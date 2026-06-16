import { useState, useEffect } from "react";
import axiosClient from "../../api/axiosClient";

export default function Timetable() {
  const [timetableEntries, setTimetableEntries] = useState([]);
  const [classes, setClasses] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [teachers, setTeachers] = useState([]);
  const [status, setStatus] = useState("");
  const [loading, setLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [selectedClassId, setSelectedClassId] = useState("");
  const [formData, setFormData] = useState({
    subject_id: "",
    teacher_id: "",
    day_of_week: "Monday",
    start_time: "08:00",
    end_time: "09:00",
    venue: "",
    academic_year: new Date().getFullYear().toString(),
  });

  // Fetch initial data
  useEffect(() => {
    fetchClasses();
    fetchTeachers();
  }, []);

  // Fetch subjects when class changes
  useEffect(() => {
    if (selectedClassId) {
      fetchSubjects(selectedClassId);
      fetchTimetable(selectedClassId);
    }
  }, [selectedClassId]);

  const fetchClasses = async () => {
    try {
      const response = await axiosClient.get("/classes");
      const classesData = response.data?.data?.items || [];
      setClasses(classesData);
      if (classesData.length > 0) {
        setSelectedClassId(classesData[0].id);
      }
    } catch (error) {
      console.error("Error fetching classes:", error);
    }
  };

  const fetchSubjects = async (classId) => {
    try {
      const response = await axiosClient.get(`/classes/${classId}/subjects`);
      setSubjects(response.data?.data || []);
    } catch (error) {
      console.error("Error fetching subjects:", error);
    }
  };

  const fetchTeachers = async () => {
    try {
      const response = await axiosClient.get("/users?role=teacher");
      setTeachers(response.data?.data?.items || []);
    } catch (error) {
      console.error("Error fetching teachers:", error);
    }
  };

  const fetchTimetable = async (classId) => {
    try {
      setLoading(true);
      const response = await axiosClient.get(`/classes/${classId}/timetable`);
      setTimetableEntries(response.data?.data || []);
    } catch (error) {
      console.error("Error fetching timetable:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus("");

    if (!selectedClassId) {
      setStatus("Please select a class");
      return;
    }

    try {
      setLoading(true);

      const submitData = {
        ...formData,
        class_id: selectedClassId,
      };

      if (editingId) {
        // Update timetable entry
        await axiosClient.put(`/timetable/${editingId}`, submitData);
        setStatus("Timetable entry updated successfully!");
      } else {
        // Create timetable entry
        await axiosClient.post(`/classes/${selectedClassId}/timetable`, formData);
        setStatus("Timetable entry created successfully!");
      }

      // Reset form
      setFormData({
        subject_id: "",
        teacher_id: "",
        day_of_week: "Monday",
        start_time: "08:00",
        end_time: "09:00",
        venue: "",
        academic_year: new Date().getFullYear().toString(),
      });
      setEditingId(null);
      setShowForm(false);
      fetchTimetable(selectedClassId);
    } catch (error) {
      setStatus(error.response?.data?.error || "Failed to save timetable entry");
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (entry) => {
    setFormData({
      subject_id: entry.subject_id,
      teacher_id: entry.teacher_id,
      day_of_week: entry.day_of_week,
      start_time: entry.start_time,
      end_time: entry.end_time,
      venue: entry.venue || "",
      academic_year: entry.academic_year,
    });
    setEditingId(entry.id);
    setShowForm(true);
  };

  const handleDelete = async (entryId) => {
    if (!window.confirm("Are you sure you want to delete this timetable entry?")) {
      return;
    }

    try {
      setLoading(true);
      await axiosClient.delete(`/timetable/${entryId}`);
      setStatus("Timetable entry deleted successfully!");
      fetchTimetable(selectedClassId);
    } catch (error) {
      setStatus("Failed to delete timetable entry");
    } finally {
      setLoading(false);
    }
  };

  const daysOfWeek = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

  // Group entries by day
  const groupedByDay = timetableEntries.reduce((acc, entry) => {
    if (!acc[entry.day_of_week]) {
      acc[entry.day_of_week] = [];
    }
    acc[entry.day_of_week].push(entry);
    return acc;
  }, {});

  return (
    <div>
      <h2>Timetable Management</h2>

      {status && (
        <p className={status.includes("successfully") ? "success-message" : "error-message"}>
          {status}
        </p>
      )}

      <div style={{ marginBottom: "20px" }}>
        <label htmlFor="class-select">Select Class: </label>
        <select
          id="class-select"
          value={selectedClassId}
          onChange={(e) => setSelectedClassId(e.target.value)}
          style={{ padding: "8px", marginRight: "10px" }}
        >
          <option value="">Choose a class...</option>
          {classes.map((cls) => (
            <option key={cls.id} value={cls.id}>
              {cls.name} - {cls.level}
            </option>
          ))}
        </select>

        <button
          onClick={() => {
            setShowForm(!showForm);
            setEditingId(null);
            setFormData({
              subject_id: "",
              teacher_id: "",
              day_of_week: "Monday",
              start_time: "08:00",
              end_time: "09:00",
              venue: "",
              academic_year: new Date().getFullYear().toString(),
            });
          }}
          style={{ padding: "8px 16px" }}
        >
          {showForm ? "Cancel" : "Add New Entry"}
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="form-container" style={{ marginBottom: "30px" }}>
          <h3>{editingId ? "Edit Timetable Entry" : "Add New Timetable Entry"}</h3>

          <select
            name="day_of_week"
            value={formData.day_of_week}
            onChange={handleChange}
            required
          >
            {daysOfWeek.map((day) => (
              <option key={day} value={day}>
                {day}
              </option>
            ))}
          </select>

          <input
            type="time"
            name="start_time"
            value={formData.start_time}
            onChange={handleChange}
            required
          />

          <input
            type="time"
            name="end_time"
            value={formData.end_time}
            onChange={handleChange}
            required
          />

          <select
            name="subject_id"
            value={formData.subject_id}
            onChange={handleChange}
            required
          >
            <option value="">Select Subject</option>
            {subjects.map((subject) => (
              <option key={subject.id} value={subject.id}>
                {subject.name} ({subject.code})
              </option>
            ))}
          </select>

          <select
            name="teacher_id"
            value={formData.teacher_id}
            onChange={handleChange}
            required
          >
            <option value="">Select Teacher</option>
            {teachers.map((teacher) => (
              <option key={teacher.id} value={teacher.id}>
                {teacher.first_name} {teacher.last_name}
              </option>
            ))}
          </select>

          <input
            type="text"
            name="venue"
            placeholder="Venue (e.g., Room 101)"
            value={formData.venue}
            onChange={handleChange}
          />

          <button type="submit" disabled={loading}>
            {loading ? (editingId ? "Updating..." : "Creating...") : editingId ? "Update Entry" : "Create Entry"}
          </button>
        </form>
      )}

      <div className="card">
        {loading ? (
          <p>Loading timetable...</p>
        ) : timetableEntries.length > 0 ? (
          daysOfWeek.map((day) => (
            <div key={day} style={{ marginBottom: "20px" }}>
              <h3>{day}</h3>
              <table>
                <thead>
                  <tr>
                    <th>Time</th>
                    <th>Subject</th>
                    <th>Teacher</th>
                    <th>Venue</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {(groupedByDay[day] || [])
                    .sort((a, b) => a.start_time.localeCompare(b.start_time))
                    .map((entry) => (
                      <tr key={entry.id}>
                        <td>
                          {entry.start_time} - {entry.end_time}
                        </td>
                        <td>
                          {subjects.find((s) => s.id === entry.subject_id)?.name || "N/A"}
                        </td>
                        <td>
                          {teachers.find((t) => t.id === entry.teacher_id)
                            ? `${teachers.find((t) => t.id === entry.teacher_id).first_name} ${
                                teachers.find((t) => t.id === entry.teacher_id).last_name
                              }`
                            : "N/A"}
                        </td>
                        <td>{entry.venue || "N/A"}</td>
                        <td>
                          <button
                            onClick={() => handleEdit(entry)}
                            style={{ marginRight: "10px", cursor: "pointer" }}
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => handleDelete(entry.id)}
                            style={{ color: "red", cursor: "pointer" }}
                          >
                            Delete
                          </button>
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          ))
        ) : (
          <p>
            {selectedClassId
              ? "No timetable entries found for this class. Add one to get started!"
              : "Select a class to view timetable."}
          </p>
        )}
      </div>
    </div>
  );
}