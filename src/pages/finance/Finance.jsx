import { useState, useEffect } from "react";
import axiosClient from "../../api/axiosClient";

export default function Finance() {
  const [feesData, setFeesData] = useState([]);
  const [totalCollected, setTotalCollected] = useState(0);
  const [totalDue, setTotalDue] = useState(0);
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    student_id: "",
    amount: "",
    payment_date: new Date().toISOString().split('T')[0],
    payment_method: "cash",
    description: "",
  });
  const [students, setStudents] = useState([]);

  useEffect(() => {
    fetchFeesData();
    fetchStudents();
  }, []);

  const fetchFeesData = async () => {
    try {
      setLoading(true);
      const response = await axiosClient.get("/finance/fees");
      const data = response.data?.data?.items || [];
      setFeesData(data);

      // Calculate totals
      const collected = data.reduce((sum, item) => sum + (item.amount_paid || 0), 0);
      const due = data.reduce((sum, item) => sum + (item.balance || 0), 0);

      setTotalCollected(collected);
      setTotalDue(due);
    } catch (error) {
      console.error("Error fetching fees:", error);
      setStatus("Failed to load fees data");
    } finally {
      setLoading(false);
    }
  };

  const fetchStudents = async () => {
    try {
      const response = await axiosClient.get("/students");
      setStudents(response.data?.data?.items || []);
    } catch (error) {
      console.error("Error fetching students:", error);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: name === "amount" ? parseFloat(value) : value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus("");

    try {
      setLoading(true);
      await axiosClient.post("/finance/payments", formData);

      setStatus("Payment recorded successfully!");
      setFormData({
        student_id: "",
        amount: "",
        payment_date: new Date().toISOString().split('T')[0],
        payment_method: "cash",
        description: "",
      });
      setShowForm(false);
      fetchFeesData();
    } catch (error) {
      setStatus(error.response?.data?.error || "Failed to record payment");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h2>Finance Management</h2>

      {status && (
        <p className={status.includes("successfully") ? "success-message" : "error-message"}>
          {status}
        </p>
      )}

      <div className="card" style={{ marginBottom: "20px" }}>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "20px" }}>
          <div>
            <h3>Total Collected</h3>
            <p style={{ fontSize: "24px", fontWeight: "bold" }}>
              UGX {totalCollected.toLocaleString()}
            </p>
          </div>
          <div>
            <h3>Total Due</h3>
            <p style={{ fontSize: "24px", fontWeight: "bold", color: "red" }}>
              UGX {totalDue.toLocaleString()}
            </p>
          </div>
          <div>
            <h3>Balance</h3>
            <p style={{ fontSize: "24px", fontWeight: "bold" }}>
              UGX {(totalCollected - totalDue).toLocaleString()}
            </p>
          </div>
        </div>
      </div>

      <div style={{ marginBottom: "20px" }}>
        <button
          onClick={() => setShowForm(!showForm)}
          style={{ padding: "8px 16px" }}
        >
          {showForm ? "Cancel" : "Record Payment"}
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="form-container" style={{ marginBottom: "30px" }}>
          <h3>Record Payment</h3>

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

          <input
            type="number"
            name="amount"
            placeholder="Amount Paid"
            value={formData.amount}
            onChange={handleChange}
            min="0"
            required
          />

          <input
            type="date"
            name="payment_date"
            value={formData.payment_date}
            onChange={handleChange}
            required
          />

          <select
            name="payment_method"
            value={formData.payment_method}
            onChange={handleChange}
          >
            <option value="cash">Cash</option>
            <option value="check">Check</option>
            <option value="bank_transfer">Bank Transfer</option>
            <option value="mobile_money">Mobile Money</option>
          </select>

          <textarea
            name="description"
            placeholder="Description (optional)"
            value={formData.description}
            onChange={handleChange}
          />

          <button type="submit" disabled={loading}>
            {loading ? "Recording..." : "Record Payment"}
          </button>
        </form>
      )}

      {loading ? (
        <p>Loading fees data...</p>
      ) : feesData.length > 0 ? (
        <table>
          <thead>
            <tr>
              <th>Student</th>
              <th>Amount Paid</th>
              <th>Balance</th>
              <th>Status</th>
            </tr>
          </thead>

          <tbody>
            {feesData.map((item) => (
              <tr key={item.id}>
                <td>{item.student_name || `${item.student?.user?.first_name} ${item.student?.user?.last_name}`}</td>
                <td>UGX {(item.amount_paid || 0).toLocaleString()}</td>
                <td style={{ color: item.balance > 0 ? "red" : "green" }}>
                  UGX {(item.balance || 0).toLocaleString()}
                </td>
                <td>{item.balance > 0 ? "Pending" : "Paid"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      ) : (
        <p>No fees data available.</p>
      )}
    </div>
  );
}