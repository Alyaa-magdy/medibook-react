import { useEffect, useState } from "react";
import {
  Link,
  useNavigate,
  useParams
} from "react-router";

import axios from "axios";

import {
  createNotification,
  getDoctorUserByDoctorId
} from "../utils/notifications";


function EditAppointment() {

  /* =========================
     APPOINTMENT ID FROM URL
  ========================= */

  const { id } = useParams();

  const navigate = useNavigate();


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

  const [appointment, setAppointment] =
    useState(null);

  const [schedules, setSchedules] =
    useState([]);

  const [appointments, setAppointments] =
    useState([]);

  const [selectedDate, setSelectedDate] =
    useState("");

  const [selectedTime, setSelectedTime] =
    useState("");

  const [loading, setLoading] =
    useState(true);

  const [saving, setSaving] =
    useState(false);

  const [error, setError] =
    useState("");


  /* =========================
     DATE / TIME SAFETY
  ========================= */

  const getToday = () => {
    const now = new Date();

    const year =
      now.getFullYear();

    const month =
      String(
        now.getMonth() + 1
      ).padStart(2, "0");

    const day =
      String(
        now.getDate()
      ).padStart(2, "0");

    return `${year}-${month}-${day}`;
  };


  const timeToMinutes = (value) => {
    if (!value) {
      return null;
    }

    const normalized =
      String(value)
        .trim()
        .toUpperCase();


    const time24 =
      normalized.match(
        /^(\d{1,2}):(\d{2})$/
      );


    if (time24) {
      const hours =
        Number(time24[1]);

      const minutes =
        Number(time24[2]);

      if (
        hours >= 0 &&
        hours <= 23 &&
        minutes >= 0 &&
        minutes <= 59
      ) {
        return (
          hours * 60 +
          minutes
        );
      }
    }


    const time12 =
      normalized.match(
        /^(\d{1,2}):(\d{2})\s*(AM|PM)$/
      );


    if (time12) {
      let hours =
        Number(time12[1]);

      const minutes =
        Number(time12[2]);

      const period =
        time12[3];

      if (
        hours < 1 ||
        hours > 12 ||
        minutes < 0 ||
        minutes > 59
      ) {
        return null;
      }

      if (hours === 12) {
        hours = 0;
      }

      if (period === "PM") {
        hours += 12;
      }

      return (
        hours * 60 +
        minutes
      );
    }


    return null;
  };


  const today =
    getToday();


  const isPastSlot = (
    appointmentDate,
    appointmentTime
  ) => {
    if (appointmentDate < today) {
      return true;
    }

    if (appointmentDate > today) {
      return false;
    }

    const slotMinutes =
      timeToMinutes(
        appointmentTime
      );

    if (slotMinutes === null) {
      return false;
    }

    const now =
      new Date();

    const currentMinutes =
      now.getHours() * 60 +
      now.getMinutes();

    return (
      slotMinutes <=
      currentMinutes
    );
  };


  const isActiveAppointment = (
    item
  ) => {
    return (
      item.status === "pending" ||
      item.status === "confirmed"
    );
  };


  /* =========================
     GET DATA
  ========================= */

  useEffect(() => {

    const getData = async () => {

      if (!currentUser) {

        navigate("/login");

        return;

      }


      try {

        /*
          هات الحجز الحالي
        */

        const appointmentResponse =
          await axios.get(
            `http://localhost:3000/appointments/${id}`
          );


        const appointmentData =
          appointmentResponse.data;


        /*
          نتأكد إن الحجز
          ملك المستخدم الحالي
        */

        if (
          String(appointmentData.userId) !==
          String(currentUser.id)
        ) {

          setError(
            "You are not allowed to edit this appointment."
          );

          return;

        }


        /*
          نسمح بإعادة الجدولة فقط
          للحجز Pending أو Confirmed
        */

        if (
          appointmentData.status !==
            "pending" &&
          appointmentData.status !==
            "confirmed"
        ) {

          setError(
            "Only pending or confirmed appointments can be rescheduled."
          );

          return;

        }


        /*
          هات كل الجداول
        */

        const schedulesResponse =
          await axios.get(
            "http://localhost:3000/schedules"
          );


        /*
          هات كل الحجوزات
        */

        const appointmentsResponse =
          await axios.get(
            "http://localhost:3000/appointments"
          );


        /*
          مواعيد الدكتور الحالي فقط
        */

        const doctorSchedules =
          schedulesResponse.data.filter(
            (schedule) => {

              if (
                String(schedule.doctorId) !==
                String(appointmentData.doctorId)
              ) {
                return false;
              }


              if (
                schedule.date < today
              ) {
                return false;
              }


              return schedule.times.some(
                (scheduleTime) => {
                  return (
                    !isPastSlot(
                      schedule.date,
                      scheduleTime
                    )
                  );
                }
              );

            }
          );


        /*
          تخزين البيانات
        */

        setAppointment(
          appointmentData
        );

        setSchedules(
          doctorSchedules
        );

        setAppointments(
          appointmentsResponse.data
        );


        /*
          خلي التاريخ والوقت الحاليين
          Selected افتراضيًا
        */

        const currentSchedule =
          doctorSchedules.find(
            (schedule) => {
              return (
                schedule.date ===
                appointmentData.date
              );
            }
          );


        const currentSlotStillValid =
          currentSchedule &&
          currentSchedule.times.includes(
            appointmentData.time
          ) &&
          !isPastSlot(
            appointmentData.date,
            appointmentData.time
          );


        setSelectedDate(
          currentSlotStillValid
            ? appointmentData.date
            : ""
        );

        setSelectedTime(
          currentSlotStillValid
            ? appointmentData.time
            : ""
        );


      } catch (error) {

        console.log(error);

        setError(
          "Appointment not found."
        );


      } finally {

        setLoading(false);

      }

    };


    getData();

  }, [id]);


  /* =========================
     SELECTED SCHEDULE
  ========================= */

  const selectedSchedule =
    schedules.find((schedule) => {

      return (
        schedule.date ===
        selectedDate
      );

    });


  /* =========================
     OTHER BOOKINGS
  ========================= */

  const otherBookedAppointments =
    appointments.filter(
      (item) => {

        return (

          /*
            نفس الدكتور
          */

          String(item.doctorId) ===
          String(appointment?.doctorId)

          &&

          /*
            نفس اليوم
          */

          item.date ===
          selectedDate

          &&

          /*
            مش الحجز الحالي
          */

          String(item.id) !==
          String(id)

          &&

          /*
            الحجز الفعّال فقط
          */

          isActiveAppointment(
            item
          )

        );

      }
    );


  /* =========================
     BOOKED TIMES
  ========================= */

  const bookedTimes =
    otherBookedAppointments.map(
      (item) => {

        return item.time;

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
            !bookedTimes.includes(time) &&
            !isPastSlot(
              selectedDate,
              time
            )
          );

        }
      );

  }


  /* =========================
     SELECT DATE
  ========================= */

  const handleDateChange = (date) => {

    if (date < today) {
      return;
    }


    setSelectedDate(date);

    /*
      لما يغير اليوم
      نشيل الساعة القديمة
    */

    setSelectedTime("");

  };


  /* =========================
     SAVE RESCHEDULE
  ========================= */

  const handleSave = async () => {

    if (
      selectedDate === "" ||
      selectedTime === ""
    ) {

      alert(
        "Please select date and time."
      );

      return;

    }


    if (
      selectedDate < today ||
      isPastSlot(
        selectedDate,
        selectedTime
      )
    ) {

      alert(
        "Past appointment times cannot be selected."
      );

      return;

    }


    if (
      appointment &&
      appointment.date ===
        selectedDate &&
      appointment.time ===
        selectedTime
    ) {

      alert(
        "Please choose a different date or time."
      );

      return;

    }


    try {

      setSaving(true);


      /*
        Server-side style recheck:
        قبل الحفظ نجيب أحدث نسخة من
        الحجز والجداول وكل الحجوزات.
      */

      const [
        latestAppointmentResponse,
        schedulesResponse,
        appointmentsResponse
      ] = await Promise.all([

        axios.get(
          `http://localhost:3000/appointments/${id}`
        ),

        axios.get(
          "http://localhost:3000/schedules"
        ),

        axios.get(
          "http://localhost:3000/appointments"
        )

      ]);


      const latestAppointment =
        latestAppointmentResponse.data;


      if (
        String(latestAppointment.userId) !==
        String(currentUser.id)
      ) {

        alert(
          "You are not allowed to edit this appointment."
        );

        return;

      }


      if (
        latestAppointment.status !==
          "pending" &&
        latestAppointment.status !==
          "confirmed"
      ) {

        alert(
          "This appointment can no longer be rescheduled."
        );

        return;

      }


      if (
        selectedDate < today ||
        isPastSlot(
          selectedDate,
          selectedTime
        )
      ) {

        alert(
          "This appointment time is already in the past."
        );

        return;

      }


      const latestSchedule =
        schedulesResponse.data.find(
          (schedule) => {

            return (
              String(schedule.doctorId) ===
                String(
                  latestAppointment.doctorId
                ) &&
              schedule.date ===
                selectedDate
            );

          }
        );


      if (
        !latestSchedule ||
        !latestSchedule.times.includes(
          selectedTime
        )
      ) {

        alert(
          "This appointment slot is no longer available."
        );

        return;

      }


      const slotAlreadyBooked =
        appointmentsResponse.data.some(
          (item) => {

            return (
              String(item.doctorId) ===
                String(
                  latestAppointment.doctorId
                ) &&
              item.date ===
                selectedDate &&
              item.time ===
                selectedTime &&
              String(item.id) !==
                String(id) &&
              isActiveAppointment(
                item
              )
            );

          }
        );


      if (slotAlreadyBooked) {

        alert(
          "This appointment slot was just booked. Please choose another time."
        );

        setAppointments(
          appointmentsResponse.data
        );

        return;

      }


      const oldDate =
        latestAppointment.date;

      const oldTime =
        latestAppointment.time;


      await axios.patch(
        `http://localhost:3000/appointments/${id}`,
        {
          date:
            selectedDate,

          time:
            selectedTime
        }
      );


      /*
        Notify doctor about reschedule.
        لو الإشعار فشل، التعديل نفسه يفضل ناجح.
      */

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
              "appointment_rescheduled",

            title:
              "Appointment Rescheduled",

            message:
              `${latestAppointment.patientName} changed the appointment from ${oldDate} ${oldTime} to ${selectedDate} ${selectedTime}.`,

            appointmentId:
              latestAppointment.id,

            link:
              "/doctor/dashboard"
          });

        }

      } catch (
        notificationError
      ) {

        console.log(
          "RESCHEDULE NOTIFICATION ERROR:",
          notificationError
        );

      }


      /*
        بعد نجاح التعديل
        ارجع My Appointments
      */

      navigate(
        "/appointments"
      );


    } catch (error) {

      console.log(error);

      alert(
        "Unable to reschedule appointment."
      );


    } finally {

      setSaving(false);

    }

  };


  /* =========================
     LOADING
  ========================= */

  if (loading) {

    return (

      <div className="appointments-message">
        Loading appointment...
      </div>

    );

  }


  /* =========================
     ERROR
  ========================= */

  if (error) {

    return (

      <main className="reschedule-page">

        <div className="section-container">

          <div className="reschedule-error">

            <div>
              ⚠️
            </div>

            <h2>
              Unable to Edit Appointment
            </h2>

            <p>
              {error}
            </p>

            <Link
              to="/appointments"
            >
              Back to My Appointments
            </Link>

          </div>

        </div>

      </main>

    );

  }


  return (

    <main className="reschedule-page">

      <div className="section-container">


        {/* BACK */}

        <Link
          to="/appointments"
          className="doctor-profile-back"
        >
          ← Back to My Appointments
        </Link>


        {/* =========================
            PAGE HEADER
        ========================= */}

        <div className="reschedule-heading">

          <span>
            RESCHEDULE APPOINTMENT
          </span>

          <h1>
            Choose a New Appointment
          </h1>

          <p>
            Select another available date and time.
          </p>

        </div>


        {/* =========================
            LAYOUT
        ========================= */}

        <div className="reschedule-layout">


          {/* =========================
              APPOINTMENT INFO
          ========================= */}

          <div className="reschedule-info-card">

            <div className="reschedule-info-title">

              <div>
                🩺
              </div>

              <div>

                <span>
                  YOUR APPOINTMENT
                </span>

                <h2>
                  {appointment.doctorName}
                </h2>

              </div>

            </div>


            <div className="reschedule-current">

              <div>

                <span>
                  Current Date
                </span>

                <strong>
                  {appointment.date}
                </strong>

              </div>


              <div>

                <span>
                  Current Time
                </span>

                <strong>
                  {appointment.time}
                </strong>

              </div>


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
                  Consultation Fee
                </span>

                <strong>
                  {appointment.fee} EGP
                </strong>

              </div>

            </div>

          </div>


          {/* =========================
              RESCHEDULE CARD
          ========================= */}

          <div className="reschedule-booking-card">


            {/* DATES */}

            <div className="booking-group">

              <label>
                Choose Date
              </label>


              {schedules.length > 0 ? (

                <div className="booking-days">

                  {schedules.map(
                    (schedule) => (

                      <button
                        type="button"
                        key={schedule.id}
                        className={
                          selectedDate ===
                          schedule.date
                            ? "booking-day active"
                            : "booking-day"
                        }
                        onClick={() =>
                          handleDateChange(
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
                Choose Time
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
                          setSelectedTime(
                            time
                          )
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


            {/* NEW APPOINTMENT SUMMARY */}

            <div className="reschedule-summary">

              <span>
                NEW APPOINTMENT
              </span>


              <div>

                <p>
                  Date
                </p>

                <strong>
                  {selectedDate ||
                    "Not selected"}
                </strong>

              </div>


              <div>

                <p>
                  Time
                </p>

                <strong>
                  {selectedTime ||
                    "Not selected"}
                </strong>

              </div>

            </div>


            {/* SAVE */}

            <button
              type="button"
              className="reschedule-save-btn"
              onClick={handleSave}
              disabled={
                !selectedDate ||
                !selectedTime ||
                saving
              }
            >

              {saving
                ? "Saving Changes..."
                : "Save New Appointment"
              }

            </button>


            <Link
              to="/appointments"
              className="reschedule-cancel-btn"
            >
              Keep Current Appointment
            </Link>

          </div>

        </div>

      </div>

    </main>

  );
}


export default EditAppointment;