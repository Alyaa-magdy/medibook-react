import { useEffect, useState } from "react";
import { Link } from "react-router";
import axios from "axios";
import {
  createNotification,
  getDoctorUserByDoctorId
} from "../utils/notifications";

function Appointments() {
  /* ========================================
     CURRENT USER
  ======================================== */

  const savedUser =
    localStorage.getItem("currentUser");

  const currentUser =
    savedUser
      ? JSON.parse(savedUser)
      : null;


  /* ========================================
     STATES
  ======================================== */

  const [appointments, setAppointments] =
    useState([]);

  const [reviews, setReviews] =
    useState([]);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");

  const [reviewAppointment, setReviewAppointment] =
    useState(null);

  const [reviewRating, setReviewRating] =
    useState(0);

  const [reviewComment, setReviewComment] =
    useState("");

  const [reviewSaving, setReviewSaving] =
    useState(false);

  const [reviewError, setReviewError] =
    useState("");

  const [reviewSuccess, setReviewSuccess] =
    useState("");

  const [paymentAppointment, setPaymentAppointment] =
    useState(null);

  const [paymentMethod, setPaymentMethod] =
    useState("card");

  const [paymentSaving, setPaymentSaving] =
    useState(false);

  const [paymentError, setPaymentError] =
    useState("");

  const [paymentSuccess, setPaymentSuccess] =
    useState("");


  /* ========================================
     GET MY APPOINTMENTS + REVIEWS
  ======================================== */

  const getAppointments = async (
    showLoading = false
  ) => {
    if (!currentUser) {
      setLoading(false);
      return;
    }


    try {
      if (showLoading) {
        setLoading(true);
      }


      const [appointmentsResponse, reviewsResponse] =
        await Promise.all([
          axios.get(
            "http://localhost:3000/appointments"
          ),
          axios.get(
            "http://localhost:3000/reviews"
          )
        ]);


      /*
        نعرض حجوزات المستخدم الحالي فقط
      */

      const myAppointments =
        appointmentsResponse.data.filter(
          (appointment) => {
            return (
              String(appointment.userId) ===
              String(currentUser.id)
            );
          }
        );


      /*
        نعرض Reviews الخاصة بالمستخدم الحالي فقط
      */

      const myReviews =
        reviewsResponse.data.filter(
          (review) => {
            return (
              String(review.userId) ===
              String(currentUser.id)
            );
          }
        );


      setAppointments(
        myAppointments
      );

      setReviews(
        myReviews
      );

      setError("");


    } catch (error) {

      console.log(
        "GET APPOINTMENTS ERROR:",
        error
      );


      setError(
        "Unable to load appointments."
      );


    } finally {

      setLoading(false);

    }
  };


  /* ========================================
     LOAD + AUTO REFRESH
  ======================================== */

  useEffect(() => {
    getAppointments(true);


    const interval =
      setInterval(() => {
        getAppointments(false);
      }, 5000);


    return () => {
      clearInterval(interval);
    };

  }, []);


  /* ========================================
     CANCEL APPOINTMENT
  ======================================== */

  const handleCancel =
    async (appointment) => {

      const confirmCancel =
        window.confirm(
          "Are you sure you want to cancel this appointment?"
        );


      if (!confirmCancel) {
        return;
      }


      try {

        const currentPaymentStatus =
          appointment.paymentStatus ||
          "unpaid";


        const updateData = {
          status: "cancelled"
        };


        /*
          Mock refund:
          لو الحجز كان مدفوع
          بنعلّم العملية Refunded
        */

        if (
          currentPaymentStatus ===
          "paid"
        ) {

          updateData.paymentStatus =
            "refunded";

          updateData.refundedAt =
            new Date().toISOString();

        }


        await axios.patch(
          `http://localhost:3000/appointments/${appointment.id}`,
          updateData
        );


        const updatedAppointments =
          appointments.map(
            (appointmentItem) => {

              if (
                String(appointmentItem.id) ===
                String(appointment.id)
              ) {

                return {
                  ...appointmentItem,
                  ...updateData
                };

              }


              return appointmentItem;

            }
          );


        setAppointments(
          updatedAppointments
        );


        try {
          const doctorUser =
            await getDoctorUserByDoctorId(
              appointment.doctorId
            );

          if (doctorUser) {
            await createNotification({
              recipientUserId:
                doctorUser.id,
              recipientRole:
                "doctor",
              type:
                "appointment_cancelled",
              title:
                "Appointment Cancelled",
              message:
                `${currentUser.name} cancelled the appointment on ${appointment.date} at ${appointment.time}.`,
              appointmentId:
                appointment.id,
              link:
                "/doctor/dashboard"
            });
          }
        } catch (notificationError) {
          console.log(
            "CANCEL NOTIFICATION ERROR:",
            notificationError
          );
        }


        if (
          currentPaymentStatus ===
          "paid"
        ) {

          setPaymentSuccess(
            "Appointment cancelled. The mock payment was marked as refunded."
          );

        }


      } catch (error) {

        console.log(
          "CANCEL ERROR:",
          error
        );


        alert(
          "Unable to cancel appointment."
        );

      }

    };


  /* ========================================
     PAYMENT HELPERS
  ======================================== */

  const getPaymentStatus = (
    appointment
  ) => {

    return (
      appointment.paymentStatus ||
      "unpaid"
    );

  };


  const openPayment = (
    appointment
  ) => {

    const paymentStatus =
      getPaymentStatus(
        appointment
      );


    if (
      appointment.status !==
        "confirmed" &&
      appointment.status !==
        "completed"
    ) {

      return;

    }


    if (
      paymentStatus !==
      "unpaid"
    ) {

      return;

    }


    setPaymentAppointment(
      appointment
    );

    setPaymentMethod(
      "card"
    );

    setPaymentError("");
    setPaymentSuccess("");

  };


  const closePayment = () => {

    if (paymentSaving) {
      return;
    }


    setPaymentAppointment(
      null
    );

    setPaymentError("");

  };


  /* ========================================
     MOCK PAYMENT
  ======================================== */

  const handlePayment =
    async (event) => {

      event.preventDefault();


      if (!paymentAppointment) {
        return;
      }


      setPaymentError("");
      setPaymentSuccess("");


      if (
        paymentMethod !== "card" &&
        paymentMethod !== "wallet"
      ) {

        setPaymentError(
          "Please choose a payment method."
        );

        return;

      }


      try {

        setPaymentSaving(true);


        /*
          نراجع آخر نسخة من الحجز
          قبل تسجيل الدفع
        */

        const appointmentResponse =
          await axios.get(
            `http://localhost:3000/appointments/${paymentAppointment.id}`
          );


        const latestAppointment =
          appointmentResponse.data;


        const latestPaymentStatus =
          latestAppointment.paymentStatus ||
          "unpaid";


        if (
          latestPaymentStatus !==
          "unpaid"
        ) {

          setPaymentError(
            "This appointment payment has already been processed."
          );

          setAppointments(
            appointments.map(
              (appointment) => {

                if (
                  String(appointment.id) ===
                  String(latestAppointment.id)
                ) {

                  return latestAppointment;

                }


                return appointment;

              }
            )
          );

          return;

        }


        if (
          latestAppointment.status !==
            "confirmed" &&
          latestAppointment.status !==
            "completed"
        ) {

          setPaymentError(
            "Payment is available after the appointment is confirmed."
          );

          return;

        }


        const paidAt =
          new Date().toISOString();


        const transactionId =
          `PAY-${Date.now()}-${String(
            latestAppointment.id
          ).slice(-5)}`;


        const paymentData = {
          paymentStatus:
            "paid",

          paymentMethod:
            paymentMethod,

          transactionId:
            transactionId,

          paidAt:
            paidAt,

          refundedAt:
            null
        };


        const response =
          await axios.patch(
            `http://localhost:3000/appointments/${latestAppointment.id}`,
            paymentData
          );


        setAppointments(
          appointments.map(
            (appointment) => {

              if (
                String(appointment.id) ===
                String(
                  latestAppointment.id
                )
              ) {

                return {
                  ...appointment,
                  ...response.data
                };

              }


              return appointment;

            }
          )
        );


        setPaymentSuccess(
          `Payment completed successfully. Transaction: ${transactionId}`
        );


        try {
          const doctorUser =
            await getDoctorUserByDoctorId(
              latestAppointment.doctorId
            );

          if (doctorUser) {
            await createNotification({
              recipientUserId:
                doctorUser.id,
              recipientRole:
                "doctor",
              type:
                "payment_received",
              title:
                "Payment Received",
              message:
                `${currentUser.name} completed a mock payment of ${latestAppointment.fee} EGP for the appointment on ${latestAppointment.date}.`,
              appointmentId:
                latestAppointment.id,
              link:
                "/doctor/dashboard"
            });
          }
        } catch (notificationError) {
          console.log(
            "PAYMENT NOTIFICATION ERROR:",
            notificationError
          );
        }


        setPaymentAppointment(
          null
        );


      } catch (error) {

        console.log(
          "PAYMENT ERROR:",
          error
        );


        if (error.response) {

          setPaymentError(
            `Unable to process payment. Server error: ${error.response.status}`
          );

        } else {

          setPaymentError(
            "Unable to process payment."
          );

        }


      } finally {

        setPaymentSaving(false);

      }

    };


  /* ========================================
     REVIEW HELPERS
  ======================================== */

  const getAppointmentReview = (
    appointmentId
  ) => {
    return reviews.find((review) => {
      return (
        String(review.appointmentId) ===
        String(appointmentId)
      );
    });
  };


  const openReview = (
    appointment
  ) => {
    if (
      appointment.status !==
      "completed"
    ) {
      return;
    }


    const existingReview =
      getAppointmentReview(
        appointment.id
      );


    if (existingReview) {
      return;
    }


    setReviewAppointment(
      appointment
    );

    setReviewRating(0);
    setReviewComment("");
    setReviewError("");
    setReviewSuccess("");
  };


  const closeReview = () => {
    if (reviewSaving) {
      return;
    }

    setReviewAppointment(null);
    setReviewRating(0);
    setReviewComment("");
    setReviewError("");
  };


  /* ========================================
     SUBMIT REVIEW
  ======================================== */

  const handleSubmitReview =
    async (event) => {

      event.preventDefault();

      setReviewError("");
      setReviewSuccess("");


      if (!reviewAppointment) {
        return;
      }


      if (
        reviewAppointment.status !==
        "completed"
      ) {
        setReviewError(
          "You can only review a completed visit."
        );
        return;
      }


      if (
        reviewRating < 1 ||
        reviewRating > 5
      ) {
        setReviewError(
          "Please choose a rating from 1 to 5 stars."
        );
        return;
      }


      try {
        setReviewSaving(true);


        /*
          Double check من الـ Server
          إن الحجز لسه ملوش Review
        */

        const reviewsResponse =
          await axios.get(
            "http://localhost:3000/reviews"
          );


        const alreadyReviewed =
          reviewsResponse.data.find(
            (review) => {
              return (
                String(review.appointmentId) ===
                String(reviewAppointment.id)
              );
            }
          );


        if (alreadyReviewed) {
          setReviewError(
            "This appointment has already been reviewed."
          );

          setReviews(
            reviewsResponse.data.filter(
              (review) => {
                return (
                  String(review.userId) ===
                  String(currentUser.id)
                );
              }
            )
          );

          return;
        }


        /* ==================================
           CREATE REVIEW
        ================================== */

        let createdReview = null;


        try {

          const reviewResponse =
            await axios.post(
              "http://localhost:3000/reviews",
              {
                appointmentId:
                  reviewAppointment.id,

                userId:
                  currentUser.id,

                doctorId:
                  reviewAppointment.doctorId,

                doctorName:
                  reviewAppointment.doctorName,

                patientName:
                  currentUser.name,

                rating:
                  Number(reviewRating),

                comment:
                  reviewComment.trim(),

                createdAt:
                  new Date().toISOString()
              }
            );


          createdReview =
            reviewResponse.data;


          /* ==================================
             UPDATE DOCTOR RATING

             بنحافظ على التقييمات القديمة
             الموجودة بالفعل في Doctor Record
          ================================== */

          const doctorResponse =
            await axios.get(
              `http://localhost:3000/doctors/${reviewAppointment.doctorId}`
            );


          const doctorData =
            doctorResponse.data;


          const oldReviewsCount =
            Number(
              doctorData.reviews || 0
            );


          const oldRating =
            Number(
              doctorData.rating || 0
            );


          const newReviewsCount =
            oldReviewsCount + 1;


          const newRating =
            oldReviewsCount > 0
              ? (
                  (
                    oldRating *
                    oldReviewsCount
                  ) +
                  Number(reviewRating)
                ) /
                newReviewsCount
              : Number(reviewRating);


          const roundedRating =
            Math.round(
              newRating * 10
            ) / 10;


          await axios.patch(
            `http://localhost:3000/doctors/${reviewAppointment.doctorId}`,
            {
              rating:
                roundedRating,

              reviews:
                newReviewsCount
            }
          );


        } catch (saveError) {

          /*
            لو Review اتعمل لكن تحديث الدكتور فشل
            نرجع نحذف الـ Review عشان البيانات تفضل متناسقة
          */

          if (createdReview) {
            try {
              await axios.delete(
                `http://localhost:3000/reviews/${createdReview.id}`
              );
            } catch (rollbackError) {
              console.log(
                "REVIEW ROLLBACK ERROR:",
                rollbackError
              );
            }
          }


          throw saveError;
        }


        setReviews([
          ...reviews,
          createdReview
        ]);


        setReviewSuccess(
          "Thank you. Your review was submitted successfully."
        );


        try {
          const doctorUser =
            await getDoctorUserByDoctorId(
              reviewAppointment.doctorId
            );

          if (doctorUser) {
            await createNotification({
              recipientUserId:
                doctorUser.id,
              recipientRole:
                "doctor",
              type:
                "review_received",
              title:
                "New Patient Review",
              message:
                `${currentUser.name} rated the completed visit ${reviewRating}/5.`,
              appointmentId:
                reviewAppointment.id,
              link:
                "/doctor/dashboard"
            });
          }
        } catch (notificationError) {
          console.log(
            "REVIEW NOTIFICATION ERROR:",
            notificationError
          );
        }


        setReviewAppointment(null);
        setReviewRating(0);
        setReviewComment("");


      } catch (error) {

        console.log(
          "SUBMIT REVIEW ERROR:",
          error
        );


        if (error.response) {
          setReviewError(
            `Unable to submit review. Server error: ${error.response.status}`
          );
        } else {
          setReviewError(
            "Unable to submit review."
          );
        }


      } finally {

        setReviewSaving(false);

      }

    };


  /* ========================================
     STATUS TEXT
  ======================================== */

  const getStatusText = (
    status
  ) => {

    if (status === "pending") {
      return "⏳ Pending";
    }

    if (status === "confirmed") {
      return "✓ Confirmed";
    }

    if (status === "completed") {
      return "✓ Completed";
    }

    if (status === "cancelled") {
      return "✕ Cancelled";
    }

    return status;
  };


  /* ========================================
     STATUS STYLE
  ======================================== */

  const getStatusStyle = (
    status
  ) => {

    const baseStyle = {
      position: "static",
      display: "inline-flex",
      alignItems: "center",
      justifyContent: "center",
      minWidth: "95px",
      padding: "7px 11px",
      borderRadius: "50px",
      fontSize: "9px",
      fontWeight: "800",
      whiteSpace: "nowrap",
      textTransform: "capitalize"
    };


    if (status === "pending") {
      return {
        ...baseStyle,
        background: "#fef3c7",
        color: "#b45309"
      };
    }


    if (status === "confirmed") {
      return {
        ...baseStyle,
        background: "#dbeafe",
        color: "#1d4ed8"
      };
    }


    if (status === "completed") {
      return {
        ...baseStyle,
        background: "#dcfce7",
        color: "#15803d"
      };
    }


    if (status === "cancelled") {
      return {
        ...baseStyle,
        background: "#fee2e2",
        color: "#dc2626"
      };
    }


    return baseStyle;
  };


  /* ========================================
     PAYMENT STATUS TEXT
  ======================================== */

  const getPaymentStatusText = (
    status
  ) => {

    if (status === "paid") {
      return "✓ Paid";
    }

    if (status === "refunded") {
      return "↩ Refunded";
    }

    return "Unpaid";

  };


  /* ========================================
     PAYMENT STATUS STYLE
  ======================================== */

  const getPaymentStatusStyle = (
    status
  ) => {

    const baseStyle = {
      position: "static",
      display: "inline-flex",
      alignItems: "center",
      justifyContent: "center",
      minWidth: "82px",
      padding: "6px 10px",
      borderRadius: "50px",
      fontSize: "8px",
      fontWeight: "800",
      whiteSpace: "nowrap"
    };


    if (status === "paid") {

      return {
        ...baseStyle,
        background: "#dcfce7",
        color: "#15803d"
      };

    }


    if (status === "refunded") {

      return {
        ...baseStyle,
        background: "#ede9fe",
        color: "#6d28d9"
      };

    }


    return {
      ...baseStyle,
      background: "#f1f5f9",
      color: "#64748b"
    };

  };


  /* ========================================
     NOT LOGGED IN
  ======================================== */

  if (!currentUser) {

    return (

      <main className="appointments-page">

        <div className="section-container">

          <div className="appointments-empty">

            <div>
              👤
            </div>

            <h2>
              Login Required
            </h2>

            <p>
              Please login to view
              your appointments.
            </p>

            <Link
              to="/login"
              className="booking-login-btn"
              style={{
                maxWidth: "220px",
                marginTop: "15px"
              }}
            >
              Login
            </Link>

          </div>

        </div>

      </main>

    );

  }


  /* ========================================
     LOADING
  ======================================== */

  if (loading) {

    return (

      <div className="appointments-message">

        Loading appointments...

      </div>

    );

  }


  /* ========================================
     ERROR
  ======================================== */

  if (error) {

    return (

      <div className="appointments-message error">

        {error}

      </div>

    );

  }


  /* ========================================
     PAGE
  ======================================== */

  return (

    <main className="appointments-page">

      <style>
        {`
          .patient-review-notice {
            margin-bottom: 18px;
            padding: 12px 15px;
            border-radius: 10px;
            background: #dcfce7;
            color: #15803d;
            font-size: 11px;
            font-weight: 700;
          }

          .appointment-review-area {
            display: flex;
            align-items: center;
            gap: 8px;
            flex-wrap: wrap;
          }

          .appointment-review-btn {
            padding: 9px 13px;
            border: 0;
            border-radius: 8px;
            background: #fff7ed;
            color: #c2410c;
            font-size: 9px;
            font-weight: 800;
            cursor: pointer;
          }

          .appointment-review-btn:hover {
            background: #ffedd5;
          }

          .appointment-review-submitted {
            display: inline-flex;
            align-items: center;
            gap: 6px;
            padding: 8px 11px;
            border-radius: 8px;
            background: #fef3c7;
            color: #a16207;
            font-size: 9px;
            font-weight: 800;
          }

          .review-modal-overlay {
            position: fixed;
            inset: 0;
            z-index: 4000;
            padding: 18px;
            display: flex;
            align-items: center;
            justify-content: center;
            background: rgba(15, 23, 42, .62);
          }

          .review-modal {
            width: 100%;
            max-width: 540px;
            overflow: hidden;
            border-radius: 18px;
            background: white;
            box-shadow: 0 28px 80px rgba(15, 23, 42, .22);
          }

          .review-modal-header {
            padding: 20px;
            display: flex;
            align-items: flex-start;
            justify-content: space-between;
            gap: 15px;
            border-bottom: 1px solid #e2e8f0;
          }

          .review-modal-header span {
            display: block;
            margin-bottom: 5px;
            color: #2563eb;
            font-size: 8px;
            font-weight: 800;
            letter-spacing: 1px;
          }

          .review-modal-header h2 {
            margin: 0;
            color: #0f172a;
            font-size: 19px;
          }

          .review-modal-close {
            width: 36px;
            height: 36px;
            border: 0;
            border-radius: 9px;
            background: #f1f5f9;
            color: #334155;
            font-size: 18px;
            cursor: pointer;
          }

          .review-modal-body {
            padding: 20px;
          }

          .review-doctor-box {
            padding: 13px;
            margin-bottom: 18px;
            border: 1px solid #e2e8f0;
            border-radius: 10px;
            background: #f8fafc;
          }

          .review-doctor-box span {
            display: block;
            margin-bottom: 4px;
            color: #94a3b8;
            font-size: 8px;
            font-weight: 700;
          }

          .review-doctor-box strong {
            color: #0f172a;
            font-size: 12px;
          }

          .review-stars-label {
            display: block;
            margin-bottom: 8px;
            color: #334155;
            font-size: 10px;
            font-weight: 800;
          }

          .review-stars {
            display: flex;
            gap: 7px;
            margin-bottom: 20px;
          }

          .review-star-btn {
            padding: 0;
            border: 0;
            background: transparent;
            color: #cbd5e1;
            font-size: 30px;
            line-height: 1;
            cursor: pointer;
          }

          .review-star-btn.active {
            color: #f59e0b;
          }

          .review-comment-group label {
            display: block;
            margin-bottom: 7px;
            color: #334155;
            font-size: 10px;
            font-weight: 800;
          }

          .review-comment-group textarea {
            width: 100%;
            min-height: 115px;
            padding: 12px;
            border: 1px solid #dbe2ea;
            border-radius: 9px;
            outline: none;
            resize: vertical;
            font-size: 11px;
            line-height: 1.7;
          }

          .review-comment-group textarea:focus {
            border-color: #2563eb;
          }

          .review-modal-error {
            margin-top: 12px;
            padding: 10px 12px;
            border-radius: 8px;
            background: #fee2e2;
            color: #dc2626;
            font-size: 9px;
            font-weight: 700;
          }

          .review-modal-actions {
            margin-top: 18px;
            display: flex;
            justify-content: flex-end;
            gap: 9px;
          }

          .review-modal-actions button {
            min-height: 41px;
            padding: 0 16px;
            border: 0;
            border-radius: 8px;
            font-size: 9px;
            font-weight: 800;
            cursor: pointer;
          }

          .review-cancel-btn {
            background: #f1f5f9;
            color: #475569;
          }

          .review-submit-btn {
            background: #2563eb;
            color: white;
          }

          .review-submit-btn:disabled {
            opacity: .55;
            cursor: not-allowed;
          }

          .patient-payment-notice {
            margin-bottom: 18px;
            padding: 12px 15px;
            border-radius: 10px;
            background: #dbeafe;
            color: #1d4ed8;
            font-size: 11px;
            font-weight: 700;
          }

          .appointment-payment-box {
            display: flex;
            flex-direction: column;
            gap: 5px;
          }

          .appointment-payment-meta {
            color: #64748b;
            font-size: 8px;
            line-height: 1.5;
          }

          .appointment-pay-btn {
            padding: 9px 13px;
            border: 0;
            border-radius: 8px;
            background: #2563eb;
            color: white;
            font-size: 9px;
            font-weight: 800;
            cursor: pointer;
          }

          .appointment-pay-btn:hover {
            background: #1d4ed8;
          }

          .payment-modal-overlay {
            position: fixed;
            inset: 0;
            z-index: 4100;
            padding: 18px;
            display: flex;
            align-items: center;
            justify-content: center;
            background: rgba(15, 23, 42, .64);
          }

          .payment-modal {
            width: 100%;
            max-width: 560px;
            overflow: hidden;
            border-radius: 18px;
            background: white;
            box-shadow: 0 28px 80px rgba(15, 23, 42, .24);
          }

          .payment-modal-header {
            padding: 20px;
            display: flex;
            align-items: flex-start;
            justify-content: space-between;
            gap: 15px;
            border-bottom: 1px solid #e2e8f0;
          }

          .payment-modal-header span {
            display: block;
            margin-bottom: 5px;
            color: #2563eb;
            font-size: 8px;
            font-weight: 800;
            letter-spacing: 1px;
          }

          .payment-modal-header h2 {
            margin: 0;
            color: #0f172a;
            font-size: 19px;
          }

          .payment-modal-close {
            width: 36px;
            height: 36px;
            border: 0;
            border-radius: 9px;
            background: #f1f5f9;
            color: #334155;
            font-size: 18px;
            cursor: pointer;
          }

          .payment-modal-body {
            padding: 20px;
          }

          .payment-appointment-box {
            padding: 14px;
            margin-bottom: 18px;
            border: 1px solid #e2e8f0;
            border-radius: 11px;
            background: #f8fafc;
          }

          .payment-appointment-box div {
            display: flex;
            justify-content: space-between;
            gap: 15px;
            padding: 5px 0;
          }

          .payment-appointment-box span {
            color: #64748b;
            font-size: 9px;
          }

          .payment-appointment-box strong {
            color: #0f172a;
            font-size: 10px;
            text-align: right;
          }

          .payment-method-title {
            display: block;
            margin-bottom: 9px;
            color: #334155;
            font-size: 10px;
            font-weight: 800;
          }

          .payment-methods {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 10px;
            margin-bottom: 16px;
          }

          .payment-method-option {
            padding: 14px;
            border: 1px solid #dbe2ea;
            border-radius: 10px;
            background: white;
            color: #334155;
            text-align: left;
            font-size: 10px;
            font-weight: 800;
            cursor: pointer;
          }

          .payment-method-option.active {
            border-color: #2563eb;
            background: #eff6ff;
            color: #1d4ed8;
          }

          .payment-training-note {
            padding: 11px 12px;
            border-radius: 9px;
            background: #fff7ed;
            color: #9a3412;
            font-size: 9px;
            line-height: 1.7;
          }

          .payment-modal-error {
            margin-top: 12px;
            padding: 10px 12px;
            border-radius: 8px;
            background: #fee2e2;
            color: #dc2626;
            font-size: 9px;
            font-weight: 700;
          }

          .payment-modal-actions {
            margin-top: 18px;
            display: flex;
            justify-content: flex-end;
            gap: 9px;
          }

          .payment-modal-actions button {
            min-height: 41px;
            padding: 0 16px;
            border: 0;
            border-radius: 8px;
            font-size: 9px;
            font-weight: 800;
            cursor: pointer;
          }

          .payment-cancel-btn {
            background: #f1f5f9;
            color: #475569;
          }

          .payment-submit-btn {
            background: #2563eb;
            color: white;
          }

          .payment-submit-btn:disabled {
            opacity: .55;
            cursor: not-allowed;
          }

          @media (max-width: 600px) {
            .payment-methods {
              grid-template-columns: 1fr;
            }

            .payment-appointment-box div {
              flex-direction: column;
              gap: 3px;
            }

            .payment-appointment-box strong {
              text-align: left;
            }
          }
        `}
      </style>


      <div className="section-container">


        {/* ==================================
            HEADER
        ================================== */}

        <div className="appointments-heading">

          <span className="section-small-title">
            MY APPOINTMENTS
          </span>

          <h1>
            Welcome, {currentUser.name}
          </h1>

          <p>
            View and manage
            your medical appointments.
          </p>

        </div>


        {reviewSuccess && (

          <div className="patient-review-notice">
            ✓ {reviewSuccess}
          </div>

        )}


        {paymentSuccess && (

          <div className="patient-payment-notice">
            ✓ {paymentSuccess}
          </div>

        )}


        {/* ==================================
            EMPTY
        ================================== */}

        {appointments.length === 0 ? (

          <div className="appointments-empty">

            <div>
              📅
            </div>

            <h2>
              No appointments yet
            </h2>

            <p>
              You haven't booked
              any appointments yet.
            </p>

            <Link
              to="/doctors"
              className="booking-login-btn"
              style={{
                maxWidth: "220px",
                marginTop: "15px"
              }}
            >
              Find a Doctor
            </Link>

          </div>

        ) : (

          <div className="appointments-list">


            {appointments.map(
              (appointment) => {

                const appointmentReview =
                  getAppointmentReview(
                    appointment.id
                  );


                return (

                  <div
                    className="appointment-card"
                    key={appointment.id}
                  >


                    {/* DATE */}

                    <div className="appointment-date-box">

                      <span>
                        {appointment.date}
                      </span>

                      <strong>
                        {appointment.time}
                      </strong>

                    </div>


                    {/* INFORMATION */}

                    <div className="appointment-info">


                      <div className="appointment-top">

                        <div>

                          <span className="appointment-doctor-label">
                            DOCTOR
                          </span>

                          <h3>
                            {appointment.doctorName}
                          </h3>

                        </div>


                        <span
                          style={
                            getStatusStyle(
                              appointment.status
                            )
                          }
                        >
                          {
                            getStatusText(
                              appointment.status
                            )
                          }
                        </span>

                      </div>


                      <div className="appointment-details">

                        <div>

                          <span>
                            Patient
                          </span>

                          <strong>
                            {appointment.patientName}
                          </strong>

                        </div>


                        <div>

                          <span>
                            Phone
                          </span>

                          <strong>
                            {appointment.patientPhone}
                          </strong>

                        </div>


                        <div>

                          <span>
                            Consultation Fee
                          </span>

                          <strong>
                            {appointment.fee} EGP
                          </strong>

                        </div>


                        <div className="appointment-payment-box">

                          <span>
                            Payment
                          </span>

                          <strong>
                            <span
                              style={
                                getPaymentStatusStyle(
                                  getPaymentStatus(
                                    appointment
                                  )
                                )
                              }
                            >
                              {
                                getPaymentStatusText(
                                  getPaymentStatus(
                                    appointment
                                  )
                                )
                              }
                            </span>
                          </strong>

                          {appointment.transactionId && (

                            <small className="appointment-payment-meta">
                              {appointment.transactionId}
                            </small>

                          )}

                        </div>


                      </div>


                    </div>


                    {/* ACTIONS */}

                    <div className="appointment-action">


                      {appointment.status ===
                        "pending" && (

                        <>

                          <Link
                            to={`/appointments/${appointment.id}/edit`}
                            className="appointment-reschedule-btn"
                          >
                            Reschedule
                          </Link>


                          <button
                            type="button"
                            onClick={() =>
                              handleCancel(
                                appointment
                              )
                            }
                          >
                            Cancel Appointment
                          </button>

                        </>

                      )}


                      {appointment.status ===
                        "confirmed" && (

                        <>

                          {getPaymentStatus(
                            appointment
                          ) === "unpaid" && (

                            <button
                              type="button"
                              className="appointment-pay-btn"
                              onClick={() =>
                                openPayment(
                                  appointment
                                )
                              }
                            >
                              Pay Now
                            </button>

                          )}


                          <Link
                            to={`/appointments/${appointment.id}/edit`}
                            className="appointment-reschedule-btn"
                          >
                            Reschedule
                          </Link>


                          <button
                            type="button"
                            onClick={() =>
                              handleCancel(
                                appointment
                              )
                            }
                          >
                            Cancel Appointment
                          </button>

                        </>

                      )}


                      {appointment.status ===
                        "completed" && (

                        <div className="appointment-review-area">

                          {getPaymentStatus(
                            appointment
                          ) === "unpaid" && (

                            <button
                              type="button"
                              className="appointment-pay-btn"
                              onClick={() =>
                                openPayment(
                                  appointment
                                )
                              }
                            >
                              Pay Now
                            </button>

                          )}


                          <span
                            style={{
                              color: "#15803d",
                              fontSize: "10px",
                              fontWeight: "700"
                            }}
                          >
                            ✓ Visit Completed
                          </span>


                          {appointmentReview ? (

                            <span className="appointment-review-submitted">
                              ★ {appointmentReview.rating}/5 · Review Submitted
                            </span>

                          ) : (

                            <button
                              type="button"
                              className="appointment-review-btn"
                              onClick={() =>
                                openReview(
                                  appointment
                                )
                              }
                            >
                              ★ Leave a Review
                            </button>

                          )}

                        </div>

                      )}


                      {appointment.status ===
                        "cancelled" && (

                        <span
                          style={{
                            color: "#dc2626",
                            fontSize: "10px",
                            fontWeight: "700"
                          }}
                        >
                          Appointment Cancelled
                        </span>

                      )}


                    </div>


                  </div>

                );

              }
            )}


          </div>

        )}


      </div>


      {/* ====================================
          PAYMENT POPUP
      ==================================== */}

      {paymentAppointment && (

        <div
          className="payment-modal-overlay"
          onClick={closePayment}
        >

          <div
            className="payment-modal"
            onClick={(event) =>
              event.stopPropagation()
            }
          >


            <div className="payment-modal-header">

              <div>

                <span>
                  MOCK PAYMENT
                </span>

                <h2>
                  Pay Consultation Fee
                </h2>

              </div>


              <button
                type="button"
                className="payment-modal-close"
                onClick={closePayment}
              >
                ×
              </button>

            </div>


            <form
              className="payment-modal-body"
              onSubmit={handlePayment}
            >


              <div className="payment-appointment-box">

                <div>

                  <span>
                    Doctor
                  </span>

                  <strong>
                    {paymentAppointment.doctorName}
                  </strong>

                </div>


                <div>

                  <span>
                    Appointment
                  </span>

                  <strong>
                    {paymentAppointment.date}
                    {" · "}
                    {paymentAppointment.time}
                  </strong>

                </div>


                <div>

                  <span>
                    Amount
                  </span>

                  <strong>
                    {paymentAppointment.fee} EGP
                  </strong>

                </div>

              </div>


              <span className="payment-method-title">
                Payment Method
              </span>


              <div className="payment-methods">

                <button
                  type="button"
                  className={
                    paymentMethod === "card"
                      ? "payment-method-option active"
                      : "payment-method-option"
                  }
                  onClick={() =>
                    setPaymentMethod(
                      "card"
                    )
                  }
                >
                  💳 Card Payment
                </button>


                <button
                  type="button"
                  className={
                    paymentMethod === "wallet"
                      ? "payment-method-option active"
                      : "payment-method-option"
                  }
                  onClick={() =>
                    setPaymentMethod(
                      "wallet"
                    )
                  }
                >
                  📱 Mobile Wallet
                </button>

              </div>


              <div className="payment-training-note">
                Training mode only. No real card or wallet
                details are collected, stored or sent to a
                payment gateway in this JSON Server project.
              </div>


              {paymentError && (

                <div className="payment-modal-error">
                  {paymentError}
                </div>

              )}


              <div className="payment-modal-actions">

                <button
                  type="button"
                  className="payment-cancel-btn"
                  onClick={closePayment}
                  disabled={paymentSaving}
                >
                  Cancel
                </button>


                <button
                  type="submit"
                  className="payment-submit-btn"
                  disabled={paymentSaving}
                >
                  {paymentSaving
                    ? "Processing..."
                    : `Pay ${paymentAppointment.fee} EGP`
                  }
                </button>

              </div>


            </form>


          </div>

        </div>

      )}


      {/* ====================================
          REVIEW POPUP
      ==================================== */}

      {reviewAppointment && (

        <div
          className="review-modal-overlay"
          onClick={closeReview}
        >

          <div
            className="review-modal"
            onClick={(event) =>
              event.stopPropagation()
            }
          >


            <div className="review-modal-header">

              <div>

                <span>
                  COMPLETED VISIT
                </span>

                <h2>
                  Rate Your Doctor
                </h2>

              </div>


              <button
                type="button"
                className="review-modal-close"
                onClick={closeReview}
              >
                ×
              </button>

            </div>


            <form
              className="review-modal-body"
              onSubmit={
                handleSubmitReview
              }
            >


              <div className="review-doctor-box">

                <span>
                  DOCTOR
                </span>

                <strong>
                  {reviewAppointment.doctorName}
                </strong>

              </div>


              <label className="review-stars-label">
                How was your visit? *
              </label>


              <div className="review-stars">

                {[1, 2, 3, 4, 5].map(
                  (star) => (

                    <button
                      type="button"
                      key={star}
                      className={
                        reviewRating >= star
                          ? "review-star-btn active"
                          : "review-star-btn"
                      }
                      onClick={() =>
                        setReviewRating(
                          star
                        )
                      }
                      aria-label={`${star} star`}
                    >
                      ★
                    </button>

                  )
                )}

              </div>


              <div className="review-comment-group">

                <label>
                  Comment (optional)
                </label>

                <textarea
                  value={reviewComment}
                  maxLength="500"
                  placeholder="Tell other patients about your experience..."
                  onChange={(event) =>
                    setReviewComment(
                      event.target.value
                    )
                  }
                />

              </div>


              {reviewError && (

                <div className="review-modal-error">
                  {reviewError}
                </div>

              )}


              <div className="review-modal-actions">

                <button
                  type="button"
                  className="review-cancel-btn"
                  onClick={closeReview}
                  disabled={reviewSaving}
                >
                  Cancel
                </button>


                <button
                  type="submit"
                  className="review-submit-btn"
                  disabled={
                    reviewSaving ||
                    reviewRating === 0
                  }
                >
                  {reviewSaving
                    ? "Submitting..."
                    : "Submit Review"
                  }
                </button>

              </div>


            </form>


          </div>

        </div>

      )}


    </main>

  );
}

export default Appointments;
