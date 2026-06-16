import { useState, useEffect } from "react";
import axiosClient from "../../api/axiosClient";

export default function Messages() {
  const [activeTab, setActiveTab] = useState("inbox");
  const [messages, setMessages] = useState([]);
  const [users, setUsers] = useState([]);
  const [status, setStatus] = useState("");
  const [loading, setLoading] = useState(false);
  const [showCompose, setShowCompose] = useState(false);
  const [newMessage, setNewMessage] = useState({
    recipient_id: "",
    subject: "",
    body: "",
  });

  // Fetch messages
  useEffect(() => {
    fetchMessages();
  }, [activeTab]);

  // Fetch users for dropdown
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await axiosClient.get("/users");
        setUsers(response.data?.data?.items || []);
      } catch (error) {
        console.error("Error fetching users:", error);
      }
    };
    fetchUsers();
  }, []);

  const fetchMessages = async () => {
    try {
      setLoading(true);
      let endpoint = "";
      
      if (activeTab === "inbox") {
        endpoint = "/communication/messages/inbox";
      } else if (activeTab === "sent") {
        endpoint = "/communication/messages/sent";
      }

      const response = await axiosClient.get(endpoint);
      setMessages(response.data?.data?.items || []);
    } catch (error) {
      console.error("Error fetching messages:", error);
      setStatus("Failed to load messages");
    } finally {
      setLoading(false);
    }
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    
    if (!newMessage.recipient_id || !newMessage.body) {
      setStatus("Please fill in all required fields");
      return;
    }

    try {
      setLoading(true);
      await axiosClient.post("/communication/messages", newMessage);
      setStatus("Message sent successfully!");
      setNewMessage({
        recipient_id: "",
        subject: "",
        body: "",
      });
      setShowCompose(false);
      fetchMessages();
    } catch (error) {
      setStatus(error.response?.data?.error || "Failed to send message");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteMessage = async (messageId) => {
    if (!window.confirm("Are you sure you want to delete this message?")) {
      return;
    }

    try {
      await axiosClient.delete(`/communication/messages/${messageId}`);
      setStatus("Message deleted successfully!");
      fetchMessages();
    } catch (error) {
      setStatus("Failed to delete message");
    }
  };

  return (
    <div>
      <h2>Messages</h2>

      {status && (
        <p className={status.includes("successfully") ? "success-message" : "error-message"}>
          {status}
        </p>
      )}

      <div className="message-controls" style={{ marginBottom: "20px" }}>
        <button onClick={() => setShowCompose(!showCompose)} style={{ marginRight: "10px" }}>
          {showCompose ? "Cancel" : "Compose Message"}
        </button>
      </div>

      {showCompose && (
        <form onSubmit={handleSendMessage} className="message-form" style={{ marginBottom: "30px", padding: "20px", border: "1px solid #ccc", borderRadius: "5px" }}>
          <h3>New Message</h3>

          <select
            value={newMessage.recipient_id}
            onChange={(e) => setNewMessage({ ...newMessage, recipient_id: e.target.value })}
            required
            style={{ width: "100%", padding: "8px", marginBottom: "10px" }}
          >
            <option value="">Select Recipient</option>
            {users.map((user) => (
              <option key={user.id} value={user.id}>
                {user.first_name} {user.last_name} ({user.role?.name || "Unknown"})
              </option>
            ))}
          </select>

          <input
            type="text"
            placeholder="Subject"
            value={newMessage.subject}
            onChange={(e) => setNewMessage({ ...newMessage, subject: e.target.value })}
            style={{ width: "100%", padding: "8px", marginBottom: "10px" }}
          />

          <textarea
            placeholder="Message Body"
            value={newMessage.body}
            onChange={(e) => setNewMessage({ ...newMessage, body: e.target.value })}
            required
            style={{ width: "100%", padding: "8px", marginBottom: "10px", minHeight: "100px" }}
          />

          <button type="submit" disabled={loading}>
            {loading ? "Sending..." : "Send Message"}
          </button>
        </form>
      )}

      <div className="message-tabs" style={{ marginBottom: "20px" }}>
        <button
          className={activeTab === "inbox" ? "active" : ""}
          onClick={() => setActiveTab("inbox")}
          style={{ marginRight: "10px", padding: "8px 16px" }}
        >
          Inbox
        </button>
        <button
          className={activeTab === "sent" ? "active" : ""}
          onClick={() => setActiveTab("sent")}
          style={{ padding: "8px 16px" }}
        >
          Sent
        </button>
      </div>

      {loading ? (
        <p>Loading messages...</p>
      ) : messages.length > 0 ? (
        <table>
          <thead>
            <tr>
              <th>{activeTab === "inbox" ? "From" : "To"}</th>
              <th>Subject</th>
              <th>Body</th>
              <th>Date</th>
              <th>Status</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {messages.map((msg) => (
              <tr key={msg.id}>
                <td>
                  {activeTab === "inbox"
                    ? `${msg.sender?.first_name} ${msg.sender?.last_name}`
                    : `${msg.recipient?.first_name} ${msg.recipient?.last_name}`}
                </td>
                <td>{msg.subject || "No Subject"}</td>
                <td>{msg.body.substring(0, 50)}...</td>
                <td>{new Date(msg.created_at).toLocaleDateString()}</td>
                <td>{msg.is_read ? "Read" : "Unread"}</td>
                <td>
                  <button
                    onClick={() => handleDeleteMessage(msg.id)}
                    style={{ color: "red", cursor: "pointer" }}
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      ) : (
        <p>No messages in {activeTab}</p>
      )}
    </div>
  );
}
