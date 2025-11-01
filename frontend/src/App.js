import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Sidebar from './components/Shared/Sidebar';
import Dashboard from './components/Dashboard/Dashboard';
import StudentManagement from './components/Students/StudentManagement';
import TeacherManagement from './components/Teachers/TeacherManagement';
import CourseManagement from './components/Courses/CourseManagement';
import Attendance from './components/Attendance/Attendance';
import Grades from './components/Grades/Grades';
import Reports from './components/Reports/Reports';
import Settings from './components/Settings/Settings';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import './App.css';

function App() {
  const [sidebarOpen, setSidebarOpen] = useState(true);

  return (
    <Router>
      <div className="app">
        <Sidebar 
          isOpen={sidebarOpen} 
          onToggle={() => setSidebarOpen(!sidebarOpen)} 
        />
        
        <div className={`main-content ${sidebarOpen ? 'sidebar-open' : 'sidebar-closed'}`}>
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/students" element={<StudentManagement />} />
            <Route path="/teachers" element={<TeacherManagement />} />
            <Route path="/courses" element={<CourseManagement />} />
            <Route path="/attendance" element={<Attendance />} />
            <Route path="/grades" element={<Grades />} />
            <Route path="/reports" element={<Reports />} />
            <Route path="/settings" element={<Settings />} />
          </Routes>
        </div>
        
        <ToastContainer 
          position="top-right"
          autoClose={5000}
          hideProgressBar={false}
          newestOnTop={false}
          closeOnClick
          rtl={true}
          pauseOnFocusLoss
          draggable
          pauseOnHover
        />
      </div>
    </Router>
  );
}

export default App;          </button>
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
