import React, { useState } from 'react';
import './App.css';

const QuranLearningPlatform = () => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [students, setStudents] = useState([
    { id: 'S001', name: 'أحمد محمد علي', class: 'الصف الثالث', status: 'نشط' },
    { id: 'S002', name: 'فاطمة أحمد', class: 'الصف الثاني', status: 'نشط' },
    { id: 'S003', name: 'محمد سالم', class: 'الصف الرابع', status: 'نشط' },
    { id: 'S004', name: 'عائشة علي', class: 'الصف الأول', status: 'نشط' }
  ]);

  const stats = {
    totalStudents: 1247,
    activeTeachers: 89,
    availableCourses: 156,
    attendanceRate: 94
  };

  return (
    <div className="app">
      {/* الشريط الجانبي */}
      <div className="sidebar">
        <h2>نظام إدارة تعليمي</h2>
        <nav>
          <button 
            className={activeTab === 'dashboard' ? 'active' : ''}
            onClick={() => setActiveTab('dashboard')}
          >
            لوحة التحكم
          </button>
          <button 
            className={activeTab === 'students' ? 'active' : ''}
            onClick={() => setActiveTab('students')}
          >
            إدارة الطلاب
          </button>
          <button 
            className={activeTab === 'teachers' ? 'active' : ''}
            onClick={() => setActiveTab('teachers')}
          >
            إدارة المعلمين
          </button>
          <button 
            className={activeTab === 'courses' ? 'active' : ''}
            onClick={() => setActiveTab('courses')}
          >
            إدارة المقررات
          </button>
          <button 
            className={activeTab === 'grades' ? 'active' : ''}
            onClick={() => setActiveTab('grades')}
          >
            الدرجات والتقييم
          </button>
          <button 
            className={activeTab === 'attendance' ? 'active' : ''}
            onClick={() => setActiveTab('attendance')}
          >
            الحضور والغياب
          </button>
          <button 
            className={activeTab === 'reports' ? 'active' : ''}
            onClick={() => setActiveTab('reports')}
          >
            التقارير
          </button>
          <button 
            className={activeTab === 'settings' ? 'active' : ''}
            onClick={() => setActiveTab('settings')}
          >
            الإعدادات
          </button>
        </nav>
      </div>

      {/* المحتوى الرئيسي */}
      <div className="main-content">
        {activeTab === 'dashboard' && <Dashboard stats={stats} />}
        {activeTab === 'students' && <StudentManagement students={students} />}
        {activeTab === 'reports' && <Reports />}
        {/* يمكن إضافة المزيد من المكونات هنا */}
      </div>
    </div>
  );
};

// مكون لوحة التحكم
const Dashboard = ({ stats }) => (
  <div className="dashboard">
    <h1>لوحة التحكم الرئيسية</h1>
    
    <div className="stats-grid">
      <div className="stat-card">
        <h3>إجمالي الطلاب</h3>
        <p className="stat-number">{stats.totalStudents}</p>
      </div>
      <div className="stat-card">
        <h3>المعلمين النشطين</h3>
        <p className="stat-number">{stats.activeTeachers}</p>
      </div>
      <div className="stat-card">
        <h3>المقررات المتاحة</h3>
        <p className="stat-number">{stats.availableCourses}</p>
      </div>
      <div className="stat-card">
        <h3>معدل الحضور</h3>
        <p className="stat-number">{stats.attendanceRate}%</p>
      </div>
    </div>

    <div className="recent-activities">
      <h3>الأنشطة الأخيرة</h3>
      <ul>
        <li>تم تسجيل طالب جديد محمد أحمد - الصف الثالث</li>
        <li>تم رفع درجات امتحان القرآن الكريم</li>
        <li>الاستاذة فاطمة - الصف الثاني</li>
        <li>تم إضافة مقرر جديد تجويد - المرحلة المتوسطة</li>
      </ul>
    </div>
  </div>
);

// مكون إدارة الطلاب
const StudentManagement = ({ students }) => (
  <div className="student-management">
    <h1>إدارة الطلاب</h1>
    
    <div className="controls">
      <button className="btn-primary">إضافة طالب جديد</button>
      <input type="text" placeholder="البحث بالاسم أو الرقم..." />
      <select>
        <option>جميع الصفوف</option>
        <option>الصف الأول</option>
        <option>الصف الثاني</option>
        <option>الصف الثالث</option>
      </select>
      <select>
        <option>جميع الحالات</option>
        <option>نشط</option>
        <option>غير نشط</option>
      </select>
    </div>

    <table className="students-table">
      <thead>
        <tr>
          <th>رقم الطالب</th>
          <th>الاسم</th>
          <th>الصف</th>
          <th>الحالة</th>
          <th>الإجراءات</th>
        </tr>
      </thead>
      <tbody>
        {students.map(student => (
          <tr key={student.id}>
            <td>{student.id}</td>
            <td>{student.name}</td>
            <td>{student.class}</td>
            <td>{student.status}</td>
            <td>
              <button>تعديل</button>
              <button>حذف</button>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  </div>
);

// مكون التقارير
const Reports = () => (
  <div className="reports">
    <h1>التقارير والإحصائيات</h1>
    
    <div className="reports-grid">
      <div className="report-card">
        <h3>تقرير الطلاب</h3>
        <p>إحصائيات شاملة عن الطلاب</p>
        <button>عرض التقرير</button>
      </div>
      <div className="report-card">
        <h3>تقرير الدرجات</h3>
        <p>تحليل أداء الطلاب الأكاديمي</p>
        <button>عرض التقرير</button>
      </div>
      <div className="report-card">
        <h3>تقرير الحضور</h3>
        <p>إحصائيات الحضور والغياب</p>
        <button>عرض التقرير</button>
      </div>
    </div>
  </div>
);

export default QuranLearningPlatform;
