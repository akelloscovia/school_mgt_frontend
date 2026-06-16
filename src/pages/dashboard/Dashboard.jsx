import { useState, useEffect } from "react";
import axiosClient from "../../api/axiosClient";

const LOCAL_STORAGE_STUDENTS = "school-ms-frontend-students";
const LOCAL_STORAGE_STAFF = "school-ms-frontend-staff";

const loadLocalStudents = () => {
  try {
    const stored = localStorage.getItem(LOCAL_STORAGE_STUDENTS);
    return stored ? JSON.parse(stored) : [];
  } catch (error) {
    return [];
  }
};

const loadLocalStaff = () => {
  try {
    const stored = localStorage.getItem(LOCAL_STORAGE_STAFF);
    return stored ? JSON.parse(stored) : [];
  } catch (error) {
    return [];
  }
};

export default function Dashboard() {
  const [dashboardData, setDashboardData] = useState({
    totalStudents: 0,
    totalTeachers: 0,
    totalClasses: 0,
    totalAttendanceToday: 0,
  });
  const [attendanceSummary, setAttendanceSummary] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);

      // Attempt to fetch protected dashboard details (requires auth)
      const studentsRes = await axiosClient.get("/students");
      const studentItems = studentsRes.data?.data?.items || [];
      const localStudents = loadLocalStudents();
      const mergedStudents = [...studentItems];
      localStudents.forEach((local) => {
        if (!mergedStudents.some((item) => item.id === local.id)) {
          mergedStudents.push(local);
        }
      });
      const totalStudents =
        Number(studentsRes.data?.data?.total) || mergedStudents.length || studentItems.length;

      const classesRes = await axiosClient.get("/classes");
      const totalClasses = Number(classesRes.data?.data?.total) || classesRes.data?.data?.items?.length || 0;

      const usersRes = await axiosClient.get("/users?role=teacher");
      const apiTeachers = usersRes.data?.data?.items || [];
      const localStaff = loadLocalStaff();
      const mergedTeachers = [...apiTeachers];
      localStaff.forEach((local) => {
        if (!mergedTeachers.some((t) => t.id === local.id)) mergedTeachers.push(local);
      });
      const totalTeachers = Number(usersRes.data?.data?.total) || mergedTeachers.length || apiTeachers.length;

      const attendanceRes = await axiosClient.get("/attendance?date=" + new Date().toISOString().split('T')[0]);
      const attendanceData = attendanceRes.data?.data?.items || [];
      const presentToday = attendanceData.filter(a => a.status === 'present').length;

      setDashboardData({
        totalStudents,
        totalTeachers,
        totalClasses,
        totalAttendanceToday: presentToday,
      });

      setAttendanceSummary(attendanceData);
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
      // Try public totals endpoint first (no auth required)
      try {
        const publicRes = await axiosClient.get('/reports/public/totals');
        const publicData = publicRes.data?.data || {};
        setDashboardData((prev) => ({
          ...prev,
          totalStudents: Number(publicData.total_students) || prev.totalStudents,
          totalTeachers: Number(publicData.total_teachers) || prev.totalTeachers,
          totalClasses: Number(publicData.total_classes) || prev.totalClasses,
          totalAttendanceToday: Number(publicData.present_today) || prev.totalAttendanceToday,
        }));
      } catch (publicErr) {
        // If public endpoint also fails, fall back to local students saved by registration form
        try {
          const localStudents = loadLocalStudents();
          const localCount = Array.isArray(localStudents) ? localStudents.length : 0;
          setDashboardData((prev) => ({
            ...prev,
            totalStudents: localCount,
          }));
          setAttendanceSummary([]);
        } catch (e) {
          // ignore
        }
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
    window.addEventListener('staff:updated', fetchDashboardData);
    return () => window.removeEventListener('staff:updated', fetchDashboardData);
  }, []);
  return (
    <div>

      <h1 className="dashboard-title">
        Dashboard
      </h1>

      {loading ? (
        <p>Loading dashboard data...</p>
      ) : (
        <>
          <div className="dashboard-grid">

            <div className="dashboard-card">
              <h3>Total Students</h3>
              <p>{dashboardData.totalStudents}</p>
            </div>

            <div className="dashboard-card">
              <h3>Total Teachers</h3>
              <p>{dashboardData.totalTeachers}</p>
            </div>

            <div className="dashboard-card">
              <h3>Total Classes</h3>
              <p>{dashboardData.totalClasses}</p>
            </div>

            <div className="dashboard-card">
              <h3>Present Today</h3>
              <p>{dashboardData.totalAttendanceToday}</p>
            </div>

          </div>

          <div className="dashboard-lower">

            <div className="large-card">
              <h3>Attendance Summary</h3>

              {attendanceSummary.length > 0 ? (
                <table>
                  <thead>
                    <tr>
                      <th>Student</th>
                      <th>Status</th>
                      <th>Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    {attendanceSummary.slice(0, 10).map((record) => (
                      <tr key={record.id}>
                        <td>{record.student_name || "N/A"}</td>
                        <td>{record.status}</td>
                        <td>{new Date(record.date).toLocaleDateString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                <p>No attendance records for today.</p>
              )}
            </div>

            <div className="large-card">
              <h3>Performance Analytics</h3>

              <p>
                Performance data will be displayed here.
              </p>
            </div>

          </div>
        </>
      )}

    </div>
  );
}