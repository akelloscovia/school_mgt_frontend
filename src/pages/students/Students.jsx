import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import axiosClient from "../../api/axiosClient";
import PRESET_CLASSES from "../../data/classes";

const LOCAL_STORAGE_STUDENTS = "school-ms-frontend-students";

const loadLocalStudents = () => {
  try {
    const stored = localStorage.getItem(LOCAL_STORAGE_STUDENTS);
    return stored ? JSON.parse(stored) : [];
  } catch (error) {
    return [];
  }
};

export default function Students() {
  const [students, setStudents] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [classFilter, setClassFilter] = useState("");
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStudents = async () => {
      try {
        const response = await axiosClient.get("/students");
        const serverItems = response.data?.data?.items || [];
        const localItems = loadLocalStudents();
        const merged = [...serverItems];

        localItems.forEach((local) => {
          if (!merged.some((item) => item.id === local.id)) {
            merged.push(local);
          }
        });

        setStudents(merged);
      } catch (error) {
        setStudents(loadLocalStudents());
      } finally {
        setLoading(false);
      }
    };

    fetchStudents();
  }, []);

  const classOptions = useMemo(() => {
    const fromStudents = students
      .map((student) => student.class_name || student.class_id)
      .filter(Boolean)
      .map((value) => value.toString().trim());

    const preset = PRESET_CLASSES.map((c) => c.label);
    return Array.from(new Set([...preset, ...fromStudents]));
  }, [students]);

  const getStudentClassLabel = (student) => {
    if (student.class_name) return student.class_name.toString();
    const id = student.class_id;
    if (!id) return "";
    const found = PRESET_CLASSES.find((c) => c.id.toString().toLowerCase() === id.toString().toLowerCase());
    if (found) return found.label;
    return id.toString();
  };

  const handleSearch = (event) => {
    event.preventDefault();
    setSearchQuery(searchTerm.trim().toLowerCase());
  };

  const handleClear = () => {
    setSearchTerm("");
    setSearchQuery("");
    setClassFilter("");
    setSelectedStudent(null);
  };

  const filteredStudents = useMemo(() => {
    const query = searchQuery.toLowerCase();
    return students.filter((student) => {
      const name =
        (student.name || `${student.first_name || ""} ${student.last_name || ""}`).toString().toLowerCase();
      const className = getStudentClassLabel(student).toLowerCase();
      const matchesSearch = query === "" || name.includes(query);
      const matchesClass = classFilter === "" || className === classFilter.toLowerCase();
      return matchesSearch && matchesClass;
    });
  }, [students, searchQuery, classFilter]);

  useEffect(() => {
    if (searchQuery && filteredStudents.length === 1) {
      setSelectedStudent(filteredStudents[0]);
    } else {
      setSelectedStudent(null);
    }
  }, [searchQuery, filteredStudents]);

  const displayStudentValue = (student, keys) => {
    for (const key of keys) {
      if (student[key]) return student[key];
    }
    return "N/A";
  };

  const handleSelectDetails = (student) => {
    setSelectedStudent(student);
  };

  const handleDelete = async (studentId, studentName) => {
    if (!window.confirm(`Are you sure you want to delete ${studentName}?`)) {
      return;
    }

    try {
      await axiosClient.delete(`/students/${studentId}`);
      setStudents(students.filter((student) => student.id !== studentId));
      alert("Student deleted successfully!");
    } catch (error) {
      console.error("Error deleting student:", error);
      const errorMessage = error.response?.data?.message || error.response?.data?.error || error.message || "Unknown error";
      alert(`Failed to delete student: ${errorMessage}`);
    }
  };

  return (
    <div className="students-page">
      <div className="page-header">
        <h2>Students</h2>
        <Link className="button" to="/students/register">
          Register Student
        </Link>
      </div>

      <form className="students-filter" onSubmit={handleSearch}>
        <input
          type="text"
          placeholder="Search by student name"
          value={searchTerm}
          onChange={(event) => setSearchTerm(event.target.value)}
        />

        <select value={classFilter} onChange={(event) => setClassFilter(event.target.value)}>
          <option value="">All classes</option>
          {classOptions.map((className) => (
            <option key={className} value={className}>
              {className}
            </option>
          ))}
        </select>

        <button type="submit">Search</button>
        <button type="button" onClick={handleClear}>
          Clear
        </button>
      </form>

      {selectedStudent && (
        <div className="student-details card" style={{ margin: "20px 0", padding: "20px" }}>
          <h3>Selected student details</h3>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "12px" }}>
            <div>
              <strong>Name:</strong>
              <p>{selectedStudent.name || `${selectedStudent.first_name || ""} ${selectedStudent.last_name || ""}`.trim() || "N/A"}</p>
            </div>
            <div>
              <strong>Student ID:</strong>
              <p>{displayStudentValue(selectedStudent, ["student_id", "id", "admission_number", "admission_no", "roll_no"])}</p>
            </div>
            <div>
              <strong>Class:</strong>
              <p>{displayStudentValue(selectedStudent, ["class_name", "class_id"])}</p>
            </div>
            <div>
              <strong>Gender:</strong>
              <p>{displayStudentValue(selectedStudent, ["gender"])}
              </p>
            </div>
            <div>
              <strong>Date of birth:</strong>
              <p>{displayStudentValue(selectedStudent, ["dob", "date_of_birth", "birth_date"])}</p>
            </div>
            <div>
              <strong>Parent contact:</strong>
              <p>{displayStudentValue(selectedStudent, ["parent_contact", "parent_phone", "guardian_phone"])}</p>
            </div>
            <div>
              <strong>Email:</strong>
              <p>{displayStudentValue(selectedStudent, ["email", "parent_email", "guardian_email"])}</p>
            </div>
            <div>
              <strong>Address:</strong>
              <p>{displayStudentValue(selectedStudent, ["address", "home_address"])}</p>
            </div>
            <div>
              <strong>Medical info:</strong>
              <p>{displayStudentValue(selectedStudent, ["medical_info", "medical_history"])}</p>
            </div>
          </div>
        </div>
      )}

      {loading ? (
        <p>Loading students...</p>
      ) : (
        <table>
          <thead>
            <tr>
              <th>Name</th>
              <th>Class</th>
              <th>Gender</th>
              <th>Parent Contact</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredStudents.length === 0 ? (
              <tr>
                <td colSpan="5">No students found.</td>
              </tr>
            ) : (
              filteredStudents.map((student) => (
                <tr key={student.id || `${student.first_name}-${student.last_name}-${student.class_id}`}>
                  <td>{student.name || `${student.first_name || ""} ${student.last_name || ""}`.trim() || "N/A"}</td>
                  <td>{student.class_name || student.class_id || "N/A"}</td>
                  <td>{student.gender || "N/A"}</td>
                  <td>{student.parent_contact || student.parent_phone || "N/A"}</td>
                  <td style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
                    <button type="button" className="view-btn" onClick={() => handleSelectDetails(student)}>
                      View details
                    </button>
                    <button
                      type="button"
                      className="delete-btn"
                      onClick={() =>
                        handleDelete(
                          student.id,
                          student.name || `${student.first_name || ""} ${student.last_name || ""}`.trim()
                        )
                      }
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      )}
    </div>
  );
}
