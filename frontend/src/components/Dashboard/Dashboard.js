
import React, { useState, useEffect } from 'react';
import { Bar, Doughnut } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
} from 'chart.js';
import { Users, BookOpen, UserCheck, Award } from 'lucide-react';
import './Dashboard.css';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
);

const Dashboard = () => {
  const [stats, setStats] = useState({
    totalStudents: 0,
    activeTeachers: 0,
    availableCourses: 0,
    attendanceRate: 0
  });

  const [recentActivities, setRecentActivities] = useState([]);

  useEffect(() => {
    // بيانات وهمية للعرض
    setStats({
      totalStudents: 1247,
      activeTeachers: 89,
      availableCourses: 156,
      attendanceRate: 94
    });

    setRecentActivities([
      { id: 1, type: 'student', message: 'تم تسجيل طالب جديد محمد أحمد - الصف الثالث', time: 'منذ 5 دقائق' },
      { id: 2, type: 'grade', message: 'تم رفع درجات امتحان القرآن الكريم', time: 'منذ ساعة' },
      { id: 3, type: 'teacher', message: 'الاستاذة فاطمة - الصف الثاني', time: 'منذ ساعتين' },
      { id: 4, type: 'course', message: 'تم إضافة مقرر جديد تجويد - المرحلة المتوسطة', time: 'منذ 3 ساعات' }
    ]);
  }, []);

  const performanceData = {
    labels: ['يناير', 'فبراير', 'مارس', 'أبريل', 'مايو', 'يونيو'],
    datasets: [
      {
        label: 'معدل الحفظ',
        data: [65, 70, 75, 80, 85, 90],
        backgroundColor: 'rgba(54, 162, 235, 0.6)',
        borderColor: 'rgba(54, 162, 235, 1)',
        borderWidth: 2,
      },
      {
        label: 'معدل الحضور',
        data: [85, 88, 90, 92, 94, 96],
        backgroundColor: 'rgba(75, 192, 192, 0.6)',
        borderColor: 'rgba(75, 192, 192, 1)',
        borderWidth: 2,
      },
    ],
  };

  const courseDistributionData = {
    labels: ['القرآن الكريم', 'التجويد', 'الفقه', 'اللغة العربية'],
    datasets: [
      {
        data: [40, 25, 20, 15],
        backgroundColor: [
          'rgba(255, 99, 132, 0.8)',
          'rgba(54, 162, 235, 0.8)',
          'rgba(255, 206, 86, 0.8)',
          'rgba(75, 192, 192, 0.8)',
        ],
        borderWidth: 2,
      },
    ],
  };

  return (
    <div className="dashboard">
      <div className="dashboard-header">
        <h1>لوحة التحكم الرئيسية</h1>
        <p>مرحباً بك في نظام إدارة تعليم القرآن الكريم</p>
      </div>

      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon students">
            <Users size={24} />
          </div>
          <div className="stat-info">
            <h3>إجمالي الطلاب</h3>
            <p className="stat-number">{stats.totalStudents}</p>
            <span className="stat-change">+12 هذا الشهر</span>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon teachers">
            <UserCheck size={24} />
          </div>
          <div className="stat-info">
            <h3>المعلمين النشطين</h3>
            <p className="stat-number">{stats.activeTeachers}</p>
            <span className="stat-change">+2 هذا الشهر</span>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon courses">
            <BookOpen size={24} />
          </div>
          <div className="stat-info">
            <h3>المقررات المتاحة</h3>
            <p className="stat-number">{stats.availableCourses}</p>
            <span className="stat-change">+5 جديد</span>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon attendance">
            <Award size={24} />
          </div>
          <div className="stat-info">
            <h3>معدل الحضور</h3>
            <p className="stat-number">{stats.attendanceRate}%</p>
            <span className="stat-change">+2% عن الشهر الماضي</span>
          </div>
        </div>
      </div>

      <div className="charts-grid">
        <div className="chart-card">
          <h3>أداء الطلاب الشهري</h3>
          <Bar 
            data={performanceData} 
            options={{
              responsive: true,
              plugins: {
                legend: {
                  position: 'top',
                  rtl: true,
                },
                title: {
                  display: false,
                },
              },
              scales: {
                x: {
                  grid: {
                    display: false,
                  },
                },
                y: {
                  beginAtZero: true,
                  max: 100,
                },
              },
            }}
          />
        </div>

        <div className="chart-card">
          <h3>توزيع المقررات</h3>
          <Doughnut 
            data={courseDistributionData}
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

      <div className="recent-activities">
        <h3>الأنشطة الأخيرة</h3>
        <div className="activities-list">
          {recentActivities.map(activity => (
            <div key={activity.id} className="activity-item">
              <div className="activity-dot"></div>
              <div className="activity-content">
                <p>{activity.message}</p>
                <span className="activity-time">{activity.time}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
