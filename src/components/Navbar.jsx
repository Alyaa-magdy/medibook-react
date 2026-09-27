import {
  useEffect,
  useState
} from "react";

import {
  Link,
  useNavigate
} from "react-router";

import axios from "axios";


function Navbar() {

  const navigate =
    useNavigate();


  const [
    menuOpen,
    setMenuOpen
  ] =
    useState(false);


  const [
    currentUser,
    setCurrentUser
  ] =
    useState(null);


  const [
    unreadNotifications,
    setUnreadNotifications
  ] =
    useState(0);


  /* =========================
     GET CURRENT USER
  ========================= */

  useEffect(() => {

    const getCurrentUser = () => {

      const savedUser =
        localStorage.getItem(
          "currentUser"
        );


      if (savedUser) {

        setCurrentUser(
          JSON.parse(
            savedUser
          )
        );

      } else {

        setCurrentUser(
          null
        );

      }

    };


    getCurrentUser();


    window.addEventListener(
      "authChanged",
      getCurrentUser
    );


    return () => {

      window.removeEventListener(
        "authChanged",
        getCurrentUser
      );

    };

  }, []);


  /* =========================
     NOTIFICATIONS COUNT
  ========================= */

  useEffect(() => {

    let interval =
      null;


    const getUnreadNotifications =
      async () => {

        if (!currentUser) {

          setUnreadNotifications(
            0
          );

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

                  String(
                    notification.recipientUserId
                  ) ===
                  String(
                    currentUser.id
                  )

                  &&

                  notification.read !==
                    true

                );

              }
            ).length;


          setUnreadNotifications(
            count
          );


        } catch (error) {

          console.log(
            "NAVBAR NOTIFICATIONS ERROR:",
            error
          );

        }

      };


    getUnreadNotifications();


    interval =
      setInterval(
        () => {

          getUnreadNotifications();

        },
        5000
      );


    window.addEventListener(
      "notificationsChanged",
      getUnreadNotifications
    );


    return () => {

      if (interval) {

        clearInterval(
          interval
        );

      }


      window.removeEventListener(
        "notificationsChanged",
        getUnreadNotifications
      );

    };

  }, [currentUser]);


  /* =========================
     NOTIFICATION PATH
  ========================= */

  const notificationsPath =
    currentUser?.role ===
    "doctor"
      ? "/doctor/notifications"
      : "/notifications";


  /* =========================
     BADGE
  ========================= */

  const notificationBadge =
    unreadNotifications > 0 ? (

      <span
        style={{
          minWidth: "18px",
          height: "18px",
          padding: "0 5px",
          marginLeft: "6px",
          display: "inline-flex",
          alignItems: "center",
          justifyContent: "center",
          borderRadius: "50px",
          background: "#ef4444",
          color: "#ffffff",
          fontSize: "9px",
          fontWeight: "800",
          lineHeight: "1"
        }}
      >

        {unreadNotifications > 99
          ? "99+"
          : unreadNotifications
        }

      </span>

    ) : null;


  /* =========================
     CLOSE MENU
  ========================= */

  const closeMenu = () => {

    setMenuOpen(
      false
    );

  };


  /* =========================
     LOGOUT
  ========================= */

  const handleLogout = () => {

    localStorage.removeItem(
      "currentUser"
    );


    setCurrentUser(
      null
    );


    window.dispatchEvent(
      new Event(
        "authChanged"
      )
    );


    setMenuOpen(
      false
    );


    navigate(
      "/"
    );

  };


  return (

    <header className="header">


      <div className="navbar-container">


        {/* =========================
            LOGO
        ========================= */}

        <Link
          to="/"
          className="logo"
          onClick={closeMenu}
        >


          <div className="logo-icon">

            M

          </div>


          <div className="logo-text">

            Medi<span>Book</span>

          </div>


        </Link>


        {/* =========================
            NAVIGATION
        ========================= */}

        <nav
          className={
            menuOpen
              ? "nav-menu active"
              : "nav-menu"
          }
        >


          {/* HOME */}

          <Link
            to="/"
            onClick={closeMenu}
          >

            Home

          </Link>


          {/* DOCTORS */}

          <Link
            to="/doctors"
            onClick={closeMenu}
          >

            Doctors

          </Link>


          {/* SPECIALTIES */}

          <Link
            to="/specialties"
            onClick={closeMenu}
          >

            Specialties

          </Link>


          {/* HOW IT WORKS */}

          <Link
            to="/how-it-works"
            onClick={closeMenu}
          >

            How It Works

          </Link>


          {/* =========================
              PATIENT MENU
          ========================= */}

          {currentUser &&
            currentUser.role ===
              "patient" && (

              <>


                <Link
                  to="/appointments"
                  onClick={closeMenu}
                >

                  My Appointments

                </Link>


                <Link
                  to="/notifications"
                  onClick={closeMenu}
                >

                  Notifications

                  {notificationBadge}

                </Link>


              </>

            )}


          {/* =========================
              DOCTOR MENU
          ========================= */}

          {currentUser &&
            currentUser.role ===
              "doctor" && (

              <>


                <Link
                  to="/doctor/dashboard"
                  onClick={closeMenu}
                  className="dashboard-nav-link"
                >

                  Dashboard

                </Link>


                <Link
                  to="/doctor/schedule"
                  onClick={closeMenu}
                >

                  Manage Schedule

                </Link>


                <Link
                  to="/doctor/notifications"
                  onClick={closeMenu}
                >

                  Notifications

                  {notificationBadge}

                </Link>


              </>

            )}


          {/* =========================
              ADMIN MENU
          ========================= */}

          {currentUser &&
            currentUser.role ===
              "admin" && (

              <>


                <Link
                  to="/admin/dashboard"
                  onClick={closeMenu}
                  className="dashboard-nav-link"
                >

                  Admin Dashboard

                </Link>


                <Link
                  to="/admin/doctors"
                  onClick={closeMenu}
                >

                  Manage Doctors

                </Link>


                <Link
                  to="/admin/appointments"
                  onClick={closeMenu}
                >

                  Appointments

                </Link>


              </>

            )}


          {/* CONTACT */}

          <Link
            to="/contact"
            onClick={closeMenu}
          >

            Contact

          </Link>


          {/* =========================
              MOBILE ACCOUNT AREA
          ========================= */}

          <div className="mobile-buttons">


            {currentUser ? (

              <div className="navbar-user">


                {/* PATIENT */}

                {currentUser.role ===
                  "patient" && (

                  <Link
                    to="/profile"
                    className="navbar-user-name"
                    onClick={closeMenu}
                  >

                    <span className="navbar-user-icon">

                      👤

                    </span>

                    {currentUser.name}

                  </Link>

                )}


                {/* DOCTOR */}

                {currentUser.role ===
                  "doctor" && (

                  <Link
                    to="/doctor/dashboard"
                    className="navbar-user-name"
                    onClick={closeMenu}
                  >

                    <span className="navbar-user-icon">

                      🩺

                    </span>

                    {currentUser.name}

                  </Link>

                )}


                {/* ADMIN */}

                {currentUser.role ===
                  "admin" && (

                  <Link
                    to="/admin/dashboard"
                    className="navbar-user-name"
                    onClick={closeMenu}
                  >

                    <span className="navbar-user-icon">

                      ⚙️

                    </span>

                    {currentUser.name}

                  </Link>

                )}


                <button
                  type="button"
                  className="navbar-logout"
                  onClick={
                    handleLogout
                  }
                >

                  Logout

                </button>


              </div>

            ) : (

              <div className="navbar-auth">


                <Link
                  to="/login"
                  className="navbar-login"
                  onClick={closeMenu}
                >

                  Login

                </Link>


                <Link
                  to="/register"
                  className="navbar-register"
                  onClick={closeMenu}
                >

                  Create Account

                </Link>


              </div>

            )}


          </div>


        </nav>


        {/* =========================
            DESKTOP ACCOUNT AREA
        ========================= */}

        <div className="navbar-buttons">


          {currentUser ? (

            <div className="navbar-user">


              {(currentUser.role ===
                "patient" ||
                currentUser.role ===
                "doctor") && (

                <Link
                  to={
                    notificationsPath
                  }
                  title="Notifications"
                  style={{
                    position: "relative",
                    width: "38px",
                    height: "38px",
                    display: "inline-flex",
                    alignItems: "center",
                    justifyContent: "center",
                    borderRadius: "50%",
                    background: "#f1f5f9",
                    color: "#0f172a",
                    textDecoration: "none",
                    fontSize: "16px"
                  }}
                >

                  🔔


                  {unreadNotifications >
                    0 && (

                    <span
                      style={{
                        position:
                          "absolute",
                        top: "-4px",
                        right: "-5px",
                        minWidth:
                          "18px",
                        height:
                          "18px",
                        padding:
                          "0 4px",
                        display:
                          "inline-flex",
                        alignItems:
                          "center",
                        justifyContent:
                          "center",
                        borderRadius:
                          "50px",
                        background:
                          "#ef4444",
                        color:
                          "white",
                        fontSize:
                          "8px",
                        fontWeight:
                          "800"
                      }}
                    >

                      {unreadNotifications >
                        99
                        ? "99+"
                        : unreadNotifications
                      }

                    </span>

                  )}


                </Link>

              )}


              {/* PATIENT */}

              {currentUser.role ===
                "patient" && (

                <Link
                  to="/profile"
                  className="navbar-user-name"
                >

                  <span className="navbar-user-icon">

                    👤

                  </span>

                  {currentUser.name}

                </Link>

              )}


              {/* DOCTOR */}

              {currentUser.role ===
                "doctor" && (

                <Link
                  to="/doctor/dashboard"
                  className="navbar-user-name"
                >

                  <span className="navbar-user-icon">

                    🩺

                  </span>

                  {currentUser.name}

                </Link>

              )}


              {/* ADMIN */}

              {currentUser.role ===
                "admin" && (

                <Link
                  to="/admin/dashboard"
                  className="navbar-user-name"
                >

                  <span className="navbar-user-icon">

                    ⚙️

                  </span>

                  {currentUser.name}

                </Link>

              )}


              <button
                type="button"
                className="navbar-logout"
                onClick={
                  handleLogout
                }
              >

                Logout

              </button>


            </div>

          ) : (

            <div className="navbar-auth">


              <Link
                to="/login"
                className="navbar-login"
              >

                Login

              </Link>


              <Link
                to="/register"
                className="navbar-register"
              >

                Create Account

              </Link>


            </div>

          )}


        </div>


        {/* =========================
            MOBILE MENU BUTTON
        ========================= */}

        <button
          type="button"
          className="menu-btn"
          onClick={() =>
            setMenuOpen(
              !menuOpen
            )
          }
        >

          {menuOpen
            ? "✕"
            : "☰"
          }

        </button>


      </div>


    </header>

  );

}

export default Navbar;