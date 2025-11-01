const Student = require('../models/Student');
const Teacher = require('../models/Teacher');
const Course = require('../models/Course');
const Attendance = require('../models/Attendance');
const Grade = require('../models/Grade');
const ParentFollowup = require('../models/ParentFollowup');
const Enrollment = require('../models/Enrollment');

// @desc    Get overview statistics
// @route   GET /api/reports/overview
// @access  Private
exports.getOverviewReport = async (req, res) => {
  try {
    const [
      totalStudents,
      activeStudents,
      totalTeachers,
      activeTeachers,
      totalCourses,
      activeCourses,
      attendanceStats,
      gradeStats,
      followupStats
    ] = await Promise.all([
      Student.countDocuments(),
      Student.countDocuments({ status: 'نشط' }),
      Teacher.countDocuments(),
      Teacher.countDocuments({ status: 'نشط' }),
      Course.countDocuments(),
      Course.countDocuments({ status: 'نشط' }),
      getAttendanceStatistics(),
      getGradeStatistics(),
      getFollowupStatistics()
    ]);

    res.status(200).json({
      success: true,
      data: {
        totalStudents,
        activeStudents,
        totalTeachers,
        activeTeachers,
        totalCourses,
        activeCourses,
        attendanceRate: attendanceStats.averageRate,
        completionRate: gradeStats.averageScore,
        followupStats
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'خطأ في جلب التقرير العام',
      error: error.message
    });
  }
};

// @desc    Get students report
// @route   GET /api/reports/students
// @access  Private
exports.getStudentsReport = async (req, res) => {
  try {
    const studentsByClass = await Student.aggregate([
      {
        $group: {
          _id: '$class',
          count: { $sum: 1 }
        }
      },
      {
        $sort: { _id: 1 }
      }
    ]);

    const studentsByLevel = await Student.aggregate([
      {
        $group: {
          _id: '$level',
          count: { $sum: 1 }
        }
      }
    ]);

    const studentsByStatus = await Student.aggregate([
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 }
        }
      }
    ]);

    // New students this month
    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);

    const newStudentsThisMonth = await Student.countDocuments({
      createdAt: { $gte: startOfMonth }
    });

    res.status(200).json({
      success: true,
      data: {
        byClass: {
          labels: studentsByClass.map(item => item._id),
          data: studentsByClass.map(item => item.count)
        },
        byLevel: {
          labels: studentsByLevel.map(item => item._id),
          data: studentsByLevel.map(item => item.count)
        },
        byStatus: {
          labels: studentsByStatus.map(item => item._id),
          data: studentsByStatus.map(item => item.count)
        },
        newStudentsThisMonth
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'خطأ في جلب تقرير الطلاب',
      error: error.message
    });
  }
};

// @desc    Get attendance report
// @route   GET /api/reports/attendance
// @access  Private
exports.getAttendanceReport = async (req, res) => {
  try {
    const { period = 'month' } = req.query;
    
    const dailyAttendance = await getDailyAttendance(7);
    const monthlyAttendance = await getMonthlyAttendance(6);
    const attendanceByCourse = await getAttendanceByCourse();

    res.status(200).json({
      success: true,
      data: {
        daily: dailyAttendance,
        monthly: monthlyAttendance,
        byCourse: attendanceByCourse
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'خطأ في جلب تقرير الحضور',
      error: error.message
    });
  }
};

// @desc    Get grades report
// @route   GET /api/reports/grades
// @access  Private
exports.getGradesReport = async (req, res) => {
  try {
    const gradeDistribution = await getGradeDistribution();
    const averagesByCourse = await getAveragesByCourse();
    const gradeTrends = await getGradeTrends();

    res.status(200).json({
      success: true,
      data: {
        distribution: gradeDistribution,
        byCourse: averagesByCourse,
        trends: gradeTrends
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'خطأ في جلب تقرير الدرجات',
      error: error.message
    });
  }
};

// @desc    Get comprehensive report
// @route   GET /api/reports/comprehensive
// @access  Private/Admin
exports.getComprehensiveReport = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;

    const dateFilter = {};
    if (startDate && endDate) {
      const start = new Date(startDate);
      const end = new Date(endDate);
      end.setDate(end.getDate() + 1);
      
      dateFilter.createdAt = {
        $gte: start,
        $lt: end
      };
    }

    const [
      studentsData,
      teachersData,
      coursesData,
      attendanceData,
      gradesData,
      followupsData,
      enrollmentsData
    ] = await Promise.all([
      // Students data
      Student.aggregate([
        { $match: dateFilter },
        {
          $group: {
            _id: null,
            total: { $sum: 1 },
            byClass: { $push: '$class' },
            byLevel: { $push: '$level' }
          }
        }
      ]),

      // Teachers data
      Teacher.aggregate([
        { $match: dateFilter },
        {
          $group: {
            _id: null,
            total: { $sum: 1 },
            bySpecialization: { $push: '$specialization' }
          }
        }
      ]),

      // Courses data
      Course.aggregate([
        { $match: dateFilter },
        {
          $group: {
            _id: null,
            total: { $sum: 1 },
            byCategory: { $push: '$category' },
            byLevel: { $push: '$level' }
          }
        }
      ]),

      // Attendance data
      Attendance.aggregate([
        { $match: dateFilter },
        {
          $group: {
            _id: '$status',
            count: { $sum: 1 }
          }
        }
      ]),

      // Grades data
      Grade.aggregate([
        { $match: dateFilter },
        {
          $group: {
            _id: null,
            averageScore: { $avg: '$score' },
            totalExams: { $sum: 1 }
          }
        }
      ]),

      // Followups data
      ParentFollowup.aggregate([
        { $match: dateFilter },
        {
          $group: {
            _id: '$status',
            count: { $sum: 1 }
          }
        }
      ]),

      // Enrollments data
      Enrollment.aggregate([
        { $match: dateFilter },
        {
          $group: {
            _id: '$status',
            count: { $sum: 1 }
          }
        }
      ])
    ]);

    res.status(200).json({
      success: true,
      data: {
        period: { startDate, endDate },
        students: studentsData[0] || {},
        teachers: teachersData[0] || {},
        courses: coursesData[0] || {},
        attendance: attendanceData,
        grades: gradesData[0] || {},
        followups: followupsData,
        enrollments: enrollmentsData
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'خطأ في جلب التقرير الشامل',
      error: error.message
    });
  }
};

// Helper functions
const getAttendanceStatistics = async () => {
  const totalRecords = await Attendance.countDocuments();
  const presentRecords = await Attendance.countDocuments({ status: 'حاضر' });
  
  return {
    totalRecords,
    presentRecords,
    averageRate: totalRecords > 0 ? Math.round((presentRecords / totalRecords) * 100) : 0
  };
};

const getGradeStatistics = async () => {
  const result = await Grade.aggregate([
    {
      $group: {
        _id: null,
        averageScore: { $avg: '$score' },
        totalExams: { $sum: 1 }
      }
    }
  ]);

  return result.length > 0 ? result[0] : { averageScore: 0, totalExams: 0 };
};

const getFollowupStatistics = async () => {
  const stats = await ParentFollowup.getStatistics();
  return stats;
};

const getDailyAttendance = async (days = 7) => {
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);

  const attendance = await Attendance.aggregate([
    {
      $match: {
        date: { $gte: startDate }
      }
    },
    {
      $group: {
        _id: { $dateToString: { format: '%Y-%m-%d', date: '$date' } },
        total: { $sum: 1 },
        present: {
          $sum: { $cond: [{ $eq: ['$status', 'حاضر'] }, 1, 0] }
        }
      }
    },
    {
      $sort: { _id: 1 }
    }
  ]);

  return attendance.map(item => ({
    date: item._id,
    present: item.present,
    total: item.total,
    rate: Math.round((item.present / item.total) * 100)
  }));
};

const getMonthlyAttendance = async (months = 6) => {
  const startDate = new Date();
  startDate.setMonth(startDate.getMonth() - months);

  const attendance = await Attendance.aggregate([
    {
      $match: {
        date: { $gte: startDate }
      }
    },
    {
      $group: {
        _id: { $dateToString: { format: '%Y-%m', date: '$date' } },
        total: { $sum: 1 },
        present: {
          $sum: { $cond: [{ $eq: ['$status', 'حاضر'] }, 1, 0] }
        }
      }
    },
    {
      $sort: { _id: 1 }
    }
  ]);

  return attendance.map(item => ({
    month: item._id,
    rate: item.total > 0 ? Math.round((item.present / item.total) * 100) : 0
  }));
};

const getAttendanceByCourse = async () => {
  const attendance = await Attendance.aggregate([
    {
      $lookup: {
        from: 'courses',
        localField: 'course',
        foreignField: '_id',
        as: 'course'
      }
    },
    {
      $unwind: '$course'
    },
    {
      $group: {
        _id: '$course.title',
        total: { $sum: 1 },
        present: {
          $sum: { $cond: [{ $eq: ['$status', 'حاضر'] }, 1, 0] }
        }
      }
    }
  ]);

  return attendance.map(item => ({
    course: item._id,
    rate: item.total > 0 ? Math.round((item.present / item.total) * 100) : 0
  }));
};

const getGradeDistribution = async () => {
  const distribution = await Grade.aggregate([
    {
      $project: {
        range: {
          $switch: {
            branches: [
              { case: { $gte: ['$score', 90] }, then: 'ممتاز (90-100)' },
              { case: { $gte: ['$score', 80] }, then: 'جيد جداً (80-89)' },
              { case: { $gte: ['$score', 70] }, then: 'جيد (70-79)' },
              { case: { $gte: ['$score', 60] }, then: 'مقبول (60-69)' },
              { case: { $lt: ['$score', 60] }, then: 'راسب (أقل من 60)' }
            ],
            default: 'غير محدد'
          }
        }
      }
    },
    {
      $group: {
        _id: '$range',
        count: { $sum: 1 }
      }
    }
  ]);

  return distribution;
};

const getAveragesByCourse = async () => {
  const averages = await Grade.aggregate([
    {
      $lookup: {
        from: 'courses',
        localField: 'course',
        foreignField: '_id',
        as: 'course'
      }
    },
    {
      $unwind: '$course'
    },
    {
      $group: {
        _id: '$course.title',
        average: { $avg: '$score' }
      }
    }
  ]);

  return averages.map(item => ({
    course: item._id,
    average: Math.round(item.average)
  }));
};

const getGradeTrends = async () => {
  const trends = await Grade.aggregate([
    {
      $group: {
        _id: { $dateToString: { format: '%Y-%m', date: '$gradeDate' } },
        average: { $avg: '$score' }
      }
    },
    {
      $sort: { _id: 1 }
    },
    {
      $limit: 6
    }
  ]);

  return trends.map(item => ({
    month: item._id,
    average: Math.round(item.average)
  }));
};
