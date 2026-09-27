import { useEffect, useState } from "react";
import axios from "axios";


function DoctorProfile() {

  /* ========================================
     CURRENT USER
  ======================================== */

  const savedUser =
    localStorage.getItem(
      "currentUser"
    );


  const currentUser =
    savedUser
      ? JSON.parse(savedUser)
      : null;


  /* ========================================
     STATES
  ======================================== */

  const [doctor, setDoctor] =
    useState(null);

  const [loading, setLoading] =
    useState(true);

  const [saving, setSaving] =
    useState(false);

  const [error, setError] =
    useState("");

  const [success, setSuccess] =
    useState("");


  /* ========================================
     FORM
  ======================================== */

  const [name, setName] =
    useState("");

  const [specialty, setSpecialty] =
    useState("");

  const [location, setLocation] =
    useState("");

  const [fee, setFee] =
    useState("");

  const [image, setImage] =
    useState("");

  const [about, setAbout] =
    useState("");

  const [experienceYears, setExperienceYears] =
    useState("");

  const [clinicName, setClinicName] =
    useState("");

  const [clinicAddress, setClinicAddress] =
    useState("");

  const [servicesText, setServicesText] =
    useState("");


  /* ========================================
     GET DOCTOR
  ======================================== */

  useEffect(() => {

    const getDoctor = async () => {

      if (
        !currentUser ||
        !currentUser.doctorId
      ) {

        setError(
          "Doctor account is not connected to a doctor profile."
        );

        setLoading(false);

        return;
      }


      try {

        const response =
          await axios.get(
            `http://localhost:3000/doctors/${currentUser.doctorId}`
          );


        const doctorData =
          response.data;


        setDoctor(
          doctorData
        );


        setName(
          doctorData.name || ""
        );


        setSpecialty(
          doctorData.specialty || ""
        );


        setLocation(
          doctorData.location || ""
        );


        setFee(
          doctorData.fee || ""
        );


        setImage(
          doctorData.image || ""
        );


        setAbout(
          doctorData.about || ""
        );


        setExperienceYears(
          doctorData.experienceYears || ""
        );


        setClinicName(
          doctorData.clinicName || ""
        );


        setClinicAddress(
          doctorData.clinicAddress || ""
        );


        /*
          services في db.json
          هنخزنها Array

          لكن في الفورمة
          كل Service في سطر
        */

        if (
          Array.isArray(
            doctorData.services
          )
        ) {

          setServicesText(
            doctorData.services.join(
              "\n"
            )
          );

        } else {

          setServicesText("");

        }


      } catch (error) {

        console.log(
          "GET DOCTOR PROFILE ERROR:",
          error
        );


        setError(
          "Unable to load doctor profile."
        );


      } finally {

        setLoading(false);

      }

    };


    getDoctor();

  }, []);


  /* ========================================
     IMAGE UPLOAD
  ======================================== */

  const handleImageChange = (
    event
  ) => {

    setError("");
    setSuccess("");


    const file =
      event.target.files[0];


    if (!file) {

      return;

    }


    if (
      !file.type.startsWith(
        "image/"
      )
    ) {

      setError(
        "Please select a valid image."
      );

      event.target.value = "";

      return;

    }


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


    const reader =
      new FileReader();


    reader.onload = (
      readerEvent
    ) => {

      const img =
        new Image();


      img.onload = () => {

        const maxWidth =
          600;

        const maxHeight =
          600;


        let width =
          img.width;

        let height =
          img.height;


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


        context.fillStyle =
          "#ffffff";


        context.fillRect(
          0,
          0,
          width,
          height
        );


        context.drawImage(
          img,
          0,
          0,
          width,
          height
        );


        const compressedImage =
          canvas.toDataURL(
            "image/jpeg",
            0.75
          );


        setImage(
          compressedImage
        );

      };


      img.onerror = () => {

        setError(
          "Unable to process this image."
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
     SAVE PROFILE
  ======================================== */

  const handleSubmit =
    async (event) => {

      event.preventDefault();


      setError("");
      setSuccess("");


      if (
        name.trim() === "" ||
        specialty.trim() === "" ||
        location.trim() === "" ||
        fee === ""
      ) {

        setError(
          "Please complete all required fields."
        );

        return;

      }


      if (
        Number(fee) < 0
      ) {

        setError(
          "Consultation fee is invalid."
        );

        return;

      }


      try {

        setSaving(true);


        /*
          تحويل Services
          من Text إلى Array
        */

        const services =
          servicesText
            .split("\n")
            .map(
              (service) =>
                service.trim()
            )
            .filter(
              (service) =>
                service !== ""
            );


        const response =
          await axios.patch(
            `http://localhost:3000/doctors/${currentUser.doctorId}`,
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

              about:
                about.trim(),

              experienceYears:
                Number(
                  experienceYears || 0
                ),

              clinicName:
                clinicName.trim(),

              clinicAddress:
                clinicAddress.trim(),

              services:
                services
            }
          );


        setDoctor(
          response.data
        );


        /*
          نحدث اسم الدكتور
          في currentUser كمان

          علشان الاسم في الـ Layout
          يتغير فورًا.
        */

        const updatedCurrentUser = {
          ...currentUser,
          name:
            response.data.name
        };


        localStorage.setItem(
          "currentUser",
          JSON.stringify(
            updatedCurrentUser
          )
        );


        window.dispatchEvent(
          new Event(
            "authChanged"
          )
        );


        setSuccess(
          "Profile updated successfully."
        );


      } catch (error) {

        console.log(
          "UPDATE DOCTOR PROFILE ERROR:",
          error
        );


        if (error.response) {

          setError(
            `Unable to update profile. Server error: ${error.response.status}`
          );

        } else {

          setError(
            "Unable to update doctor profile."
          );

        }


      } finally {

        setSaving(false);

      }

    };


  /* ========================================
     LOADING
  ======================================== */

  if (loading) {

    return (

      <div className="doctor-profile-loading">

        Loading doctor profile...

      </div>

    );

  }


  /* ========================================
     LOAD ERROR
  ======================================== */

  if (
    error &&
    !doctor
  ) {

    return (

      <div className="doctor-profile-loading">

        {error}

      </div>

    );

  }


  /* ========================================
     PAGE
  ======================================== */

  return (

    <main className="doctor-profile-management">

      <style>
        {`

          .doctor-profile-management {
            padding: 32px;
          }

          .doctor-profile-management-container {
            width: 100%;
            max-width: 1050px;
            margin: 0 auto;
          }

          .doctor-profile-management-header {
            margin-bottom: 25px;
          }

          .doctor-profile-management-header span {
            display: block;
            margin-bottom: 6px;
            color: #2563eb;
            font-size: 9px;
            font-weight: 800;
            letter-spacing: 1px;
          }

          .doctor-profile-management-header h1 {
            margin: 0 0 8px;
            color: #0f172a;
            font-size: 28px;
          }

          .doctor-profile-management-header p {
            margin: 0;
            color: #64748b;
            font-size: 12px;
            line-height: 1.7;
          }

          .doctor-profile-form {
            display: flex;
            flex-direction: column;
            gap: 20px;
          }

          .doctor-profile-section {
            padding: 22px;
            border: 1px solid #e2e8f0;
            border-radius: 15px;
            background: white;
          }

          .doctor-profile-section-heading {
            margin-bottom: 18px;
          }

          .doctor-profile-section-heading h2 {
            margin: 0 0 5px;
            color: #0f172a;
            font-size: 17px;
          }

          .doctor-profile-section-heading p {
            margin: 0;
            color: #94a3b8;
            font-size: 10px;
          }

          .doctor-profile-form-grid {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 16px;
          }

          .doctor-profile-field {
            display: flex;
            flex-direction: column;
            gap: 7px;
          }

          .doctor-profile-field.full {
            grid-column: 1 / -1;
          }

          .doctor-profile-field label {
            color: #334155;
            font-size: 10px;
            font-weight: 800;
          }

          .doctor-profile-field input,
          .doctor-profile-field textarea {
            width: 100%;
            border: 1px solid #dbe2ea;
            border-radius: 9px;
            background: white;
            color: #0f172a;
            font-size: 11px;
            outline: none;
          }

          .doctor-profile-field input {
            min-height: 44px;
            padding: 0 13px;
          }

          .doctor-profile-field textarea {
            min-height: 130px;
            padding: 12px 13px;
            resize: vertical;
            line-height: 1.7;
          }

          .doctor-profile-field input:focus,
          .doctor-profile-field textarea:focus {
            border-color: #2563eb;
            box-shadow:
              0 0 0 3px rgba(37, 99, 235, .07);
          }

          .doctor-profile-field small {
            color: #94a3b8;
            font-size: 8px;
          }

          .doctor-profile-image-box {
            display: flex;
            align-items: center;
            gap: 20px;
            padding: 17px;
            border: 1px dashed #cbd5e1;
            border-radius: 13px;
            background: #f8fafc;
          }

          .doctor-profile-image-preview {
            width: 120px;
            height: 120px;
            flex-shrink: 0;
            overflow: hidden;
            border-radius: 14px;
            background: #e2e8f0;
          }

          .doctor-profile-image-preview img {
            width: 100%;
            height: 100%;
            display: block;
            object-fit: cover;
          }

          .doctor-profile-no-image {
            width: 100%;
            height: 100%;
            display: flex;
            align-items: center;
            justify-content: center;
            background: #eff6ff;
            font-size: 34px;
          }

          .doctor-profile-image-control {
            flex: 1;
          }

          .doctor-profile-image-control strong {
            display: block;
            margin-bottom: 8px;
            color: #0f172a;
            font-size: 11px;
          }

          .doctor-profile-image-control input {
            width: 100%;
            padding: 9px;
            border: 1px solid #dbe2ea;
            border-radius: 8px;
            background: white;
            font-size: 10px;
          }

          .doctor-profile-image-control p {
            margin: 8px 0 0;
            color: #94a3b8;
            font-size: 8px;
            line-height: 1.6;
          }

          .doctor-profile-message {
            padding: 12px 15px;
            border-radius: 9px;
            font-size: 10px;
            font-weight: 700;
          }

          .doctor-profile-message.success {
            background: #dcfce7;
            color: #15803d;
          }

          .doctor-profile-message.error {
            background: #fee2e2;
            color: #dc2626;
          }

          .doctor-profile-actions {
            display: flex;
            justify-content: flex-end;
          }

          .doctor-profile-save {
            min-width: 165px;
            min-height: 44px;
            padding: 0 20px;
            border: 0;
            border-radius: 9px;
            background: #2563eb;
            color: white;
            font-size: 10px;
            font-weight: 800;
            cursor: pointer;
          }

          .doctor-profile-save:hover {
            background: #1d4ed8;
          }

          .doctor-profile-save:disabled {
            opacity: .6;
            cursor: not-allowed;
          }

          .doctor-profile-loading {
            min-height: 60vh;
            display: flex;
            align-items: center;
            justify-content: center;
            padding: 30px;
            color: #475569;
            font-size: 12px;
            font-weight: 700;
          }

          @media (max-width: 700px) {

            .doctor-profile-management {
              padding: 20px 13px;
            }

            .doctor-profile-form-grid {
              grid-template-columns: 1fr;
            }

            .doctor-profile-field.full {
              grid-column: auto;
            }

            .doctor-profile-image-box {
              align-items: stretch;
              flex-direction: column;
            }

            .doctor-profile-image-preview {
              width: 100%;
              height: 230px;
            }

            .doctor-profile-actions {
              justify-content: stretch;
            }

            .doctor-profile-save {
              width: 100%;
            }

          }

        `}
      </style>


      <div className="doctor-profile-management-container">


        {/* HEADER */}

        <div className="doctor-profile-management-header">

          <span>
            DOCTOR PORTAL / PROFILE
          </span>

          <h1>
            My Professional Profile
          </h1>

          <p>
            Manage the information patients see
            when they view your doctor profile.
          </p>

        </div>


        <form
          className="doctor-profile-form"
          onSubmit={handleSubmit}
        >


          {/* ==================================
              PHOTO
          ================================== */}

          <section className="doctor-profile-section">


            <div className="doctor-profile-section-heading">

              <h2>
                Profile Photo
              </h2>

              <p>
                Upload a professional doctor photo.
              </p>

            </div>


            <div className="doctor-profile-image-box">


              <div className="doctor-profile-image-preview">

                {image ? (

                  <img
                    src={image}
                    alt={name}
                  />

                ) : (

                  <div className="doctor-profile-no-image">

                    🩺

                  </div>

                )}

              </div>


              <div className="doctor-profile-image-control">

                <strong>
                  Doctor Photo
                </strong>


                <input
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  onChange={
                    handleImageChange
                  }
                />


                <p>
                  JPG, PNG or WEBP.
                  The image will be resized
                  and compressed automatically.
                </p>

              </div>


            </div>


          </section>


          {/* ==================================
              BASIC INFORMATION
          ================================== */}

          <section className="doctor-profile-section">


            <div className="doctor-profile-section-heading">

              <h2>
                Basic Information
              </h2>

              <p>
                Main information shown to patients.
              </p>

            </div>


            <div className="doctor-profile-form-grid">


              <div className="doctor-profile-field">

                <label>
                  Doctor Name *
                </label>

                <input
                  type="text"
                  value={name}
                  onChange={(event) =>
                    setName(
                      event.target.value
                    )
                  }
                />

              </div>


              <div className="doctor-profile-field">

                <label>
                  Specialty *
                </label>

                <input
                  type="text"
                  value={specialty}
                  onChange={(event) =>
                    setSpecialty(
                      event.target.value
                    )
                  }
                />

              </div>


              <div className="doctor-profile-field">

                <label>
                  Location *
                </label>

                <input
                  type="text"
                  value={location}
                  onChange={(event) =>
                    setLocation(
                      event.target.value
                    )
                  }
                />

              </div>


              <div className="doctor-profile-field">

                <label>
                  Consultation Fee *
                </label>

                <input
                  type="number"
                  min="0"
                  value={fee}
                  onChange={(event) =>
                    setFee(
                      event.target.value
                    )
                  }
                />

              </div>


              <div className="doctor-profile-field">

                <label>
                  Years of Experience
                </label>

                <input
                  type="number"
                  min="0"
                  value={experienceYears}
                  placeholder="10"
                  onChange={(event) =>
                    setExperienceYears(
                      event.target.value
                    )
                  }
                />

              </div>


            </div>


          </section>


          {/* ==================================
              ABOUT
          ================================== */}

          <section className="doctor-profile-section">


            <div className="doctor-profile-section-heading">

              <h2>
                About Doctor
              </h2>

              <p>
                Tell patients about your experience
                and professional background.
              </p>

            </div>


            <div className="doctor-profile-field full">

              <label>
                About
              </label>

              <textarea
                value={about}
                placeholder="Write a short professional introduction..."
                onChange={(event) =>
                  setAbout(
                    event.target.value
                  )
                }
              />

            </div>


          </section>


          {/* ==================================
              CLINIC
          ================================== */}

          <section className="doctor-profile-section">


            <div className="doctor-profile-section-heading">

              <h2>
                Clinic Information
              </h2>

              <p>
                Information about the clinic
                where patients will attend.
              </p>

            </div>


            <div className="doctor-profile-form-grid">


              <div className="doctor-profile-field">

                <label>
                  Clinic Name
                </label>

                <input
                  type="text"
                  value={clinicName}
                  placeholder="MediBook Clinic"
                  onChange={(event) =>
                    setClinicName(
                      event.target.value
                    )
                  }
                />

              </div>


              <div className="doctor-profile-field">

                <label>
                  Clinic Address
                </label>

                <input
                  type="text"
                  value={clinicAddress}
                  placeholder="Street, Area, City"
                  onChange={(event) =>
                    setClinicAddress(
                      event.target.value
                    )
                  }
                />

              </div>


            </div>


          </section>


          {/* ==================================
              SERVICES
          ================================== */}

          <section className="doctor-profile-section">


            <div className="doctor-profile-section-heading">

              <h2>
                Medical Services
              </h2>

              <p>
                Add one service on each line.
              </p>

            </div>


            <div className="doctor-profile-field full">

              <label>
                Services
              </label>

              <textarea
                value={servicesText}
                placeholder={`General Consultation\nFollow-up Visit\nMedical Examination`}
                onChange={(event) =>
                  setServicesText(
                    event.target.value
                  )
                }
              />

              <small>
                Write one service per line.
              </small>

            </div>


          </section>


          {/* ==================================
              MESSAGES
          ================================== */}

          {error && (

            <div className="doctor-profile-message error">

              {error}

            </div>

          )}


          {success && (

            <div className="doctor-profile-message success">

              ✓ {success}

            </div>

          )}


          {/* ==================================
              SAVE
          ================================== */}

          <div className="doctor-profile-actions">

            <button
              type="submit"
              className="doctor-profile-save"
              disabled={saving}
            >

              {saving
                ? "Saving..."
                : "Save Profile"
              }

            </button>

          </div>


        </form>


      </div>

    </main>

  );

}

export default DoctorProfile;