import { useState, useEffect } from "react";
import axiosClient from "../../api/axiosClient";
import { getClassLabel, sortClasses } from "../../data/classes";

export default function Attendance() {
  const [attendanceData, setAttendanceData] = useState([]);
  const [classStudents, setClassStudents] = useState([]);
  const [classes, setClasses] = useState([]);
  const [selectedClass, setSelectedClass] = useState("");
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState("");

  useEffect(() => {
    fetchClasses();
  }, []);

  useEffect(() => {
    if (selectedClass) {
      fetchClassStudents();
    }
    if (selectedClass && selectedDate) {
      fetchAttendance();
    } else {
      setAttendanceData([]);
    }
  }, [selectedClass, selectedDate]);

  const getAttendanceStudentId = (record) =>
    record.student_id || record.student?.id || record.student?.user?.id;

  const fetchClasses = async () => {
    try {
      const response = await axiosClient.get("/classes");
      const classesData = response.data?.data?.items || [];
      const sorted = sortClasses(classesData);
      setClasses(sorted);
      if (sorted.length > 0) {
        setSelectedClass(sorted[0].id);
      }
    } catch (error) {
      console.error("Error fetching classes:", error);
    }
  };

  const fetchClassStudents = async () => {
    try {
      setLoading(true);
      const response = await axiosClient.get(`/students?class_id=${selectedClass}`);
      setClassStudents(response.data?.data?.items || []);
    } catch (error) {
      console.error("Error fetching class students:", error);
      setClassStudents([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchAttendance = async () => {
    try {
      setLoading(true);
      const response = await axiosClient.get(
        `/attendance?class_id=${selectedClass}&date=${selectedDate}`
      );
      setAttendanceData(response.data?.data?.items || []);
    } catch (error) {
      console.error("Error fetching attendance:", error);
      setAttendanceData([]);
    } finally {
      setLoading(false);
    }
  };

  const handleAttendanceChange = async (studentId, status) => {
    try {
      await axiosClient.post("/attendance", {
        student_id: studentId,
        date: selectedDate,
        status: status,
      });

      setAttendanceData((prev) => {
        const existing = prev.find((item) => getAttendanceStudentId(item) === studentId);
        if (existing) {
          return prev.map((item) =>
            getAttendanceStudentId(item) === studentId ? { ...item, status } : item
          );
        }
        return [...prev, { student_id: studentId, status, remarks: "", date: selectedDate }];
      });

      setStatus("Attendance marked successfully!");
    } catch (error) {
      setStatus(error.response?.data?.error || "Failed to mark attendance");
    }
  };

  return (
    <div>
      <h2>Attendance Management</h2>

      {status && (
        <p className={status.includes("successfully") ? "success-message" : "error-message"}>
          {status}
        </p>
      )}

      <div style={{ marginBottom: "20px" }}>
        <label style={{ marginRight: "20px" }}>
          Class:
          <select
            value={selectedClass}
            onChange={(e) => setSelectedClass(e.target.value)}
            style={{ marginLeft: "10px", padding: "8px" }}
          >
            <option value="">Select Class</option>
            {classes.map((cls) => (
              <option key={cls.id} value={cls.id}>
                {getClassLabel(cls)}
              </option>
            ))}
          </select>
        </label>

        <label>
          Date:
          <input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            style={{ marginLeft: "10px", padding: "8px" }}
          />
        </label>
      </div>

      {loading ? (
        <p>Loading attendance records...</p>
      ) : classStudents.length > 0 ? (
        <div>
          <h3>Students in selected class</h3>
          <table>
            <thead>
              <tr>
                <th>Student Name</th>
                <th>Attendance</th>
                <th>Remarks</th>
              </tr>
            </thead>
            <tbody>
              {classStudents.map((student) => {
                const studentId = student.id || student.student_id || student.user?.id;
                const studentName =
                  student.name ||
                  `${student.first_name || student.user?.first_name || ""} ${student.last_name || student.user?.last_name || ""}`.trim();
                const attendanceRecord = attendanceData.find(
                  (record) => record.student_id === studentId || record.student?.id === studentId
                );
                return (
                  <tr key={studentId || studentName}>
                    <td>{studentName || "N/A"}</td>
                    <td>
                      <select
                        value={attendanceRecord?.status || ""}
                        onChange={(e) => handleAttendanceChange(studentId, e.target.value)}
                        style={{ padding: "5px" }}
                      >
                        <option value="">Mark Attendance</option>
                        <option value="present">Present</option>
                        <option value="absent">Absent</option>
                        <option value="late">Late</option>
                        <option value="excused">Excused</option>
                      </select>
                    </td>
                    <td>{attendanceRecord?.remarks || "N/A"}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      ) : (
        <p>
          {selectedClass
            ? "No students found for this class, or attendance has not been recorded yet."
            : "Select a class and date to view attendance."}
        </p>
      )}
    </div>
  );
}