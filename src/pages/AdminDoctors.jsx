import { useEffect, useState } from "react";
import { Link } from "react-router";
import axios from "axios";

function AdminDoctors() {

  /* ========================================
     DATA STATES
  ======================================== */

  const [doctors, setDoctors] = useState([]);
  const [users, setUsers] = useState([]);
  const [appointments, setAppointments] = useState([]);
  const [schedules, setSchedules] = useState([]);

  const [loading, setLoading] = useState(true);

  const [modalOpen, setModalOpen] = useState(false);

  const [editingDoctor, setEditingDoctor] = useState(null);

  const [editingAccountId, setEditingAccountId] =
    useState(null);

  const [saving, setSaving] = useState(false);

  const [error, setError] = useState("");

  const [success, setSuccess] = useState("");


  /* ========================================
     FORM STATES
  ======================================== */

  const [name, setName] = useState("");

  const [specialty, setSpecialty] = useState("");

  const [location, setLocation] = useState("");

  const [fee, setFee] = useState("");

  const [image, setImage] = useState("");

  const [email, setEmail] = useState("");

  const [phone, setPhone] = useState("");

  const [password, setPassword] = useState("");

  const [available, setAvailable] = useState(true);


  /* ========================================
     GET DATA
  ======================================== */

  const getData = async () => {

    try {

      const doctorsResponse = await axios.get(
        "http://localhost:3000/doctors"
      );


      const usersResponse = await axios.get(
        "http://localhost:3000/users"
      );


      const appointmentsResponse = await axios.get(
        "http://localhost:3000/appointments"
      );


      const schedulesResponse = await axios.get(
        "http://localhost:3000/schedules"
      );


      setDoctors(
        doctorsResponse.data
      );


      setUsers(
        usersResponse.data
      );


      setAppointments(
        appointmentsResponse.data
      );


      setSchedules(
        schedulesResponse.data
      );


    } catch (error) {

      console.log(
        "GET DATA ERROR:",
        error
      );


      setError(
        "Unable to load doctors."
      );


    } finally {

      setLoading(false);

    }

  };


  useEffect(() => {

    getData();

  }, []);


  /* ========================================
     RESET FORM
  ======================================== */

  const resetForm = () => {

    setName("");

    setSpecialty("");

    setLocation("");

    setFee("");

    setImage("");

    setEmail("");

    setPhone("");

    setPassword("");

    setAvailable(true);

    setEditingDoctor(null);

    setEditingAccountId(null);

    setError("");

  };


  /* ========================================
     GET DOCTOR ACCOUNT
  ======================================== */

  const getDoctorAccount = (
    doctorId
  ) => {

    return users.find((user) => {

      return (
        user.role === "doctor" &&
        String(user.doctorId) ===
          String(doctorId)
      );

    });

  };


  /* ========================================
     OPEN ADD
  ======================================== */

  const openAddDoctor = () => {

    resetForm();

    setSuccess("");

    setModalOpen(true);

  };


  /* ========================================
     OPEN EDIT
  ======================================== */

  const openEditDoctor = (doctor) => {

    setError("");

    setSuccess("");


    const doctorAccount =
      getDoctorAccount(
        doctor.id
      );


    setEditingDoctor(
      doctor
    );


    if (doctorAccount) {

      setEditingAccountId(
        doctorAccount.id
      );

    } else {

      setEditingAccountId(null);

    }


    setName(
      doctor.name || ""
    );


    setSpecialty(
      doctor.specialty || ""
    );


    setLocation(
      doctor.location || ""
    );


    setFee(
      doctor.fee || ""
    );


    setImage(
      doctor.image || ""
    );


    setAvailable(
      doctor.available !== false
    );


    if (doctorAccount) {

      setEmail(
        doctorAccount.email || ""
      );


      setPhone(
        doctorAccount.phone || ""
      );

    } else {

      setEmail("");

      setPhone("");

    }


    /*
      في التعديل نخلي Password فاضي.

      لو المستخدم سابه فاضي
      الباسورد القديم يفضل كما هو.
    */

    setPassword("");


    setModalOpen(true);

  };


  /* ========================================
     CLOSE MODAL
  ======================================== */

  const closeModal = () => {

    setModalOpen(false);

    resetForm();

  };


  /* ========================================
     IMAGE UPLOAD
     RESIZE + COMPRESS
  ======================================== */

  const handleImageChange = (
    event
  ) => {

    setError("");


    const file =
      event.target.files[0];


    if (!file) {

      return;

    }


    /* ==============================
       CHECK IMAGE TYPE
    ============================== */

    if (
      !file.type.startsWith(
        "image/"
      )
    ) {

      setError(
        "Please select an image file."
      );

      event.target.value = "";

      return;

    }


    /* ==============================
       MAX ORIGINAL FILE SIZE 10MB
    ============================== */

    if (
      file.size >
      10 * 1024 * 1024
    ) {

      setError(
        "Original image must be less than 10MB."
      );

      event.target.value = "";

      return;

    }


    /* ==============================
       FILE READER
    ============================== */

    const reader =
      new FileReader();


    reader.onload = (
      readerEvent
    ) => {

      const img =
        new Image();


      img.onload = () => {

        /* ==========================
           MAX DIMENSIONS
        ========================== */

        const maxWidth = 500;

        const maxHeight = 500;


        let width =
          img.width;

        let height =
          img.height;


        /*
          لو الصورة أكبر من
          500 × 500

          نصغرها مع المحافظة
          على النسبة.
        */

        if (
          width > maxWidth ||
          height > maxHeight
        ) {

          const ratio =
            Math.min(
              maxWidth / width,
              maxHeight / height
            );


          width =
            Math.round(
              width * ratio
            );


          height =
            Math.round(
              height * ratio
            );

        }


        /* ==========================
           CREATE CANVAS
        ========================== */

        const canvas =
          document.createElement(
            "canvas"
          );


        canvas.width =
          width;

        canvas.height =
          height;


        const context =
          canvas.getContext(
            "2d"
          );


        /* ==========================
           WHITE BACKGROUND
        ========================== */

        context.fillStyle =
          "#ffffff";


        context.fillRect(
          0,
          0,
          width,
          height
        );


        /* ==========================
           DRAW IMAGE
        ========================== */

        context.drawImage(
          img,
          0,
          0,
          width,
          height
        );


        /* ==========================
           COMPRESS TO JPEG
        ========================== */

        const compressedImage =
          canvas.toDataURL(
            "image/jpeg",
            0.7
          );


        /*
          الصورة دي هي اللي
          هتتحفظ في db.json
        */

        setImage(
          compressedImage
        );

      };


      img.onerror = () => {

        setError(
          "Unable to read this image."
        );

      };


      img.src =
        readerEvent.target.result;

    };


    reader.onerror = () => {

      setError(
        "Unable to read image file."
      );

    };


    reader.readAsDataURL(
      file
    );

  };


  /* ========================================
     SAVE DOCTOR
  ======================================== */

  const handleSubmit =
    async (event) => {

      event.preventDefault();


      setError("");

      setSuccess("");


      /* ====================================
         VALIDATION
      ==================================== */

      if (
        name.trim() === "" ||
        specialty.trim() === "" ||
        location.trim() === "" ||
        fee === "" ||
        email.trim() === "" ||
        phone.trim() === ""
      ) {

        setError(
          "Please complete all required fields."
        );

        return;

      }


      /* ==============================
         IMAGE REQUIRED
         FOR NEW DOCTOR
      ============================== */

      if (
        !editingDoctor &&
        image === ""
      ) {

        setError(
          "Please upload doctor photo."
        );

        return;

      }


      /* ==============================
         PASSWORD REQUIRED
         FOR NEW DOCTOR
      ============================== */

      if (
        !editingDoctor &&
        password.trim() === ""
      ) {

        setError(
          "Password is required for new doctor."
        );

        return;

      }


      /*
        دكتور موجود
        لكن مفيش Account مرتبط به
      */

      if (
        editingDoctor &&
        !editingAccountId &&
        password.trim() === ""
      ) {

        setError(
          "Password is required to create doctor account."
        );

        return;

      }


      /* ====================================
         CHECK EMAIL
      ==================================== */

      const emailExists =
        users.find((user) => {

          return (

            user.email
              ?.toLowerCase()
              .trim() ===
            email
              .toLowerCase()
              .trim()

            &&

            String(user.id) !==
            String(editingAccountId)

          );

        });


      if (emailExists) {

        setError(
          "This email is already registered."
        );

        return;

      }


      try {

        setSaving(true);


        /* ==================================
           EDIT DOCTOR
        ================================== */

        if (editingDoctor) {

          const doctorResponse =
            await axios.patch(

              `http://localhost:3000/doctors/${editingDoctor.id}`,

              {
                name:
                  name.trim(),

                specialty:
                  specialty.trim(),

                location:
                  location.trim(),

                fee:
                  Number(fee),

                image:
                  image,

                available:
                  available
              }

            );


          /* ================================
             DOCTOR ALREADY HAS ACCOUNT
          ================================ */

          if (editingAccountId) {

            const accountData = {

              name:
                name.trim(),

              email:
                email
                  .trim()
                  .toLowerCase(),

              phone:
                phone.trim(),

              role:
                "doctor",

              doctorId:
                doctorResponse.data.id

            };


            /*
              نغير Password فقط
              لو كتب Password جديد
            */

            if (
              password.trim() !== ""
            ) {

              accountData.password =
                password;

            }


            await axios.patch(

              `http://localhost:3000/users/${editingAccountId}`,

              accountData

            );


          } else {

            /* ================================
               CREATE MISSING DOCTOR ACCOUNT
            ================================ */

            await axios.post(

              "http://localhost:3000/users",

              {
                name:
                  name.trim(),

                email:
                  email
                    .trim()
                    .toLowerCase(),

                phone:
                  phone.trim(),

                password:
                  password,

                role:
                  "doctor",

                doctorId:
                  doctorResponse.data.id
              }

            );

          }


          setSuccess(
            "Doctor updated successfully."
          );


        } else {

          /* ==================================
             CREATE NEW DOCTOR
          ================================== */

          let createdDoctor = null;


          try {

            const doctorResponse =
              await axios.post(

                "http://localhost:3000/doctors",

                {
                  name:
                    name.trim(),

                  specialty:
                    specialty.trim(),

                  location:
                    location.trim(),

                  fee:
                    Number(fee),

                  rating:
                    0,

                  reviews:
                    0,

                  image:
                    image,

                  available:
                    available
                }

              );


            createdDoctor =
              doctorResponse.data;


            /* ================================
               CREATE DOCTOR LOGIN ACCOUNT
            ================================ */

            await axios.post(

              "http://localhost:3000/users",

              {
                name:
                  name.trim(),

                email:
                  email
                    .trim()
                    .toLowerCase(),

                phone:
                  phone.trim(),

                password:
                  password,

                role:
                  "doctor",

                doctorId:
                  createdDoctor.id
              }

            );


          } catch (createError) {

            /*
              لو Doctor اتضاف لكن
              Account فشل

              نحذف الدكتور تاني
              عشان ميبقاش عندنا
              Doctor بدون Account.
            */

            if (
              createdDoctor
            ) {

              try {

                await axios.delete(
                  `http://localhost:3000/doctors/${createdDoctor.id}`
                );

              } catch (
                rollbackError
              ) {

                console.log(
                  "ROLLBACK ERROR:",
                  rollbackError
                );

              }

            }


            throw createError;

          }


          setSuccess(
            "Doctor and login account created successfully."
          );

        }


        /* ==================================
           RELOAD DATA
        ================================== */

        await getData();


        /* ==================================
           CLOSE MODAL
        ================================== */

        setModalOpen(false);


        resetForm();


      } catch (error) {

        console.log(
          "SAVE DOCTOR ERROR:",
          error
        );


        /*
          لو Server رجع Error
        */

        if (
          error.response
        ) {

          console.log(
            "SERVER RESPONSE:",
            error.response.data
          );


          setError(
            `Unable to save doctor. Server error: ${error.response.status}`
          );


        } else if (
          error.request
        ) {

          /*
            Request خرج
            لكن مفيش Response
          */

          setError(
            "Unable to save doctor. JSON Server is not responding."
          );


        } else {

          setError(
            "Unable to save doctor."
          );

        }


      } finally {

        setSaving(false);

      }

    };


  /* ========================================
     TOGGLE AVAILABILITY
  ======================================== */

  const toggleAvailability =
    async (doctor) => {

      try {

        const newStatus =
          !doctor.available;


        await axios.patch(

          `http://localhost:3000/doctors/${doctor.id}`,

          {
            available:
              newStatus
          }

        );


        const updatedDoctors =
          doctors.map((item) => {

            if (
              String(item.id) ===
              String(doctor.id)
            ) {

              return {

                ...item,

                available:
                  newStatus

              };

            }


            return item;

          });


        setDoctors(
          updatedDoctors
        );


      } catch (error) {

        console.log(error);


        alert(
          "Unable to change doctor status."
        );

      }

    };


  /* ========================================
     DELETE DOCTOR
  ======================================== */

  const handleDeleteDoctor =
    async (doctor) => {

      /*
        لو الدكتور عنده
        Appointment History

        مش هنحذفه.
      */

      const hasAppointments =
        appointments.some(
          (appointment) => {

            return (

              String(
                appointment.doctorId
              ) ===

              String(
                doctor.id
              )

            );

          }
        );


      if (hasAppointments) {

        alert(
          "This doctor has appointment history. Set the doctor as unavailable instead of deleting."
        );

        return;

      }


      const confirmDelete =
        window.confirm(
          `Delete ${doctor.name}?`
        );


      if (!confirmDelete) {

        return;

      }


      try {

        /* ==============================
           DOCTOR ACCOUNT
        ============================== */

        const doctorAccount =
          getDoctorAccount(
            doctor.id
          );


        /* ==============================
           DOCTOR SCHEDULES
        ============================== */

        const doctorSchedules =
          schedules.filter(
            (schedule) => {

              return (

                String(
                  schedule.doctorId
                ) ===

                String(
                  doctor.id
                )

              );

            }
          );


        /* ==============================
           DELETE SCHEDULES
        ============================== */

        for (
          const schedule
          of doctorSchedules
        ) {

          await axios.delete(

            `http://localhost:3000/schedules/${schedule.id}`

          );

        }


        /* ==============================
           DELETE LOGIN ACCOUNT
        ============================== */

        if (doctorAccount) {

          await axios.delete(

            `http://localhost:3000/users/${doctorAccount.id}`

          );

        }


        /* ==============================
           DELETE DOCTOR PROFILE
        ============================== */

        await axios.delete(

          `http://localhost:3000/doctors/${doctor.id}`

        );


        /* ==============================
           RELOAD
        ============================== */

        await getData();


        setSuccess(
          "Doctor deleted successfully."
        );


      } catch (error) {

        console.log(
          "DELETE DOCTOR ERROR:",
          error
        );


        alert(
          "Unable to delete doctor."
        );

      }

    };


  /* ========================================
     COUNTERS
  ======================================== */

  const activeDoctors =
    doctors.filter((doctor) => {

      return (
        doctor.available === true
      );

    });


  const doctorAccounts =
    users.filter((user) => {

      return (
        user.role === "doctor"
      );

    });


  /* ========================================
     LOADING
  ======================================== */

  if (loading) {

    return (

      <div className="admin-dashboard-message">

        Loading doctors...

      </div>

    );

  }


  /* ========================================
     PAGE
  ======================================== */

  return (

    <main className="admin-doctors-page">

      <div className="section-container">


        {/* ==================================
            BACK
        ================================== */}

        <Link
          to="/admin/dashboard"
          className="doctor-profile-back"
        >

          ← Back to Admin Dashboard

        </Link>


        {/* ==================================
            HEADER
        ================================== */}

        <div className="admin-doctors-header">


          <div>

            <span>
              ADMIN / DOCTORS
            </span>

            <h1>
              Manage Doctors
            </h1>

            <p>
              Add, edit and manage doctor
              profiles and login accounts.
            </p>

          </div>


          <button
            type="button"
            className="admin-add-doctor-btn"
            onClick={
              openAddDoctor
            }
          >

            + Add Doctor

          </button>


        </div>


        {/* ==================================
            STATS
        ================================== */}

        <div className="admin-doctors-stats">


          <div>

            <span>
              Total Doctors
            </span>

            <strong>
              {doctors.length}
            </strong>

          </div>


          <div>

            <span>
              Active Doctors
            </span>

            <strong>
              {activeDoctors.length}
            </strong>

          </div>


          <div>

            <span>
              Doctor Accounts
            </span>

            <strong>
              {doctorAccounts.length}
            </strong>

          </div>


        </div>


        {/* ==================================
            SUCCESS
        ================================== */}

        {success && (

          <div className="admin-doctors-success">

            ✓ {success}

          </div>

        )}


        {/* ==================================
            DOCTORS DIRECTORY
        ================================== */}

        <section className="admin-doctors-section">


          <div className="admin-doctors-section-title">

            <div>

              <span>
                DOCTORS
              </span>

              <h2>
                Doctor Directory
              </h2>

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
                Add your first doctor.
              </p>

            </div>

          ) : (

            <div className="admin-doctors-table">


              {/* ==========================
                  TABLE HEADER
              ========================== */}

              <div className="admin-doctor-row admin-doctor-table-head">

                <div>
                  Doctor
                </div>

                <div>
                  Specialty
                </div>

                <div>
                  Location
                </div>

                <div>
                  Fee
                </div>

                <div>
                  Account
                </div>

                <div>
                  Status
                </div>

                <div>
                  Actions
                </div>

              </div>


              {/* ==========================
                  DOCTORS
              ========================== */}

              {doctors.map((doctor) => {

                const doctorAccount =
                  getDoctorAccount(
                    doctor.id
                  );


                return (

                  <div
                    className="admin-doctor-row"
                    key={doctor.id}
                  >


                    {/* DOCTOR */}

                    <div className="admin-doctor-main">


                      {doctor.image ? (

                        <img
                          src={
                            doctor.image
                          }
                          alt={
                            doctor.name
                          }
                        />

                      ) : (

                        <div className="admin-doctor-no-image">
                          🩺
                        </div>

                      )}


                      <div>

                        <strong>
                          {doctor.name}
                        </strong>

                        <span>
                          ID: {doctor.id}
                        </span>

                      </div>


                    </div>


                    {/* SPECIALTY */}

                    <div className="admin-doctor-cell">

                      <span>
                        Specialty
                      </span>

                      <strong>
                        {doctor.specialty}
                      </strong>

                    </div>


                    {/* LOCATION */}

                    <div className="admin-doctor-cell">

                      <span>
                        Location
                      </span>

                      <strong>
                        {doctor.location}
                      </strong>

                    </div>


                    {/* FEE */}

                    <div className="admin-doctor-cell">

                      <span>
                        Fee
                      </span>

                      <strong>
                        {doctor.fee} EGP
                      </strong>

                    </div>


                    {/* ACCOUNT */}

                    <div className="admin-doctor-account">


                      {doctorAccount ? (

                        <>

                          <span className="doctor-account-connected">

                            ● Account Connected

                          </span>


                          <small>

                            {
                              doctorAccount.email
                            }

                          </small>

                        </>

                      ) : (

                        <span className="doctor-account-missing">

                          No Login Account

                        </span>

                      )}


                    </div>


                    {/* STATUS */}

                    <div>

                      <button
                        type="button"
                        className={
                          doctor.available
                            ? "doctor-availability active"
                            : "doctor-availability inactive"
                        }
                        onClick={() =>
                          toggleAvailability(
                            doctor
                          )
                        }
                      >

                        {doctor.available
                          ? "Available"
                          : "Unavailable"
                        }

                      </button>

                    </div>


                    {/* ACTIONS */}

                    <div className="admin-doctor-actions">


                      <button
                        type="button"
                        className="admin-doctor-edit"
                        onClick={() =>
                          openEditDoctor(
                            doctor
                          )
                        }
                      >

                        Edit

                      </button>


                      <button
                        type="button"
                        className="admin-doctor-delete"
                        onClick={() =>
                          handleDeleteDoctor(
                            doctor
                          )
                        }
                      >

                        Delete

                      </button>


                    </div>


                  </div>

                );

              })}


            </div>

          )}


        </section>


      </div>


      {/* ====================================
          ADD / EDIT MODAL
      ==================================== */}

      {modalOpen && (

        <div className="admin-doctor-modal-overlay">


          <div className="admin-doctor-modal">


            {/* ==============================
                HEADER
            ============================== */}

            <div className="admin-doctor-modal-header">


              <div>

                <span>

                  {editingDoctor
                    ? "EDIT DOCTOR"
                    : "NEW DOCTOR"
                  }

                </span>


                <h2>

                  {editingDoctor
                    ? "Update Doctor"
                    : "Add New Doctor"
                  }

                </h2>

              </div>


              <button
                type="button"
                onClick={
                  closeModal
                }
              >

                ×

              </button>


            </div>


            {/* ==============================
                FORM
            ============================== */}

            <form
              className="admin-doctor-form"
              onSubmit={
                handleSubmit
              }
            >


              {/* ============================
                  DOCTOR INFORMATION
              ============================ */}

              <div className="admin-form-section-title">

                Doctor Information

              </div>


              <div className="admin-doctor-form-grid">


                {/* NAME */}

                <div className="admin-doctor-form-group">

                  <label>
                    Doctor Name *
                  </label>

                  <input
                    type="text"
                    value={name}
                    placeholder="Dr. Mohamed Ali"
                    onChange={(event) =>
                      setName(
                        event.target.value
                      )
                    }
                  />

                </div>


                {/* SPECIALTY */}

                <div className="admin-doctor-form-group">

                  <label>
                    Specialty *
                  </label>

                  <input
                    type="text"
                    value={specialty}
                    placeholder="Cardiology"
                    onChange={(event) =>
                      setSpecialty(
                        event.target.value
                      )
                    }
                  />

                </div>


                {/* LOCATION */}

                <div className="admin-doctor-form-group">

                  <label>
                    Location *
                  </label>

                  <input
                    type="text"
                    value={location}
                    placeholder="New Cairo"
                    onChange={(event) =>
                      setLocation(
                        event.target.value
                      )
                    }
                  />

                </div>


                {/* FEE */}

                <div className="admin-doctor-form-group">

                  <label>
                    Consultation Fee *
                  </label>

                  <input
                    type="number"
                    min="0"
                    value={fee}
                    placeholder="500"
                    onChange={(event) =>
                      setFee(
                        event.target.value
                      )
                    }
                  />

                </div>


                {/* ==========================
                    DOCTOR PHOTO
                ========================== */}

                <div className="admin-doctor-form-group admin-form-full">

                  <label>
                    Doctor Photo *
                  </label>


                  <div className="doctor-image-upload">


                    {/* IMAGE PREVIEW */}

                    {image ? (

                      <div className="doctor-image-preview">


                        <img
                          src={image}
                          alt="Doctor Preview"
                        />


                        <button
                          type="button"
                          onClick={() =>
                            setImage("")
                          }
                        >

                          Remove

                        </button>


                      </div>

                    ) : (

                      <div className="doctor-image-placeholder">

                        🩺

                      </div>

                    )}


                    {/* CHOOSE FILE */}

                    <div className="doctor-image-upload-control">


                      <input
                        type="file"
                        accept="image/jpeg,image/png,image/webp"
                        onChange={
                          handleImageChange
                        }
                      />


                      <small>

                        Select JPG, PNG or WEBP.
                        The image will be resized
                        and compressed automatically.

                      </small>


                    </div>


                  </div>

                </div>


              </div>


              {/* ============================
                  LOGIN ACCOUNT
              ============================ */}

              <div className="admin-form-section-title">

                Doctor Login Account

              </div>


              <div className="admin-doctor-form-grid">


                {/* EMAIL */}

                <div className="admin-doctor-form-group">

                  <label>
                    Email *
                  </label>

                  <input
                    type="email"
                    value={email}
                    placeholder="doctor@medibook.com"
                    onChange={(event) =>
                      setEmail(
                        event.target.value
                      )
                    }
                  />

                </div>


                {/* PHONE */}

                <div className="admin-doctor-form-group">

                  <label>
                    Phone *
                  </label>

                  <input
                    type="text"
                    value={phone}
                    placeholder="01000000000"
                    onChange={(event) =>
                      setPhone(
                        event.target.value
                      )
                    }
                  />

                </div>


                {/* PASSWORD */}

                <div className="admin-doctor-form-group admin-form-full">

                  <label>

                    {editingDoctor
                      ? "New Password"
                      : "Password *"
                    }

                  </label>


                  <input
                    type="password"
                    value={password}
                    placeholder={
                      editingDoctor
                        ? "Leave empty to keep current password"
                        : "Enter doctor password"
                    }
                    onChange={(event) =>
                      setPassword(
                        event.target.value
                      )
                    }
                  />


                  {editingDoctor && (

                    <small>

                      Leave it empty
                      if you don't want
                      to change the password.

                    </small>

                  )}


                </div>


                {/* AVAILABLE */}

                <div className="admin-doctor-checkbox admin-form-full">


                  <input
                    id="doctorAvailable"
                    type="checkbox"
                    checked={
                      available
                    }
                    onChange={(event) =>
                      setAvailable(
                        event.target.checked
                      )
                    }
                  />


                  <label htmlFor="doctorAvailable">

                    Doctor is available
                    for booking

                  </label>


                </div>


              </div>


              {/* ============================
                  ERROR
              ============================ */}

              {error && (

                <div className="admin-doctor-form-error">

                  {error}

                </div>

              )}


              {/* ============================
                  BUTTONS
              ============================ */}

              <div className="admin-doctor-modal-actions">


                <button
                  type="button"
                  className="admin-modal-cancel"
                  onClick={
                    closeModal
                  }
                >

                  Cancel

                </button>


                <button
                  type="submit"
                  className="admin-modal-save"
                  disabled={
                    saving
                  }
                >

                  {saving
                    ? "Saving..."
                    : editingDoctor
                      ? "Save Changes"
                      : "Add Doctor"
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

export default AdminDoctors;