import { useEffect, useState } from "react";
import axiosClient from "../../api/axiosClient";

const LOCAL_STORAGE_STAFF = "school-ms-frontend-staff";

const loadLocalStaff = () => {
  try {
    const stored = localStorage.getItem(LOCAL_STORAGE_STAFF);
    return stored ? JSON.parse(stored) : [];
  } catch (error) {
    console.error("Unable to load local staff", error);
    return [];
  }
};

const saveLocalStaff = (staffMembers) => {
  try {
    localStorage.setItem(LOCAL_STORAGE_STAFF, JSON.stringify(staffMembers));
  } catch (error) {
    console.error("Unable to save staff locally", error);
  }
};

const createLocalStaffMember = (staffData) => {
  const id = staffData.id || `local-${Date.now()}-${Math.random().toString(36).slice(2)}`;
  return {
    ...staffData,
    id,
    email: staffData.email || "",
    role: { name: staffData.role_name || staffData.role?.name || "Teacher" },
    created_locally: true,
  };
};

export default function Staff() {
  const [staff, setStaff] = useState([]);
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState("");
  const [form, setForm] = useState({ first_name: "", last_name: "", role_name: "teacher", phone: "" });

  const mergeStaff = (apiStaff = [], localStaff = []) => {
    const existingIds = new Set(apiStaff.map((item) => item.id));
    const uniqueLocal = localStaff.filter((item) => !existingIds.has(item.id));
    return [...apiStaff, ...uniqueLocal];
  };

  const fetchStaff = async () => {
    const localStaff = loadLocalStaff();
    setStaff(localStaff);

    try {
      setLoading(true);
      const res = await axiosClient.get("/users?role=teacher");
      const apiStaff = res.data?.data?.items || [];
      setStaff(mergeStaff(apiStaff, localStaff));
    } catch (error) {
      console.warn("API staff load failed, using local staff", error);
      setStatus("Using locally saved staff because API load failed.");
      setStaff(localStaff);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchStaff(); }, []);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleCreate = (e) => {
    e.preventDefault();
    setStatus("");

    if (!form.first_name || !form.last_name) {
      setStatus("First name and last name are required.");
      return;
    }

    const localStaffMember = createLocalStaffMember({
      first_name: form.first_name,
      last_name: form.last_name,
      role_name: form.role_name,
      phone: form.phone,
    });

    const currentLocal = loadLocalStaff();
    const nextStaff = [...currentLocal.filter((item) => item.id !== localStaffMember.id), localStaffMember];
    saveLocalStaff(nextStaff);
    setStaff(nextStaff);
    try {
      window.dispatchEvent(new CustomEvent('staff:updated', { detail: { staff: nextStaff } }));
    } catch (e) {
      // ignore if environment doesn't support CustomEvent
    }
    setStatus("Staff created locally");
    setForm({ first_name: "", last_name: "", role_name: "teacher", phone: "" });
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this staff member?")) return;
    try {
      setLoading(true);
      await axiosClient.delete(`/users/${id}`);
      setStatus("Staff deactivated");
      fetchStaff();
    } catch (error) {
      console.error('Error deleting staff', error);
      setStatus('Failed to delete staff');
    } finally { setLoading(false); }
  };

  return (
    <div>
      <h2>Staff Management</h2>

      {status && <p className={status.includes("Failed") ? "error-message" : "success-message"}>{status}</p>}

      <form onSubmit={handleCreate} style={{ marginBottom: 16 }}>
        <input name="first_name" placeholder="First name" value={form.first_name} onChange={handleChange} required />
        <input name="last_name" placeholder="Last name" value={form.last_name} onChange={handleChange} required />
        <select name="role_name" value={form.role_name} onChange={handleChange}>
          <option value="teacher">Teacher</option>
          <option value="admin">Administrator</option>
          <option value="accountant">Accountant</option>
        </select>
        <input name="phone" placeholder="Phone (optional)" value={form.phone} onChange={handleChange} />
        <button type="submit" disabled={loading}>{loading ? 'Creating...' : 'Create staff'}</button>
      </form>

      {loading ? <p>Loading...</p> : (
        <table>
          <thead>
            <tr>
              <th>Name</th>
              <th>Email</th>
              <th>Role</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {staff.length === 0 ? (
              <tr><td colSpan="4">No staff found.</td></tr>
            ) : staff.map((u) => (
              <tr key={u.id}>
                <td>{u.first_name} {u.last_name}</td>
                <td>{u.email}</td>
                <td>{u.role?.name || 'N/A'}</td>
                <td>
                  <button onClick={() => handleDelete(u.id)}>Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}