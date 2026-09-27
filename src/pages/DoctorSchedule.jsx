import { useEffect, useState } from "react";
import { Link } from "react-router";
import axios from "axios";

function DoctorSchedule() {
  /* =========================
     CURRENT DOCTOR
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

  const [schedules, setSchedules] =
    useState([]);

  const [date, setDate] =
    useState("");

  const [time, setTime] =
    useState("");

  const [times, setTimes] =
    useState([]);

  const [loading, setLoading] =
    useState(true);

  const [saving, setSaving] =
    useState(false);

  const [error, setError] =
    useState("");

  const [success, setSuccess] =
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


  const nowTimeForInput = (() => {
    const now = new Date();

    return `${String(
      now.getHours()
    ).padStart(2, "0")}:${String(
      now.getMinutes()
    ).padStart(2, "0")}`;
  })();


  const isPastSlot = (
    scheduleDate,
    scheduleTime
  ) => {
    if (scheduleDate < today) {
      return true;
    }

    if (scheduleDate > today) {
      return false;
    }

    const slotMinutes =
      timeToMinutes(
        scheduleTime
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
    appointment
  ) => {
    return (
      appointment.status === "pending" ||
      appointment.status === "confirmed"
    );
  };


  const getLatestDoctorAppointments =
    async () => {
      const response =
        await axios.get(
          "http://localhost:3000/appointments"
        );

      return response.data.filter(
        (appointment) => {
          return (
            String(
              appointment.doctorId
            ) ===
            String(
              currentUser.doctorId
            )
          );
        }
      );
    };


  /* =========================
     GET DOCTOR SCHEDULES
  ========================= */

  useEffect(() => {
    const getSchedules = async () => {
      try {
        const response = await axios.get(
          "http://localhost:3000/schedules"
        );


        const doctorSchedules =
          response.data.filter(
            (schedule) => {
              return (
                String(schedule.doctorId) ===
                String(currentUser.doctorId)
              );
            }
          );


        setSchedules(
          doctorSchedules
        );

      } catch (error) {
        console.log(error);

        setError(
          "Unable to load schedules."
        );

      } finally {
        setLoading(false);
      }
    };


    getSchedules();

  }, []);


  /* =========================
     ADD TIME TO TEMP ARRAY
  ========================= */

  const handleAddTime = () => {
    setError("");
    setSuccess("");


    if (date === "") {
      setError(
        "Please select a date first."
      );

      return;
    }


    if (date < today) {
      setError(
        "Past dates cannot be used."
      );

      return;
    }


    if (time === "") {
      setError(
        "Please select a time."
      );

      return;
    }


    if (
      isPastSlot(
        date,
        time
      )
    ) {
      setError(
        "Past times cannot be added."
      );

      return;
    }


    /*
      منع إضافة نفس الوقت مرتين
    */

    if (times.includes(time)) {
      setError(
        "This time already exists."
      );

      return;
    }


    setTimes([
      ...times,
      time
    ]);


    setTime("");
  };


  /* =========================
     REMOVE TEMP TIME
  ========================= */

  const handleRemoveTime = (
    selectedTime
  ) => {
    const newTimes =
      times.filter((item) => {
        return (
          item !== selectedTime
        );
      });


    setTimes(newTimes);
  };


  /* =========================
     SAVE SCHEDULE
  ========================= */

  const handleSaveSchedule =
    async () => {

      setError("");
      setSuccess("");


      if (date === "") {
        setError(
          "Please select a date."
        );

        return;
      }


      if (date < today) {
        setError(
          "Past dates cannot be used."
        );

        return;
      }


      if (times.length === 0) {
        setError(
          "Please add at least one time."
        );

        return;
      }


      const containsPastTime =
        times.some(
          (selectedTime) => {
            return isPastSlot(
              date,
              selectedTime
            );
          }
        );


      if (containsPastTime) {
        setError(
          "One or more selected times are already in the past."
        );

        return;
      }


      /*
        نتأكد إن اليوم مش موجود
        للدكتور قبل كده
      */

      const existingSchedule =
        schedules.find(
          (schedule) => {
            return (
              schedule.date === date
            );
          }
        );


      if (existingSchedule) {
        setError(
          "Schedule for this date already exists."
        );

        return;
      }


      const scheduleData = {
        doctorId:
          currentUser.doctorId,

        date: date,

        times: times
      };


      try {
        setSaving(true);


        const response =
          await axios.post(
            "http://localhost:3000/schedules",
            scheduleData
          );


        setSchedules([
          ...schedules,
          response.data
        ]);


        setDate("");

        setTimes([]);

        setTime("");


        setSuccess(
          "Schedule added successfully."
        );

      } catch (error) {
        console.log(error);

        setError(
          "Unable to save schedule."
        );

      } finally {
        setSaving(false);
      }
    };


  /* =========================
     DELETE FULL DAY
  ========================= */

  const handleDeleteSchedule =
    async (scheduleId) => {

      setError("");
      setSuccess("");


      const selectedSchedule =
        schedules.find(
          (schedule) => {
            return (
              String(schedule.id) ===
              String(scheduleId)
            );
          }
        );


      if (!selectedSchedule) {
        setError(
          "Schedule not found."
        );

        return;
      }


      try {
        /*
          نراجع آخر الحجوزات من السيرفر
          قبل حذف اليوم
        */

        const latestAppointments =
          await getLatestDoctorAppointments();


        const hasActiveAppointments =
          latestAppointments.some(
            (appointment) => {
              return (
                appointment.date ===
                  selectedSchedule.date &&
                isActiveAppointment(
                  appointment
                )
              );
            }
          );


        if (hasActiveAppointments) {
          setError(
            "This day cannot be deleted because it has pending or confirmed appointments."
          );

          return;
        }


        const confirmDelete =
          window.confirm(
            "Delete this schedule?"
          );


        if (!confirmDelete) {
          return;
        }


        await axios.delete(
          `http://localhost:3000/schedules/${scheduleId}`
        );


        const updatedSchedules =
          schedules.filter(
            (schedule) => {
              return (
                String(schedule.id) !==
                String(scheduleId)
              );
            }
          );


        setSchedules(
          updatedSchedules
        );


        setSuccess(
          "Schedule deleted successfully."
        );

      } catch (error) {
        console.log(error);

        setError(
          "Unable to delete schedule."
        );
      }
    };


  /* =========================
     DELETE ONE TIME
  ========================= */

  const handleDeleteTime =
    async (
      schedule,
      selectedTime
    ) => {

      setError("");
      setSuccess("");


      try {
        /*
          نراجع آخر الحجوزات من السيرفر
          قبل حذف الساعة
        */

        const latestAppointments =
          await getLatestDoctorAppointments();


        const hasActiveAppointment =
          latestAppointments.some(
            (appointment) => {
              return (
                appointment.date ===
                  schedule.date &&
                appointment.time ===
                  selectedTime &&
                isActiveAppointment(
                  appointment
                )
              );
            }
          );


        if (hasActiveAppointment) {
          setError(
            `The ${selectedTime} slot cannot be deleted because it has an active appointment.`
          );

          return;
        }


        /*
          نشيل الساعة من array
        */

        const updatedTimes =
          schedule.times.filter(
            (item) => {
              return (
                item !==
                selectedTime
              );
            }
          );


        /*
          لو مفيش ساعات متبقية
          نحذف اليوم كله
        */

        if (
          updatedTimes.length === 0
        ) {
          await handleDeleteSchedule(
            schedule.id
          );

          return;
        }


        const response =
          await axios.patch(
            `http://localhost:3000/schedules/${schedule.id}`,
            {
              times: updatedTimes
            }
          );


        const updatedSchedules =
          schedules.map(
            (item) => {

              if (
                String(item.id) ===
                String(schedule.id)
              ) {
                return response.data;
              }


              return item;
            }
          );


        setSchedules(
          updatedSchedules
        );


        setSuccess(
          "Time removed successfully."
        );

      } catch (error) {
        console.log(error);

        setError(
          "Unable to remove time."
        );
      }
    };


  /* =========================
     LOADING
  ========================= */

  if (loading) {
    return (
      <div className="doctor-dashboard-message">
        Loading schedule...
      </div>
    );
  }


  return (
    <main className="doctor-schedule-page">

      <div className="section-container">


        {/* =========================
            BACK
        ========================= */}

        <Link
          to="/doctor/dashboard"
          className="doctor-profile-back"
        >
          ← Back to Dashboard
        </Link>


        {/* =========================
            HEADER
        ========================= */}

        <div className="doctor-schedule-header">

          <div>

            <span>
              DOCTOR SCHEDULE
            </span>

            <h1>
              Manage Availability
            </h1>

            <p>
              Add available dates and times
              for your patients.
            </p>

          </div>

        </div>


        {/* =========================
            ADD SCHEDULE
        ========================= */}

        <section className="schedule-create-card">

          <div className="schedule-create-title">

            <div>
              📅
            </div>

            <div>

              <span>
                ADD AVAILABILITY
              </span>

              <h2>
                Create New Schedule
              </h2>

            </div>

          </div>


          <div className="schedule-form">


            {/* DATE */}

            <div className="schedule-form-group">

              <label>
                Available Date
              </label>

              <input
                type="date"
                min={today}
                value={date}
                onChange={(event) =>
                  setDate(
                    event.target.value
                  )
                }
              />

            </div>


            {/* TIME */}

            <div className="schedule-form-group">

              <label>
                Available Time
              </label>


              <div className="schedule-time-input">

                <input
                  type="time"
                  min={
                    date === today
                      ? nowTimeForInput
                      : undefined
                  }
                  value={time}
                  onChange={(event) =>
                    setTime(
                      event.target.value
                    )
                  }
                />


                <button
                  type="button"
                  onClick={handleAddTime}
                >
                  Add Time
                </button>

              </div>

            </div>


            {/* TEMP TIMES */}

            {times.length > 0 && (

              <div className="schedule-selected-times">

                <span>
                  Selected Times
                </span>


                <div>

                  {times.map(
                    (selectedTime) => (

                      <button
                        type="button"
                        key={selectedTime}
                        onClick={() =>
                          handleRemoveTime(
                            selectedTime
                          )
                        }
                      >
                        {selectedTime}

                        <b>
                          ×
                        </b>

                      </button>

                    )
                  )}

                </div>

              </div>

            )}


            {/* ERROR */}

            {error && (

              <div className="schedule-error">
                {error}
              </div>

            )}


            {/* SUCCESS */}

            {success && (

              <div className="schedule-success">
                ✓ {success}
              </div>

            )}


            {/* SAVE */}

            <button
              type="button"
              className="schedule-save-btn"
              onClick={
                handleSaveSchedule
              }
              disabled={saving}
            >

              {saving
                ? "Saving..."
                : "Save Schedule"
              }

            </button>

          </div>

        </section>


        {/* =========================
            CURRENT SCHEDULES
        ========================= */}

        <section className="doctor-schedules-section">

          <div className="doctor-schedules-heading">

            <div>

              <span>
                AVAILABILITY
              </span>

              <h2>
                Your Schedules
              </h2>

            </div>


            <strong>
              {schedules.length} Days
            </strong>

          </div>


          {schedules.length === 0 ? (

            <div className="doctor-dashboard-empty">

              <div>
                🗓️
              </div>

              <h3>
                No schedules yet
              </h3>

              <p>
                Add your first available
                date and time.
              </p>

            </div>

          ) : (

            <div className="doctor-schedules-list">


              {schedules.map(
                (schedule) => (

                  <div
                    className="doctor-schedule-card"
                    key={schedule.id}
                  >


                    {/* DATE */}

                    <div className="schedule-date-box">

                      <span>
                        AVAILABLE DATE
                      </span>

                      <strong>
                        {schedule.date}
                      </strong>

                    </div>


                    {/* TIMES */}

                    <div className="schedule-times-box">

                      <span>
                        AVAILABLE TIMES
                      </span>


                      <div>

                        {schedule.times.map(
                          (scheduleTime) => (

                            <div
                              className="schedule-time-tag"
                              key={scheduleTime}
                            >

                              {scheduleTime}


                              <button
                                type="button"
                                onClick={() =>
                                  handleDeleteTime(
                                    schedule,
                                    scheduleTime
                                  )
                                }
                              >
                                ×
                              </button>

                            </div>

                          )
                        )}

                      </div>

                    </div>


                    {/* DELETE DAY */}

                    <button
                      type="button"
                      className="schedule-delete-day"
                      onClick={() =>
                        handleDeleteSchedule(
                          schedule.id
                        )
                      }
                    >
                      Delete Day
                    </button>


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

export default DoctorSchedule;