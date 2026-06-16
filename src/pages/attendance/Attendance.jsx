import { useState, useEffect } from "react";
import axiosClient from "../../api/axiosClient";

export default function Attendance() {
  const [attendanceData, setAttendanceData] = useState([]);
  const [classes, setClasses] = useState([]);
  const [selectedClass, setSelectedClass] = useState("");
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState("");

  useEffect(() => {
    fetchClasses();
  }, []);

  useEffect(() => {
    if (selectedClass && selectedDate) {
      fetchAttendance();
    }
  }, [selectedClass, selectedDate]);

  const fetchClasses = async () => {
    try {
      const response = await axiosClient.get("/classes");
      const classesData = response.data?.data?.items || [];
      setClasses(classesData);
      if (classesData.length > 0) {
        setSelectedClass(classesData[0].id);
      }
    } catch (error) {
      console.error("Error fetching classes:", error);
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
      
      // Update local state
      setAttendanceData((prev) =>
        prev.map((item) =>
          item.student_id === studentId ? { ...item, status } : item
        )
      );
      
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
                {cls.name} - {cls.level}
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
      ) : attendanceData.length > 0 ? (
        <table>
          <thead>
            <tr>
              <th>Student Name</th>
              <th>Status</th>
              <th>Remarks</th>
            </tr>
          </thead>

          <tbody>
            {attendanceData.map((record) => (
              <tr key={record.id || record.student_id}>
                <td>{record.student_name || `${record.student?.user?.first_name} ${record.student?.user?.last_name}`}</td>
                <td>
                  <select
                    value={record.status || ""}
                    onChange={(e) => handleAttendanceChange(record.student_id, e.target.value)}
                    style={{ padding: "5px" }}
                  >
                    <option value="">Mark Attendance</option>
                    <option value="present">Present</option>
                    <option value="absent">Absent</option>
                    <option value="late">Late</option>
                    <option value="excused">Excused</option>
                  </select>
                </td>
                <td>{record.remarks || "N/A"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      ) : (
        <p>
          {selectedClass && selectedDate
            ? "No students found for this class, or attendance not yet loaded."
            : "Select a class and date to view attendance."}
        </p>
      )}
    </div>
  );
}