import { useEffect, useState } from "react";
import axiosClient from "../../api/axiosClient";

export default function Applications() {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [actioningId, setActioningId] = useState(null);

  const fetchApplications = async () => {
    try {
      setLoading(true);
      const response = await axiosClient.get("/admissions/pending");
      setApplications(response.data?.data?.applications || []);
      setError("");
    } catch (err) {
      console.error("Error fetching applications:", err);
      setError(
        err.response?.data?.error || "Failed to load applications"
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchApplications();
  }, []);

  const handleApprove = async (id) => {
    try {
      setActioningId(id);
      await axiosClient.post(`/admissions/approve/${id}`);
      await fetchApplications();
    } catch (err) {
      alert(err.response?.data?.error || "Failed to approve application");
    } finally {
      setActioningId(null);
    }
  };

  const handleReject = async (id) => {
    const reason = window.prompt("Reason for rejection (optional):", "");
    if (reason === null) return;

    try {
      setActioningId(id);
      await axiosClient.post(`/admissions/reject/${id}`, { reason });
      await fetchApplications();
    } catch (err) {
      alert(err.response?.data?.error || "Failed to reject application");
    } finally {
      setActioningId(null);
    }
  };

  return (
    <div className="applications-page">
      <div className="page-header">
        <h2>Applications</h2>
      </div>

      {error && <p style={{ color: "crimson" }}>{error}</p>}

      {loading ? (
        <p>Loading applications...</p>
      ) : (
        <table>
          <thead>
            <tr>
              <th>Student</th>
              <th>Grade</th>
              <th>Parent</th>
              <th>Contact</th>
              <th>Email</th>
              <th>Submitted</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {applications.length === 0 ? (
              <tr>
                <td colSpan="8">No applications found.</td>
              </tr>
            ) : (
              applications.map((app) => (
                <tr key={app.id}>
                  <td>{app.student_name}</td>
                  <td>{app.grade_applied}</td>
                  <td>{app.parent_name}</td>
                  <td>{app.contact_number}</td>
                  <td>{app.parent_email}</td>
                  <td>{app.submitted_at}</td>
                  <td>{app.status}</td>
                  <td style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
                    <button
                      type="button"
                      disabled={app.status !== "Pending" || actioningId === app.id}
                      onClick={() => handleApprove(app.id)}
                    >
                      Approve
                    </button>
                    <button
                      type="button"
                      className="delete-btn"
                      disabled={app.status !== "Pending" || actioningId === app.id}
                      onClick={() => handleReject(app.id)}
                    >
                      Reject
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
