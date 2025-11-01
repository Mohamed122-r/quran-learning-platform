import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';

const StudentForm = ({ student, onSave, onCancel }) => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    class: '',
    level: 'مبتدئ',
    status: 'نشط',
    parentInfo: {
      fatherName: '',
      motherName: '',
      parentPhone: ''
    }
  });

  useEffect(() => {
    if (student) {
      setFormData(student);
    }
  }, [student]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    
    if (name.startsWith('parentInfo.')) {
      const parentField = name.split('.')[1];
      setFormData(prev => ({
        ...prev,
        parentInfo: {
          ...prev.parentInfo,
          [parentField]: value
        }
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <div className="modal-header">
          <h2>{student ? 'تعديل بيانات الطالب' : 'إضافة طالب جديد'}</h2>
          <button className="close-btn" onClick={onCancel}>
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="student-form">
          <div className="form-grid">
            <div className="form-group">
              <label>الاسم الكامل *</label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-group">
              <label>البريد الإلكتروني *</label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-group">
              <label>رقم الهاتف</label>
              <input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
              />
            </div>

            <div className="form-group">
              <label>الصف *</label>
              <select
                name="class"
                value={formData.class}
                onChange={handleChange}
                required
              >
                <option value="">اختر الصف</option>
                <option value="الصف الأول">الصف الأول</option>
                <option value="الصف الثاني">الصف الثاني</option>
                <option value="الصف الثالث">الصف الثالث</option>
                <option value="الصف الرابع">الصف الرابع</option>
              </select>
            </div>

            <div className="form-group">
              <label>المستوى</label>
              <select
                name="level"
                value={formData.level}
                onChange={handleChange}
              >
                <option value="مبتدئ">مبتدئ</option>
                <option value="متوسط">متوسط</option>
                <option value="متقدم">متقدم</option>
              </select>
            </div>

            <div className="form-group">
              <label>الحالة</label>
              <select
                name="status"
                value={formData.status}
                onChange={handleChange}
              >
                <option value="نشط">نشط</option>
                <option value="غير نشط">غير نشط</option>
                <option value="موقوف">موقوف</option>
              </select>
            </div>
          </div>

          <div className="form-section">
            <h3>معلومات ولي الأمر</h3>
            <div className="form-grid">
              <div className="form-group">
                <label>اسم الأب</label>
                <input
                  type="text"
                  name="parentInfo.fatherName"
                  value={formData.parentInfo.fatherName}
                  onChange={handleChange}
                />
              </div>

              <div className="form-group">
                <label>اسم الأم</label>
                <input
                  type="text"
                  name="parentInfo.motherName"
                  value={formData.parentInfo.motherName}
                  onChange={handleChange}
                />
              </div>

              <div className="form-group">
                <label>هاتف ولي الأمر</label>
                <input
                  type="tel"
                  name="parentInfo.parentPhone"
                  value={formData.parentInfo.parentPhone}
                  onChange={handleChange}
                />
              </div>
            </div>
          </div>

          <div className="form-actions">
            <button type="button" className="btn-cancel" onClick={onCancel}>
              إلغاء
            </button>
            <button type="submit" className="btn-save">
              {student ? 'تحديث' : 'حفظ'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default StudentForm;
