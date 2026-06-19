import { useEffect, useState } from "react";
import axiosClient from "../../api/axiosClient";
import PRESET_CLASSES, { sortClasses } from "../../data/classes";

const LOCAL_STORAGE_STUDENTS = "school-ms-frontend-students";

const loadLocalStudents = () => {
  try {
    const stored = localStorage.getItem(LOCAL_STORAGE_STUDENTS);
    return stored ? JSON.parse(stored) : [];
  } catch (error) {
    return [];
  }
};

const saveLocalStudents = (students) => {
  try {
    localStorage.setItem(LOCAL_STORAGE_STUDENTS, JSON.stringify(students));
  } catch (error) {
    console.error("Unable to save students locally", error);
  }
};

const addLocalStudent = (student) => {
  const existing = loadLocalStudents();
  const next = [...existing];
  if (!next.some((item) => item.id === student.id)) {
    next.push(student);
    saveLocalStudents(next);
  }
};

export default function RegisterStudent() {
  const [formData, setFormData] = useState({
    first_name: "",
    last_name: "",
    email: "",
    password: "",
    date_of_birth: "",
    gender: "",
    class_id: "",
    medical_info: "",
    address: "",
  });
  const [parentData, setParentData] = useState({
    parent_name: "",
    relationship: "Father",
    phone: "",
    email: "",
    occupation: "",
    address: "",
    is_primary_contact: true,
  });
  const [classOptions, setClassOptions] = useState(PRESET_CLASSES);
  const [status, setStatus] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const localClasses = Array.from(
      new Set(
        loadLocalStudents()
          .map((student) => student.class_id || student.class_name)
          .filter(Boolean)
          .map((value) => value.toString().trim())
      )
    ).map((level) => ({ id: level, label: level }));

    setClassOptions((prev) => {
      const merged = [...prev, ...localClasses];
      const unique = Object.values(
        merged.reduce((acc, cls) => {
          acc[cls.id] = acc[cls.id] || cls;
          return acc;
        }, {})
      );
      return sortClasses(unique);
    });

    axiosClient
      .get("/classes")
      .then((response) => {
        const classesData = response.data?.data?.items || [];
        const fetched = classesData
          .filter((cls) => cls?.id != null)
          .map((cls) => ({
            id: cls.id,
            label: cls.level || cls.name || cls.id?.toString(),
          }));

        setClassOptions((prev) => {
          const merged = [...prev, ...fetched];
          const uniqueById = Object.values(
            merged.reduce((acc, cls) => {
              acc[cls.id] = acc[cls.id] || cls;
              return acc;
            }, {})
          );
          return sortClasses(uniqueById);
        });
      })
      .catch((error) => {
        console.warn("Unable to fetch classes from API, using available class options.", error);
      });
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handleParentChange = (e) => {
    const { name, value } = e.target;
    if (name === "is_primary_contact") {
      setParentData({
        ...parentData,
        [name]: e.target.checked,
      });
    } else {
      setParentData({
        ...parentData,
        [name]: value,
      });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus("");
    setLoading(true);

    const localRecord = {
      id: `local-${Date.now()}`,
      name: `${formData.first_name} ${formData.last_name}`.trim(),
      first_name: formData.first_name,
      last_name: formData.last_name,
      email: formData.email,
      date_of_birth: formData.date_of_birth,
      gender: formData.gender,
      class_id: formData.class_id,
      address: formData.address,
      medical_info: formData.medical_info,
      parent_contact: parentData.phone,
      parent_name: parentData.parent_name,
      relationship: parentData.relationship,
      parent_email: parentData.email,
      occupation: parentData.occupation,
      is_primary_contact: parentData.is_primary_contact,
    };

    try {
      const classIdValue = formData.class_id ? parseInt(formData.class_id, 10) : null;
      const studentPayload = {
        first_name: formData.first_name,
        last_name: formData.last_name,
        email: formData.email,
        password: formData.password,
        date_of_birth: formData.date_of_birth,
        gender: formData.gender,
        class_id: Number.isNaN(classIdValue) ? formData.class_id : classIdValue,
        address: formData.address,
        medical_info: formData.medical_info,
        phone: parentData.phone,
      };

      const response = await axiosClient.post("/students/register", studentPayload);
      const registered = response.data?.data;

      if (registered) {
        const studentId = registered.id || localRecord.id;
        const studentSave = {
          ...localRecord,
          email: formData.email,
          id: studentId,
          name: registered.name || localRecord.name,
          class_id: registered.class_id || localRecord.class_id,
        };

        addLocalStudent(studentSave);

        if (parentData.parent_name) {
          try {
            await axiosClient.post(`/students/${studentId}/parents`, parentData);
          } catch (parentError) {
            console.error("Error adding parent info:", parentError);
          }
        }

        setStatus("Student registered successfully!");
      } else {
        addLocalStudent(localRecord);
        setStatus("Student registered locally. API registration response was incomplete.");
      }
    } catch (error) {
      addLocalStudent(localRecord);
      setStatus("Student saved locally. API registration failed.");
    } finally {
      setLoading(false);
      setFormData({
        first_name: "",
        last_name: "",
        email: "",
        password: "",
        date_of_birth: "",
        gender: "",
        class_id: "",
        medical_info: "",
        address: "",
      });
      setParentData({
        parent_name: "",
        relationship: "Father",
        phone: "",
        email: "",
        occupation: "",
        address: "",
        is_primary_contact: true,
      });
    }
  };

  return (
    <div className="form-container">
      <h2>Register Student</h2>
      {status && (
        <p className={status.toLowerCase().includes("success") ? "success-message" : "error-message"}>
          {status}
        </p>
      )}

      <form onSubmit={handleSubmit}>
        <h3>Student Information</h3>

        <input
          type="text"
          name="first_name"
          placeholder="First Name"
          value={formData.first_name}
          onChange={handleChange}
          required
        />

        <input
          type="text"
          name="last_name"
          placeholder="Last Name"
          value={formData.last_name}
          onChange={handleChange}
          required
        />

        <input
          type="date"
          name="date_of_birth"
          value={formData.date_of_birth}
          onChange={handleChange}
          required
        />

        <input
          type="email"
          name="email"
          placeholder="Student Email"
          value={formData.email}
          onChange={handleChange}
          required
        />

        <input
          type="password"
          name="password"
          placeholder="Student Password"
          value={formData.password}
          onChange={handleChange}
          required
        />

        <select name="gender" value={formData.gender} onChange={handleChange} required>
          <option value="">Select Gender</option>
          <option value="Male">Male</option>
          <option value="Female">Female</option>
        </select>

        <select name="class_id" value={formData.class_id} onChange={handleChange} required>
          <option value="">Select Class</option>
          {classOptions.map((cls) => (
            <option key={cls.id} value={cls.id}>
              {cls.label}
            </option>
          ))}
        </select>

        <textarea
          name="address"
          placeholder="Home Address"
          value={formData.address}
          onChange={handleChange}
        />

        <textarea
          name="medical_info"
          placeholder="Medical Information"
          value={formData.medical_info}
          onChange={handleChange}
        />

        <h3>Parent/Guardian Information</h3>

        <input
          type="text"
          name="parent_name"
          placeholder="Parent/Guardian Name"
          value={parentData.parent_name}
          onChange={handleParentChange}
          required
        />

        <select name="relationship" value={parentData.relationship} onChange={handleParentChange}>
          <option value="Father">Father</option>
          <option value="Mother">Mother</option>
          <option value="Guardian">Guardian</option>
          <option value="Uncle">Uncle</option>
          <option value="Aunt">Aunt</option>
          <option value="Grandparent">Grandparent</option>
          <option value="Other">Other</option>
        </select>

        <input
          type="tel"
          name="phone"
          placeholder="Parent Contact Number"
          value={parentData.phone}
          onChange={handleParentChange}
          required
        />

        <input
          type="email"
          name="email"
          placeholder="Parent Email"
          value={parentData.email}
          onChange={handleParentChange}
        />

        <input
          type="text"
          name="occupation"
          placeholder="Parent Occupation"
          value={parentData.occupation}
          onChange={handleParentChange}
        />

        <textarea
          name="address"
          placeholder="Parent Address"
          value={parentData.address}
          onChange={handleParentChange}
        />

        <label>
          <input
            type="checkbox"
            name="is_primary_contact"
            checked={parentData.is_primary_contact}
            onChange={handleParentChange}
          />
          Primary Contact
        </label>

        <button type="submit" disabled={loading}>
          {loading ? "Registering..." : "Register Student"}
        </button>
      </form>
    </div>
  );
}
