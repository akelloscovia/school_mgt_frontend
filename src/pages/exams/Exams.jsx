import { useState, useEffect } from "react";
import axiosClient from "../../api/axiosClient";
import { sortClasses } from "../../data/classes";

export default function Exams() {
  const [marks, setMarks] = useState([]);
  const [classes, setClasses] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [selectedClass, setSelectedClass] = useState("");
  const [selectedSubject, setSelectedSubject] = useState("");
  const [loading, setLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({
    student_id: "",
    subject_id: "",
    score: "",
    exam_type: "mid-term",
  });
  const [status, setStatus] = useState("");
  const [showSubjectManager, setShowSubjectManager] = useState(false);
  const [subjectEditingId, setSubjectEditingId] = useState(null);
  const [subjectFormData, setSubjectFormData] = useState({
    name: "",
    code: "",
    description: "",
    credit_hours: 40,
    class_id: "",
  });

  useEffect(() => {
    fetchClasses();
  }, []);

  useEffect(() => {
    if (selectedClass) {
      fetchSubjects(selectedClass);
      fetchMarks();
    }
  }, [selectedClass, selectedSubject]);

  useEffect(() => {
    if (selectedClass) {
      setSubjectFormData((prev) => ({ ...prev, class_id: selectedClass }));
    }
  }, [selectedClass]);

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

  const fetchSubjects = async (classId) => {
    try {
      const response = await axiosClient.get(`/classes/${classId}/subjects`);
      const subjectsData = response.data?.data?.items || response.data?.data || [];
      setSubjects(subjectsData);
      if (subjectsData.length > 0) {
        setSelectedSubject(subjectsData[0].id);
      } else {
        setSelectedSubject("");
      }
    } catch (error) {
      console.error("Error fetching subjects:", error);
    }
  };

  const fetchMarks = async () => {
    try {
      setLoading(true);
      let url = `/marks?class_id=${selectedClass}`;
      if (selectedSubject) {
        url += `&subject_id=${selectedSubject}`;
      }
      const response = await axiosClient.get(url);
      setMarks(response.data?.data?.items || []);
    } catch (error) {
      console.error("Error fetching marks:", error);
      setMarks([]);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: name === "score" ? parseFloat(value) : value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus("");

    try {
      setLoading(true);
      const payload = { ...formData, subject_id: formData.subject_id || selectedSubject };
      if (editingId) {
        // update existing mark
        await axiosClient.put(`/marks/${editingId}`, payload);
        setStatus("Mark updated successfully!");
      } else {
        await axiosClient.post("/marks", payload);
        setStatus("Mark recorded successfully!");
      }
      setFormData({
        student_id: "",
        subject_id: "",
        score: "",
        exam_type: "mid-term",
      });
      setShowForm(false);
      setEditingId(null);
      fetchMarks();
    } catch (error) {
      setStatus(error.response?.data?.error || "Failed to record mark");
    } finally {
      setLoading(false);
    }
  };

  const handleSubjectFormChange = (e) => {
    const { name, value } = e.target;
    setSubjectFormData((prev) => ({
      ...prev,
      [name]: name === "credit_hours" ? (value === "" ? "" : parseInt(value, 10)) : value,
    }));
  };

  const handleSubjectSubmit = async (e) => {
    e.preventDefault();
    setStatus("");

    if (!selectedClass) {
      setStatus("Select a class before managing subjects.");
      return;
    }

    try {
      setLoading(true);

      const payload = { ...subjectFormData, class_id: subjectFormData.class_id || selectedClass };
      if (subjectEditingId) {
        await axiosClient.put(`/subjects/${subjectEditingId}`, payload);
        setStatus("Subject updated successfully!");
      } else {
        await axiosClient.post("/subjects", payload);
        setStatus("Subject added successfully!");
      }

      setSubjectFormData({
        name: "",
        code: "",
        description: "",
        credit_hours: 40,
        class_id: selectedClass,
      });
      setSubjectEditingId(null);
      setShowSubjectManager(false);
      fetchSubjects(selectedClass);
    } catch (error) {
      setStatus(error.response?.data?.error || "Failed to save subject");
    } finally {
      setLoading(false);
    }
  };

  const handleSubjectEdit = (subject) => {
    setShowSubjectManager(true);
    setSubjectEditingId(subject.id);
    setSubjectFormData({
      name: subject.name || "",
      code: subject.code || "",
      description: subject.description || "",
      credit_hours: subject.credit_hours || 40,
      class_id: selectedClass,
    });
  };

  const handleMarkEdit = (mark) => {
    setFormData({
      student_id: mark.student_id || "",
      subject_id: mark.subject_id || selectedSubject,
      score: mark.score || "",
      exam_type: mark.exam_type || "mid-term",
    });
    setEditingId(mark.id);
    setShowForm(true);
  };

  const handleSubjectDelete = async (subjectId) => {
    if (!window.confirm("Delete this subject?")) return;

    try {
      setLoading(true);
      await axiosClient.delete(`/subjects/${subjectId}`);
      setStatus("Subject deleted successfully!");
      fetchSubjects(selectedClass);
    } catch (error) {
      setStatus("Failed to delete subject");
    } finally {
      setLoading(false);
    }
  };

  const [students, setStudents] = useState([]);

  useEffect(() => {
    if (selectedClass) {
      const fetchClassStudents = async () => {
        try {
          const response = await axiosClient.get(`/students?class_id=${selectedClass}`);
          setStudents(response.data?.data?.items || []);
        } catch (error) {
          console.error("Error fetching students:", error);
        }
      };
      fetchClassStudents();
    }
  }, [selectedClass]);

  return (
    <div>
      <h2>Exams & Results</h2>

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

        <label style={{ marginRight: "20px" }}>
          Subject:
          <select
            value={selectedSubject}
            onChange={(e) => setSelectedSubject(e.target.value)}
            style={{ marginLeft: "10px", padding: "8px" }}
          >
            <option value="">All Subjects</option>
            {subjects.map((subject) => (
              <option key={subject.id} value={subject.id}>
                {subject.name}
              </option>
            ))}
          </select>
        </label>

        <button
          onClick={() => {
            const opening = !showForm;
            setShowForm(opening);
            if (opening) {
              // prefill subject for new mark
              setFormData((prev) => ({ ...prev, subject_id: selectedSubject }));
              setEditingId(null);
            }
          }}
          style={{ padding: "8px 16px", marginRight: "10px" }}
        >
          {showForm ? "Cancel" : "Record Mark"}
        </button>

        <button
          onClick={() => setShowSubjectManager((prev) => !prev)}
          style={{ padding: "8px 16px" }}
          disabled={!selectedClass}
        >
          {showSubjectManager ? "Hide Subject Manager" : "Manage Subjects"}
        </button>
      </div>

      {showSubjectManager && (
        <div className="card" style={{ marginBottom: "30px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
            <div>
              <h3>Class Subjects</h3>
              <p style={{ margin: 0 }}>{selectedClass ? `Class ${selectedClass} subjects` : "Select a class to manage subjects."}</p>
            </div>
            <button
              type="button"
              onClick={() => {
                setSubjectEditingId(null);
                setSubjectFormData({
                  name: "",
                  code: "",
                  description: "",
                  credit_hours: 40,
                  class_id: selectedClass,
                });
              }}
              style={{ padding: "8px 16px" }}
            >
              Add New Subject
            </button>
          </div>

          {selectedClass ? (
            <>
              <table style={{ width: "100%", marginBottom: "16px" }}>
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Code</th>
                    <th>Credit Hours</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {subjects.length > 0 ? (
                    subjects.map((subject) => (
                      <tr key={subject.id}>
                        <td>{subject.name}</td>
                        <td>{subject.code || "N/A"}</td>
                        <td>{subject.credit_hours || "N/A"}</td>
                        <td>
                          <button
                            type="button"
                            onClick={() => handleSubjectEdit(subject)}
                            style={{ marginRight: "10px", cursor: "pointer" }}
                          >
                            Edit
                          </button>
                          <button
                            type="button"
                            onClick={() => handleSubjectDelete(subject.id)}
                            style={{ color: "red", cursor: "pointer", border: "none", background: "transparent" }}
                          >
                            Delete
                          </button>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="4">No subjects found for this class.</td>
                    </tr>
                  )}
                </tbody>
              </table>

              <form onSubmit={handleSubjectSubmit} className="form-container" style={{ marginBottom: "0" }}>
                <h3>{subjectEditingId ? "Edit Subject" : "Add Subject"}</h3>

                <input
                  type="text"
                  name="name"
                  placeholder="Subject Name"
                  value={subjectFormData.name}
                  onChange={handleSubjectFormChange}
                  required
                />

                <input
                  type="text"
                  name="code"
                  placeholder="Subject Code"
                  value={subjectFormData.code}
                  onChange={handleSubjectFormChange}
                />

                <textarea
                  name="description"
                  placeholder="Description"
                  value={subjectFormData.description}
                  onChange={handleSubjectFormChange}
                />

                <input
                  type="number"
                  name="credit_hours"
                  placeholder="Credit Hours"
                  value={subjectFormData.credit_hours}
                  onChange={handleSubjectFormChange}
                  min="1"
                />

                <button type="submit" disabled={loading}>
                  {loading ? (subjectEditingId ? "Saving..." : "Adding...") : subjectEditingId ? "Update Subject" : "Add Subject"}
                </button>
              </form>
            </>
          ) : (
            <p>Select a class to manage subjects.</p>
          )}
        </div>
      )}

      {showForm && (
        <form onSubmit={handleSubmit} className="form-container" style={{ marginBottom: "30px" }}>
          <h3>Record Mark</h3>

          <select
            name="student_id"
            value={formData.student_id}
            onChange={handleChange}
            required
          >
            <option value="">Select Student</option>
            {students.map((student) => (
              <option key={student.id} value={student.id}>
                {student.name || `${student.user?.first_name} ${student.user?.last_name}`}
              </option>
            ))}
          </select>

          <select
            name="exam_type"
            value={formData.exam_type}
            onChange={handleChange}
          >
            <option value="mid-term">Mid-Term</option>
            <option value="final">Final</option>
            <option value="assignment">Assignment</option>
            <option value="test">Test</option>
          </select>

          <input
            type="number"
            name="score"
            placeholder="Score (0-100)"
            value={formData.score}
            onChange={handleChange}
            min="0"
            max="100"
            required
          />

          <button type="submit" disabled={loading}>
            {loading ? (editingId ? "Updating..." : "Recording...") : editingId ? "Update Mark" : "Record Mark"}
          </button>
        </form>
      )}

      {loading ? (
        <p>Loading marks...</p>
      ) : marks.length > 0 ? (
        <table>
          <thead>
            <tr>
              <th>Student</th>
              <th>Subject</th>
              <th>Score</th>
              <th>Grade</th>
              <th>Exam Type</th>
              <th>Actions</th>
            </tr>
          </thead>

          <tbody>
            {marks.map((mark) => {
              const grade = mark.score >= 80 ? "A" : mark.score >= 70 ? "B" : mark.score >= 60 ? "C" : mark.score >= 50 ? "D" : "F";
              return (
                <tr key={mark.id}>
                  <td>{mark.student_name || `${mark.student?.user?.first_name} ${mark.student?.user?.last_name}`}</td>
                  <td>{mark.subject_name || mark.subject?.name}</td>
                  <td>{mark.score}</td>
                  <td>{grade}</td>
                  <td>{mark.exam_type}</td>
                  <td>
                    <button onClick={() => handleMarkEdit(mark)} style={{ marginRight: 8 }}>Edit</button>
                    <button style={{ color: 'red' }} onClick={async () => { if (window.confirm('Delete this mark?')) { try { setLoading(true); await axiosClient.delete(`/marks/${mark.id}`); setStatus('Mark deleted'); fetchMarks(); } catch (e) { setStatus('Failed to delete mark'); } finally { setLoading(false); } } }}>Delete</button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      ) : (
        <p>No marks recorded yet for this selection.</p>
      )}
    </div>
  );
}