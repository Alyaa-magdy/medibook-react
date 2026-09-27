import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router";
import axios from "axios";
import {
  createNotification
} from "../utils/notifications";

function AdminAppointments() {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState(null);

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [paymentFilter, setPaymentFilter] = useState("all");
  const [dateFilter, setDateFilter] = useState("");

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");


  /* ========================================
     GET APPOINTMENTS
  ======================================== */

  const getAppointments = async () => {
    try {
      setError("");

      const response = await axios.get(
        "http://localhost:3000/appointments"
      );

      setAppointments(response.data);
    } catch (error) {
      console.log(
        "ADMIN APPOINTMENTS ERROR:",
        error
      );

      setError(
        "Unable to load appointments."
      );
    } finally {
      setLoading(false);
    }
  };


  useEffect(() => {
    getAppointments();
  }, []);


  /* ========================================
     FILTER APPOINTMENTS
  ======================================== */

  const filteredAppointments = useMemo(() => {
    let result = [...appointments];


    /* SEARCH */

    if (search.trim() !== "") {
      const keyword =
        search
          .toLowerCase()
          .trim();

      result = result.filter((appointment) => {
        const patientName =
          appointment.patientName
            ?.toLowerCase() || "";

        const doctorName =
          appointment.doctorName
            ?.toLowerCase() || "";

        const phone =
          appointment.patientPhone
            ?.toLowerCase() || "";

        const email =
          appointment.patientEmail
            ?.toLowerCase() || "";

        const transactionId =
          appointment.transactionId
            ?.toLowerCase() || "";

        const paymentMethod =
          appointment.paymentMethod
            ?.toLowerCase() || "";

        return (
          patientName.includes(keyword) ||
          doctorName.includes(keyword) ||
          phone.includes(keyword) ||
          email.includes(keyword) ||
          transactionId.includes(keyword) ||
          paymentMethod.includes(keyword)
        );
      });
    }


    /* STATUS */

    if (statusFilter !== "all") {
      result = result.filter((appointment) => {
        return (
          appointment.status ===
          statusFilter
        );
      });
    }


    /* PAYMENT STATUS */

    if (paymentFilter !== "all") {
      result = result.filter((appointment) => {
        return (
          (appointment.paymentStatus || "unpaid") ===
          paymentFilter
        );
      });
    }


    /* DATE */

    if (dateFilter !== "") {
      result = result.filter((appointment) => {
        return (
          appointment.date ===
          dateFilter
        );
      });
    }


    /* NEWEST FIRST */

    result.sort((a, b) => {
      const aValue =
        `${a.date || ""} ${a.time || ""}`;

      const bValue =
        `${b.date || ""} ${b.time || ""}`;

      return bValue.localeCompare(aValue);
    });


    return result;
  }, [
    appointments,
    search,
    statusFilter,
    paymentFilter,
    dateFilter
  ]);


  /* ========================================
     STATUS COUNTERS
  ======================================== */

  const pendingCount =
    appointments.filter(
      (appointment) =>
        appointment.status === "pending"
    ).length;


  const confirmedCount =
    appointments.filter(
      (appointment) =>
        appointment.status === "confirmed"
    ).length;


  const completedCount =
    appointments.filter(
      (appointment) =>
        appointment.status === "completed"
    ).length;


  const cancelledCount =
    appointments.filter(
      (appointment) =>
        appointment.status === "cancelled"
    ).length;


  /* ========================================
     PAYMENT COUNTERS
  ======================================== */

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
      (appointment) =>
        getPaymentStatus(
          appointment
        ) === "paid"
    );


  const unpaidAppointments =
    appointments.filter(
      (appointment) =>
        getPaymentStatus(
          appointment
        ) === "unpaid"
    );


  const refundedAppointments =
    appointments.filter(
      (appointment) =>
        getPaymentStatus(
          appointment
        ) === "refunded"
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


  /* ========================================
     UPDATE STATUS
  ======================================== */

  const updateAppointmentStatus =
    async (
      appointmentId,
      newStatus
    ) => {
      try {
        setUpdatingId(
          appointmentId
        );

        setError("");
        setSuccess("");


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


        /*
          لو الحجز اتلغى بعد الدفع
          نعمل Mock Refund تلقائي.
        */

        const updateData = {
          status: newStatus
        };


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


        /*
          حجز اتعمله Refund ماينفعش
          نرجعه لحالة نشطة بنفس العملية.
        */

        if (
          currentAppointment.status ===
            "cancelled" &&
          getPaymentStatus(
            currentAppointment
          ) === "refunded" &&
          newStatus !== "cancelled"
        ) {

          setError(
            "A refunded appointment cannot be reactivated. Create a new appointment instead."
          );

          return;

        }


        const response =
          await axios.patch(
            `http://localhost:3000/appointments/${appointmentId}`,
            updateData
          );


        setAppointments(
          appointments.map((appointment) => {
            if (
              String(appointment.id) ===
              String(appointmentId)
            ) {
              return response.data;
            }

            return appointment;
          })
        );


        if (currentAppointment.userId) {
          try {
            let title =
              "Appointment Updated";

            let message =
              `Your appointment with ${currentAppointment.doctorName} is now ${newStatus}.`;

            if (newStatus === "confirmed") {
              title =
                "Appointment Confirmed";
            }

            if (newStatus === "completed") {
              title =
                "Visit Completed";
            }

            if (newStatus === "cancelled") {
              title =
                "Appointment Cancelled";

              message =
                getPaymentStatus(
                  currentAppointment
                ) === "paid"
                  ? `Your appointment with ${currentAppointment.doctorName} was cancelled and the mock payment was marked as refunded.`
                  : `Your appointment with ${currentAppointment.doctorName} was cancelled.`;
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
              "ADMIN NOTIFICATION ERROR:",
              notificationError
            );
          }
        }


        if (
          updateData.paymentStatus ===
          "refunded"
        ) {

          setSuccess(
            "Appointment cancelled and payment marked as refunded."
          );

        } else {

          setSuccess(
            `Appointment status changed to ${newStatus}.`
          );

        }


      } catch (error) {
        console.log(
          "UPDATE STATUS ERROR:",
          error
        );

        setError(
          "Unable to update appointment status."
        );

      } finally {
        setUpdatingId(null);
      }
    };


  /* ========================================
     CLEAR FILTERS
  ======================================== */

  const clearFilters = () => {
    setSearch("");
    setStatusFilter("all");
    setPaymentFilter("all");
    setDateFilter("");
  };


  /* ========================================
     STATUS LABEL
  ======================================== */

  const getStatusLabel = (status) => {
    if (status === "pending") {
      return "Pending";
    }

    if (status === "confirmed") {
      return "Confirmed";
    }

    if (status === "completed") {
      return "Completed";
    }

    if (status === "cancelled") {
      return "Cancelled";
    }

    return status;
  };


  /* ========================================
     PAYMENT LABEL
  ======================================== */

  const getPaymentLabel = (
    appointment
  ) => {

    const paymentStatus =
      getPaymentStatus(
        appointment
      );


    if (paymentStatus === "paid") {
      return "Paid";
    }


    if (
      paymentStatus ===
      "refunded"
    ) {
      return "Refunded";
    }


    return "Unpaid";

  };


  /* ========================================
     LOADING
  ======================================== */

  if (loading) {
    return (
      <div
        style={{
          minHeight: "60vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontWeight: "700"
        }}
      >
        Loading appointments...
      </div>
    );
  }


  return (
    <main
      style={{
        minHeight: "100vh",
        background: "#f8fafc",
        padding: "40px 0 70px"
      }}
    >
      <style>
        {`
          .adminAppointmentsPage {
            width: min(1180px, calc(100% - 32px));
            margin: 0 auto;
          }

          .adminAppointmentsBack {
            display: inline-flex;
            margin-bottom: 20px;
            color: #2563eb;
            font-size: 13px;
            font-weight: 700;
            text-decoration: none;
          }

          .adminAppointmentsHeader {
            display: flex;
            align-items: flex-start;
            justify-content: space-between;
            gap: 20px;
            margin-bottom: 25px;
          }

          .adminAppointmentsHeader small {
            display: block;
            margin-bottom: 8px;
            color: #2563eb;
            font-weight: 800;
            letter-spacing: 1px;
          }

          .adminAppointmentsHeader h1 {
            margin: 0 0 8px;
            color: #0f172a;
            font-size: 30px;
          }

          .adminAppointmentsHeader p {
            margin: 0;
            color: #64748b;
            font-size: 14px;
          }

          .adminAppointmentsStats {
            display: grid;
            grid-template-columns: repeat(5, 1fr);
            gap: 14px;
            margin-bottom: 22px;
          }

          .adminAppointmentsStat {
            padding: 18px;
            background: white;
            border: 1px solid #e2e8f0;
            border-radius: 14px;
          }

          .adminAppointmentsStat span {
            display: block;
            margin-bottom: 6px;
            color: #64748b;
            font-size: 11px;
            font-weight: 700;
          }

          .adminAppointmentsStat strong {
            color: #0f172a;
            font-size: 24px;
          }

          .adminAppointmentsFilters {
            display: grid;
            grid-template-columns: 2fr 1fr 1fr 1fr auto;
            gap: 12px;
            padding: 18px;
            margin-bottom: 18px;
            background: white;
            border: 1px solid #e2e8f0;
            border-radius: 14px;
          }

          .adminAppointmentsFilters input,
          .adminAppointmentsFilters select {
            width: 100%;
            min-height: 44px;
            padding: 0 12px;
            border: 1px solid #dbe2ea;
            border-radius: 9px;
            background: white;
            color: #0f172a;
            outline: none;
          }

          .adminAppointmentsFilters input:focus,
          .adminAppointmentsFilters select:focus {
            border-color: #2563eb;
          }

          .adminAppointmentsClear {
            min-height: 44px;
            padding: 0 18px;
            border: 0;
            border-radius: 9px;
            background: #f1f5f9;
            color: #334155;
            font-weight: 700;
            cursor: pointer;
          }

          .adminAppointmentsMessage {
            padding: 12px 16px;
            margin-bottom: 15px;
            border-radius: 10px;
            font-size: 13px;
            font-weight: 700;
          }

          .adminAppointmentsMessage.success {
            background: #dcfce7;
            color: #166534;
          }

          .adminAppointmentsMessage.error {
            background: #fee2e2;
            color: #b91c1c;
          }

          .adminAppointmentsCard {
            overflow: hidden;
            background: white;
            border: 1px solid #e2e8f0;
            border-radius: 15px;
          }

          .adminAppointmentsCardHeader {
            display: flex;
            align-items: center;
            justify-content: space-between;
            padding: 18px 20px;
            border-bottom: 1px solid #e2e8f0;
          }

          .adminAppointmentsCardHeader h2 {
            margin: 0;
            color: #0f172a;
            font-size: 18px;
          }

          .adminAppointmentsCardHeader span {
            color: #64748b;
            font-size: 12px;
            font-weight: 700;
          }

          .adminAppointmentsTableWrap {
            overflow-x: auto;
          }

          .adminAppointmentsTable {
            width: 100%;
            min-width: 1250px;
            border-collapse: collapse;
          }

          .adminAppointmentsTable th {
            padding: 13px 16px;
            text-align: left;
            background: #f8fafc;
            color: #64748b;
            font-size: 10px;
            text-transform: uppercase;
            letter-spacing: .5px;
          }

          .adminAppointmentsTable td {
            padding: 16px;
            border-top: 1px solid #f1f5f9;
            color: #334155;
            font-size: 12px;
            vertical-align: middle;
          }

          .adminAppointmentPerson strong {
            display: block;
            margin-bottom: 4px;
            color: #0f172a;
            font-size: 12px;
          }

          .adminAppointmentPerson span {
            display: block;
            color: #94a3b8;
            font-size: 10px;
          }

          .adminAppointmentDate strong {
            display: block;
            color: #0f172a;
          }

          .adminAppointmentDate span {
            display: block;
            margin-top: 4px;
            color: #64748b;
          }

          .adminAppointmentStatus {
            display: inline-flex;
            align-items: center;
            justify-content: center;
            min-width: 85px;
            padding: 7px 10px;
            border-radius: 50px;
            font-size: 10px;
            font-weight: 800;
          }

          .adminAppointmentStatus.pending {
            background: #fef3c7;
            color: #b45309;
          }

          .adminAppointmentStatus.confirmed {
            background: #dbeafe;
            color: #1d4ed8;
          }

          .adminAppointmentStatus.completed {
            background: #dcfce7;
            color: #15803d;
          }

          .adminAppointmentStatus.cancelled {
            background: #fee2e2;
            color: #dc2626;
          }

          .adminAppointmentActions {
            display: flex;
            gap: 6px;
            flex-wrap: wrap;
          }

          .adminAppointmentActions button {
            padding: 7px 10px;
            border: 0;
            border-radius: 7px;
            font-size: 9px;
            font-weight: 800;
            cursor: pointer;
          }

          .adminAppointmentActions button:disabled {
            opacity: .5;
            cursor: not-allowed;
          }

          .adminAppointmentConfirm {
            background: #dbeafe;
            color: #1d4ed8;
          }

          .adminAppointmentComplete {
            background: #dcfce7;
            color: #15803d;
          }

          .adminAppointmentCancel {
            background: #fee2e2;
            color: #dc2626;
          }

          .adminPaymentBadge {
            display: inline-flex;
            align-items: center;
            justify-content: center;
            min-width: 70px;
            padding: 6px 9px;
            border-radius: 50px;
            font-size: 9px;
            font-weight: 800;
            text-transform: capitalize;
          }

          .adminPaymentBadge.unpaid {
            background: #fef3c7;
            color: #b45309;
          }

          .adminPaymentBadge.paid {
            background: #dcfce7;
            color: #15803d;
          }

          .adminPaymentBadge.refunded {
            background: #e2e8f0;
            color: #475569;
          }

          .adminPaymentDetails {
            margin-top: 6px;
          }

          .adminPaymentDetails span {
            display: block;
            margin-top: 3px;
            color: #64748b;
            font-size: 9px;
            line-height: 1.4;
            word-break: break-word;
          }

          .adminPaymentStats {
            display: grid;
            grid-template-columns: repeat(5, 1fr);
            gap: 14px;
            margin-bottom: 22px;
          }

          .adminPaymentStat {
            padding: 18px;
            background: white;
            border: 1px solid #e2e8f0;
            border-radius: 14px;
          }

          .adminPaymentStat span {
            display: block;
            margin-bottom: 6px;
            color: #64748b;
            font-size: 11px;
            font-weight: 700;
          }

          .adminPaymentStat strong {
            color: #0f172a;
            font-size: 20px;
          }

          .adminAppointmentPending {
            background: #fef3c7;
            color: #b45309;
          }

          .adminAppointmentsEmpty {
            padding: 60px 20px;
            text-align: center;
            color: #64748b;
          }

          .adminAppointmentsEmpty strong {
            display: block;
            margin-bottom: 6px;
            color: #0f172a;
            font-size: 17px;
          }

          @media (max-width: 900px) {
            .adminAppointmentsStats,
            .adminPaymentStats {
              grid-template-columns: repeat(2, 1fr);
            }

            .adminAppointmentsFilters {
              grid-template-columns: 1fr 1fr;
            }
          }

          @media (max-width: 600px) {
            .adminAppointmentsPage {
              width: min(100% - 20px, 1180px);
            }

            .adminAppointmentsHeader {
              flex-direction: column;
            }

            .adminAppointmentsHeader h1 {
              font-size: 24px;
            }

            .adminAppointmentsStats,
            .adminPaymentStats {
              grid-template-columns: 1fr 1fr;
            }

            .adminAppointmentsFilters {
              grid-template-columns: 1fr;
            }
          }
        `}
      </style>


      <div className="adminAppointmentsPage">

        <Link
          to="/admin/dashboard"
          className="adminAppointmentsBack"
        >
          ← Back to Admin Dashboard
        </Link>


        <div className="adminAppointmentsHeader">

          <div>
            <small>
              ADMIN / APPOINTMENTS
            </small>

            <h1>
              Manage Appointments
            </h1>

            <p>
              View and manage all patient appointments.
            </p>
          </div>

        </div>


        {/* STATS */}

        <div className="adminAppointmentsStats">

          <div className="adminAppointmentsStat">
            <span>
              Total Appointments
            </span>

            <strong>
              {appointments.length}
            </strong>
          </div>


          <div className="adminAppointmentsStat">
            <span>
              Pending
            </span>

            <strong>
              {pendingCount}
            </strong>
          </div>


          <div className="adminAppointmentsStat">
            <span>
              Confirmed
            </span>

            <strong>
              {confirmedCount}
            </strong>
          </div>


          <div className="adminAppointmentsStat">
            <span>
              Completed
            </span>

            <strong>
              {completedCount}
            </strong>
          </div>


          <div className="adminAppointmentsStat">
            <span>
              Cancelled
            </span>

            <strong>
              {cancelledCount}
            </strong>
          </div>

        </div>


        {/* PAYMENT STATS */}

        <div className="adminPaymentStats">

          <div className="adminPaymentStat">
            <span>
              Paid Appointments
            </span>
            <strong>
              {paidAppointments.length}
            </strong>
          </div>


          <div className="adminPaymentStat">
            <span>
              Unpaid Appointments
            </span>
            <strong>
              {unpaidAppointments.length}
            </strong>
          </div>


          <div className="adminPaymentStat">
            <span>
              Refunded
            </span>
            <strong>
              {refundedAppointments.length}
            </strong>
          </div>


          <div className="adminPaymentStat">
            <span>
              Total Collected
            </span>
            <strong>
              {totalCollected} EGP
            </strong>
          </div>


          <div className="adminPaymentStat">
            <span>
              Refunded Amount
            </span>
            <strong>
              {refundedAmount} EGP
            </strong>
          </div>

        </div>


        {/* FILTERS */}

        <div className="adminAppointmentsFilters">

          <input
            type="text"
            placeholder="Search patient, doctor, phone, email or transaction..."
            value={search}
            onChange={(event) =>
              setSearch(
                event.target.value
              )
            }
          />


          <select
            value={statusFilter}
            onChange={(event) =>
              setStatusFilter(
                event.target.value
              )
            }
          >
            <option value="all">
              All Statuses
            </option>

            <option value="pending">
              Pending
            </option>

            <option value="confirmed">
              Confirmed
            </option>

            <option value="completed">
              Completed
            </option>

            <option value="cancelled">
              Cancelled
            </option>
          </select>


          <select
            value={paymentFilter}
            onChange={(event) =>
              setPaymentFilter(
                event.target.value
              )
            }
          >
            <option value="all">
              All Payments
            </option>

            <option value="unpaid">
              Unpaid
            </option>

            <option value="paid">
              Paid
            </option>

            <option value="refunded">
              Refunded
            </option>
          </select>


          <input
            type="date"
            value={dateFilter}
            onChange={(event) =>
              setDateFilter(
                event.target.value
              )
            }
          />


          <button
            type="button"
            className="adminAppointmentsClear"
            onClick={clearFilters}
          >
            Clear Filters
          </button>

        </div>


        {/* MESSAGES */}

        {success && (
          <div className="adminAppointmentsMessage success">
            ✓ {success}
          </div>
        )}


        {error && (
          <div className="adminAppointmentsMessage error">
            {error}
          </div>
        )}


        {/* TABLE */}

        <div className="adminAppointmentsCard">

          <div className="adminAppointmentsCardHeader">

            <h2>
              All Appointments
            </h2>

            <span>
              {filteredAppointments.length} results
            </span>

          </div>


          {filteredAppointments.length === 0 ? (

            <div className="adminAppointmentsEmpty">

              <strong>
                No appointments found
              </strong>

              Try changing your search or filters.

            </div>

          ) : (

            <div className="adminAppointmentsTableWrap">

              <table className="adminAppointmentsTable">

                <thead>
                  <tr>
                    <th>
                      Patient
                    </th>

                    <th>
                      Doctor
                    </th>

                    <th>
                      Date & Time
                    </th>

                    <th>
                      Fee
                    </th>

                    <th>
                      Payment
                    </th>

                    <th>
                      Status
                    </th>

                    <th>
                      Actions
                    </th>
                  </tr>
                </thead>


                <tbody>

                  {filteredAppointments.map(
                    (appointment) => (

                      <tr key={appointment.id}>

                        {/* PATIENT */}

                        <td>
                          <div className="adminAppointmentPerson">

                            <strong>
                              {appointment.patientName}
                            </strong>

                            <span>
                              {appointment.patientPhone}
                            </span>

                            <span>
                              {appointment.patientEmail}
                            </span>

                          </div>
                        </td>


                        {/* DOCTOR */}

                        <td>
                          <div className="adminAppointmentPerson">

                            <strong>
                              {appointment.doctorName}
                            </strong>

                            <span>
                              Doctor ID: {appointment.doctorId}
                            </span>

                          </div>
                        </td>


                        {/* DATE */}

                        <td>
                          <div className="adminAppointmentDate">

                            <strong>
                              {appointment.date}
                            </strong>

                            <span>
                              {appointment.time}
                            </span>

                          </div>
                        </td>


                        {/* FEE */}

                        <td>
                          <strong>
                            {appointment.fee} EGP
                          </strong>
                        </td>


                        {/* PAYMENT */}

                        <td>

                          <span
                            className={
                              `adminPaymentBadge ${getPaymentStatus(
                                appointment
                              )}`
                            }
                          >
                            {getPaymentLabel(
                              appointment
                            )}
                          </span>


                          <div className="adminPaymentDetails">

                            {appointment.paymentMethod && (
                              <span>
                                Method: {appointment.paymentMethod}
                              </span>
                            )}


                            {appointment.transactionId && (
                              <span>
                                Transaction: {appointment.transactionId}
                              </span>
                            )}


                            {getPaymentStatus(
                              appointment
                            ) === "paid" && (
                              <span>
                                Paid Amount: {appointment.fee} EGP
                              </span>
                            )}


                            {getPaymentStatus(
                              appointment
                            ) === "refunded" && (
                              <span>
                                Refunded Amount: {appointment.fee} EGP
                              </span>
                            )}

                          </div>

                        </td>


                        {/* STATUS */}

                        <td>
                          <span
                            className={
                              `adminAppointmentStatus ${appointment.status}`
                            }
                          >
                            {getStatusLabel(
                              appointment.status
                            )}
                          </span>
                        </td>


                        {/* ACTIONS */}

                        <td>

                          <div className="adminAppointmentActions">

                            {appointment.status !==
                              "pending" && (

                              <button
                                type="button"
                                className="adminAppointmentPending"
                                disabled={
                                  updatingId ===
                                  appointment.id
                                }
                                onClick={() =>
                                  updateAppointmentStatus(
                                    appointment.id,
                                    "pending"
                                  )
                                }
                              >
                                Pending
                              </button>

                            )}


                            {appointment.status !==
                              "confirmed" && (

                              <button
                                type="button"
                                className="adminAppointmentConfirm"
                                disabled={
                                  updatingId ===
                                  appointment.id
                                }
                                onClick={() =>
                                  updateAppointmentStatus(
                                    appointment.id,
                                    "confirmed"
                                  )
                                }
                              >
                                Confirm
                              </button>

                            )}


                            {appointment.status !==
                              "completed" && (

                              <button
                                type="button"
                                className="adminAppointmentComplete"
                                disabled={
                                  updatingId ===
                                  appointment.id
                                }
                                onClick={() =>
                                  updateAppointmentStatus(
                                    appointment.id,
                                    "completed"
                                  )
                                }
                              >
                                Complete
                              </button>

                            )}


                            {appointment.status !==
                              "cancelled" && (

                              <button
                                type="button"
                                className="adminAppointmentCancel"
                                disabled={
                                  updatingId ===
                                  appointment.id
                                }
                                onClick={() =>
                                  updateAppointmentStatus(
                                    appointment.id,
                                    "cancelled"
                                  )
                                }
                              >
                                Cancel
                              </button>

                            )}

                          </div>

                        </td>

                      </tr>

                    )
                  )}

                </tbody>

              </table>

            </div>

          )}

        </div>

      </div>

    </main>
  );
}

export default AdminAppointments;