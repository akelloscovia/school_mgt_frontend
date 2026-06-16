import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axiosClient from "../../api/axiosClient";

export default function Topbar() {
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState([]);
  const [unreadMessages, setUnreadMessages] = useState(0);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showMessages, setShowMessages] = useState(false);

  useEffect(() => {
    // Fetch unread messages
    const fetchUnreadMessages = async () => {
      try {
        const response = await axiosClient.get("/communication/messages/inbox?is_read=false");
        setUnreadMessages(response.data?.data?.total || 0);
      } catch (error) {
        console.error("Error fetching messages:", error);
      }
    };

    // Fetch announcements as notifications
    const fetchNotifications = async () => {
      try {
        const response = await axiosClient.get("/communication/announcements");
        setNotifications(response.data?.data?.items || []);
      } catch (error) {
        console.error("Error fetching notifications:", error);
      }
    };

    fetchUnreadMessages();
    fetchNotifications();

    // Set up interval to refresh every 30 seconds
    const interval = setInterval(() => {
      fetchUnreadMessages();
      fetchNotifications();
    }, 30000);

    return () => clearInterval(interval);
  }, []);

  const handleAdminClick = () => {
    navigate("/settings");
  };

  const handleMessagesClick = () => {
    navigate("/messages");
  };

  const handleNotificationsClick = () => {
    setShowNotifications(!showNotifications);
    setShowMessages(false);
  };

  const handleMessagesToggle = () => {
    setShowMessages(!showMessages);
    setShowNotifications(false);
  };

  return (
    <div className="topbar">

      <input
        type="text"
        placeholder="Search students, fees, reports..."
      />

      <div className="topbar-right">

        <div className="top-item" onClick={handleNotificationsClick} style={{ cursor: "pointer", position: "relative" }}>
          Notifications
          {notifications.length > 0 && (
            <span className="notification-badge">{notifications.length}</span>
          )}
          {showNotifications && (
            <div className="notification-dropdown">
              {notifications.length > 0 ? (
                <ul>
                  {notifications.slice(0, 5).map((notif) => (
                    <li key={notif.id}>
                      <strong>{notif.title}</strong>
                      <p>{notif.content}</p>
                    </li>
                  ))}
                </ul>
              ) : (
                <p>No notifications</p>
              )}
            </div>
          )}
        </div>

        <div className="top-item" onClick={handleMessagesToggle} style={{ cursor: "pointer", position: "relative" }}>
          Messages
          {unreadMessages > 0 && (
            <span className="notification-badge">{unreadMessages}</span>
          )}
          {showMessages && (
            <div className="notification-dropdown">
              <p>You have {unreadMessages} unread messages</p>
              <button onClick={handleMessagesClick} style={{ marginTop: "10px" }}>
                View All Messages
              </button>
            </div>
          )}
        </div>

        <div className="top-item" onClick={handleAdminClick} style={{ cursor: "pointer" }}>
          Admin
        </div>

      </div>

    </div>
  );
}