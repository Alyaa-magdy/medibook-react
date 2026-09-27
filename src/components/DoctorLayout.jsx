import { useEffect, useState } from "react";
import axios from "axios";

import {
  Link,
  NavLink,
  Outlet,
  useNavigate
} from "react-router";


function DoctorLayout() {

  const navigate =
    useNavigate();


  const [menuOpen, setMenuOpen] =
    useState(false);


  const [currentUser, setCurrentUser] =
    useState(() => {
      const savedUser =
        localStorage.getItem(
          "currentUser"
        );

      return savedUser
        ? JSON.parse(savedUser)
        : null;
    });


  const [unreadNotifications, setUnreadNotifications] =
    useState(0);


  /* =========================
     CURRENT USER CHANGES
  ========================= */

  useEffect(() => {

    const refreshCurrentUser = () => {

      const savedUser =
        localStorage.getItem(
          "currentUser"
        );


      setCurrentUser(
        savedUser
          ? JSON.parse(savedUser)
          : null
      );

    };


    window.addEventListener(
      "authChanged",
      refreshCurrentUser
    );


    return () => {

      window.removeEventListener(
        "authChanged",
        refreshCurrentUser
      );

    };

  }, []);


  /* =========================
     NOTIFICATIONS COUNT
  ========================= */

  useEffect(() => {

    let interval = null;


    const getUnreadNotifications =
      async () => {

        if (!currentUser) {
          setUnreadNotifications(0);
          return;
        }


        try {

          const response =
            await axios.get(
              "http://localhost:3000/notifications"
            );


          const count =
            response.data.filter(
              (notification) => {

                return (
                  String(notification.recipientUserId) ===
                    String(currentUser.id) &&
                  notification.read !== true
                );

              }
            ).length;


          setUnreadNotifications(
            count
          );


        } catch (error) {

          console.log(
            "DOCTOR LAYOUT NOTIFICATIONS ERROR:",
            error
          );

        }

      };


    getUnreadNotifications();


    interval = setInterval(() => {
      getUnreadNotifications();
    }, 5000);


    window.addEventListener(
      "notificationsChanged",
      getUnreadNotifications
    );


    return () => {

      if (interval) {
        clearInterval(interval);
      }

      window.removeEventListener(
        "notificationsChanged",
        getUnreadNotifications
      );

    };

  }, [currentUser]);


  /* =========================
     CLOSE MENU
  ========================= */

  const closeMenu = () => {

    setMenuOpen(false);

  };


  /* =========================
     LOGOUT
  ========================= */

  const handleLogout = () => {

    localStorage.removeItem(
      "currentUser"
    );


    window.dispatchEvent(
      new Event("authChanged")
    );


    navigate("/login");

  };


  const notificationBadge =
    unreadNotifications > 0 ? (
      <span
        style={{
          marginLeft: "auto",
          minWidth: "20px",
          height: "20px",
          padding: "0 6px",
          display: "inline-flex",
          alignItems: "center",
          justifyContent: "center",
          borderRadius: "50px",
          background: "#ef4444",
          color: "white",
          fontSize: "9px",
          fontWeight: "800"
        }}
      >
        {unreadNotifications > 99
          ? "99+"
          : unreadNotifications}
      </span>
    ) : null;


  return (

    <div className="dashboard-layout">


      {/* =================================
          SIDEBAR
      ================================= */}

      <aside
        className={
          menuOpen
            ? "dashboard-sidebar active"
            : "dashboard-sidebar"
        }
      >


        {/* LOGO */}

        <div className="dashboard-sidebar-logo">

          <Link
            to="/doctor/dashboard"
            onClick={closeMenu}
          >

            <div className="dashboard-logo-icon">

              M

            </div>


            <div>

              <strong>
                MediBook
              </strong>

              <span>
                Doctor Portal
              </span>

            </div>

          </Link>

        </div>


        {/* DOCTOR */}

        <div className="dashboard-user-box">

          <div className="dashboard-user-avatar">

            🩺

          </div>


          <div>

            <strong>

              {currentUser?.name ||
                "Doctor"}

            </strong>

            <span>
              Doctor Account
            </span>

          </div>

        </div>


        {/* =================================
            MENU
        ================================= */}

        <nav className="dashboard-menu">


          <span className="dashboard-menu-title">

            DOCTOR PORTAL

          </span>


          {/* DASHBOARD */}

          <NavLink
            to="/doctor/dashboard"
            onClick={closeMenu}
            className={({ isActive }) =>
              isActive
                ? "dashboard-menu-link active"
                : "dashboard-menu-link"
            }
          >

            <span>
              ▦
            </span>

            Dashboard

          </NavLink>


          {/* PROFILE */}

          <NavLink
            to="/doctor/profile"
            onClick={closeMenu}
            className={({ isActive }) =>
              isActive
                ? "dashboard-menu-link active"
                : "dashboard-menu-link"
            }
          >

            <span>
              ♙
            </span>

            My Profile

          </NavLink>


          {/* SCHEDULE */}

          <NavLink
            to="/doctor/schedule"
            onClick={closeMenu}
            className={({ isActive }) =>
              isActive
                ? "dashboard-menu-link active"
                : "dashboard-menu-link"
            }
          >

            <span>
              ▣
            </span>

            Manage Schedule

          </NavLink>


          {/* NOTIFICATIONS */}

          <NavLink
            to="/doctor/notifications"
            onClick={closeMenu}
            className={({ isActive }) =>
              isActive
                ? "dashboard-menu-link active"
                : "dashboard-menu-link"
            }
          >

            <span>
              🔔
            </span>

            Notifications

            {notificationBadge}

          </NavLink>


          {/* WEBSITE */}

          <span className="dashboard-menu-title dashboard-menu-title-second">

            WEBSITE

          </span>


          <Link
            to="/"
            onClick={closeMenu}
            className="dashboard-menu-link"
          >

            <span>
              ↗
            </span>

            View Website

          </Link>


        </nav>


        {/* =================================
            LOGOUT
        ================================= */}

        <div className="dashboard-sidebar-bottom">

          <button
            type="button"
            onClick={handleLogout}
            className="dashboard-logout-btn"
          >

            <span>
              ↪
            </span>

            Logout

          </button>

        </div>


      </aside>


      {/* =================================
          MOBILE OVERLAY
      ================================= */}

      {menuOpen && (

        <div
          className="dashboard-overlay"
          onClick={closeMenu}
        />

      )}


      {/* =================================
          MAIN AREA
      ================================= */}

      <div className="dashboard-main">


        {/* =================================
            TOPBAR
        ================================= */}

        <header className="dashboard-topbar">


          <div className="dashboard-topbar-left">


            <button
              type="button"
              className="dashboard-mobile-menu"
              onClick={() =>
                setMenuOpen(
                  !menuOpen
                )
              }
            >

              ☰

            </button>


            <div>

              <strong>
                Doctor Portal
              </strong>

              <span>
                Manage profile, appointments
                and schedule
              </span>

            </div>


          </div>


          <div className="dashboard-topbar-right">


            <Link
              to="/doctor/notifications"
              className="dashboard-view-site"
              style={{
                position: "relative"
              }}
            >

              🔔 Notifications

              {unreadNotifications > 0 && (
                <span
                  style={{
                    marginLeft: "7px",
                    minWidth: "18px",
                    height: "18px",
                    padding: "0 5px",
                    display: "inline-flex",
                    alignItems: "center",
                    justifyContent: "center",
                    borderRadius: "50px",
                    background: "#ef4444",
                    color: "white",
                    fontSize: "8px",
                    fontWeight: "800"
                  }}
                >
                  {unreadNotifications > 99
                    ? "99+"
                    : unreadNotifications}
                </span>
              )}

            </Link>


            <Link
              to="/"
              className="dashboard-view-site"
            >

              View Website

            </Link>


            <div className="dashboard-topbar-user">


              <div className="dashboard-topbar-avatar">

                🩺

              </div>


              <div>

                <strong>

                  {currentUser?.name ||
                    "Doctor"}

                </strong>

                <span>
                  Doctor
                </span>

              </div>


            </div>


          </div>


        </header>


        {/* =================================
            PAGE CONTENT
        ================================= */}

        <div className="dashboard-content">

          <Outlet />

        </div>


      </div>


    </div>

  );

}

export default DoctorLayout;
