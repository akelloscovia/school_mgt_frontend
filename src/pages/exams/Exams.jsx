import { useState, useEffect } from "react";
import axiosClient from "../../api/axiosClient";

export default function Exams() {
  const [marks, setMarks] = useState([]);
  const [classes, setClasses] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [selectedClass, setSelectedClass] = useState("");
  const [selectedSubject, setSelectedSubject] = useState("");
  const [loading, setLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    student_id: "",
    subject_id: "",
    score: "",
    exam_type: "mid-term",
  });
  const [status, setStatus] = useState("");

  useEffect(() => {
    fetchClasses();
  }, []);

  useEffect(() => {
    if (selectedClass) {
      fetchSubjects(selectedClass);
      fetchMarks();
    }
  }, [selectedClass, selectedSubject]);

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

  const fetchSubjects = async (classId) => {
    try {
      const response = await axiosClient.get(`/classes/${classId}/subjects`);
      const subjectsData = response.data?.data || [];
      setSubjects(subjectsData);
      if (subjectsData.length > 0) {
        setSelectedSubject(subjectsData[0].id);
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
      await axiosClient.post("/marks", {
        ...formData,
        subject_id: selectedSubject,
      });
      
      setStatus("Mark recorded successfully!");
      setFormData({
        student_id: "",
        subject_id: "",
        score: "",
        exam_type: "mid-term",
      });
      setShowForm(false);
      fetchMarks();
    } catch (error) {
      setStatus(error.response?.data?.error || "Failed to record mark");
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
          onClick={() => setShowForm(!showForm)}
          style={{ padding: "8px 16px" }}
        >
          {showForm ? "Cancel" : "Record Mark"}
        </button>
      </div>

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
            {loading ? "Recording..." : "Record Mark"}
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