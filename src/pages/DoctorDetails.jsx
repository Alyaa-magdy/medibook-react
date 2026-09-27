import { useEffect, useState } from "react";
import { useParams, Link } from "react-router";
import axios from "axios";
import {
  createNotification,
  getDoctorUserByDoctorId
} from "../utils/notifications";

function DoctorDetails() {
  const { id } = useParams();

  /* =========================
     CURRENT USER
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

  const [doctor, setDoctor] = useState(null);
  const [schedules, setSchedules] = useState([]);
  const [appointments, setAppointments] = useState([]);
  const [reviews, setReviews] = useState([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [selectedDate, setSelectedDate] = useState("");
  const [selectedTime, setSelectedTime] = useState("");

  const [bookingLoading, setBookingLoading] = useState(false);
  const [bookingSuccess, setBookingSuccess] = useState("");

  /* =========================
     GET DATA
  ========================= */

  useEffect(() => {
    const getDoctorData = async () => {
      try {
        const [
          doctorResponse,
          schedulesResponse,
          appointmentsResponse,
          reviewsResponse
        ] = await Promise.all([
          axios.get(
            `http://localhost:3000/doctors/${id}`
          ),
          axios.get(
            "http://localhost:3000/schedules"
          ),
          axios.get(
            "http://localhost:3000/appointments"
          ),
          axios.get(
            "http://localhost:3000/reviews"
          )
        ]);

        const doctorSchedules =
          schedulesResponse.data.filter(
            (schedule) => {
              return (
                String(schedule.doctorId) ===
                String(id)
              );
            }
          );

        const doctorReviews =
          reviewsResponse.data.filter(
            (review) => {
              return (
                String(review.doctorId) ===
                String(id)
              );
            }
          );

        setDoctor(doctorResponse.data);
        setSchedules(doctorSchedules);
        setAppointments(appointmentsResponse.data);
        setReviews(doctorReviews);

      } catch (error) {
        console.log(
          "DOCTOR DETAILS ERROR:",
          error
        );

        setError(
          "Doctor not found."
        );

      } finally {
        setLoading(false);
      }
    };

    getDoctorData();
  }, [id]);

  /* =========================
     SELECTED SCHEDULE
  ========================= */

  const selectedSchedule =
    schedules.find((schedule) => {
      return (
        schedule.date === selectedDate
      );
    });

  /* =========================
     BOOKED APPOINTMENTS
  ========================= */

  const bookedAppointments =
    appointments.filter(
      (appointment) => {
        return (
          String(appointment.doctorId) ===
            String(id) &&
          appointment.date ===
            selectedDate &&
          appointment.status !==
            "cancelled"
        );
      }
    );

  const bookedTimes =
    bookedAppointments.map(
      (appointment) => {
        return appointment.time;
      }
    );

  /* =========================
     AVAILABLE TIMES
  ========================= */

  let availableTimes = [];

  if (selectedSchedule) {
    availableTimes =
      selectedSchedule.times.filter(
        (time) => {
          return (
            !bookedTimes.includes(time)
          );
        }
      );
  }

  /* =========================
     SELECT DATE
  ========================= */

  const handleSelectDate = (date) => {
    setSelectedDate(date);
    setSelectedTime("");
    setBookingSuccess("");
  };

  /* =========================
     BOOK APPOINTMENT
  ========================= */

  const handleBooking = async () => {
    if (!currentUser) {
      alert(
        "Please login before booking."
      );
      return;
    }

    if (
      currentUser.role !== "patient"
    ) {
      alert(
        "Only patient accounts can book appointments."
      );
      return;
    }

    if (
      selectedDate === "" ||
      selectedTime === ""
    ) {
      alert(
        "Please select date and time."
      );
      return;
    }

    const appointmentData = {
      userId: currentUser.id,
      doctorId: doctor.id,
      doctorName: doctor.name,
      patientName: currentUser.name,
      patientPhone: currentUser.phone,
      patientEmail: currentUser.email,
      date: selectedDate,
      time: selectedTime,
      fee: doctor.fee,
      status: "pending",
      paymentStatus: "unpaid",
      paymentMethod: null,
      transactionId: null,
      paidAt: null,
      refundedAt: null
    };

    try {
      setBookingLoading(true);
      setBookingSuccess("");

      const response =
        await axios.post(
          "http://localhost:3000/appointments",
          appointmentData
        );

      setAppointments([
        ...appointments,
        response.data
      ]);

      try {
        const doctorUser =
          await getDoctorUserByDoctorId(
            doctor.id
          );

        if (doctorUser) {
          await createNotification({
            recipientUserId:
              doctorUser.id,
            recipientRole:
              "doctor",
            type:
              "appointment_created",
            title:
              "New Appointment",
            message:
              `${currentUser.name} booked an appointment on ${selectedDate} at ${selectedTime}.`,
            appointmentId:
              response.data.id,
            link:
              "/doctor/dashboard"
          });
        }
      } catch (notificationError) {
        console.log(
          "BOOKING NOTIFICATION ERROR:",
          notificationError
        );
      }

      setBookingSuccess(
        "Appointment booked successfully."
      );

      setSelectedTime("");

    } catch (error) {
      console.log(
        "BOOKING ERROR:",
        error
      );

      alert(
        "Booking failed."
      );

    } finally {
      setBookingLoading(false);
    }
  };

  /* =========================
     DOCTOR PATIENT STATS
  ========================= */

  const doctorAppointments =
    appointments.filter(
      (appointment) => {
        return (
          String(appointment.doctorId) ===
            String(id) &&
          appointment.status !==
            "cancelled"
        );
      }
    );

  const uniquePatientIds =
    new Set(
      doctorAppointments
        .map((appointment) => {
          return appointment.userId
            ? String(appointment.userId)
            : null;
        })
        .filter(Boolean)
    );

  const totalPatients =
    uniquePatientIds.size;

  /* =========================
     RECENT REVIEWS
  ========================= */

  const recentReviews =
    [...reviews].sort((a, b) => {
      const aTime =
        new Date(a.createdAt || 0).getTime();

      const bTime =
        new Date(b.createdAt || 0).getTime();

      return bTime - aTime;
    });

  /* =========================
     STARS
  ========================= */

  const renderStars = (rating) => {
    const roundedRating =
      Math.round(Number(rating || 0));

    return [1, 2, 3, 4, 5]
      .map((star) => {
        return star <= roundedRating
          ? "★"
          : "☆";
      })
      .join("");
  };

  /* =========================
     REVIEW DATE
  ========================= */

  const formatReviewDate = (
    createdAt
  ) => {
    if (!createdAt) {
      return "";
    }

    const date =
      new Date(createdAt);

    if (
      Number.isNaN(
        date.getTime()
      )
    ) {
      return "";
    }

    return date.toLocaleDateString(
      "en-GB",
      {
        year: "numeric",
        month: "short",
        day: "numeric"
      }
    );
  };

  /* =========================
     LOADING
  ========================= */

  if (loading) {
    return (
      <div className="doctor-profile-message">
        Loading doctor...
      </div>
    );
  }

  /* =========================
     ERROR
  ========================= */

  if (error || !doctor) {
    return (
      <div className="doctor-profile-message error">
        {error || "Doctor not found."}
      </div>
    );
  }

  return (
    <main className="doctor-profile-page">
      <style>
        {`
          .doctor-reviews-summary {
            display: flex;
            align-items: center;
            gap: 14px;
            padding: 16px;
            margin-bottom: 16px;
            border: 1px solid #e2e8f0;
            border-radius: 12px;
            background: #f8fafc;
          }

          .doctor-reviews-score {
            min-width: 70px;
            text-align: center;
          }

          .doctor-reviews-score strong {
            display: block;
            color: #0f172a;
            font-size: 27px;
            line-height: 1;
          }

          .doctor-reviews-score span {
            display: block;
            margin-top: 6px;
            color: #f59e0b;
            font-size: 13px;
            letter-spacing: 1px;
          }

          .doctor-reviews-summary-text strong {
            display: block;
            color: #0f172a;
            font-size: 11px;
          }

          .doctor-reviews-summary-text span {
            display: block;
            margin-top: 4px;
            color: #64748b;
            font-size: 9px;
          }

          .doctor-reviews-list {
            display: flex;
            flex-direction: column;
            gap: 10px;
          }

          .doctor-review-item {
            padding: 15px;
            border: 1px solid #e2e8f0;
            border-radius: 11px;
            background: #fff;
          }

          .doctor-review-top {
            display: flex;
            align-items: flex-start;
            justify-content: space-between;
            gap: 12px;
          }

          .doctor-review-person {
            display: flex;
            align-items: center;
            gap: 9px;
          }

          .doctor-review-avatar {
            width: 36px;
            height: 36px;
            flex-shrink: 0;
            display: flex;
            align-items: center;
            justify-content: center;
            border-radius: 50%;
            background: #eff6ff;
            color: #2563eb;
            font-size: 12px;
            font-weight: 900;
          }

          .doctor-review-person strong {
            display: block;
            color: #0f172a;
            font-size: 10px;
          }

          .doctor-review-person span {
            display: block;
            margin-top: 3px;
            color: #94a3b8;
            font-size: 8px;
          }

          .doctor-review-stars {
            color: #f59e0b;
            font-size: 12px;
            letter-spacing: 1px;
            white-space: nowrap;
          }

          .doctor-review-comment {
            margin: 11px 0 0;
            color: #475569;
            font-size: 10px;
            line-height: 1.8;
          }

          .doctor-reviews-empty {
            padding: 24px;
            border-radius: 10px;
            background: #f8fafc;
            color: #64748b;
            text-align: center;
            font-size: 10px;
          }

          @media (max-width: 600px) {
            .doctor-review-top {
              flex-direction: column;
            }
          }
        `}
      </style>

      <div className="section-container">

        {/* BACK */}

        <Link
          to="/doctors"
          className="doctor-profile-back"
        >
          ← Back to Doctors
        </Link>

        {/* =========================
            HEADER
        ========================= */}

        <section className="doctor-profile-header">

          <div className="doctor-profile-main">

            {/* IMAGE */}

            <div className="doctor-profile-image">

              {doctor.image ? (
                <img
                  src={doctor.image}
                  alt={doctor.name}
                />
              ) : (
                <div
                  style={{
                    width: "100%",
                    height: "100%",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    background: "#eff6ff",
                    fontSize: "42px"
                  }}
                >
                  🩺
                </div>
              )}

              {doctor.available ? (
                <span className="profile-status available">
                  ● Available
                </span>
              ) : (
                <span className="profile-status unavailable">
                  ● Not Available
                </span>
              )}

            </div>

            {/* INFO */}

            <div className="doctor-profile-info">

              <div className="profile-doctor-label">
                VERIFIED DOCTOR
              </div>

              <h1>
                {doctor.name}
                <span className="profile-verified">
                  ✓
                </span>
              </h1>

              <p className="profile-specialty">
                {doctor.specialty}
              </p>

              <div className="profile-rating">

                <span className="profile-star">
                  ★
                </span>

                <strong>
                  {Number(doctor.rating || 0).toFixed(1)}
                </strong>

                <span>
                  ({doctor.reviews || 0} patient reviews)
                </span>

              </div>

              <div className="profile-details-grid">

                <div className="profile-detail">
                  <span className="profile-detail-icon">
                    📍
                  </span>
                  <div>
                    <small>
                      Location
                    </small>
                    <strong>
                      {doctor.location || "Not specified"}
                    </strong>
                  </div>
                </div>

                <div className="profile-detail">
                  <span className="profile-detail-icon">
                    🩺
                  </span>
                  <div>
                    <small>
                      Experience
                    </small>
                    <strong>
                      {doctor.experienceYears
                        ? `${doctor.experienceYears}+ Years`
                        : "Not specified"
                      }
                    </strong>
                  </div>
                </div>

                <div className="profile-detail">
                  <span className="profile-detail-icon">
                    👥
                  </span>
                  <div>
                    <small>
                      Patients
                    </small>
                    <strong>
                      {totalPatients}
                    </strong>
                  </div>
                </div>

                <div className="profile-detail">
                  <span className="profile-detail-icon">
                    💬
                  </span>
                  <div>
                    <small>
                      Languages
                    </small>
                    <strong>
                      {Array.isArray(doctor.languages) &&
                      doctor.languages.length > 0
                        ? doctor.languages.join(", ")
                        : "Not specified"
                      }
                    </strong>
                  </div>
                </div>

              </div>

            </div>

          </div>

          {/* PRICE */}

          <div className="doctor-profile-price">

            <span>
              Consultation Fee
            </span>

            <strong>
              {doctor.fee}
              <small>
                {" "}EGP
              </small>
            </strong>

            <p>
              Per clinic visit
            </p>

            <a href="#booking">
              Book Appointment
            </a>

          </div>

        </section>

        {/* =========================
            CONTENT
        ========================= */}

        <div className="doctor-profile-layout">

          {/* LEFT */}

          <div className="doctor-profile-left">

            {/* ABOUT */}

            <section className="profile-section-card">

              <div className="profile-section-title">
                <div>
                  👨‍⚕️
                </div>
                <h2>
                  About Doctor
                </h2>
              </div>

              <p className="profile-about-text">
                {doctor.about ||
                  "No professional introduction has been added yet."
                }
              </p>

            </section>

            {/* CLINIC */}

            <section className="profile-section-card">

              <div className="profile-section-title">
                <div>
                  🏥
                </div>
                <h2>
                  Clinic Information
                </h2>
              </div>

              <div className="clinic-information">

                <div>
                  <span>
                    Clinic
                  </span>
                  <strong>
                    {doctor.clinicName || "Not specified"}
                  </strong>
                </div>

                <div>
                  <span>
                    Address
                  </span>
                  <strong>
                    {doctor.clinicAddress ||
                      doctor.location ||
                      "Not specified"
                    }
                  </strong>
                </div>

                <div>
                  <span>
                    Working Hours
                  </span>
                  <strong>
                    {schedules.length > 0
                      ? `${schedules.length} available day${schedules.length > 1 ? "s" : ""}`
                      : "No schedule added yet"
                    }
                  </strong>
                </div>

                <div>
                  <span>
                    Waiting Time
                  </span>
                  <strong>
                    {doctor.waitingTime || "Not specified"}
                  </strong>
                </div>

              </div>

            </section>

            {/* SERVICES */}

            <section className="profile-section-card">

              <div className="profile-section-title">
                <div>
                  ✓
                </div>
                <h2>
                  Services
                </h2>
              </div>

              <div className="doctor-services">

                {Array.isArray(doctor.services) &&
                doctor.services.length > 0 ? (
                  doctor.services.map(
                    (service, index) => (
                      <span key={`${service}-${index}`}>
                        ✓ {service}
                      </span>
                    )
                  )
                ) : (
                  <span>
                    No services have been added yet.
                  </span>
                )}

              </div>

            </section>

            {/* REVIEWS */}

            <section className="profile-section-card">

              <div className="profile-section-title">
                <div>
                  ★
                </div>
                <h2>
                  Patient Reviews
                </h2>
              </div>

              <div className="doctor-reviews-summary">

                <div className="doctor-reviews-score">
                  <strong>
                    {Number(doctor.rating || 0).toFixed(1)}
                  </strong>
                  <span>
                    {renderStars(doctor.rating)}
                  </span>
                </div>

                <div className="doctor-reviews-summary-text">
                  <strong>
                    Overall patient rating
                  </strong>
                  <span>
                    Based on {doctor.reviews || 0} patient reviews
                  </span>
                </div>

              </div>

              {recentReviews.length === 0 ? (

                <div className="doctor-reviews-empty">
                  No written reviews have been submitted yet.
                </div>

              ) : (

                <div className="doctor-reviews-list">

                  {recentReviews.map((review) => (

                    <div
                      className="doctor-review-item"
                      key={review.id}
                    >

                      <div className="doctor-review-top">

                        <div className="doctor-review-person">

                          <div className="doctor-review-avatar">
                            {review.patientName
                              ? review.patientName
                                  .charAt(0)
                                  .toUpperCase()
                              : "P"
                            }
                          </div>

                          <div>
                            <strong>
                              {review.patientName || "Patient"}
                            </strong>
                            <span>
                              {formatReviewDate(review.createdAt)}
                            </span>
                          </div>

                        </div>

                        <div className="doctor-review-stars">
                          {renderStars(review.rating)}
                        </div>

                      </div>

                      {review.comment && (
                        <p className="doctor-review-comment">
                          {review.comment}
                        </p>
                      )}

                    </div>

                  ))}

                </div>

              )}

            </section>

          </div>

          {/* =========================
              BOOKING
          ========================= */}

          <aside
            className="doctor-booking-card"
            id="booking"
          >

            <div className="booking-card-header">
              <span>
                BOOK APPOINTMENT
              </span>
              <h2>
                Choose your visit
              </h2>
              <p>
                Select an available date
                and time.
              </p>
            </div>

            {/* LOGIN CHECK */}

            {!currentUser ? (

              <div className="booking-login-required">

                <div className="booking-login-icon">
                  👤
                </div>

                <h3>
                  Login Required
                </h3>

                <p>
                  Please login to your account
                  before booking an appointment.
                </p>

                <Link
                  to="/login"
                  className="booking-login-btn"
                >
                  Login to Book
                </Link>

              </div>

            ) : currentUser.role !== "patient" ? (

              <div className="booking-login-required">

                <div className="booking-login-icon">
                  🔒
                </div>

                <h3>
                  Patient Account Required
                </h3>

                <p>
                  Appointment booking is available
                  only for patient accounts.
                </p>

              </div>

            ) : (

              <>

                {/* PATIENT INFO */}

                <div className="booking-patient">
                  <span>
                    Booking for
                  </span>
                  <strong>
                    {currentUser.name}
                  </strong>
                  <small>
                    {currentUser.phone}
                  </small>
                </div>

                {/* DATES */}

                <div className="booking-group">

                  <label>
                    Available Dates
                  </label>

                  {schedules.length > 0 ? (

                    <div className="booking-days">

                      {schedules.map(
                        (schedule) => (
                          <button
                            type="button"
                            key={schedule.id}
                            className={
                              selectedDate === schedule.date
                                ? "booking-day active"
                                : "booking-day"
                            }
                            onClick={() =>
                              handleSelectDate(
                                schedule.date
                              )
                            }
                          >
                            {schedule.date}
                          </button>
                        )
                      )}

                    </div>

                  ) : (

                    <p className="select-date-message">
                      No available dates.
                    </p>

                  )}

                </div>

                {/* TIMES */}

                <div className="booking-group">

                  <label>
                    Available Times
                  </label>

                  {!selectedDate ? (

                    <p className="select-date-message">
                      Please select a date first.
                    </p>

                  ) : availableTimes.length > 0 ? (

                    <div className="booking-times">

                      {availableTimes.map(
                        (time) => (
                          <button
                            type="button"
                            key={time}
                            className={
                              selectedTime === time
                                ? "booking-time active"
                                : "booking-time"
                            }
                            onClick={() =>
                              setSelectedTime(time)
                            }
                          >
                            {time}
                          </button>
                        )
                      )}

                    </div>

                  ) : (

                    <p className="select-date-message">
                      No available times for this date.
                    </p>

                  )}

                </div>

                {/* SUMMARY */}

                <div className="booking-summary">

                  <div>
                    <span>
                      Doctor
                    </span>
                    <strong>
                      {doctor.name}
                    </strong>
                  </div>

                  <div>
                    <span>
                      Patient
                    </span>
                    <strong>
                      {currentUser.name}
                    </strong>
                  </div>

                  <div>
                    <span>
                      Date
                    </span>
                    <strong>
                      {selectedDate || "Not selected"}
                    </strong>
                  </div>

                  <div>
                    <span>
                      Time
                    </span>
                    <strong>
                      {selectedTime || "Not selected"}
                    </strong>
                  </div>

                  <div>
                    <span>
                      Total
                    </span>
                    <strong>
                      {doctor.fee} EGP
                    </strong>
                  </div>

                </div>

                {/* CONFIRM */}

                <button
                  type="button"
                  className="confirm-booking-btn"
                  onClick={handleBooking}
                  disabled={
                    !selectedDate ||
                    !selectedTime ||
                    bookingLoading
                  }
                >
                  {bookingLoading
                    ? "Booking..."
                    : "Confirm Appointment"
                  }
                </button>

                {bookingSuccess && (
                  <div className="booking-success">
                    ✓ {bookingSuccess}
                  </div>
                )}

                <p className="booking-note">
                  You will not be charged at this stage.
                </p>

              </>

            )}

          </aside>

        </div>

      </div>

    </main>
  );
}

export default DoctorDetails;
