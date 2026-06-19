import { useState } from "react";
import { Link } from "react-router-dom";
import axiosClient from "../../api/axiosClient";

export default function Forgot() {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setError("");
    setMessage("");
    setLoading(true);

    axiosClient
      .post("/auth/forgot-password", { email: email.trim() })
      .then((res) => {
        setSuccess(true);
        setMessage(
          res.data?.data?.reset_token ||
          res.data?.data?.token ||
          res.data?.data?.resetToken ||
          res.data?.data ||
          "Reset token sent (check console in dev mode)"
        );
      })
      .catch((err) => {
        setError(err.response?.data?.error || "Error sending reset request");
      })
      .finally(() => setLoading(false));
  };

  if (success) {
    return (
      <div className="auth-page">
        <div className="auth-form" style={{ maxWidth: "400px" }}>
          <h2>Reset Link Sent</h2>
          <p style={{ color: "#555", marginBottom: "20px" }}>
            If an account with that email exists, you should receive a password reset link.
          </p>
          <div style={{ 
            backgroundColor: "#f0f8ff", 
            padding: "15px", 
            borderRadius: "4px", 
            marginBottom: "20px",
            border: "1px solid #d0e8ff",
            wordBreak: "break-all"
          }}>
            <small style={{ color: "#0066cc" }}>
              <strong>Dev Token:</strong> {message}
            </small>
          </div>
          <p style={{ fontSize: "14px", color: "#666", marginBottom: "15px" }}>
            Use this token in the reset link: <code style={{ backgroundColor: "#eee", padding: "2px 4px" }}>/reset-password/{message}</code>
          </p>
          <Link to="/login" style={{ 
            display: "block", 
            textAlign: "center", 
            padding: "10px", 
            backgroundColor: "#007bff", 
            color: "white", 
            textDecoration: "none", 
            borderRadius: "4px",
            marginBottom: "10px"
          }}>
            Back to Login
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="auth-page">
      <form onSubmit={handleSubmit} className="auth-form" style={{ maxWidth: "400px" }}>
        <h2>Forgot Password</h2>
        <p style={{ color: "#666", marginBottom: "20px" }}>
          Enter your email address and we'll send you a link to reset your password.
        </p>

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

        <input
          type="email"
          placeholder="Enter your email address"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          style={{
            width: "100%",
            padding: "10px",
            marginBottom: "15px",
            border: "1px solid #ddd",
            borderRadius: "4px",
            fontSize: "14px",
            boxSizing: "border-box"
          }}
        />

        <button 
          type="submit" 
          disabled={loading}
          style={{
            width: "100%",
            padding: "10px",
            backgroundColor: loading ? "#ccc" : "#007bff",
            color: "white",
            border: "none",
            borderRadius: "4px",
            fontSize: "16px",
            fontWeight: "bold",
            cursor: loading ? "not-allowed" : "pointer",
            marginBottom: "15px"
          }}
        >
          {loading ? "Sending..." : "Send Reset Link"}
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

