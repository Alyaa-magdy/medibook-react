import { Navigate } from "react-router";

function ProtectedRoute({ children }) {

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
     PATIENT
  ========================= */

  if (
    currentUser.role ===
    "patient"
  ) {

    return children;

  }


  /* =========================
     DOCTOR
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
     ADMIN
  ========================= */

  if (
    currentUser.role ===
    "admin"
  ) {

    return (
      <Navigate
        to="/admin/dashboard"
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

export default ProtectedRoute;