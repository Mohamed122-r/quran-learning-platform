import React, { useState, useEffect } from 'react';
import { X, Calendar, Upload } from 'lucide-react';

const FollowupForm = ({ followup, onSave, onCancel }) => {
  const [formData, setFormData] = useState({
    student: '',
    type: 'اتصال هاتفي',
    subject: '',
    message: '',
    priority: 'متوسط',
    status: 'معلق',
    scheduledDate: '',
    assignedTo: '',
    notes: ''
  });

  const [students, setStudents] = useState([]);
  const [teachers, setTeachers] = useState([]);

  useEffect(() => {
    // بيانات وهمية للطلاب والمعلمين
    const sampleStudents = [
      { id: 'S001', name: 'أحمد محمد علي', class: 'الصف الثالث' },
      { id: 'S002', name: 'فاطمة أحمد', class: 'الصف الثاني' },
      { id: 'S003', name: 'محمد سالم', class: 'الصف الرابع' }
    ];

    const sampleTeachers = [
      { id: 'T001', name: 'أحمد محمد' },
      { id: 'T002', name: 'فاطمة أحمد' },
      { id: 'T003', name: 'محمد علي' }
    ];

    setStudents(sampleStudents);
    setTeachers(sampleTeachers);

    if (followup) {
      setFormData({
        student: followup.student.id,
        type: followup.type,
        subject: followup.subject,
        message: followup.message,
        priority: followup.priority,
        status: followup.status,
        scheduledDate: followup.scheduledDate,
        assignedTo: followup.assignedTo.id,
        notes: followup.notes || ''
      });
    } else {
      // تعيين تاريخ افتراضي
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      setFormData(prev => ({
        ...prev,
        scheduledDate: tomorrow.toISOString().split('T')[0]
      }));
    }
  }, [followup]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    const selectedStudent = students.find(s => s.id === formData.student);
    const selectedTeacher = teachers.find(t => t.id === formData.assignedTo);
    
    const followupData = {
      ...formData,
      student: {
        id: selectedStudent.id,
        name: selectedStudent.name,
        class: selectedStudent.class
      },
      assignedTo: {
        id: selectedTeacher.id,
        name: selectedTeacher.name
      },
      parent: {
        name: 'محمد علي', // بيانات وهمية
        phone: '0512345678'
      }
    };

    onSave(followupData);
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content large">
        <div className="modal-header">
          <h2>{followup ? 'تعديل المتابعة' : 'إضافة متابعة جديدة'}</h2>
          <button className="close-btn" onClick={onCancel}>
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="followup-form">
          <div className="form-grid">
            <div className="form-group">
              <label>الطالب *</label>
              <select
                name="student"
                value={formData.student}
                onChange={handleChange}
                required
              >
                <option value="">اختر الطالب</option>
                {students.map(student => (
                  <option key={student.id} value={student.id}>
                    {student.name} - {student.class}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label>نوع المتابعة *</label>
              <select
                name="type"
                value={formData.type}
                onChange={handleChange}
                required
              >
                <option value="اتصال هاتفي">اتصال هاتفي</option>
                <option value="رسالة نصية">رسالة نصية</option>
                <option value="اجتماع">اجتماع</option>
                <option value="تقرير أداء">تقرير أداء</option>
                <option value="تنبيه">تنبيه</option>
              </select>
            </div>

            <div className="form-group">
              <label>الأولوية *</label>
              <select
                name="priority"
                value={formData.priority}
                onChange={handleChange}
                required
              >
                <option value="منخفض">منخفض</option>
                <option value="متوسط">متوسط</option>
                <option value="عالي">عالي</option>
                <option value="عاجل">عاجل</option>
              </select>
            </div>

            <div className="form-group">
              <label>الحالة *</label>
              <select
                name="status"
                value={formData.status}
                onChange={handleChange}
                required
              >
                <option value="معلق">معلق</option>
                <option value="مكتمل">مكتمل</option>
                <option value="ملغي">ملغي</option>
                <option value="مؤجل">مؤجل</option>
              </select>
            </div>

            <div className="form-group">
              <label>المكلف بالمتابعة *</label>
              <select
                name="assignedTo"
                value={formData.assignedTo}
                onChange={handleChange}
                required
              >
                <option value="">اختر المعلم</option>
                {teachers.map(teacher => (
                  <option key={teacher.id} value={teacher.id}>
                    {teacher.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label>التاريخ المجدول *</label>
              <div className="date-input">
                <Calendar size={18} />
                <input
                  type="date"
                  name="scheduledDate"
                  value={formData.scheduledDate}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>
          </div>

          <div className="form-group">
            <label>موضوع المتابعة *</label>
            <input
              type="text"
              name="subject"
              value={formData.subject}
              onChange={handleChange}
              placeholder="أدخل موضوع المتابعة..."
              required
            />
          </div>

          <div className="form-group">
            <label>نص المتابعة *</label>
            <textarea
              name="message"
              value={formData.message}
              onChange={handleChange}
              placeholder="أدخل نص المتابعة..."
              rows="4"
              required
            />
          </div>

          <div className="form-group">
            <label>ملاحظات إضافية</label>
            <textarea
              name="notes"
              value={formData.notes}
              onChange={handleChange}
              placeholder="أدخل أي ملاحظات إضافية..."
              rows="3"
            />
          </div>

          <div className="form-group">
            <label>المرفقات</label>
            <div className="file-upload">
              <Upload size={18} />
              <span>انقر لرفع الملفات</span>
              <input type="file" multiple style={{ display: 'none' }} />
            </div>
          </div>

          <div className="form-actions">
            <button type="button" className="btn-cancel" onClick={onCancel}>
              إلغاء
            </button>
            <button type="submit" className="btn-save">
              {followup ? 'تحديث' : 'حفظ'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default FollowupForm;        priority: 'عالي',
        status: 'معلق',
        scheduledDate: '2024-01-20',
        assignedTo: {
          id: 'T001',
          name: 'أحمد محمد'
        },
        createdAt: '2024-01-15'
      },
      {
        id: 'F002',
        student: {
          id: 'S002',
          name: 'فاطمة أحمد',
          class: 'الصف الثاني'
        },
        parent: {
          name: 'أحمد محمد',
          phone: '0512345681'
        },
        type: 'رسالة نصية',
        subject: 'تقرير الأداء الشهري',
        message: 'تم إرسال تقرير الأداء الشهري للطالبة',
        priority: 'متوسط',
        status: 'مكتمل',
        scheduledDate: '2024-01-10',
        completedDate: '2024-01-10',
        assignedTo: {
          id: 'T002',
          name: 'فاطمة أحمد'
        },
        createdAt: '2024-01-08'
      },
      {
        id: 'F003',
        student: {
          id: 'S003',
          name: 'محمد سالم',
          class: 'الصف الرابع'
        },
        parent: {
          name: 'سالم عبدالله',
          phone: '0512345683'
        },
        type: 'اجتماع',
        subject: 'مناقشة السلوك',
        message: 'الطالب يحتاج إلى متابعة في السلوك داخل الفصل',
        priority: 'عاجل',
        status: 'معلق',
        scheduledDate: '2024-01-25',
        assignedTo: {
          id: 'T001',
          name: 'أحمد محمد'
        },
        createdAt: '2024-01-18'
      }
    ];

    setFollowups(sampleFollowups);
    setFilteredFollowups(sampleFollowups);
  }, []);

  useEffect(() => {
    filterFollowups();
  }, [searchTerm, filters, followups]);

  const filterFollowups = () => {
    let filtered = followups;

    if (searchTerm) {
      filtered = filtered.filter(followup =>
        followup.student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        followup.parent.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        followup.subject.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (filters.status !== 'all') {
      filtered = filtered.filter(followup => followup.status === filters.status);
    }

    if (filters.priority !== 'all') {
      filtered = filtered.filter(followup => followup.priority === filters.priority);
    }

    if (filters.type !== 'all') {
      filtered = filtered.filter(followup => followup.type === filters.type);
    }

    if (filters.assignedTo !== 'all') {
      filtered = filtered.filter(followup => followup.assignedTo.id === filters.assignedTo);
    }

    setFilteredFollowups(filtered);
  };

  const handleAddFollowup = (followupData) => {
    const newFollowup = {
      ...followupData,
      id: `F${String(followups.length + 1).padStart(3, '0')}`,
      createdAt: new Date().toISOString().split('T')[0]
    };
    setFollowups([...followups, newFollowup]);
    setShowForm(false);
  };

  const handleUpdateFollowup = (followupData) => {
    setFollowups(followups.map(followup =>
      followup.id === editingFollowup.id ? { ...followup, ...followupData } : followup
    ));
    setEditingFollowup(null);
    setShowForm(false);
  };

  const handleStatusChange = (followupId, newStatus) => {
    setFollowups(followups.map(followup =>
      followup.id === followupId ? {
        ...followup,
        status: newStatus,
        completedDate: newStatus === 'مكتمل' ? new Date().toISOString().split('T')[0] : followup.completedDate
      } : followup
    ));
  };

  const getPriorityIcon = (priority) => {
    switch (priority) {
      case 'عاجل':
        return <AlertTriangle size={16} className="priority-urgent" />;
      case 'عالي':
        return <AlertTriangle size={16} className="priority-high" />;
      default:
        return <Clock size={16} className="priority-normal" />;
    }
  };

  const getTypeIcon = (type) => {
    switch (type) {
      case 'اتصال هاتفي':
        return <Phone size={16} />;
      case 'رسالة نصية':
        return <MessageCircle size={16} />;
      case 'اجتماع':
        return <Users size={16} />;
      default:
        return <MessageCircle size={16} />;
    }
  };

  return (
    <div className="parent-followup">
      <div className="page-header">
        <h1>متابعة أولياء الأمور</h1>
        <div className="header-actions">
          <button 
            className="btn-primary"
            onClick={() => setShowForm(true)}
          >
            <Plus size={18} />
            إضافة متابعة جديدة
          </button>
        </div>
      </div>

      <div className="followup-stats">
        <div className="stat-card">
          <div className="stat-icon total">
            <MessageCircle size={24} />
          </div>
          <div className="stat-info">
            <h3>إجمالي المتابعات</h3>
            <p className="stat-number">{followups.length}</p>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon pending">
            <Clock size={24} />
          </div>
          <div className="stat-info">
            <h3>معلقة</h3>
            <p className="stat-number">
              {followups.filter(f => f.status === 'معلق').length}
            </p>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon completed">
            <CheckCircle size={24} />
          </div>
          <div className="stat-info">
            <h3>مكتملة</h3>
            <p className="stat-number">
              {followups.filter(f => f.status === 'مكتمل').length}
            </p>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon urgent">
            <AlertTriangle size={24} />
          </div>
          <div className="stat-info">
            <h3>عاجلة</h3>
            <p className="stat-number">
              {followups.filter(f => f.priority === 'عاجل').length}
            </p>
          </div>
        </div>
      </div>

      <div className="filters-section">
        <div className="search-box">
          <Search size={20} />
          <input
            type="text"
            placeholder="البحث باسم الطالب أو ولي الأمر أو الموضوع..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div className="filter-group">
          <select
            value={filters.status}
            onChange={(e) => setFilters({...filters, status: e.target.value})}
          >
            <option value="all">جميع الحالات</option>
            <option value="معلق">معلق</option>
            <option value="مكتمل">مكتمل</option>
            <option value="ملغي">ملغي</option>
            <option value="مؤجل">مؤجل</option>
          </select>
        </div>

        <div className="filter-group">
          <select
            value={filters.priority}
            onChange={(e) => setFilters({...filters, priority: e.target.value})}
          >
            <option value="all">جميع الأولويات</option>
            <option value="عاجل">عاجل</option>
            <option value="عالي">عالي</option>
            <option value="متوسط">متوسط</option>
            <option value="منخفض">منخفض</option>
          </select>
        </div>

        <div className="filter-group">
          <select
            value={filters.type}
            onChange={(e) => setFilters({...filters, type: e.target.value})}
          >
            <option value="all">جميع الأنواع</option>
            <option value="اتصال هاتفي">اتصال هاتفي</option>
            <option value="رسالة نصية">رسالة نصية</option>
            <option value="اجتماع">اجتماع</option>
            <option value="تقرير أداء">تقرير أداء</option>
            <option value="تنبيه">تنبيه</option>
          </select>
        </div>
      </div>

      <div className="followups-list">
        {filteredFollowups.map(followup => (
          <div key={followup.id} className={`followup-card ${followup.priority} ${followup.status}`}>
            <div className="followup-header">
              <div className="followup-meta">
                <div className="student-info">
                  <span className="student-name">{followup.student.name}</span>
                  <span className="student-class">{followup.student.class}</span>
                </div>
                <div className="parent-info">
                  <span className="parent-name">ولي الأمر: {followup.parent.name}</span>
                  <span className="parent-phone">{followup.parent.phone}</span>
                </div>
              </div>
              
              <div className="followup-actions">
                <span className={`status-badge ${followup.status}`}>
                  {followup.status}
                </span>
                <div className="priority-badge">
                  {getPriorityIcon(followup.priority)}
                  {followup.priority}
                </div>
              </div>
            </div>

            <div className="followup-content">
              <div className="followup-type">
                {getTypeIcon(followup.type)}
                {followup.type}
              </div>
              
              <h3 className="followup-subject">{followup.subject}</h3>
              <p className="followup-message">{followup.message}</p>
              
              <div className="followup-details">
                <div className="detail-item">
                  <strong>المكلف:</strong> {followup.assignedTo.name}
                </div>
                <div className="detail-item">
                  <strong>مجدول:</strong> {new Date(followup.scheduledDate).toLocaleDateString('ar-SA')}
                </div>
                <div className="detail-item">
                  <strong>أنشئت:</strong> {new Date(followup.createdAt).toLocaleDateString('ar-SA')}
                </div>
              </div>
            </div>

            <div className="followup-footer">
              <div className="action-buttons">
                {followup.status === 'معلق' && (
                  <>
                    <button 
                      className="btn-complete"
                      onClick={() => handleStatusChange(followup.id, 'مكتمل')}
                    >
                      <CheckCircle size={16} />
                      إكمال
                    </button>
                    <button 
                      className="btn-edit"
                      onClick={() => {
                        setEditingFollowup(followup);
                        setShowForm(true);
                      }}
                    >
                      تعديل
                    </button>
                  </>
                )}
                <button className="btn-view">
                  عرض التفاصيل
                </button>
              </div>
            </div>
          </div>
        ))}

        {filteredFollowups.length === 0 && (
          <div className="no-data">
            <p>لا توجد متابعات للعرض</p>
          </div>
        )}
      </div>

      {showForm && (
        <FollowupForm
          followup={editingFollowup}
          onSave={editingFollowup ? handleUpdateFollowup : handleAddFollowup}
          onCancel={() => {
            setShowForm(false);
            setEditingFollowup(null);
          }}
        />
      )}
    </div>
  );
};

export default ParentFollowup;
