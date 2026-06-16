import { useState, useEffect } from "react";
import axiosClient from "../../api/axiosClient";

export default function Subjects() {
  const [subjects, setSubjects] = useState([]);
  const [classes, setClasses] = useState([]);
  const [status, setStatus] = useState("");
  const [loading, setLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({
    name: "",
    code: "",
    class_id: "",
    description: "",
    credit_hours: 40,
  });

  // Fetch subjects and classes on mount
  useEffect(() => {
    fetchClasses();
  }, []);

  const fetchClasses = async () => {
    try {
      const response = await axiosClient.get("/classes");
      const classesData = response.data?.data?.items || [];
      setClasses(classesData);
      
      // Fetch subjects for the first class if available
      if (classesData.length > 0) {
        fetchSubjects(classesData[0].id);
      }
    } catch (error) {
      console.error("Error fetching classes:", error);
    }
  };

  const fetchSubjects = async (classId) => {
    try {
      setLoading(true);
      const response = await axiosClient.get(`/classes/${classId}/subjects`);
      setSubjects(response.data?.data || []);
    } catch (error) {
      console.error("Error fetching subjects:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleClassChange = (e) => {
    const classId = e.target.value;
    setFormData({ ...formData, class_id: classId });
    if (classId) {
      fetchSubjects(classId);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: name === "credit_hours" ? (value === "" ? "" : parseInt(value, 10)) : value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus("");

    if (!formData.class_id) {
      setStatus("Please select a class");
      return;
    }

    try {
      setLoading(true);
      
      if (editingId) {
        // Update subject
        await axiosClient.put(`/subjects/${editingId}`, formData);
        setStatus("Subject updated successfully!");
      } else {
        // Create subject
        await axiosClient.post("/subjects", formData);
        setStatus("Subject created successfully!");
      }

      // Reset form and fetch updated list
      setFormData({
        name: "",
        code: "",
        class_id: formData.class_id,
        description: "",
        credit_hours: 40,
      });
      setEditingId(null);
      setShowForm(false);
      fetchSubjects(formData.class_id);
    } catch (error) {
      setStatus(error.response?.data?.error || "Failed to save subject");
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (subject) => {
    setFormData(subject);
    setEditingId(subject.id);
    setShowForm(true);
  };

  const handleDelete = async (subjectId) => {
    if (!window.confirm("Are you sure you want to delete this subject?")) {
      return;
    }

    try {
      setLoading(true);
      await axiosClient.delete(`/subjects/${subjectId}`);
      setStatus("Subject deleted successfully!");
      fetchSubjects(formData.class_id);
    } catch (error) {
      setStatus("Failed to delete subject");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h2>Subjects Management</h2>

      {status && (
        <p className={status.includes("successfully") ? "success-message" : "error-message"}>
          {status}
        </p>
      )}

      <div style={{ marginBottom: "20px" }}>
        <label htmlFor="class-select">Select Class: </label>
        <select
          id="class-select"
          value={formData.class_id}
          onChange={handleClassChange}
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
              name: "",
              code: "",
              class_id: formData.class_id,
              description: "",
              credit_hours: 40,
            });
          }}
          style={{ padding: "8px 16px" }}
        >
          {showForm ? "Cancel" : "Add New Subject"}
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="form-container" style={{ marginBottom: "30px" }}>
          <h3>{editingId ? "Edit Subject" : "Add New Subject"}</h3>

          <input
            type="text"
            name="name"
            placeholder="Subject Name"
            value={formData.name}
            onChange={handleChange}
            required
          />

          <input
            type="text"
            name="code"
            placeholder="Subject Code (e.g., MATH101)"
            value={formData.code}
            onChange={handleChange}
            required
          />

          <textarea
            name="description"
            placeholder="Description"
            value={formData.description}
            onChange={handleChange}
          />

          <input
            type="number"
            name="credit_hours"
            placeholder="Credit Hours"
            value={formData.credit_hours}
            onChange={handleChange}
            min="1"
          />

          <button type="submit" disabled={loading}>
            {loading ? (editingId ? "Updating..." : "Creating...") : editingId ? "Update Subject" : "Create Subject"}
          </button>
        </form>
      )}

      <div className="card">
        {loading ? (
          <p>Loading subjects...</p>
        ) : subjects.length > 0 ? (
          <table>
            <thead>
              <tr>
                <th>Subject</th>
                <th>Code</th>
                <th>Description</th>
                <th>Credit Hours</th>
                <th>Actions</th>
              </tr>
            </thead>

            <tbody>
              {subjects.map((subject) => (
                <tr key={subject.id}>
                  <td>{subject.name}</td>
                  <td>{subject.code}</td>
                  <td>{subject.description || "N/A"}</td>
                  <td>{subject.credit_hours}</td>
                  <td>
                    <button
                      onClick={() => handleEdit(subject)}
                      style={{ marginRight: "10px", cursor: "pointer" }}
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(subject.id)}
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
          <p>
            {formData.class_id
              ? "No subjects found for this class. Add one to get started!"
              : "Select a class to view subjects."}
          </p>
        )}
      </div>
    </div>
  );
}