import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router";
import axios from "axios";

function Notifications() {
  const savedUser =
    localStorage.getItem("currentUser");

  const currentUser = savedUser
    ? JSON.parse(savedUser)
    : null;

  const [notifications, setNotifications] =
    useState([]);

  const [filter, setFilter] =
    useState("all");

  const [loading, setLoading] =
    useState(true);

  const [updating, setUpdating] =
    useState(false);

  const [error, setError] =
    useState("");

  const getNotifications = async (
    showLoading = false
  ) => {
    if (!currentUser) {
      setLoading(false);
      return;
    }

    try {
      if (showLoading) {
        setLoading(true);
      }

      const response = await axios.get(
        "http://localhost:3000/notifications"
      );

      const myNotifications =
        response.data
          .filter((notification) => {
            return (
              String(notification.recipientUserId) ===
              String(currentUser.id)
            );
          })
          .sort((a, b) => {
            return String(b.createdAt || "")
              .localeCompare(
                String(a.createdAt || "")
              );
          });

      setNotifications(
        myNotifications
      );

      setError("");
    } catch (error) {
      console.log(
        "NOTIFICATIONS ERROR:",
        error
      );

      setError(
        "Unable to load notifications."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    getNotifications(true);

    const interval = setInterval(() => {
      getNotifications(false);
    }, 5000);

    const refreshNotifications = () => {
      getNotifications(false);
    };

    window.addEventListener(
      "notificationsChanged",
      refreshNotifications
    );

    return () => {
      clearInterval(interval);

      window.removeEventListener(
        "notificationsChanged",
        refreshNotifications
      );
    };
  }, []);

  const unreadCount =
    notifications.filter(
      (notification) =>
        notification.read !== true
    ).length;

  const filteredNotifications =
    useMemo(() => {
      if (filter === "unread") {
        return notifications.filter(
          (notification) =>
            notification.read !== true
        );
      }

      return notifications;
    }, [notifications, filter]);

  const markAsRead = async (
    notification
  ) => {
    if (notification.read === true) {
      return;
    }

    try {
      const response = await axios.patch(
        `http://localhost:3000/notifications/${notification.id}`,
        {
          read: true,
          readAt: new Date().toISOString()
        }
      );

      setNotifications(
        notifications.map((item) => {
          if (
            String(item.id) ===
            String(notification.id)
          ) {
            return response.data;
          }

          return item;
        })
      );

      window.dispatchEvent(
        new Event("notificationsChanged")
      );
    } catch (error) {
      console.log(
        "MARK NOTIFICATION ERROR:",
        error
      );
    }
  };

  const markAllAsRead = async () => {
    const unreadNotifications =
      notifications.filter(
        (notification) =>
          notification.read !== true
      );

    if (unreadNotifications.length === 0) {
      return;
    }

    try {
      setUpdating(true);

      const readAt =
        new Date().toISOString();

      await Promise.all(
        unreadNotifications.map(
          (notification) => {
            return axios.patch(
              `http://localhost:3000/notifications/${notification.id}`,
              {
                read: true,
                readAt
              }
            );
          }
        )
      );

      setNotifications(
        notifications.map(
          (notification) => ({
            ...notification,
            read: true,
            readAt:
              notification.readAt || readAt
          })
        )
      );

      window.dispatchEvent(
        new Event("notificationsChanged")
      );
    } catch (error) {
      console.log(
        "MARK ALL NOTIFICATIONS ERROR:",
        error
      );

      setError(
        "Unable to update notifications."
      );
    } finally {
      setUpdating(false);
    }
  };

  const deleteNotification = async (
    notificationId
  ) => {
    try {
      await axios.delete(
        `http://localhost:3000/notifications/${notificationId}`
      );

      setNotifications(
        notifications.filter(
          (notification) => {
            return (
              String(notification.id) !==
              String(notificationId)
            );
          }
        )
      );

      window.dispatchEvent(
        new Event("notificationsChanged")
      );
    } catch (error) {
      console.log(
        "DELETE NOTIFICATION ERROR:",
        error
      );
    }
  };

  const formatDate = (value) => {
    if (!value) {
      return "";
    }

    const date = new Date(value);

    if (Number.isNaN(date.getTime())) {
      return value;
    }

    return date.toLocaleString();
  };

  const getIcon = (type) => {
    if (type === "appointment_created") {
      return "📅";
    }

    if (type === "appointment_confirmed") {
      return "✓";
    }

    if (type === "appointment_completed") {
      return "🩺";
    }

    if (type === "appointment_cancelled") {
      return "✕";
    }

    if (type === "payment_received") {
      return "💳";
    }

    if (type === "review_received") {
      return "★";
    }

    return "🔔";
  };

  const defaultLink =
    currentUser?.role === "doctor"
      ? "/doctor/dashboard"
      : "/appointments";

  if (loading) {
    return (
      <div className="notifications-message">
        Loading notifications...
      </div>
    );
  }

  return (
    <main className="notifications-page">
      <style>
        {`
          .notifications-page {
            min-height: 70vh;
            padding: 35px 0 70px;
            background: #f8fafc;
          }

          .notifications-container {
            width: min(920px, calc(100% - 32px));
            margin: 0 auto;
          }

          .notifications-header {
            display: flex;
            align-items: flex-start;
            justify-content: space-between;
            gap: 20px;
            margin-bottom: 22px;
          }

          .notifications-header small {
            display: block;
            margin-bottom: 7px;
            color: #2563eb;
            font-size: 10px;
            font-weight: 800;
            letter-spacing: 1px;
          }

          .notifications-header h1 {
            margin: 0 0 8px;
            color: #0f172a;
            font-size: 30px;
          }

          .notifications-header p {
            margin: 0;
            color: #64748b;
            font-size: 13px;
          }

          .notifications-mark-all {
            min-height: 42px;
            padding: 0 15px;
            border: 0;
            border-radius: 9px;
            background: #2563eb;
            color: white;
            font-size: 11px;
            font-weight: 800;
            cursor: pointer;
          }

          .notifications-mark-all:disabled {
            opacity: .5;
            cursor: not-allowed;
          }

          .notifications-toolbar {
            display: flex;
            align-items: center;
            justify-content: space-between;
            gap: 15px;
            padding: 14px;
            margin-bottom: 16px;
            border: 1px solid #e2e8f0;
            border-radius: 12px;
            background: white;
          }

          .notifications-filters {
            display: flex;
            gap: 8px;
          }

          .notifications-filter {
            padding: 8px 12px;
            border: 1px solid #e2e8f0;
            border-radius: 8px;
            background: white;
            color: #475569;
            font-size: 10px;
            font-weight: 800;
            cursor: pointer;
          }

          .notifications-filter.active {
            border-color: #2563eb;
            background: #eff6ff;
            color: #1d4ed8;
          }

          .notifications-count {
            color: #64748b;
            font-size: 11px;
            font-weight: 700;
          }

          .notifications-error {
            padding: 12px 14px;
            margin-bottom: 14px;
            border-radius: 9px;
            background: #fee2e2;
            color: #b91c1c;
            font-size: 11px;
            font-weight: 700;
          }

          .notifications-list {
            display: grid;
            gap: 10px;
          }

          .notification-card {
            display: grid;
            grid-template-columns: 44px minmax(0, 1fr) auto;
            gap: 13px;
            align-items: flex-start;
            padding: 16px;
            border: 1px solid #e2e8f0;
            border-radius: 13px;
            background: white;
          }

          .notification-card.unread {
            border-color: #bfdbfe;
            background: #f8fbff;
          }

          .notification-icon {
            width: 44px;
            height: 44px;
            display: flex;
            align-items: center;
            justify-content: center;
            border-radius: 11px;
            background: #eff6ff;
            font-size: 18px;
          }

          .notification-content h3 {
            margin: 0 0 5px;
            color: #0f172a;
            font-size: 13px;
          }

          .notification-content p {
            margin: 0 0 8px;
            color: #64748b;
            font-size: 11px;
            line-height: 1.7;
          }

          .notification-meta {
            display: flex;
            gap: 10px;
            flex-wrap: wrap;
            color: #94a3b8;
            font-size: 9px;
            font-weight: 700;
          }

          .notification-actions {
            display: flex;
            flex-direction: column;
            align-items: flex-end;
            gap: 7px;
          }

          .notification-open,
          .notification-read,
          .notification-delete {
            min-width: 82px;
            padding: 7px 10px;
            border-radius: 7px;
            font-size: 9px;
            font-weight: 800;
            text-align: center;
            text-decoration: none;
            cursor: pointer;
          }

          .notification-open {
            border: 0;
            background: #2563eb;
            color: white;
          }

          .notification-read {
            border: 1px solid #e2e8f0;
            background: white;
            color: #475569;
          }

          .notification-delete {
            border: 0;
            background: #fee2e2;
            color: #b91c1c;
          }

          .notification-unread-dot {
            display: inline-block;
            width: 7px;
            height: 7px;
            border-radius: 50%;
            background: #2563eb;
          }

          .notifications-empty {
            padding: 55px 20px;
            border: 1px solid #e2e8f0;
            border-radius: 14px;
            background: white;
            text-align: center;
          }

          .notifications-empty div {
            margin-bottom: 10px;
            font-size: 30px;
          }

          .notifications-empty h2 {
            margin: 0 0 6px;
            color: #0f172a;
            font-size: 18px;
          }

          .notifications-empty p {
            margin: 0;
            color: #64748b;
            font-size: 12px;
          }

          .notifications-message {
            min-height: 50vh;
            display: flex;
            align-items: center;
            justify-content: center;
            font-weight: 700;
          }

          @media (max-width: 700px) {
            .notifications-header {
              flex-direction: column;
            }

            .notifications-toolbar {
              flex-direction: column;
              align-items: stretch;
            }

            .notification-card {
              grid-template-columns: 40px minmax(0, 1fr);
            }

            .notification-actions {
              grid-column: 1 / -1;
              flex-direction: row;
              align-items: center;
            }
          }
        `}
      </style>

      <div className="notifications-container">
        <div className="notifications-header">
          <div>
            <small>
              NOTIFICATIONS
            </small>

            <h1>
              Your Notifications
            </h1>

            <p>
              Appointment and account updates appear here.
            </p>
          </div>

          <button
            type="button"
            className="notifications-mark-all"
            onClick={markAllAsRead}
            disabled={
              updating || unreadCount === 0
            }
          >
            {updating
              ? "Updating..."
              : "Mark All as Read"}
          </button>
        </div>

        <div className="notifications-toolbar">
          <div className="notifications-filters">
            <button
              type="button"
              className={
                filter === "all"
                  ? "notifications-filter active"
                  : "notifications-filter"
              }
              onClick={() => setFilter("all")}
            >
              All ({notifications.length})
            </button>

            <button
              type="button"
              className={
                filter === "unread"
                  ? "notifications-filter active"
                  : "notifications-filter"
              }
              onClick={() => setFilter("unread")}
            >
              Unread ({unreadCount})
            </button>
          </div>

          <div className="notifications-count">
            {unreadCount} unread
          </div>
        </div>

        {error && (
          <div className="notifications-error">
            {error}
          </div>
        )}

        {filteredNotifications.length === 0 ? (
          <div className="notifications-empty">
            <div>🔔</div>
            <h2>
              No notifications
            </h2>
            <p>
              New appointment updates will appear here.
            </p>
          </div>
        ) : (
          <div className="notifications-list">
            {filteredNotifications.map(
              (notification) => (
                <div
                  key={notification.id}
                  className={
                    notification.read === true
                      ? "notification-card"
                      : "notification-card unread"
                  }
                >
                  <div className="notification-icon">
                    {getIcon(notification.type)}
                  </div>

                  <div className="notification-content">
                    <h3>
                      {notification.title}
                    </h3>

                    <p>
                      {notification.message}
                    </p>

                    <div className="notification-meta">
                      <span>
                        {formatDate(
                          notification.createdAt
                        )}
                      </span>

                      {notification.read !== true && (
                        <span>
                          <span className="notification-unread-dot" />
                          {" "}Unread
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="notification-actions">
                    <Link
                      to={
                        notification.link ||
                        defaultLink
                      }
                      className="notification-open"
                      onClick={() =>
                        markAsRead(notification)
                      }
                    >
                      Open
                    </Link>

                    {notification.read !== true && (
                      <button
                        type="button"
                        className="notification-read"
                        onClick={() =>
                          markAsRead(notification)
                        }
                      >
                        Mark Read
                      </button>
                    )}

                    <button
                      type="button"
                      className="notification-delete"
                      onClick={() =>
                        deleteNotification(
                          notification.id
                        )
                      }
                    >
                      Delete
                    </button>
                  </div>
                </div>
              )
            )}
          </div>
        )}
      </div>
    </main>
  );
}

export default Notifications;
