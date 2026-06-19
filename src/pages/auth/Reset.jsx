import { useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import axiosClient from "../../api/axiosClient";

export default function Reset() {
  const { token } = useParams();
  const navigate = useNavigate();
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const validatePassword = () => {
    if (password.length < 6) {
      setError("Password must be at least 6 characters long");
      return false;
    }
    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return false;
    }
    return true;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setError("");

    if (!token) {
      setError("Password reset token is missing or invalid.");
      return;
    }

    if (!validatePassword()) {
      return;
    }

    setLoading(true);
    axiosClient
      .post("/auth/reset-password", { token, new_password: password })
      .then((res) => {
        setSuccess(true);
      })
      .catch((err) => {
        setError(err.response?.data?.error || "Error resetting password. Token may be expired.");
      })
      .finally(() => setLoading(false));
  };

  if (success) {
    return (
      <div className="auth-page">
        <div className="auth-form" style={{ maxWidth: "400px", textAlign: "center" }}>
          <h2 style={{ color: "#28a745" }}>✓ Password Reset Successfully</h2>
          <p style={{ color: "#555", marginBottom: "20px" }}>
            Your password has been changed. You can now log in with your new password.
          </p>
          <Link to="/login" style={{ 
            display: "block", 
            padding: "10px", 
            backgroundColor: "#007bff", 
            color: "white", 
            textDecoration: "none", 
            borderRadius: "4px",
            fontWeight: "bold"
          }}>
            Go to Login
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="auth-page">
      <form onSubmit={handleSubmit} className="auth-form" style={{ maxWidth: "400px" }}>
        <h2>Reset Password</h2>
        <p style={{ color: "#666", marginBottom: "20px", fontSize: "14px" }}>
          Enter a new password and confirm it below.
        </p>

        {error && (
          <div style={{ 
            color: "#d32f2f", 
            backgroundColor: "#ffebee", 
            padding: "10px", 
            borderRadius: "4px", 
            marginBottom: "15px",
            border: "1px solid #ffcdd2",
            fontSize: "14px"
          }}>
            {error}
          </div>
        )}

        <div style={{ marginBottom: "15px" }}>
          <label style={{ display: "block", marginBottom: "5px", fontWeight: "500", fontSize: "14px" }}>
            New Password
          </label>
          <input
            type="password"
            placeholder="Enter new password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
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
          <label style={{ display: "block", marginBottom: "5px", fontWeight: "500", fontSize: "14px" }}>
            Confirm Password
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
              border: confirmPassword && password === confirmPassword ? "1px solid #28a745" : "1px solid #ddd",
              borderRadius: "4px",
              fontSize: "14px",
              boxSizing: "border-box"
            }}
          />
          {confirmPassword && password === confirmPassword && (
            <small style={{ color: "#28a745", display: "block", marginTop: "5px" }}>✓ Passwords match</small>
          )}
          {confirmPassword && password !== confirmPassword && (
            <small style={{ color: "#d32f2f", display: "block", marginTop: "5px" }}>✗ Passwords do not match</small>
          )}
        </div>

        <button 
          type="submit" 
          disabled={loading || !password || !confirmPassword || password !== confirmPassword}
          style={{
            width: "100%",
            padding: "10px",
            backgroundColor: (loading || !password || !confirmPassword || password !== confirmPassword) ? "#ccc" : "#28a745",
            color: "white",
            border: "none",
            borderRadius: "4px",
            fontSize: "16px",
            fontWeight: "bold",
            cursor: (loading || !password || !confirmPassword || password !== confirmPassword) ? "not-allowed" : "pointer",
            marginBottom: "15px"
          }}
        >
          {loading ? "Resetting..." : "Reset Password"}
        </button>

        <div style={{ textAlign: "center" }}>
          <Link to="/login" style={{ color: "#007bff", textDecoration: "none", fontSize: "14px" }}>
            Back to Login
          </Link>
        </div>
      </form>
    </div>
  );
}
