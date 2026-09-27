import { useState } from "react";
import { Navigate } from "react-router";
import axios from "axios";

function Profile() {
  const savedUser = localStorage.getItem("currentUser");

  const currentUser = savedUser
    ? JSON.parse(savedUser)
    : null;


  const [name, setName] = useState(
    currentUser?.name || ""
  );

  const [email] = useState(
    currentUser?.email || ""
  );

  const [phone, setPhone] = useState(
    currentUser?.phone || ""
  );

  const [loading, setLoading] = useState(false);

  const [success, setSuccess] = useState("");

  const [error, setError] = useState("");


  /* =========================
     NOT LOGGED IN
  ========================= */

  if (!currentUser) {
    return <Navigate to="/login" replace />;
  }


  /* =========================
     UPDATE PROFILE
  ========================= */

  const handleUpdate = async (event) => {
    event.preventDefault();

    setSuccess("");
    setError("");


    if (
      name.trim() === "" ||
      phone.trim() === ""
    ) {
      setError(
        "Name and phone are required."
      );

      return;
    }


    try {
      setLoading(true);


      const response = await axios.patch(
        `http://localhost:3000/users/${currentUser.id}`,
        {
          name: name,
          phone: phone
        }
      );


      /*
        تحديث المستخدم داخل localStorage
      */

      localStorage.setItem(
        "currentUser",
        JSON.stringify(response.data)
      );


      /*
        تحديث الـ Navbar
      */

      window.dispatchEvent(
        new Event("authChanged")
      );


      setSuccess(
        "Profile updated successfully."
      );

    } catch (error) {
      console.log(error);

      setError(
        "Unable to update profile."
      );

    } finally {
      setLoading(false);
    }
  };


  return (
    <main className="profile-page">

      <div className="section-container">

        <div className="patient-profile-card">


          {/* PROFILE HEADER */}

          <div className="patient-profile-header">

            <div className="patient-avatar">
              {currentUser.name
                .charAt(0)
                .toUpperCase()}
            </div>


            <div>

              <span>
                PATIENT ACCOUNT
              </span>

              <h1>
                My Profile
              </h1>

              <p>
                Manage your personal information.
              </p>

            </div>

          </div>


          {/* FORM */}

          <form
            className="patient-profile-form"
            onSubmit={handleUpdate}
          >


            {/* NAME */}

            <div className="profile-form-group">

              <label>
                Full Name
              </label>

              <input
                type="text"
                value={name}
                onChange={(event) =>
                  setName(event.target.value)
                }
              />

            </div>


            {/* EMAIL */}

            <div className="profile-form-group">

              <label>
                Email Address
              </label>

              <input
                type="email"
                value={email}
                disabled
              />

              <small>
                Email cannot be changed.
              </small>

            </div>


            {/* PHONE */}

            <div className="profile-form-group">

              <label>
                Phone Number
              </label>

              <input
                type="text"
                value={phone}
                onChange={(event) =>
                  setPhone(event.target.value)
                }
              />

            </div>


            {/* ROLE */}

            <div className="profile-form-group">

              <label>
                Account Type
              </label>

              <input
                type="text"
                value="Patient"
                disabled
              />

            </div>


            {/* ERROR */}

            {error && (

              <div className="profile-error">
                {error}
              </div>

            )}


            {/* SUCCESS */}

            {success && (

              <div className="profile-success">
                ✓ {success}
              </div>

            )}


            {/* BUTTON */}

            <button
              type="submit"
              className="profile-save-btn"
              disabled={loading}
            >

              {loading
                ? "Saving..."
                : "Save Changes"
              }

            </button>


          </form>

        </div>

      </div>

    </main>
  );
}

export default Profile;