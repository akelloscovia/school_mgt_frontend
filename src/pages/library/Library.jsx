import { useState, useEffect } from "react";
import axiosClient from "../../api/axiosClient";

export default function Library() {
  const [borrowRecords, setBorrowRecords] = useState([]);
  const [books, setBooks] = useState([]);
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [showReturnForm, setShowReturnForm] = useState(false);
  const [formData, setFormData] = useState({
    book_id: "",
    student_id: "",
    borrow_date: new Date().toISOString().split('T')[0],
    due_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
  });
  const [returnData, setReturnData] = useState({
    borrow_id: "",
    return_date: new Date().toISOString().split('T')[0],
  });

  useEffect(() => {
    fetchBorrowRecords();
    fetchBooks();
    fetchStudents();
  }, []);

  const fetchBorrowRecords = async () => {
    try {
      setLoading(true);
      const response = await axiosClient.get("/library/borrow-records");
      setBorrowRecords(response.data?.data?.items || []);
    } catch (error) {
      console.error("Error fetching borrow records:", error);
      setStatus("Failed to load borrow records");
    } finally {
      setLoading(false);
    }
  };

  const fetchBooks = async () => {
    try {
      const response = await axiosClient.get("/library/books");
      setBooks(response.data?.data?.items || []);
    } catch (error) {
      console.error("Error fetching books:", error);
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
      [name]: value,
    });
  };

  const handleReturnChange = (e) => {
    const { name, value } = e.target;
    setReturnData({
      ...returnData,
      [name]: value,
    });
  };

  const handleBorrow = async (e) => {
    e.preventDefault();
    setStatus("");

    try {
      setLoading(true);
      await axiosClient.post("/library/borrow", formData);

      setStatus("Book borrowed successfully!");
      setFormData({
        book_id: "",
        student_id: "",
        borrow_date: new Date().toISOString().split('T')[0],
        due_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      });
      setShowForm(false);
      fetchBorrowRecords();
    } catch (error) {
      setStatus(error.response?.data?.error || "Failed to record borrow");
    } finally {
      setLoading(false);
    }
  };

  const handleReturn = async (e) => {
    e.preventDefault();
    setStatus("");

    try {
      setLoading(true);
      await axiosClient.post("/library/return", returnData);

      setStatus("Book returned successfully!");
      setReturnData({
        borrow_id: "",
        return_date: new Date().toISOString().split('T')[0],
      });
      setShowReturnForm(false);
      fetchBorrowRecords();
    } catch (error) {
      setStatus(error.response?.data?.error || "Failed to record return");
    } finally {
      setLoading(false);
    }
  };

  const activeBorrows = borrowRecords.filter((r) => !r.return_date);
  const returnedBooks = borrowRecords.filter((r) => r.return_date);

  return (
    <div>
      <h2>Library Management</h2>

      {status && (
        <p className={status.includes("successfully") ? "success-message" : "error-message"}>
          {status}
        </p>
      )}

      <div style={{ marginBottom: "20px" }}>
        <button
          onClick={() => {
            setShowForm(!showForm);
            setShowReturnForm(false);
          }}
          style={{ marginRight: "10px", padding: "8px 16px" }}
        >
          {showForm ? "Cancel" : "Borrow Book"}
        </button>

        <button
          onClick={() => {
            setShowReturnForm(!showReturnForm);
            setShowForm(false);
          }}
          style={{ padding: "8px 16px" }}
        >
          {showReturnForm ? "Cancel" : "Return Book"}
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleBorrow} className="form-container" style={{ marginBottom: "30px" }}>
          <h3>Borrow Book</h3>

          <select
            name="book_id"
            value={formData.book_id}
            onChange={handleChange}
            required
          >
            <option value="">Select Book</option>
            {books.map((book) => (
              <option key={book.id} value={book.id}>
                {book.title} by {book.author}
              </option>
            ))}
          </select>

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
            type="date"
            name="borrow_date"
            value={formData.borrow_date}
            onChange={handleChange}
            required
          />

          <input
            type="date"
            name="due_date"
            value={formData.due_date}
            onChange={handleChange}
            required
          />

          <button type="submit" disabled={loading}>
            {loading ? "Borrowing..." : "Record Borrow"}
          </button>
        </form>
      )}

      {showReturnForm && (
        <form onSubmit={handleReturn} className="form-container" style={{ marginBottom: "30px" }}>
          <h3>Return Book</h3>

          <select
            name="borrow_id"
            value={returnData.borrow_id}
            onChange={handleReturnChange}
            required
          >
            <option value="">Select Active Borrow Record</option>
            {activeBorrows.map((record) => (
              <option key={record.id} value={record.id}>
                {record.book_title} - {record.student_name} (Borrowed: {record.borrow_date})
              </option>
            ))}
          </select>

          <input
            type="date"
            name="return_date"
            value={returnData.return_date}
            onChange={handleReturnChange}
            required
          />

          <button type="submit" disabled={loading}>
            {loading ? "Returning..." : "Record Return"}
          </button>
        </form>
      )}

      <div className="card">
        <h3>Active Borrows ({activeBorrows.length})</h3>
        {loading ? (
          <p>Loading borrow records...</p>
        ) : activeBorrows.length > 0 ? (
          <table>
            <thead>
              <tr>
                <th>Book</th>
                <th>Student</th>
                <th>Borrow Date</th>
                <th>Due Date</th>
                <th>Days Left</th>
              </tr>
            </thead>

            <tbody>
              {activeBorrows.map((record) => {
                const daysLeft = Math.ceil(
                  (new Date(record.due_date) - new Date()) / (1000 * 60 * 60 * 24)
                );
                return (
                  <tr key={record.id}>
                    <td>{record.book_title}</td>
                    <td>{record.student_name}</td>
                    <td>{new Date(record.borrow_date).toLocaleDateString()}</td>
                    <td>{new Date(record.due_date).toLocaleDateString()}</td>
                    <td style={{ color: daysLeft < 0 ? "red" : daysLeft < 3 ? "orange" : "green" }}>
                      {daysLeft < 0 ? `${Math.abs(daysLeft)} days overdue` : `${daysLeft} days`}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        ) : (
          <p>No active borrows.</p>
        )}
      </div>

      <div className="card" style={{ marginTop: "20px" }}>
        <h3>Returned Books ({returnedBooks.length})</h3>
        {returnedBooks.length > 0 ? (
          <table>
            <thead>
              <tr>
                <th>Book</th>
                <th>Student</th>
                <th>Borrow Date</th>
                <th>Return Date</th>
                <th>Days Borrowed</th>
              </tr>
            </thead>

            <tbody>
              {returnedBooks.slice(0, 10).map((record) => {
                const daysBorrowed = Math.ceil(
                  (new Date(record.return_date) - new Date(record.borrow_date)) / (1000 * 60 * 60 * 24)
                );
                return (
                  <tr key={record.id}>
                    <td>{record.book_title}</td>
                    <td>{record.student_name}</td>
                    <td>{new Date(record.borrow_date).toLocaleDateString()}</td>
                    <td>{new Date(record.return_date).toLocaleDateString()}</td>
                    <td>{daysBorrowed}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        ) : (
          <p>No returned books yet.</p>
        )}
      </div>
    </div>
  );
}