import { Navigate } from "react-router";

function AdminRoute({ children }) {

  /* =========================
     GET CURRENT USER
  ========================= */

  const savedUser =
    localStorage.getItem(
      "currentUser"
    );


  const currentUser =
    savedUser
      ? JSON.parse(savedUser)
      : null;


  /* =========================
     NOT LOGGED IN
  ========================= */

  if (!currentUser) {

    return (
      <Navigate
        to="/login"
        replace
      />
    );

  }


  /* =========================
     ADMIN
  ========================= */

  if (
    currentUser.role ===
    "admin"
  ) {

    return children;

  }


  /* =========================
     DOCTOR TRIES ADMIN AREA
  ========================= */

  if (
    currentUser.role ===
    "doctor"
  ) {

    return (
      <Navigate
        to="/doctor/dashboard"
        replace
      />
    );

  }


  /* =========================
     PATIENT TRIES ADMIN AREA
  ========================= */

  if (
    currentUser.role ===
    "patient"
  ) {

    return (
      <Navigate
        to="/"
        replace
      />
    );

  }


  /* =========================
     UNKNOWN ROLE
  ========================= */

  return (
    <Navigate
      to="/"
      replace
    />
  );

}

export default AdminRoute;