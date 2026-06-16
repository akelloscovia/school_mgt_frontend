import { useState, useContext } from "react";
import axiosClient from "../../api/axiosClient";
import { AuthContext } from "../../context/AuthContext";

export default function Settings() {
  const { user } = useContext(AuthContext);
  const [showChangePassword, setShowChangePassword] = useState(false);
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  const validatePassword = () => {
    if (!oldPassword) {
      setError("Current password is required");
      return false;
    }
    if (newPassword.length < 6) {
      setError("New password must be at least 6 characters long");
      return false;
    }
    if (newPassword !== confirmPassword) {
      setError("New passwords do not match");
      return false;
    }
    if (oldPassword === newPassword) {
      setError("New password must be different from current password");
      return false;
    }
    return true;
  };

  const handleChangePassword = (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!validatePassword()) {
      return;
    }

    setLoading(true);
    axiosClient
      .post("/auth/change-password", {
        old_password: oldPassword,
        new_password: newPassword
      })
      .then((res) => {
        setSuccess("Password changed successfully!");
        setOldPassword("");
        setNewPassword("");
        setConfirmPassword("");
        setTimeout(() => {
          setShowChangePassword(false);
        }, 2000);
      })
      .catch((err) => {
        setError(err.response?.data?.error || "Error changing password");
      })
      .finally(() => setLoading(false));
  };

  return (
    <div style={{ maxWidth: "600px", margin: "0 auto", padding: "20px" }}>
      <h2>Settings</h2>

      {/* User Info Section */}
      <div style={{
        backgroundColor: "#f9f9f9",
        padding: "20px",
        borderRadius: "8px",
        marginBottom: "20px",
        border: "1px solid #e0e0e0"
      }}>
        <h3 style={{ marginTop: "0" }}>Account Information</h3>
        <div style={{ marginBottom: "10px" }}>
          <strong>Name:</strong> {user?.first_name} {user?.last_name}
        </div>
        <div style={{ marginBottom: "10px" }}>
          <strong>Email:</strong> {user?.email}
        </div>
        <div style={{ marginBottom: "10px" }}>
          <strong>Role:</strong> {user?.role?.name || "N/A"}
        </div>
      </div>

      {/* Change Password Section */}
      <div style={{
        backgroundColor: "#fff",
        padding: "20px",
        borderRadius: "8px",
        border: "1px solid #e0e0e0"
      }}>
        <h3 style={{ marginTop: "0" }}>Password</h3>
        
        {!showChangePassword ? (
          <button
            onClick={() => setShowChangePassword(true)}
            style={{
              padding: "10px 20px",
              backgroundColor: "#007bff",
              color: "white",
              border: "none",
              borderRadius: "4px",
              cursor: "pointer",
              fontSize: "14px",
              fontWeight: "bold"
            }}
          >
            Change Password
          </button>
        ) : (
          <form onSubmit={handleChangePassword}>
            {error && (
              <div style={{
                color: "#d32f2f",
                backgroundColor: "#ffebee",
                padding: "10px",
                borderRadius: "4px",
                marginBottom: "15px",
                border: "1px solid #ffcdd2"
              }}>
                {error}
              </div>
            )}

            {success && (
              <div style={{
                color: "#28a745",
                backgroundColor: "#d4edda",
                padding: "10px",
                borderRadius: "4px",
                marginBottom: "15px",
                border: "1px solid #c3e6cb"
              }}>
                {success}
              </div>
            )}

            <div style={{ marginBottom: "15px" }}>
              <label style={{ display: "block", marginBottom: "5px", fontWeight: "500" }}>
                Current Password
              </label>
              <input
                type="password"
                placeholder="Enter current password"
                value={oldPassword}
                onChange={(e) => setOldPassword(e.target.value)}
                required
                style={{
                  width: "100%",
                  padding: "10px",
                  border: "1px solid #ddd",
                  borderRadius: "4px",
                  fontSize: "14px",
                  boxSizing: "border-box"
                }}
              />
            </div>

            <div style={{ marginBottom: "15px" }}>
              <label style={{ display: "block", marginBottom: "5px", fontWeight: "500" }}>
                New Password
              </label>
              <input
                type="password"
                placeholder="Enter new password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                required
                style={{
                  width: "100%",
                  padding: "10px",
                  border: "1px solid #ddd",
                  borderRadius: "4px",
                  fontSize: "14px",
                  boxSizing: "border-box"
                }}
              />
              <small style={{ color: "#999", display: "block", marginTop: "5px" }}>
                At least 6 characters
              </small>
            </div>

            <div style={{ marginBottom: "15px" }}>
              <label style={{ display: "block", marginBottom: "5px", fontWeight: "500" }}>
                Confirm New Password
              </label>
              <input
                type="password"
                placeholder="Confirm new password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                style={{
                  width: "100%",
                  padding: "10px",
                  border: confirmPassword && newPassword === confirmPassword ? "2px solid #28a745" : "1px solid #ddd",
                  borderRadius: "4px",
                  fontSize: "14px",
                  boxSizing: "border-box"
                }}
              />
              {confirmPassword && newPassword === confirmPassword && (
                <small style={{ color: "#28a745", display: "block", marginTop: "5px" }}>✓ Passwords match</small>
              )}
              {confirmPassword && newPassword !== confirmPassword && (
                <small style={{ color: "#d32f2f", display: "block", marginTop: "5px" }}>✗ Passwords do not match</small>
              )}
            </div>

            <div style={{ display: "flex", gap: "10px" }}>
              <button
                type="submit"
                disabled={loading || !oldPassword || !newPassword || !confirmPassword || newPassword !== confirmPassword}
                style={{
                  padding: "10px 20px",
                  backgroundColor: (loading || !oldPassword || !newPassword || !confirmPassword || newPassword !== confirmPassword) ? "#ccc" : "#28a745",
                  color: "white",
                  border: "none",
                  borderRadius: "4px",
                  cursor: (loading || !oldPassword || !newPassword || !confirmPassword || newPassword !== confirmPassword) ? "not-allowed" : "pointer",
                  fontSize: "14px",
                  fontWeight: "bold"
                }}
              >
                {loading ? "Updating..." : "Update Password"}
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowChangePassword(false);
                  setOldPassword("");
                  setNewPassword("");
                  setConfirmPassword("");
                  setError("");
                }}
                style={{
                  padding: "10px 20px",
                  backgroundColor: "#6c757d",
                  color: "white",
                  border: "none",
                  borderRadius: "4px",
                  cursor: "pointer",
                  fontSize: "14px",
                  fontWeight: "bold"
                }}
              >
                Cancel
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}