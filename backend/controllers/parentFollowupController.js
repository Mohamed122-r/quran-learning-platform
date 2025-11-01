const ParentFollowup = require('../models/ParentFollowup');
const Student = require('../models/Student');
const Teacher = require('../models/Teacher');

// @desc    Get all parent followups
// @route   GET /api/followups
// @access  Private
exports.getParentFollowups = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      search,
      status,
      priority,
      type,
      assignedTo
    } = req.query;

    const query = {};

    if (search) {
      query.$or = [
        { subject: { $regex: search, $options: 'i' } },
        { message: { $regex: search, $options: 'i' } },
        { 'student.name': { $regex: search, $options: 'i' } }
      ];
    }

    if (status && status !== 'all') {
      query.status = status;
    }

    if (priority && priority !== 'all') {
      query.priority = priority;
    }

    if (type && type !== 'all') {
      query.type = type;
    }

    if (assignedTo && assignedTo !== 'all') {
      query.assignedTo = assignedTo;
    }

    const followups = await ParentFollowup.find(query)
      .populate('student', 'name studentId class')
      .populate('assignedTo', 'name')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await ParentFollowup.countDocuments(query);

    res.status(200).json({
      success: true,
      count: followups.length,
      data: followups,
      pagination: {
        current: parseInt(page),
        pages: Math.ceil(total / limit),
        total
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'خطأ في جلب بيانات المتابعات',
      error: error.message
    });
  }
};

// @desc    Get single followup
// @route   GET /api/followups/:id
// @access  Private
exports.getParentFollowup = async (req, res) => {
  try {
    const followup = await ParentFollowup.findById(req.params.id)
      .populate('student', 'name studentId class parentInfo')
      .populate('assignedTo', 'name email phone')
      .populate('parent', 'name email phone');

    if (!followup) {
      return res.status(404).json({
        success: false,
        message: 'المتابعة غير موجودة'
      });
    }

    res.status(200).json({
      success: true,
      data: followup
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'خطأ في جلب بيانات المتابعة',
      error: error.message
    });
  }
};

// @desc    Create new followup
// @route   POST /api/followups
// @access  Private/Teacher
exports.createParentFollowup = async (req, res) => {
  try {
    const followup = await ParentFollowup.create(req.body);

    await followup.populate([
      { path: 'student', select: 'name studentId class' },
      { path: 'assignedTo', select: 'name' }
    ]);

    res.status(201).json({
      success: true,
      message: 'تم إضافة المتابعة بنجاح',
      data: followup
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: 'خطأ في إضافة المتابعة',
      error: error.message
    });
  }
};

// @desc    Update followup
// @route   PUT /api/followups/:id
// @access  Private/Teacher
exports.updateParentFollowup = async (req, res) => {
  try {
    const followup = await ParentFollowup.findByIdAndUpdate(
      req.params.id,
      req.body,
      {
        new: true,
        runValidators: true
      }
    ).populate('student', 'name studentId class')
     .populate('assignedTo', 'name');

    if (!followup) {
      return res.status(404).json({
        success: false,
        message: 'المتابعة غير موجودة'
      });
    }

    res.status(200).json({
      success: true,
      message: 'تم تحديث المتابعة بنجاح',
      data: followup
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: 'خطأ في تحديث المتابعة',
      error: error.message
    });
  }
};

// @desc    Update followup status
// @route   PATCH /api/followups/:id/status
// @access  Private/Teacher
exports.updateFollowupStatus = async (req, res) => {
  try {
    const { status } = req.body;
    
    const updateData = { status };
    if (status === 'مكتمل') {
      updateData.completedDate = new Date();
    }

    const followup = await ParentFollowup.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true }
    ).populate('student', 'name studentId class')
     .populate('assignedTo', 'name');

    if (!followup) {
      return res.status(404).json({
        success: false,
        message: 'المتابعة غير موجودة'
      });
    }

    res.status(200).json({
      success: true,
      message: 'تم تحديث حالة المتابعة بنجاح',
      data: followup
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: 'خطأ في تحديث حالة المتابعة',
      error: error.message
    });
  }
};

// @desc    Delete followup
// @route   DELETE /api/followups/:id
// @access  Private/Teacher
exports.deleteParentFollowup = async (req, res) => {
  try {
    const followup = await ParentFollowup.findByIdAndDelete(req.params.id);

    if (!followup) {
      return res.status(404).json({
        success: false,
        message: 'المتابعة غير موجودة'
      });
    }

    res.status(200).json({
      success: true,
      message: 'تم حذف المتابعة بنجاح',
      data: {}
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'خطأ في حذف المتابعة',
      error: error.message
    });
  }
};

// @desc    Get followup statistics
// @route   GET /api/followups/stats/overview
// @access  Private
exports.getFollowupStats = async (req, res) => {
  try {
    const teacherId = req.user.role === 'teacher' ? req.user._id : null;
    const stats = await ParentFollowup.getStatistics(teacherId);

    const totalFollowups = await ParentFollowup.countDocuments(
      teacherId ? { assignedTo: teacherId } : {}
    );

    const overdueFollowups = await ParentFollowup.countDocuments({
      status: 'معلق',
      scheduledDate: { $lt: new Date() },
      ...(teacherId && { assignedTo: teacherId })
    });

    res.status(200).json({
      success: true,
      data: {
        totalFollowups,
        overdueFollowups,
        statusDistribution: stats
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'خطأ في جلب إحصائيات المتابعات',
      error: error.message
    });
  }
};

// @desc    Get overdue followups
// @route   GET /api/followups/overdue
// @access  Private
exports.getOverdueFollowups = async (req, res) => {
  try {
    const teacherId = req.user.role === 'teacher' ? req.user._id : null;
    
    const query = {
      status: 'معلق',
      scheduledDate: { $lt: new Date() }
    };

    if (teacherId) {
      query.assignedTo = teacherId;
    }

    const overdueFollowups = await ParentFollowup.find(query)
      .populate('student', 'name studentId class')
      .populate('assignedTo', 'name')
      .sort({ scheduledDate: 1 });

    res.status(200).json({
      success: true,
      count: overdueFollowups.length,
      data: overdueFollowups
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'خطأ في جلب المتابعات المتأخرة',
      error: error.message
    });
  }
};

// @desc    Get followups by student
// @route   GET /api/followups/student/:studentId
// @access  Private
exports.getFollowupsByStudent = async (req, res) => {
  try {
    const studentId = req.params.studentId;

    const followups = await ParentFollowup.find({ student: studentId })
      .populate('assignedTo', 'name')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: followups.length,
      data: followups
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'خطأ في جلب متابعات الطالب',
      error: error.message
    });
  }
};
