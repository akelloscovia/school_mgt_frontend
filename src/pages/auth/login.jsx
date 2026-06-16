import { useState, useContext } from "react";
import { useNavigate, Link } from "react-router-dom";
import axiosClient from "../../api/axiosClient";
import { AuthContext } from "../../context/AuthContext";

export default function Login() {
  const navigate = useNavigate();
  const { login } = useContext(AuthContext);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = (e) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    axiosClient
      .post("/auth/login", { email, password })
      .then((response) => {
        const payload = response.data?.data;
        if (payload && payload.access_token && payload.user) {
          login(payload.user, payload.access_token);
          navigate("/");
        } else {
          setError("Login failed: invalid response from server.");
        }
      })
      .catch((error) => {
        let message = "Invalid email or password";
        if (!error.response) {
          message = "Unable to connect to server. Please ensure the API is running.";
          if (error.message) {
            message += ` (${error.message})`;
          }
        } else {
          message = error.response?.data?.error || message;
        }
        setError(message);
      })
      .finally(() => setIsLoading(false));
  };

  return (
    <div className="login-page">
      <form className="login-form" onSubmit={handleLogin}>
        <h2>School Management System</h2>
        <p>Login to continue</p>

        {error && <div className="error-message" style={{ color: "red", marginBottom: "10px", padding: "10px", backgroundColor: "#ffe6e6", borderRadius: "4px" }}>{error}</div>}

        <input
          type="email"
          placeholder="Enter Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          autoComplete="username"
        />

        <input
          type="password"
          placeholder="Enter Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          autoComplete="current-password"
        />

        <button type="submit" disabled={isLoading}>
          {isLoading ? "Logging in..." : "Login"}
        </button>

        <div style={{ marginTop: "15px", textAlign: "center" }}>
          <Link to="/forgot" style={{ color: "#007bff", textDecoration: "none", fontSize: "14px" }}>
            Forgot Password?
          </Link>
        </div>
      </form>
    </div>
  );
}