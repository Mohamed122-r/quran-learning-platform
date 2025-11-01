
import React, { useState, useEffect } from 'react';
import { Bar, Line, Doughnut, Pie } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
} from 'chart.js';
import { Download, Filter, Users, BookOpen, UserCheck, Award, TrendingUp } from 'lucide-react';
import './Reports.css';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
);

const Reports = () => {
  const [activeReport, setActiveReport] = useState('overview');
  const [dateRange, setDateRange] = useState({
    startDate: new Date(new Date().getFullYear(), new Date().getMonth(), 1),
    endDate: new Date()
  });
  const [filters, setFilters] = useState({
    class: 'all',
    course: 'all',
    teacher: 'all'
  });

  const [reportData, setReportData] = useState({});

  useEffect(() => {
    // بيانات وهمية للتقارير
    loadReportData();
  }, [activeReport, dateRange, filters]);

  const loadReportData = () => {
    // بيانات وهمية شاملة
    const mockData = {
      overview: {
        totalStudents: 1247,
        activeStudents: 1180,
        totalTeachers: 89,
        activeTeachers: 85,
        totalCourses: 156,
        activeCourses: 142,
        attendanceRate: 94,
        completionRate: 88
      },
      students: {
        byClass: {
          labels: ['الصف الأول', 'الصف الثاني', 'الصف الثالث', 'الصف الرابع'],
          data: [320, 280, 350, 297]
        },
        byLevel: {
          labels: ['مبتدئ', 'متوسط', 'متقدم'],
          data: [450, 520, 277]
        },
        byStatus: {
          labels: ['نشط', 'غير نشط', 'موقوف'],
          data: [1180, 45, 22]
        }
      },
      attendance: {
        daily: {
          labels: ['1', '2', '3', '4', '5', '6', '7'],
          present: [95, 92, 94, 96, 93, 95, 94],
          absent: [5, 8, 6, 4, 7, 5, 6]
        },
        monthly: {
          labels: ['يناير', 'فبراير', 'مارس', 'أبريل', 'مايو', 'يونيو'],
          rates: [92, 93, 94, 95, 94, 96]
        },
        byCourse: {
          labels: ['القرآن الكريم', 'التجويد', 'الفقه', 'اللغة العربية'],
          rates: [96, 94, 92, 95]
        }
      },
      grades: {
        distribution: {
          labels: ['ممتاز (90-100)', 'جيد جداً (80-89)', 'جيد (70-79)', 'مقبول (60-69)', 'راسب (أقل من 60)'],
          data: [35, 40, 15, 7, 3]
        },
        byCourse: {
          labels: ['القرآن الكريم', 'التجويد', 'الفقه', 'اللغة العربية'],
          averages: [88, 85, 82, 79]
        },
        trends: {
          labels: ['يناير', 'فبراير', 'مارس', 'أبريل', 'مايو', 'يونيو'],
          averages: [82, 84, 85, 86, 87, 88]
        }
      }
    };

    setReportData(mockData);
  };

  const renderOverview = () => (
    <div className="overview-reports">
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon students">
            <Users size={24} />
          </div>
          <div className="stat-info">
            <h3>إجمالي الطلاب</h3>
            <p className="stat-number">{reportData.overview?.totalStudents}</p>
            <span className="stat-change">+12 هذا الشهر</span>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon teachers">
            <UserCheck size={24} />
          </div>
          <div className="stat-info">
            <h3>المعلمين النشطين</h3>
            <p className="stat-number">{reportData.overview?.activeTeachers}</p>
            <span className="stat-change">+2 هذا الشهر</span>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon courses">
            <BookOpen size={24} />
          </div>
          <div className="stat-info">
            <h3>المقررات النشطة</h3>
            <p className="stat-number">{reportData.overview?.activeCourses}</p>
            <span className="stat-change">+5 جديد</span>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon attendance">
            <Award size={24} />
          </div>
          <div className="stat-info">
            <h3>معدل الحضور</h3>
            <p className="stat-number">{reportData.overview?.attendanceRate}%</p>
            <span className="stat-change">+2% عن الشهر الماضي</span>
          </div>
        </div>
      </div>

      <div className="charts-grid">
        <div className="chart-card">
          <h3>توزيع الطلاب حسب الصف</h3>
          <Bar 
            data={{
              labels: reportData.students?.byClass?.labels,
              datasets: [
                {
                  label: 'عدد الطلاب',
                  data: reportData.students?.byClass?.data,
                  backgroundColor: 'rgba(54, 162, 235, 0.8)',
                  borderColor: 'rgba(54, 162, 235, 1)',
                  borderWidth: 2,
                }
              ]
            }}
            options={{
              responsive: true,
              plugins: {
                legend: {
                  position: 'top',
                  rtl: true,
                },
              },
            }}
          />
        </div>

        <div className="chart-card">
          <h3>توزيع الطلاب حسب المستوى</h3>
          <Doughnut 
            data={{
              labels: reportData.students?.byLevel?.labels,
              datasets: [
                {
                  data: reportData.students?.byLevel?.data,
                  backgroundColor: [
                    'rgba(255, 99, 132, 0.8)',
                    'rgba(54, 162, 235, 0.8)',
                    'rgba(255, 206, 86, 0.8)',
                  ],
                  borderWidth: 2,
                }
              ]
            }}
            options={{
              responsive: true,
              plugins: {
                legend: {
                  position: 'bottom',
                  rtl: true,
                },
              },
            }}
          />
        </div>
      </div>
    </div>
  );

  const renderAttendanceReport = () => (
    <div className="attendance-reports">
      <div className="charts-grid">
        <div className="chart-card">
          <h3>معدل الحضور الأسبوعي</h3>
          <Line 
            data={{
              labels: reportData.attendance?.daily?.labels,
              datasets: [
                {
                  label: 'الحضور %',
                  data: reportData.attendance?.daily?.present,
                  borderColor: 'rgba(75, 192, 192, 1)',
                  backgroundColor: 'rgba(75, 192, 192, 0.2)',
                  tension: 0.4,
                }
              ]
            }}
            options={{
              responsive: true,
              plugins: {
                legend: {
                  position: 'top',
                  rtl: true,
                },
              },
              scales: {
                y: {
                  beginAtZero: false,
                  min: 80,
                  max: 100,
                },
              },
            }}
          />
        </div>

        <div className="chart-card">
          <h3>الحضور حسب المقرر</h3>
          <Bar 
            data={{
              labels: reportData.attendance?.byCourse?.labels,
              datasets: [
                {
                  label: 'معدل الحضور %',
                  data: reportData.attendance?.byCourse?.rates,
                  backgroundColor: 'rgba(153, 102, 255, 0.8)',
                  borderColor: 'rgba(153, 102, 255, 1)',
                  borderWidth: 2,
                }
              ]
            }}
            options={{
              responsive: true,
              plugins: {
                legend: {
                  position: 'top',
                  rtl: true,
                },
              },
              scales: {
                y: {
                  beginAtZero: false,
                  min: 80,
                  max: 100,
                },
              },
            }}
          />
        </div>
      </div>
    </div>
  );

  const renderGradesReport = () => (
    <div className="grades-reports">
      <div className="charts-grid">
        <div className="chart-card">
          <h3>توزيع الدرجات</h3>
          <Pie 
            data={{
              labels: reportData.grades?.distribution?.labels,
              datasets: [
                {
                  data: reportData.grades?.distribution?.data,
                  backgroundColor: [
                    'rgba(75, 192, 192, 0.8)',
                    'rgba(54, 162, 235, 0.8)',
                    'rgba(255, 206, 86, 0.8)',
                    'rgba(255, 159, 64, 0.8)',
                    'rgba(255, 99, 132, 0.8)',
                  ],
                  borderWidth: 2,
                }
              ]
            }}
            options={{
              responsive: true,
              plugins: {
                legend: {
                  position: 'bottom',
                  rtl: true,
                },
              },
            }}
          />
        </div>

        <div className="chart-card">
          <h3>متوسط الدرجات حسب المقرر</h3>
          <Bar 
            data={{
              labels: reportData.grades?.byCourse?.labels,
              datasets: [
                {
                  label: 'المتوسط %',
                  data: reportData.grades?.byCourse?.averages,
                  backgroundColor: 'rgba(255, 159, 64, 0.8)',
                  borderColor: 'rgba(255, 159, 64, 1)',
                  borderWidth: 2,
                }
              ]
            }}
            options={{
              responsive: true,
              plugins: {
                legend: {
                  position: 'top',
                  rtl: true,
                },
              },
              scales: {
                y: {
                  beginAtZero: false,
                  min: 70,
                  max: 100,
                },
              },
            }}
          />
        </div>
      </div>
    </div>
  );

  const exportReport = () => {
    // محاكاة تصدير التقرير
    const link = document.createElement('a');
    link.href = URL.createObjectURL(new Blob(['تقرير مفصل'], { type: 'text/csv' }));
    link.download = `تقرير-${activeReport}-${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
  };

  return (
    <div className="reports">
      <div className="page-header">
        <h1>التقارير والإحصائيات</h1>
        <div className="header-actions">
          <button className="btn-secondary">
            <Filter size={18} />
            تصفية
          </button>
          <button className="btn-primary" onClick={exportReport}>
            <Download size={18} />
            تصدير التقرير
          </button>
        </div>
      </div>

      <div className="reports-tabs">
        <button 
          className={`tab-button ${activeReport === 'overview' ? 'active' : ''}`}
          onClick={() => setActiveReport('overview')}
        >
          <TrendingUp size={18} />
          نظرة عامة
        </button>
        <button 
          className={`tab-button ${activeReport === 'students' ? 'active' : ''}`}
          onClick={() => setActiveReport('students')}
        >
          <Users size={18} />
          تقرير الطلاب
        </button>
        <button 
          className={`tab-button ${activeReport === 'attendance' ? 'active' : ''}`}
          onClick={() => setActiveReport('attendance')}
        >
          <UserCheck size={18} />
          تقرير الحضور
        </button>
        <button 
          className={`tab-button ${activeReport === 'grades' ? 'active' : ''}`}
          onClick={() => setActiveReport('grades')}
        >
          <Award size={18} />
          تقرير الدرجات
        </button>
      </div>

      <div className="report-content">
        {activeReport === 'overview' && renderOverview()}
        {activeReport === 'students' && renderOverview()} {/* استخدام نفس التصميم مؤقتاً */}
        {activeReport === 'attendance' && renderAttendanceReport()}
        {activeReport === 'grades' && renderGradesReport()}
      </div>
    </div>
  );
};

export default Reports;
