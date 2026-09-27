import { Navigate } from "react-router";

function GuestRoute({ children }) {

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

    return children;

  }


  /* =========================
     PATIENT
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


  return (
    <Navigate
      to="/"
      replace
    />
  );

}

export default GuestRoute;