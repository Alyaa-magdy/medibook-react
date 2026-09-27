import { Navigate } from "react-router";

function DoctorRoute({ children }) {

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
     DOCTOR
  ========================= */

  if (
    currentUser.role ===
    "doctor"
  ) {

    return children;

  }


  /* =========================
     ADMIN TRIES DOCTOR AREA
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
     PATIENT TRIES DOCTOR AREA
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

export default DoctorRoute;