import { useState, useEffect } from "react";
import axiosClient from "../../api/axiosClient";
import { sortClasses } from "../../data/classes";

export default function Subjects() {
  const [subjects, setSubjects] = useState([]);
  const [classes, setClasses] = useState([]);
  const [selectedClassId, setSelectedClassId] = useState("");
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
      const sorted = sortClasses(classesData);
      setClasses(sorted);
      
      // Fetch subjects for the first class if available
      if (sorted.length > 0) {
        setSelectedClassId(sorted[0].id);
        // ensure form defaults to this class when adding new subjects
        setFormData((prev) => ({ ...prev, class_id: sorted[0].id }));
        fetchSubjects(sorted[0].id);
      }
    } catch (error) {
      console.error("Error fetching classes:", error);
    }
  };

  const fetchSubjects = async (classId) => {
    try {
      setLoading(true);
      const response = await axiosClient.get(`/classes/${classId}/subjects`);
      // API might return subjects either as data.data.items or data.data
      const subjectsData = response.data?.data?.items || response.data?.data || [];
      setSubjects(subjectsData);
    } catch (error) {
      console.error("Error fetching subjects:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleClassChange = (e) => {
    const classId = e.target.value;
    setSelectedClassId(classId);
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
      const payload = { ...formData, class_id: formData.class_id || selectedClassId };

      if (editingId) {
        // Update subject
        await axiosClient.put(`/subjects/${editingId}`, payload);
        setStatus("Subject updated successfully!");
      } else {
        // Create subject (include class_id explicitly)
        await axiosClient.post("/subjects", payload);
        setStatus("Subject created successfully!");
      }

      // Reset form and fetch updated list
      setFormData({
        name: "",
        code: "",
        class_id: selectedClassId,
        description: "",
        credit_hours: 40,
      });
      setEditingId(null);
      setShowForm(false);
      if (selectedClassId) {
        fetchSubjects(selectedClassId);
      }
    } catch (error) {
      setStatus(error.response?.data?.error || "Failed to save subject");
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (subject) => {
    setFormData({
      name: subject.name || "",
      code: subject.code || "",
      class_id: subject.class_id || selectedClassId,
      description: subject.description || "",
      credit_hours: subject.credit_hours || 40,
    });
    setEditingId(subject.id);
    setSelectedClassId(subject.class_id || selectedClassId);
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
      if (selectedClassId) {
        fetchSubjects(selectedClassId);
      }
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
          value={selectedClassId}
          onChange={handleClassChange}
          style={{ padding: "8px", marginRight: "10px" }}
        >
          <option value="">Choose a class...</option>
          {classes.map((cls) => (
            <option key={cls.id} value={cls.id}>
              {cls.name || cls.label || cls.class_name || cls.level}
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
              class_id: selectedClassId,
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