import { useEffect, useState } from "react";
import { Link } from "react-router";
import axios from "axios";
import {
  createNotification
} from "../utils/notifications";

function DoctorDashboard() {
  /* =========================
     CURRENT DOCTOR USER
  ========================= */

  const savedUser =
    localStorage.getItem("currentUser");

  const currentUser =
    savedUser
      ? JSON.parse(savedUser)
      : null;


  /* =========================
     STATES
  ========================= */

  const [doctor, setDoctor] =
    useState(null);

  const [appointments, setAppointments] =
    useState([]);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");


  /* =========================
     GET DOCTOR DATA
  ========================= */

  useEffect(() => {
    const getDoctorDashboard = async () => {
      try {
        /*
          بيانات الدكتور
        */

        const doctorResponse =
          await axios.get(
            `http://localhost:3000/doctors/${currentUser.doctorId}`
          );


        /*
          كل الحجوزات
        */

        const appointmentsResponse =
          await axios.get(
            "http://localhost:3000/appointments"
          );


        /*
          حجوزات الدكتور الحالي فقط
        */

        const doctorAppointments =
          appointmentsResponse.data.filter(
            (appointment) => {
              return (
                String(appointment.doctorId) ===
                String(currentUser.doctorId)
              );
            }
          );


        setDoctor(
          doctorResponse.data
        );

        setAppointments(
          doctorAppointments
        );

      } catch (error) {
        console.log(error);

        setError(
          "Unable to load doctor dashboard."
        );

      } finally {
        setLoading(false);
      }
    };


    getDoctorDashboard();

  }, []);


  /* =========================
     APPOINTMENT COUNTERS
  ========================= */

  const pendingAppointments =
    appointments.filter(
      (appointment) => {
        return (
          appointment.status === "pending"
        );
      }
    );


  const confirmedAppointments =
    appointments.filter(
      (appointment) => {
        return (
          appointment.status === "confirmed"
        );
      }
    );


  const completedAppointments =
    appointments.filter(
      (appointment) => {
        return (
          appointment.status === "completed"
        );
      }
    );


  const cancelledAppointments =
    appointments.filter(
      (appointment) => {
        return (
          appointment.status === "cancelled"
        );
      }
    );


  /* =========================
     PAYMENT COUNTERS
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
     UPDATE APPOINTMENT STATUS
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
                String(appointment.id) ===
                String(appointmentId)
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
          لو الدكتور ألغى حجز مدفوع
          نعتبر الدفع Refunded في النسخة التدريبية.
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
                String(appointment.id) ===
                String(appointmentId)
              ) {

                return response.data;

              }


              return appointment;

            }
          );


        setAppointments(
          updatedAppointments
        );


        if (
          currentAppointment.userId &&
          [
            "confirmed",
            "completed",
            "cancelled"
          ].includes(newStatus)
        ) {
          try {
            let title =
              "Appointment Updated";

            let message =
              `Your appointment with ${doctor.name} was updated.`;

            if (
              newStatus === "confirmed"
            ) {
              title =
                "Appointment Confirmed";

              message =
                `${doctor.name} confirmed your appointment on ${currentAppointment.date} at ${currentAppointment.time}.`;
            }

            if (
              newStatus === "completed"
            ) {
              title =
                "Visit Completed";

              message =
                `Your visit with ${doctor.name} was marked as completed.`;
            }

            if (
              newStatus === "cancelled"
            ) {
              title =
                "Appointment Cancelled";

              message =
                getPaymentStatus(
                  currentAppointment
                ) === "paid"
                  ? `Your appointment with ${doctor.name} was cancelled and the mock payment was marked as refunded.`
                  : `Your appointment with ${doctor.name} was cancelled.`;
            }

            await createNotification({
              recipientUserId:
                currentAppointment.userId,
              recipientRole:
                "patient",
              type:
                `appointment_${newStatus}`,
              title,
              message,
              appointmentId:
                currentAppointment.id,
              link:
                "/appointments"
            });
          } catch (notificationError) {
            console.log(
              "DOCTOR NOTIFICATION ERROR:",
              notificationError
            );
          }
        }


      } catch (error) {

        console.log(error);

        alert(
          "Unable to update appointment."
        );

      }

    };


  /* =========================
     LOADING
  ========================= */

  if (loading) {
    return (
      <div className="doctor-dashboard-message">
        Loading dashboard...
      </div>
    );
  }


  /* =========================
     ERROR
  ========================= */

  if (error) {
    return (
      <div className="doctor-dashboard-message error">
        {error}
      </div>
    );
  }


  /* =========================
     PAGE
  ========================= */

  return (
    <main className="doctor-dashboard-page">

      <style>
        {`
          .doctor-payment-summary-grid {
            display: grid;
            grid-template-columns: repeat(5, minmax(0, 1fr));
            gap: 14px;
            margin: 18px 0 26px;
          }

          .doctor-payment-summary-card {
            padding: 18px;
            border: 1px solid #e2e8f0;
            border-radius: 14px;
            background: #ffffff;
          }

          .doctor-payment-summary-card span {
            display: block;
            margin-bottom: 6px;
            color: #64748b;
            font-size: 10px;
            font-weight: 700;
          }

          .doctor-payment-summary-card strong {
            color: #0f172a;
            font-size: 20px;
          }

          .doctor-payment-badge {
            display: inline-flex;
            align-items: center;
            justify-content: center;
            width: fit-content;
            margin-top: 8px;
            padding: 5px 9px;
            border-radius: 50px;
            font-size: 8px;
            font-weight: 800;
            text-transform: capitalize;
          }

          .doctor-payment-badge.unpaid {
            background: #fef3c7;
            color: #b45309;
          }

          .doctor-payment-badge.paid {
            background: #dcfce7;
            color: #15803d;
          }

          .doctor-payment-badge.refunded {
            background: #e2e8f0;
            color: #475569;
          }

          .doctor-payment-meta {
            display: block;
            margin-top: 5px;
            color: #64748b;
            font-size: 8px;
            line-height: 1.5;
            word-break: break-word;
          }

          @media (max-width: 1000px) {
            .doctor-payment-summary-grid {
              grid-template-columns: repeat(2, minmax(0, 1fr));
            }
          }

          @media (max-width: 560px) {
            .doctor-payment-summary-grid {
              grid-template-columns: 1fr;
            }
          }
        `}
      </style>

      <div className="section-container">


        {/* =========================
            HEADER
        ========================= */}

        <div className="doctor-dashboard-header">

          <div>

            <span>
              DOCTOR PORTAL
            </span>

            <h1>
              Welcome, {doctor.name}
            </h1>

            <p>
              Manage your appointments
              and patient visits.
            </p>

          </div>


          {/* RIGHT SIDE */}

          <div className="doctor-dashboard-header-actions">


            {/* MANAGE SCHEDULE */}

            <Link
              to="/doctor/schedule"
              className="doctor-manage-schedule-btn"
            >
              📅 Manage Schedule
            </Link>


            {/* DOCTOR PROFILE */}

            <div className="doctor-dashboard-profile">

              <img
                src={doctor.image}
                alt={doctor.name}
              />

              <div>

                <strong>
                  {doctor.name}
                </strong>

                <span>
                  {doctor.specialty}
                </span>

              </div>

            </div>

          </div>

        </div>


        {/* =========================
            STATS
        ========================= */}

        <div className="doctor-dashboard-stats">


          {/* TOTAL */}

          <div className="doctor-stat-card">

            <div className="doctor-stat-icon">
              📅
            </div>

            <div>

              <span>
                Total Appointments
              </span>

              <strong>
                {appointments.length}
              </strong>

            </div>

          </div>


          {/* PENDING */}

          <div className="doctor-stat-card">

            <div className="doctor-stat-icon">
              ⏳
            </div>

            <div>

              <span>
                Pending
              </span>

              <strong>
                {pendingAppointments.length}
              </strong>

            </div>

          </div>


          {/* CONFIRMED */}

          <div className="doctor-stat-card">

            <div className="doctor-stat-icon">
              ✓
            </div>

            <div>

              <span>
                Confirmed
              </span>

              <strong>
                {confirmedAppointments.length}
              </strong>

            </div>

          </div>


          {/* COMPLETED */}

          <div className="doctor-stat-card">

            <div className="doctor-stat-icon">
              🩺
            </div>

            <div>

              <span>
                Completed
              </span>

              <strong>
                {completedAppointments.length}
              </strong>

            </div>

          </div>


          {/* CANCELLED */}

          <div className="doctor-stat-card">

            <div className="doctor-stat-icon">
              ✕
            </div>

            <div>

              <span>
                Cancelled
              </span>

              <strong>
                {cancelledAppointments.length}
              </strong>

            </div>

          </div>

        </div>


        {/* =========================
            PAYMENTS
        ========================= */}

        <div className="doctor-payment-summary-grid">

          <div className="doctor-payment-summary-card">
            <span>
              Paid Appointments
            </span>
            <strong>
              {paidAppointments.length}
            </strong>
          </div>


          <div className="doctor-payment-summary-card">
            <span>
              Unpaid Appointments
            </span>
            <strong>
              {unpaidAppointments.length}
            </strong>
          </div>


          <div className="doctor-payment-summary-card">
            <span>
              Refunded
            </span>
            <strong>
              {refundedAppointments.length}
            </strong>
          </div>


          <div className="doctor-payment-summary-card">
            <span>
              Total Collected
            </span>
            <strong>
              {totalCollected} EGP
            </strong>
          </div>


          <div className="doctor-payment-summary-card">
            <span>
              Refunded Amount
            </span>
            <strong>
              {refundedAmount} EGP
            </strong>
          </div>

        </div>


        {/* =========================
            APPOINTMENTS SECTION
        ========================= */}

        <section className="doctor-dashboard-section">


          <div className="doctor-dashboard-section-header">

            <div>

              <span>
                APPOINTMENTS
              </span>

              <h2>
                Patient Appointments
              </h2>

            </div>

          </div>


          {/* =========================
              EMPTY
          ========================= */}

          {appointments.length === 0 ? (

            <div className="doctor-dashboard-empty">

              <div>
                📅
              </div>

              <h3>
                No appointments
              </h3>

              <p>
                Patient appointments will appear here.
              </p>

            </div>

          ) : (

            /* =========================
               LIST
            ========================= */

            <div className="doctor-appointments-list">


              {appointments.map(
                (appointment) => (

                  <div
                    className="doctor-appointment-card"
                    key={appointment.id}
                  >


                    {/* =========================
                        DATE
                    ========================= */}

                    <div className="doctor-appointment-date">

                      <span>
                        {appointment.date}
                      </span>

                      <strong>
                        {appointment.time}
                      </strong>

                    </div>


                    {/* =========================
                        PATIENT
                    ========================= */}

                    <div className="doctor-appointment-patient">

                      <span>
                        PATIENT
                      </span>

                      <h3>
                        {appointment.patientName}
                      </h3>


                      {appointment.patientPhone && (

                        <p>
                          📞 {appointment.patientPhone}
                        </p>

                      )}


                      {appointment.patientEmail && (

                        <p>
                          ✉️ {appointment.patientEmail}
                        </p>

                      )}

                    </div>


                    {/* =========================
                        FEE
                    ========================= */}

                    <div className="doctor-appointment-fee">

                      <span>
                        Consultation
                      </span>

                      <strong>
                        {appointment.fee} EGP
                      </strong>


                      <span
                        className={
                          `doctor-payment-badge ${getPaymentStatus(
                            appointment
                          )}`
                        }
                      >
                        {getPaymentStatus(
                          appointment
                        )}
                      </span>


                      {appointment.paymentMethod && (

                        <small className="doctor-payment-meta">
                          Method: {appointment.paymentMethod}
                        </small>

                      )}


                      {appointment.transactionId && (

                        <small className="doctor-payment-meta">
                          Transaction: {appointment.transactionId}
                        </small>

                      )}


                      {getPaymentStatus(
                        appointment
                      ) === "paid" && (

                        <small className="doctor-payment-meta">
                          Paid Amount: {appointment.fee} EGP
                        </small>

                      )}


                      {getPaymentStatus(
                        appointment
                      ) === "refunded" && (

                        <small className="doctor-payment-meta">
                          Refunded Amount: {appointment.fee} EGP
                        </small>

                      )}

                    </div>


                    {/* =========================
                        STATUS
                    ========================= */}

                    <div className="doctor-appointment-status">

                      <span
                        className={
                          `doctor-status ${appointment.status}`
                        }
                      >
                        {appointment.status}
                      </span>

                    </div>


                    {/* =========================
                        ACTIONS
                    ========================= */}

                    <div className="doctor-appointment-actions">


                      {/* PENDING */}

                      {appointment.status ===
                        "pending" && (

                        <>

                          <button
                            type="button"
                            className="doctor-confirm-btn"
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
                            className="doctor-cancel-btn"
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


                      {/* CONFIRMED */}

                      {appointment.status ===
                        "confirmed" && (

                        <>

                          <button
                            type="button"
                            className="doctor-complete-btn"
                            onClick={() =>
                              updateAppointmentStatus(
                                appointment.id,
                                "completed"
                              )
                            }
                          >
                            Mark Completed
                          </button>


                          <button
                            type="button"
                            className="doctor-cancel-btn"
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


                      {/* COMPLETED */}

                      {appointment.status ===
                        "completed" && (

                        <span className="doctor-finished-text">
                          ✓ Appointment Completed
                        </span>

                      )}


                      {/* CANCELLED */}

                      {appointment.status ===
                        "cancelled" && (

                        <span className="doctor-finished-text cancelled">
                          Appointment Cancelled
                        </span>

                      )}


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

export default DoctorDashboard;