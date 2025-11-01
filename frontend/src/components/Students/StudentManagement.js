import React, { useState, useEffect } from 'react';
import { Search, Plus, Edit, Trash2, Download, Upload } from 'lucide-react';
import StudentForm from './StudentForm';
import './StudentManagement.css';

const StudentManagement = () => {
  const [students, setStudents] = useState([]);
  const [filteredStudents, setFilteredStudents] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedClass, setSelectedClass] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [showForm, setShowForm] = useState(false);
  const [editingStudent, setEditingStudent] = useState(null);

  useEffect(() => {
    // بيانات وهمية للطلاب
    const sampleStudents = [
      {
        id: 'S001',
        name: 'أحمد محمد علي',
        email: 'ahmed@example.com',
        phone: '0512345678',
        class: 'الصف الثالث',
        level: 'متوسط',
        status: 'نشط',
        joinDate: '2023-01-15',
        parentInfo: {
          fatherName: 'محمد علي',
          motherName: 'فاطمة أحمد',
          parentPhone: '0512345679'
        }
      },
      {
        id: 'S002',
        name: 'فاطمة أحمد',
        email: 'fatima@example.com',
        phone: '0512345680',
        class: 'الصف الثاني',
        level: 'مبتدئ',
        status: 'نشط',
        joinDate: '2023-02-20',
        parentInfo: {
          fatherName: 'أحمد محمد',
          motherName: 'سارة خالد',
          parentPhone: '0512345681'
        }
      },
      {
        id: 'S003',
        name: 'محمد سالم',
        email: 'mohammed@example.com',
        phone: '0512345682',
        class: 'الصف الرابع',
        level: 'متقدم',
        status: 'نشط',
        joinDate: '2022-11-10',
        parentInfo: {
          fatherName: 'سالم عبدالله',
          motherName: 'مريم محمد',
          parentPhone: '0512345683'
        }
      },
      {
        id: 'S004',
        name: 'عائشة علي',
        email: 'aisha@example.com',
        phone: '0512345684',
        class: 'الصف الأول',
        level: 'مبتدئ',
        status: 'غير نشط',
        joinDate: '2023-03-05',
        parentInfo: {
          fatherName: 'علي إبراهيم',
          motherName: 'نورة أحمد',
          parentPhone: '0512345685'
        }
      }
    ];

    setStudents(sampleStudents);
    setFilteredStudents(sampleStudents);
  }, []);

  useEffect(() => {
    filterStudents();
  }, [searchTerm, selectedClass, selectedStatus, students]);

  const filterStudents = () => {
    let filtered = students;

    if (searchTerm) {
      filtered = filtered.filter(student =>
        student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        student.id.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (selectedClass !== 'all') {
      filtered = filtered.filter(student => student.class === selectedClass);
    }

    if (selectedStatus !== 'all') {
      filtered = filtered.filter(student => student.status === selectedStatus);
    }

    setFilteredStudents(filtered);
  };

  const handleAddStudent = (studentData) => {
    const newStudent = {
      ...studentData,
      id: `S${String(students.length + 1).padStart(3, '0')}`
    };
    setStudents([...students, newStudent]);
    setShowForm(false);
  };

  const handleEditStudent = (studentData) => {
    setStudents(students.map(student =>
      student.id === editingStudent.id ? { ...student, ...studentData } : student
    ));
    setEditingStudent(null);
    setShowForm(false);
  };

  const handleDeleteStudent = (studentId) => {
    if (window.confirm('هل أنت متأكد من حذف هذا الطالب؟')) {
      setStudents(students.filter(student => student.id !== studentId));
    }
  };

  const handleEditClick = (student) => {
    setEditingStudent(student);
    setShowForm(true);
  };

  return (
    <div className="student-management">
      <div className="page-header">
        <h1>إدارة الطلاب</h1>
        <div className="header-actions">
          <button className="btn-secondary">
            <Download size={18} />
            تصدير البيانات
          </button>
          <button className="btn-secondary">
            <Upload size={18} />
            استيراد
          </button>
          <button 
            className="btn-primary"
            onClick={() => setShowForm(true)}
          >
            <Plus size={18} />
            إضافة طالب جديد
          </button>
        </div>
      </div>

      <div className="filters-section">
        <div className="search-box">
          <Search size={20} />
          <input
            type="text"
            placeholder="البحث بالاسم أو الرقم..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <select
          value={selectedClass}
          onChange={(e) => setSelectedClass(e.target.value)}
        >
          <option value="all">جميع الصفوف</option>
          <option value="الصف الأول">الصف الأول</option>
          <option value="الصف الثاني">الصف الثاني</option>
          <option value="الصف الثالث">الصف الثالث</option>
          <option value="الصف الرابع">الصف الرابع</option>
        </select>

        <select
          value={selectedStatus}
          onChange={(e) => setSelectedStatus(e.target.value)}
        >
          <option value="all">جميع الحالات</option>
          <option value="نشط">نشط</option>
          <option value="غير نشط">غير نشط</option>
          <option value="موقوف">موقوف</option>
        </select>
      </div>

      <div className="students-table-container">
        <table className="students-table">
          <thead>
            <tr>
              <th>رقم الطالب</th>
              <th>الاسم</th>
              <th>البريد الإلكتروني</th>
              <th>الهاتف</th>
              <th>الصف</th>
              <th>المستوى</th>
              <th>الحالة</th>
              <th>تاريخ الانضمام</th>
              <th>الإجراءات</th>
            </tr>
          </thead>
          <tbody>
            {filteredStudents.map(student => (
              <tr key={student.id}>
                <td className="student-id">{student.id}</td>
                <td className="student-name">
                  <div className="name-avatar">
                    <div className="avatar">
                      {student.name.split(' ').map(n => n[0]).join('')}
                    </div>
                    {student.name}
                  </div>
                </td>
                <td>{student.email}</td>
                <td>{student.phone}</td>
                <td>
                  <span className="class-badge">{student.class}</span>
                </td>
                <td>
                  <span className={`level-badge ${student.level}`}>
                    {student.level}
                  </span>
                </td>
                <td>
                  <span className={`status-badge ${student.status}`}>
                    {student.status}
                  </span>
                </td>
                <td>{new Date(student.joinDate).toLocaleDateString('ar-SA')}</td>
                <td>
                  <div className="action-buttons">
                    <button
                      className="btn-edit"
                      onClick={() => handleEditClick(student)}
                    >
                      <Edit size={16} />
                    </button>
                    <button
                      className="btn-delete"
                      onClick={() => handleDeleteStudent(student.id)}
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {filteredStudents.length === 0 && (
          <div className="no-data">
            <p>لا توجد بيانات للعرض</p>
          </div>
        )}
      </div>

      {showForm && (
        <StudentForm
          student={editingStudent}
          onSave={editingStudent ? handleEditStudent : handleAddStudent}
          onCancel={() => {
            setShowForm(false);
            setEditingStudent(null);
          }}
        />
      )}
    </div>
  );
};

export default StudentManagement;
