import { useEffect, useState } from "react";
import { Link } from "react-router";
import axios from "axios";


function AdminDashboard() {

  /* =========================
     STATES
  ========================= */

  const [users, setUsers] =
    useState([]);

  const [doctors, setDoctors] =
    useState([]);

  const [appointments, setAppointments] =
    useState([]);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");


  /* =========================
     GET DASHBOARD DATA
  ========================= */

  useEffect(() => {

    const getDashboardData =
      async () => {

        try {

          const usersResponse =
            await axios.get(
              "http://localhost:3000/users"
            );


          const doctorsResponse =
            await axios.get(
              "http://localhost:3000/doctors"
            );


          const appointmentsResponse =
            await axios.get(
              "http://localhost:3000/appointments"
            );


          setUsers(
            usersResponse.data
          );


          setDoctors(
            doctorsResponse.data
          );


          setAppointments(
            appointmentsResponse.data
          );


        } catch (error) {

          console.log(error);


          setError(
            "Unable to load admin dashboard."
          );


        } finally {

          setLoading(false);

        }

      };


    getDashboardData();

  }, []);


  /* =========================
     PATIENTS
  ========================= */

  const patients =
    users.filter((user) => {

      return (
        user.role === "patient"
      );

    });


  /* =========================
     DOCTOR ACCOUNTS
  ========================= */

  const doctorUsers =
    users.filter((user) => {

      return (
        user.role === "doctor"
      );

    });


  /* =========================
     PENDING
  ========================= */

  const pendingAppointments =
    appointments.filter(
      (appointment) => {

        return (
          appointment.status ===
          "pending"
        );

      }
    );


  /* =========================
     CONFIRMED
  ========================= */

  const confirmedAppointments =
    appointments.filter(
      (appointment) => {

        return (
          appointment.status ===
          "confirmed"
        );

      }
    );


  /* =========================
     COMPLETED
  ========================= */

  const completedAppointments =
    appointments.filter(
      (appointment) => {

        return (
          appointment.status ===
          "completed"
        );

      }
    );


  /* =========================
     CANCELLED
  ========================= */

  const cancelledAppointments =
    appointments.filter(
      (appointment) => {

        return (
          appointment.status ===
          "cancelled"
        );

      }
    );


  /* =========================
     COMPLETED VALUE
  ========================= */

  const completedVisitValue =
    completedAppointments.reduce(
      (total, appointment) => {

        return (
          total +
          Number(
            appointment.fee || 0
          )
        );

      },
      0
    );


  /* =========================
     PAYMENT OVERVIEW
  ========================= */

  const getPaymentStatus = (
    appointment
  ) => {

    return (
      appointment.paymentStatus ||
      "unpaid"
    );

  };


  const paidAppointments =
    appointments.filter(
      (appointment) => {

        return (
          getPaymentStatus(
            appointment
          ) === "paid"
        );

      }
    );


  const unpaidAppointments =
    appointments.filter(
      (appointment) => {

        return (
          getPaymentStatus(
            appointment
          ) === "unpaid"
        );

      }
    );


  const refundedAppointments =
    appointments.filter(
      (appointment) => {

        return (
          getPaymentStatus(
            appointment
          ) === "refunded"
        );

      }
    );


  const totalCollected =
    paidAppointments.reduce(
      (total, appointment) => {

        return (
          total +
          Number(
            appointment.fee || 0
          )
        );

      },
      0
    );


  const refundedAmount =
    refundedAppointments.reduce(
      (total, appointment) => {

        return (
          total +
          Number(
            appointment.fee || 0
          )
        );

      },
      0
    );


  /* =========================
     UPDATE APPOINTMENT
  ========================= */

  const updateAppointmentStatus =
    async (
      appointmentId,
      newStatus
    ) => {

      try {

        const currentAppointment =
          appointments.find(
            (appointment) => {

              return (
                String(
                  appointment.id
                ) ===
                String(
                  appointmentId
                )
              );

            }
          );


        if (!currentAppointment) {
          return;
        }


        const updateData = {
          status: newStatus
        };


        /*
          لو الأدمن ألغى حجز مدفوع
          نحوله Refunded تلقائيًا.
        */

        if (
          newStatus === "cancelled" &&
          getPaymentStatus(
            currentAppointment
          ) === "paid"
        ) {

          updateData.paymentStatus =
            "refunded";

          updateData.refundedAt =
            new Date().toISOString();

        }


        const response =
          await axios.patch(
            `http://localhost:3000/appointments/${appointmentId}`,
            updateData
          );


        const updatedAppointments =
          appointments.map(
            (appointment) => {

              if (
                String(
                  appointment.id
                ) ===
                String(
                  appointmentId
                )
              ) {

                return response.data;

              }


              return appointment;

            }
          );


        setAppointments(
          updatedAppointments
        );


      } catch (error) {

        console.log(error);


        alert(
          "Unable to update appointment."
        );

      }

    };


  /* =========================
     RECENT APPOINTMENTS
  ========================= */

  const recentAppointments =
    [
      ...appointments
    ]
      .reverse()
      .slice(0, 6);


  /* =========================
     RECENT PATIENTS
  ========================= */

  const recentPatients =
    [
      ...patients
    ]
      .reverse()
      .slice(0, 6);


  /* =========================
     LOADING
  ========================= */

  if (loading) {

    return (

      <div className="admin-dashboard-message">

        Loading admin dashboard...

      </div>

    );

  }


  /* =========================
     ERROR
  ========================= */

  if (error) {

    return (

      <div className="admin-dashboard-message error">

        {error}

      </div>

    );

  }


  /* =========================
     PAGE
  ========================= */

  return (

    <main className="admin-dashboard-page">

      <style>
        {`
          .admin-dashboard-payment-grid {
            display: grid;
            grid-template-columns: repeat(6, minmax(0, 1fr));
            gap: 14px;
            margin: 18px 0 26px;
          }

          .admin-dashboard-payment-card {
            padding: 17px;
            border: 1px solid #e2e8f0;
            border-radius: 13px;
            background: #ffffff;
          }

          .admin-dashboard-payment-card span {
            display: block;
            margin-bottom: 7px;
            color: #64748b;
            font-size: 9px;
            font-weight: 700;
          }

          .admin-dashboard-payment-card strong {
            color: #0f172a;
            font-size: 17px;
          }

          .admin-dashboard-payment-badge {
            display: inline-flex;
            align-items: center;
            justify-content: center;
            width: fit-content;
            margin-top: 6px;
            padding: 5px 8px;
            border-radius: 50px;
            font-size: 8px;
            font-weight: 800;
            text-transform: capitalize;
          }

          .admin-dashboard-payment-badge.unpaid {
            background: #fef3c7;
            color: #b45309;
          }

          .admin-dashboard-payment-badge.paid {
            background: #dcfce7;
            color: #15803d;
          }

          .admin-dashboard-payment-badge.refunded {
            background: #e2e8f0;
            color: #475569;
          }

          .admin-dashboard-payment-meta {
            display: block;
            margin-top: 4px;
            color: #94a3b8;
            font-size: 8px;
            line-height: 1.4;
            word-break: break-word;
          }

          @media (max-width: 1100px) {
            .admin-dashboard-payment-grid {
              grid-template-columns: repeat(3, minmax(0, 1fr));
            }
          }

          @media (max-width: 650px) {
            .admin-dashboard-payment-grid {
              grid-template-columns: 1fr 1fr;
            }
          }

          @media (max-width: 430px) {
            .admin-dashboard-payment-grid {
              grid-template-columns: 1fr;
            }
          }
        `}
      </style>

      <div className="section-container">


        {/* =========================
            HEADER
        ========================= */}

        <div className="admin-dashboard-header">


          <div>

            <span>
              ADMIN PORTAL
            </span>


            <h1>
              System Dashboard
            </h1>


            <p>
              Monitor doctors, patients,
              appointments and platform activity.
            </p>

          </div>


          <div className="admin-dashboard-header-buttons">


            <Link
              to="/admin/doctors"
              className="admin-manage-btn"
            >
              🩺 Manage Doctors
            </Link>


            <Link
              to="/admin/patients"
              className="admin-manage-btn"
            >
              👥 Manage Patients
            </Link>


            <Link
              to="/admin/appointments"
              className="admin-manage-btn"
            >
              📅 Appointments
            </Link>


            <div className="admin-dashboard-badge">

              ⚙️ Administrator

            </div>


          </div>


        </div>


        {/* =========================
            MAIN STATS
        ========================= */}

        <div className="admin-stats-grid">


          {/* DOCTORS */}

          <div className="admin-stat-card">

            <div className="admin-stat-icon">

              🩺

            </div>


            <div>

              <span>
                Doctors
              </span>

              <strong>
                {doctors.length}
              </strong>

            </div>

          </div>


          {/* PATIENTS */}

          <div className="admin-stat-card">

            <div className="admin-stat-icon">

              👥

            </div>


            <div>

              <span>
                Patients
              </span>

              <strong>
                {patients.length}
              </strong>

            </div>

          </div>


          {/* APPOINTMENTS */}

          <div className="admin-stat-card">

            <div className="admin-stat-icon">

              📅

            </div>


            <div>

              <span>
                Appointments
              </span>

              <strong>
                {appointments.length}
              </strong>

            </div>

          </div>


          {/* COMPLETED VALUE */}

          <div className="admin-stat-card">

            <div className="admin-stat-icon">

              💰

            </div>


            <div>

              <span>
                Collected Payments
              </span>

              <strong>
                {totalCollected} EGP
              </strong>

            </div>

          </div>


        </div>


        {/* =========================
            STATUS
        ========================= */}

        <div className="admin-status-grid">


          <div className="admin-status-card">

            <span>
              Pending
            </span>

            <strong>
              {pendingAppointments.length}
            </strong>

          </div>


          <div className="admin-status-card">

            <span>
              Confirmed
            </span>

            <strong>
              {confirmedAppointments.length}
            </strong>

          </div>


          <div className="admin-status-card">

            <span>
              Completed
            </span>

            <strong>
              {completedAppointments.length}
            </strong>

          </div>


          <div className="admin-status-card">

            <span>
              Cancelled
            </span>

            <strong>
              {cancelledAppointments.length}
            </strong>

          </div>


        </div>


        {/* =========================
            PAYMENT OVERVIEW
        ========================= */}

        <div className="admin-dashboard-payment-grid">

          <div className="admin-dashboard-payment-card">
            <span>
              Paid Appointments
            </span>
            <strong>
              {paidAppointments.length}
            </strong>
          </div>


          <div className="admin-dashboard-payment-card">
            <span>
              Unpaid Appointments
            </span>
            <strong>
              {unpaidAppointments.length}
            </strong>
          </div>


          <div className="admin-dashboard-payment-card">
            <span>
              Refunded
            </span>
            <strong>
              {refundedAppointments.length}
            </strong>
          </div>


          <div className="admin-dashboard-payment-card">
            <span>
              Total Collected
            </span>
            <strong>
              {totalCollected} EGP
            </strong>
          </div>


          <div className="admin-dashboard-payment-card">
            <span>
              Refunded Amount
            </span>
            <strong>
              {refundedAmount} EGP
            </strong>
          </div>


          <div className="admin-dashboard-payment-card">
            <span>
              Completed Visit Value
            </span>
            <strong>
              {completedVisitValue} EGP
            </strong>
          </div>

        </div>


        {/* =========================
            APPOINTMENTS
        ========================= */}

        <section className="admin-section">


          <div className="admin-section-header">


            <div>

              <span>
                APPOINTMENTS
              </span>

              <h2>
                Recent Appointments
              </h2>

            </div>


            <div className="admin-section-header-actions">

              <strong>

                {appointments.length}

                {" "}

                Total

              </strong>


              <Link
                to="/admin/appointments"
                className="admin-section-link"
              >
                View All Appointments →
              </Link>

            </div>


          </div>


          {recentAppointments.length ===
          0 ? (

            <div className="admin-empty">

              <div>
                📅
              </div>

              <h3>
                No appointments
              </h3>

              <p>
                Appointments will appear here.
              </p>

            </div>

          ) : (

            <div className="admin-appointments-list">


              {recentAppointments.map(
                (appointment) => (

                  <div
                    className="admin-appointment-card"
                    key={appointment.id}
                  >


                    {/* DATE */}

                    <div className="admin-appointment-date">

                      <span>
                        {appointment.date}
                      </span>

                      <strong>
                        {appointment.time}
                      </strong>

                    </div>


                    {/* DOCTOR */}

                    <div className="admin-appointment-info">

                      <span>
                        DOCTOR
                      </span>

                      <strong>
                        {appointment.doctorName}
                      </strong>

                    </div>


                    {/* PATIENT */}

                    <div className="admin-appointment-info">

                      <span>
                        PATIENT
                      </span>

                      <strong>
                        {appointment.patientName}
                      </strong>


                      {appointment.patientPhone && (

                        <small>

                          {appointment.patientPhone}

                        </small>

                      )}

                    </div>


                    {/* FEE */}

                    <div className="admin-appointment-info">

                      <span>
                        FEE
                      </span>

                      <strong>
                        {appointment.fee} EGP
                      </strong>


                      <span
                        className={
                          `admin-dashboard-payment-badge ${getPaymentStatus(
                            appointment
                          )}`
                        }
                      >
                        {getPaymentStatus(
                          appointment
                        )}
                      </span>


                      {appointment.paymentMethod && (

                        <small className="admin-dashboard-payment-meta">
                          Method: {appointment.paymentMethod}
                        </small>

                      )}


                      {appointment.transactionId && (

                        <small className="admin-dashboard-payment-meta">
                          Transaction: {appointment.transactionId}
                        </small>

                      )}


                      {getPaymentStatus(
                        appointment
                      ) === "paid" && (

                        <small className="admin-dashboard-payment-meta">
                          Paid Amount: {appointment.fee} EGP
                        </small>

                      )}


                      {getPaymentStatus(
                        appointment
                      ) === "refunded" && (

                        <small className="admin-dashboard-payment-meta">
                          Refunded Amount: {appointment.fee} EGP
                        </small>

                      )}

                    </div>


                    {/* STATUS */}

                    <div className="admin-appointment-status">

                      <span
                        className={`admin-status-badge admin-status-${appointment.status}`}
                      >

                        {appointment.status}

                      </span>

                    </div>


                    {/* ACTIONS */}

                    <div className="admin-appointment-actions">


                      {appointment.status ===
                        "pending" && (

                        <>

                          <button
                            type="button"
                            className="admin-confirm-btn"
                            onClick={() =>
                              updateAppointmentStatus(
                                appointment.id,
                                "confirmed"
                              )
                            }
                          >

                            Confirm

                          </button>


                          <button
                            type="button"
                            className="admin-cancel-btn"
                            onClick={() =>
                              updateAppointmentStatus(
                                appointment.id,
                                "cancelled"
                              )
                            }
                          >

                            Cancel

                          </button>

                        </>

                      )}


                      {appointment.status ===
                        "confirmed" && (

                        <>

                          <button
                            type="button"
                            className="admin-complete-btn"
                            onClick={() =>
                              updateAppointmentStatus(
                                appointment.id,
                                "completed"
                              )
                            }
                          >

                            Complete

                          </button>


                          <button
                            type="button"
                            className="admin-cancel-btn"
                            onClick={() =>
                              updateAppointmentStatus(
                                appointment.id,
                                "cancelled"
                              )
                            }
                          >

                            Cancel

                          </button>

                        </>

                      )}


                      {appointment.status ===
                        "completed" && (

                        <span className="admin-finished">

                          ✓ Completed

                        </span>

                      )}


                      {appointment.status ===
                        "cancelled" && (

                        <span className="admin-finished cancelled">

                          Cancelled

                        </span>

                      )}


                    </div>


                  </div>

                )
              )}


            </div>

          )}


        </section>


        {/* =========================
            DOCTORS
        ========================= */}

        <section className="admin-section">


          <div className="admin-section-header">


            <div>

              <span>
                DOCTORS
              </span>

              <h2>
                Doctors Overview
              </h2>

            </div>


            <div className="admin-section-header-actions">


              <strong>

                {doctorUsers.length}

                {" "}

                Doctor Accounts

              </strong>


              <Link
                to="/admin/doctors"
                className="admin-section-link"
              >

                Manage Doctors →

              </Link>


            </div>


          </div>


          {doctors.length === 0 ? (

            <div className="admin-empty">

              <div>
                🩺
              </div>

              <h3>
                No Doctors
              </h3>

              <p>
                Doctors will appear here.
              </p>

            </div>

          ) : (

            <div className="admin-doctors-grid">


              {doctors.map(
                (doctor) => (

                  <div
                    className="admin-doctor-card"
                    key={doctor.id}
                  >


                    {doctor.image ? (

                      <img
                        src={doctor.image}
                        alt={doctor.name}
                      />

                    ) : (

                      <div className="admin-doctor-no-image">

                        🩺

                      </div>

                    )}


                    <div>

                      <h3>
                        {doctor.name}
                      </h3>


                      <p>
                        {doctor.specialty}
                      </p>


                      <span>
                        📍 {doctor.location}
                      </span>


                      <strong>
                        {doctor.fee} EGP
                      </strong>


                      {doctor.available ? (

                        <small className="admin-doctor-available">

                          ● Available

                        </small>

                      ) : (

                        <small className="admin-doctor-unavailable">

                          ● Unavailable

                        </small>

                      )}


                    </div>


                  </div>

                )
              )}


            </div>

          )}


        </section>


        {/* =========================
            PATIENTS
        ========================= */}

        <section className="admin-section">


          <div className="admin-section-header">


            <div>

              <span>
                PATIENTS
              </span>

              <h2>
                Registered Patients
              </h2>

            </div>


            <div className="admin-section-header-actions">


              <strong>

                {patients.length}

                {" "}

                Patients

              </strong>


              <Link
                to="/admin/patients"
                className="admin-section-link"
              >

                Manage Patients →

              </Link>


            </div>


          </div>


          {patients.length === 0 ? (

            <div className="admin-empty">

              <div>
                👤
              </div>

              <h3>
                No Patients
              </h3>

              <p>
                Registered patients will
                appear here.
              </p>

            </div>

          ) : (

            <div className="admin-patients-list">


              {recentPatients.map(
                (patient) => (

                  <div
                    className="admin-patient-card"
                    key={patient.id}
                  >


                    <div className="admin-patient-avatar">

                      {patient.name
                        ? patient.name
                            .charAt(0)
                            .toUpperCase()
                        : "P"
                      }

                    </div>


                    <div>

                      <strong>
                        {patient.name}
                      </strong>


                      <span>
                        {patient.email}
                      </span>


                      <small>
                        {patient.phone}
                      </small>

                    </div>


                  </div>

                )
              )}


            </div>

          )}


        </section>


      </div>

    </main>

  );

}

export default AdminDashboard;