const Attendance = require('../models/Attendance');
const Student = require('../models/Student');
const Course = require('../models/Course');

// @desc    Get all attendance records
// @route   GET /api/attendance
// @access  Private
exports.getAttendance = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      student,
      course,
      date,
      status
    } = req.query;

    const query = {};

    if (student) {
      query.student = student;
    }

    if (course) {
      query.course = course;
    }

    if (date) {
      const startDate = new Date(date);
      const endDate = new Date(date);
      endDate.setDate(endDate.getDate() + 1);
      
      query.date = {
        $gte: startDate,
        $lt: endDate
      };
    }

    if (status && status !== 'all') {
      query.status = status;
    }

    const attendance = await Attendance.find(query)
      .populate('student', 'name studentId class')
      .populate('course', 'title courseCode')
      .populate('recordedBy', 'name')
      .sort({ date: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Attendance.countDocuments(query);

    res.status(200).json({
      success: true,
      count: attendance.length,
      data: attendance,
      pagination: {
        current: parseInt(page),
        pages: Math.ceil(total / limit),
        total
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'خطأ في جلب سجل الحضور',
      error: error.message
    });
  }
};

// @desc    Get single attendance record
// @route   GET /api/attendance/:id
// @access  Private
exports.getAttendanceRecord = async (req, res) => {
  try {
    const attendance = await Attendance.findById(req.params.id)
      .populate('student', 'name studentId class')
      .populate('course', 'title courseCode')
      .populate('recordedBy', 'name email');

    if (!attendance) {
      return res.status(404).json({
        success: false,
        message: 'سجل الحضور غير موجود'
      });
    }

    res.status(200).json({
      success: true,
      data: attendance
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'خطأ في جلب سجل الحضور',
      error: error.message
    });
  }
};

// @desc    Create attendance record
// @route   POST /api/attendance
// @access  Private/Teacher
exports.createAttendance = async (req, res) => {
  try {
    const attendance = await Attendance.create(req.body);

    await attendance.populate([
      { path: 'student', select: 'name studentId class' },
      { path: 'course', select: 'title courseCode' },
      { path: 'recordedBy', select: 'name' }
    ]);

    res.status(201).json({
      success: true,
      message: 'تم تسجيل الحضور بنجاح',
      data: attendance
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: 'تم تسجيل الحضور لهذا الطالب في هذا التاريخ مسبقاً'
      });
    }

    res.status(400).json({
      success: false,
      message: 'خطأ في تسجيل الحضور',
      error: error.message
    });
  }
};

// @desc    Update attendance record
// @route   PUT /api/attendance/:id
// @access  Private/Teacher
exports.updateAttendance = async (req, res) => {
  try {
    const attendance = await Attendance.findByIdAndUpdate(
      req.params.id,
      req.body,
      {
        new: true,
        runValidators: true
      }
    ).populate('student', 'name studentId class')
     .populate('course', 'title courseCode')
     .populate('recordedBy', 'name');

    if (!attendance) {
      return res.status(404).json({
        success: false,
        message: 'سجل الحضور غير موجود'
      });
    }

    res.status(200).json({
      success: true,
      message: 'تم تحديث سجل الحضور بنجاح',
      data: attendance
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: 'تم تسجيل الحضور لهذا الطالب في هذا التاريخ مسبقاً'
      });
    }

    res.status(400).json({
      success: false,
      message: 'خطأ في تحديث سجل الحضور',
      error: error.message
    });
  }
};

// @desc    Delete attendance record
// @route   DELETE /api/attendance/:id
// @access  Private/Teacher
exports.deleteAttendance = async (req, res) => {
  try {
    const attendance = await Attendance.findByIdAndDelete(req.params.id);

    if (!attendance) {
      return res.status(404).json({
        success: false,
        message: 'سجل الحضور غير موجود'
      });
    }

    res.status(200).json({
      success: true,
      message: 'تم حذف سجل الحضور بنجاح',
      data: {}
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'خطأ في حذف سجل الحضور',
      error: error.message
    });
  }
};

// @desc    Bulk create attendance records
// @route   POST /api/attendance/bulk
// @access  Private/Teacher
exports.bulkCreateAttendance = async (req, res) => {
  try {
    const { attendanceRecords } = req.body;

    if (!attendanceRecords || !Array.isArray(attendanceRecords)) {
      return res.status(400).json({
        success: false,
        message: 'بيانات الحضور غير صحيحة'
      });
    }

    const createdRecords = await Attendance.insertMany(attendanceRecords, { ordered: false });

    // Populate the created records
    const populatedRecords = await Attendance.find({
      _id: { $in: createdRecords.map(record => record._id) }
    })
    .populate('student', 'name studentId class')
    .populate('course', 'title courseCode')
    .populate('recordedBy', 'name');

    res.status(201).json({
      success: true,
      message: `تم تسجيل حضور ${createdRecords.length} طالب بنجاح`,
      data: populatedRecords
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: 'بعض سجلات الحضور مسجلة مسبقاً',
        error: error.message
      });
    }

    res.status(400).json({
      success: false,
      message: 'خطأ في التسجيل الجماعي للحضور',
      error: error.message
    });
  }
};

// @desc    Get attendance by date range
// @route   GET /api/attendance/range
// @access  Private
exports.getAttendanceByDateRange = async (req, res) => {
  try {
    const { startDate, endDate, courseId } = req.query;

    if (!startDate || !endDate) {
      return res.status(400).json({
        success: false,
        message: 'يجب تحديد تاريخ البدء والانتهاء'
      });
    }

    const start = new Date(startDate);
    const end = new Date(endDate);
    end.setDate(end.getDate() + 1); // Include end date

    const query = {
      date: {
        $gte: start,
        $lt: end
      }
    };

    if (courseId) {
      query.course = courseId;
    }

    const attendance = await Attendance.find(query)
      .populate('student', 'name studentId class')
      .populate('course', 'title courseCode')
      .populate('recordedBy', 'name')
      .sort({ date: 1, student: 1 });

    res.status(200).json({
      success: true,
      count: attendance.length,
      data: attendance
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'خطأ في جلب سجل الحضور',
      error: error.message
    });
  }
};

// @desc    Get attendance statistics
// @route   GET /api/attendance/stats/overview
// @access  Private
exports.getAttendanceStats = async (req, res) => {
  try {
    const { courseId, startDate, endDate } = req.query;

    const query = {};

    if (courseId) {
      query.course = courseId;
    }

    if (startDate && endDate) {
      const start = new Date(startDate);
      const end = new Date(endDate);
      end.setDate(end.getDate() + 1);
      
      query.date = {
        $gte: start,
        $lt: end
      };
    }

    const stats = await Attendance.aggregate([
      { $match: query },
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 }
        }
      }
    ]);

    const totalRecords = await Attendance.countDocuments(query);
    const presentRecords = await Attendance.countDocuments({ ...query, status: 'حاضر' });
    const attendanceRate = totalRecords > 0 ? (presentRecords / totalRecords) * 100 : 0;

    res.status(200).json({
      success: true,
      data: {
        totalRecords,
        presentRecords,
        attendanceRate: Math.round(attendanceRate),
        distribution: stats
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'خطأ في جلب إحصائيات الحضور',
      error: error.message
    });
  }
};
