
const express = require('express');
const router = express.Router();
const Student = require('../models/Student');
const Teacher = require('../models/Teacher');
const Course = require('../models/Course');
const Attendance = require('../models/Attendance');
const Grade = require('../models/Grade');
const ParentFollowup = require('../models/ParentFollowup');
const { protect } = require('../middleware/auth');

// @desc    Get overview statistics
// @route   GET /api/reports/overview
// @access  Private
router.get('/overview', protect, async (req, res) => {
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

    res.json({
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
      message: 'خطأ في جلب الإحصائيات العامة',
      error: error.message
    });
  }
});

// @desc    Get students statistics
// @route   GET /api/reports/students
// @access  Private
router.get('/students', protect, async (req, res) => {
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

    res.json({
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
        }
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'خطأ في جلب إحصائيات الطلاب',
      error: error.message
    });
  }
});

// @desc    Get attendance statistics
// @route   GET /api/reports/attendance
// @access  Private
router.get('/attendance', protect, async (req, res) => {
  try {
    const { period = 'month' } = req.query;
    
    const dailyAttendance = await getDailyAttendance(7);
    const monthlyAttendance = await getMonthlyAttendance(6);
    const attendanceByCourse = await getAttendanceByCourse();

    res.json({
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
      message: 'خطأ في جلب إحصائيات الحضور',
      error: error.message
    });
  }
});

// @desc    Get grades statistics
// @route   GET /api/reports/grades
// @access  Private
router.get('/grades', protect, async (req, res) => {
  try {
    const gradeDistribution = await getGradeDistribution();
    const averagesByCourse = await getAveragesByCourse();
    const gradeTrends = await getGradeTrends();

    res.json({
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
      message: 'خطأ في جلب إحصائيات الدرجات',
      error: error.message
    });
  }
});

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

  return attendance;
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

module.exports = router;
