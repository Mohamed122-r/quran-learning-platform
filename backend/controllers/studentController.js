const Student = require('../models/Student');
const Attendance = require('../models/Attendance');
const Grade = require('../models/Grade');
const Enrollment = require('../models/Enrollment');
const ParentFollowup = require('../models/ParentFollowup');

// @desc    Get all students
// @route   GET /api/students
// @access  Private
exports.getStudents = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      search,
      class: studentClass,
      status,
      level
    } = req.query;

    const query = {};

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { studentId: { $regex: search, $options: 'i' } }
      ];
    }

    if (studentClass && studentClass !== 'all') {
      query.class = studentClass;
    }

    if (status && status !== 'all') {
      query.status = status;
    }

    if (level && level !== 'all') {
      query.level = level;
    }

    const students = await Student.find(query)
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Student.countDocuments(query);

    res.status(200).json({
      success: true,
      count: students.length,
      data: students,
      pagination: {
        current: parseInt(page),
        pages: Math.ceil(total / limit),
        total
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'خطأ في جلب بيانات الطلاب',
      error: error.message
    });
  }
};

// @desc    Get single student
// @route   GET /api/students/:id
// @access  Private
exports.getStudent = async (req, res) => {
  try {
    const student = await Student.findById(req.params.id);

    if (!student) {
      return res.status(404).json({
        success: false,
        message: 'الطالب غير موجود'
      });
    }

    res.status(200).json({
      success: true,
      data: student
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'خطأ في جلب بيانات الطالب',
      error: error.message
    });
  }
};

// @desc    Create new student
// @route   POST /api/students
// @access  Private/Admin
exports.createStudent = async (req, res) => {
  try {
    // Generate student ID
    const lastStudent = await Student.findOne().sort({ studentId: -1 });
    let newStudentId = 'S001';
    
    if (lastStudent && lastStudent.studentId) {
      const lastNumber = parseInt(lastStudent.studentId.substring(1));
      newStudentId = 'S' + String(lastNumber + 1).padStart(3, '0');
    }

    const studentData = {
      ...req.body,
      studentId: newStudentId
    };

    const student = await Student.create(studentData);

    res.status(201).json({
      success: true,
      message: 'تم إضافة الطالب بنجاح',
      data: student
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: 'البريد الإلكتروني مسجل مسبقاً'
      });
    }

    res.status(400).json({
      success: false,
      message: 'خطأ في إضافة الطالب',
      error: error.message
    });
  }
};

// @desc    Update student
// @route   PUT /api/students/:id
// @access  Private/Admin
exports.updateStudent = async (req, res) => {
  try {
    const student = await Student.findByIdAndUpdate(
      req.params.id,
      req.body,
      {
        new: true,
        runValidators: true
      }
    );

    if (!student) {
      return res.status(404).json({
        success: false,
        message: 'الطالب غير موجود'
      });
    }

    res.status(200).json({
      success: true,
      message: 'تم تحديث بيانات الطالب بنجاح',
      data: student
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: 'البريد الإلكتروني مسجل مسبقاً'
      });
    }

    res.status(400).json({
      success: false,
      message: 'خطأ في تحديث بيانات الطالب',
      error: error.message
    });
  }
};

// @desc    Delete student
// @route   DELETE /api/students/:id
// @access  Private/Admin
exports.deleteStudent = async (req, res) => {
  try {
    const student = await Student.findByIdAndDelete(req.params.id);

    if (!student) {
      return res.status(404).json({
        success: false,
        message: 'الطالب غير موجود'
      });
    }

    res.status(200).json({
      success: true,
      message: 'تم حذف الطالب بنجاح',
      data: {}
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'خطأ في حذف الطالب',
      error: error.message
    });
  }
};

// @desc    Get student dashboard
// @route   GET /api/students/:id/dashboard
// @access  Private
exports.getStudentDashboard = async (req, res) => {
  try {
    const studentId = req.params.id;

    const [
      student,
      attendance,
      grades,
      enrollments,
      followups
    ] = await Promise.all([
      Student.findById(studentId),
      Attendance.find({ student: studentId })
        .populate('course', 'title')
        .sort({ date: -1 })
        .limit(10),
      Grade.find({ student: studentId })
        .populate('course', 'title')
        .sort({ gradeDate: -1 })
        .limit(10),
      Enrollment.find({ student: studentId, status: 'مسجل' })
        .populate('course', 'title courseCode teacher schedule')
        .populate({
          path: 'course',
          populate: {
            path: 'teacher',
            select: 'name'
          }
        }),
      ParentFollowup.find({ student: studentId })
        .populate('assignedTo', 'name')
        .sort({ createdAt: -1 })
        .limit(5)
    ]);

    if (!student) {
      return res.status(404).json({
        success: false,
        message: 'الطالب غير موجود'
      });
    }

    // Calculate attendance rate
    const totalAttendance = await Attendance.countDocuments({ student: studentId });
    const presentAttendance = await Attendance.countDocuments({ 
      student: studentId, 
      status: 'حاضر' 
    });
    const attendanceRate = totalAttendance > 0 ? (presentAttendance / totalAttendance) * 100 : 0;

    // Calculate average grade
    const gradeStats = await Grade.aggregate([
      { $match: { student: student._id } },
      {
        $group: {
          _id: null,
          averageScore: { $avg: '$score' },
          totalExams: { $sum: 1 }
        }
      }
    ]);

    const averageGrade = gradeStats.length > 0 ? gradeStats[0].averageScore : 0;

    res.status(200).json({
      success: true,
      data: {
        student: student.getSummary(),
        stats: {
          attendanceRate: Math.round(attendanceRate),
          averageGrade: Math.round(averageGrade),
          activeCourses: enrollments.length,
          totalFollowups: followups.length
        },
        recentAttendance: attendance,
        recentGrades: grades,
        currentEnrollments: enrollments,
        recentFollowups: followups
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'خطأ في جلب بيانات لوحة الطالب',
      error: error.message
    });
  }
};

// @desc    Get student statistics
// @route   GET /api/students/stats/overview
// @access  Private
exports.getStudentStats = async (req, res) => {
  try {
    const totalStudents = await Student.countDocuments();
    const activeStudents = await Student.countDocuments({ status: 'نشط' });
    const studentsByClass = await Student.aggregate([
      {
        $group: {
          _id: '$class',
          count: { $sum: 1 }
        }
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

    res.status(200).json({
      success: true,
      data: {
        totalStudents,
        activeStudents,
        studentsByClass,
        studentsByLevel
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'خطأ في جلب إحصائيات الطلاب',
      error: error.message
    });
  }
};

// @desc    Bulk import students
// @route   POST /api/students/import
// @access  Private/Admin
exports.bulkImportStudents = async (req, res) => {
  try {
    const { students } = req.body;

    if (!students || !Array.isArray(students)) {
      return res.status(400).json({
        success: false,
        message: 'بيانات الطلاب غير صحيحة'
      });
    }

    // Generate student IDs
    const lastStudent = await Student.findOne().sort({ studentId: -1 });
    let lastNumber = lastStudent ? parseInt(lastStudent.studentId.substring(1)) : 0;

    const studentsWithIds = students.map((student, index) => ({
      ...student,
      studentId: 'S' + String(lastNumber + index + 1).padStart(3, '0')
    }));

    const createdStudents = await Student.insertMany(studentsWithIds, { ordered: false });

    res.status(201).json({
      success: true,
      message: `تم استيراد ${createdStudents.length} طالب بنجاح`,
      data: createdStudents
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: 'بعض البريد الإلكتروني مسجل مسبقاً',
        error: error.message
      });
    }

    res.status(400).json({
      success: false,
      message: 'خطأ في استيراد الطلاب',
      error: error.message
    });
  }
};
