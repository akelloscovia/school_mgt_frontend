import { useState, useEffect } from "react";
import axiosClient from "../../api/axiosClient";

export default function Classes() {
  const [classes, setClasses] = useState([]);
  const [teachers, setTeachers] = useState([]);
  const [status, setStatus] = useState("");
  const [loading, setLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({
    name: "",
    level: "",
    stream: "",
    teacher_id: "",
    academic_year: new Date().getFullYear().toString(),
    max_capacity: 50,
    description: "",
  });

  // Fetch data on mount
  useEffect(() => {
    fetchClasses();
    fetchTeachers();
  }, []);

  const fetchClasses = async () => {
    try {
      setLoading(true);
      const response = await axiosClient.get("/classes");
      setClasses(response.data?.data?.items || []);
    } catch (error) {
      console.error("Error fetching classes:", error);
      setStatus("Failed to load classes");
    } finally {
      setLoading(false);
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

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: name === "max_capacity" ? (value === "" ? "" : parseInt(value, 10)) : value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus("");

    try {
      setLoading(true);

      if (editingId) {
        // Update class
        await axiosClient.put(`/classes/${editingId}`, formData);
        setStatus("Class updated successfully!");
      } else {
        // Create class
        await axiosClient.post("/classes", formData);
        setStatus("Class created successfully!");
      }

      // Reset form
      setFormData({
        name: "",
        level: "",
        stream: "",
        teacher_id: "",
        academic_year: new Date().getFullYear().toString(),
        max_capacity: 50,
        description: "",
      });
      setEditingId(null);
      setShowForm(false);
      fetchClasses();
    } catch (error) {
      setStatus(error.response?.data?.error || "Failed to save class");
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (cls) => {
    setFormData({
      name: cls.name,
      level: cls.level,
      stream: cls.stream || "",
      teacher_id: cls.teacher_id || "",
      academic_year: cls.academic_year,
      max_capacity: cls.max_capacity,
      description: cls.description || "",
    });
    setEditingId(cls.id);
    setShowForm(true);
  };

  const handleDelete = async (classId) => {
    if (!window.confirm("Are you sure you want to delete this class? This action cannot be undone.")) {
      return;
    }

    try {
      setLoading(true);
      await axiosClient.delete(`/classes/${classId}`);
      setStatus("Class deleted successfully!");
      fetchClasses();
    } catch (error) {
      setStatus("Failed to delete class");
    } finally {
      setLoading(false);
    }
  };

  const educationLevels = [
    "Baby Class",
    "Middle Class",
    "Top Class",
    "P1",
    "P2",
    "P3",
    "P4",
    "P5",
    "P6",
    "P7",
  ];

  return (
    <div>
      <h2>Classes & Streams</h2>

      {status && (
        <p className={status.includes("successfully") ? "success-message" : "error-message"}>
          {status}
        </p>
      )}

      <div style={{ marginBottom: "20px" }}>
        <button
          onClick={() => {
            setShowForm(!showForm);
            setEditingId(null);
            setFormData({
              name: "",
              level: "",
              stream: "",
              teacher_id: "",
              academic_year: new Date().getFullYear().toString(),
              max_capacity: 50,
              description: "",
            });
          }}
          style={{ padding: "8px 16px" }}
        >
          {showForm ? "Cancel" : "Add New Class"}
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="form-container" style={{ marginBottom: "30px" }}>
          <h3>{editingId ? "Edit Class" : "Add New Class"}</h3>

          <input
            type="text"
            name="name"
            placeholder="Class Name (e.g., P.5A, Form 3B)"
            value={formData.name}
            onChange={handleChange}
            required
          />

          <select
            name="level"
            value={formData.level}
            onChange={handleChange}
            required
          >
            <option value="">Select Education Level</option>
            {educationLevels.map((level) => (
              <option key={level} value={level}>
                {level}
              </option>
            ))}
          </select>

          <input
            type="text"
            name="stream"
            placeholder="Stream (e.g., A, B, C)"
            value={formData.stream}
            onChange={handleChange}
          />

          <select
            name="teacher_id"
            value={formData.teacher_id}
            onChange={handleChange}
          >
            <option value="">Select Class Teacher (Optional)</option>
            {teachers.map((teacher) => (
              <option key={teacher.id} value={teacher.id}>
                {teacher.first_name} {teacher.last_name}
              </option>
            ))}
          </select>

          <input
            type="number"
            name="max_capacity"
            placeholder="Maximum Capacity"
            value={formData.max_capacity}
            onChange={handleChange}
            min="1"
            required
          />

          <input
            type="text"
            name="academic_year"
            placeholder="Academic Year"
            value={formData.academic_year}
            onChange={handleChange}
            required
          />

          <textarea
            name="description"
            placeholder="Description"
            value={formData.description}
            onChange={handleChange}
          />

          <button type="submit" disabled={loading}>
            {loading ? (editingId ? "Updating..." : "Creating...") : editingId ? "Update Class" : "Create Class"}
          </button>
        </form>
      )}

      <div className="card">
        {loading ? (
          <p>Loading classes...</p>
        ) : classes.length > 0 ? (
          <table>
            <thead>
              <tr>
                <th>Class Name</th>
                <th>Level</th>
                <th>Stream</th>
                <th>Class Teacher</th>
                <th>Students</th>
                <th>Capacity</th>
                <th>Actions</th>
              </tr>
            </thead>

            <tbody>
              {classes.map((cls) => (
                <tr key={cls.id}>
                  <td>{cls.name}</td>
                  <td>{cls.level}</td>
                  <td>{cls.stream || "N/A"}</td>
                  <td>
                    {cls.teacher
                      ? `${cls.teacher.first_name} ${cls.teacher.last_name}`
                      : "Not assigned"}
                  </td>
                  <td>{cls.student_count || 0}</td>
                  <td>{cls.max_capacity}</td>
                  <td>
                    <button
                      onClick={() => handleEdit(cls)}
                      style={{ marginRight: "10px", cursor: "pointer" }}
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(cls.id)}
                      style={{ color: "red", cursor: "pointer" }}
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <p>No classes found. Add one to get started!</p>
        )}
      </div>
    </div>
  );
}