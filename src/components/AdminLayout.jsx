import { useState } from "react";

import {
  Link,
  NavLink,
  Outlet,
  useNavigate
} from "react-router";



function AdminLayout() {

  const navigate =
    useNavigate();


  const [menuOpen, setMenuOpen] =
    useState(false);


  const savedUser =
    localStorage.getItem(
      "currentUser"
    );


  const currentUser =
    savedUser
      ? JSON.parse(savedUser)
      : null;


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
            to="/admin/dashboard"
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
                Administration
              </span>

            </div>

          </Link>

        </div>


        {/* ADMIN */}

        <div className="dashboard-user-box">

          <div className="dashboard-user-avatar">

            ⚙️

          </div>


          <div>

            <strong>

              {currentUser?.name ||
                "Administrator"}

            </strong>

            <span>
              System Administrator
            </span>

          </div>

        </div>


        {/* =================================
            MENU
        ================================= */}

        <nav className="dashboard-menu">


          <span className="dashboard-menu-title">

            MANAGEMENT

          </span>


          {/* DASHBOARD */}

          <NavLink
            to="/admin/dashboard"
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


          {/* DOCTORS */}

          <NavLink
            to="/admin/doctors"
            onClick={closeMenu}
            className={({ isActive }) =>
              isActive
                ? "dashboard-menu-link active"
                : "dashboard-menu-link"
            }
          >

            <span>
              ♟
            </span>

            Manage Doctors

          </NavLink>


          {/* PATIENTS */}

          <NavLink
            to="/admin/patients"
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

            Manage Patients

          </NavLink>


          {/* APPOINTMENTS */}

          <NavLink
            to="/admin/appointments"
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

            Appointments

          </NavLink>


          <span className="dashboard-menu-title dashboard-menu-title-second">

            WEBSITE

          </span>


          {/* WEBSITE */}

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
          MAIN
      ================================= */}

      <div className="dashboard-main">


        {/* TOPBAR */}

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
                Admin Portal
              </strong>

              <span>
                MediBook Management System
              </span>

            </div>


          </div>


          <div className="dashboard-topbar-right">


            <Link
              to="/"
              className="dashboard-view-site"
            >
              View Website
            </Link>


            <div className="dashboard-topbar-user">


              <div className="dashboard-topbar-avatar">

                ⚙️

              </div>


              <div>

                <strong>

                  {currentUser?.name ||
                    "Administrator"}

                </strong>

                <span>
                  Admin
                </span>

              </div>


            </div>


          </div>


        </header>


        {/* PAGE CONTENT */}

        <div className="dashboard-content">

          <Outlet />

        </div>


      </div>


    </div>

  );

}

export default AdminLayout;