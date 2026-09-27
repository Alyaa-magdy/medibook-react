import {
  useState
} from "react";

import axios from "axios";



function Contact() {

  /* =========================
     CURRENT USER
  ========================= */

  const savedUser =
    localStorage.getItem(
      "currentUser"
    );


  const currentUser =
    savedUser
      ? JSON.parse(savedUser)
      : null;


  /* =========================
     FORM
  ========================= */

  const [form, setForm] =
    useState({

      name:
        currentUser?.name || "",

      email:
        currentUser?.email || "",

      phone:
        currentUser?.phone || "",

      subject: "",

      message: ""

    });


  const [saving, setSaving] =
    useState(false);


  const [error, setError] =
    useState("");


  const [success, setSuccess] =
    useState("");


  /* =========================
     CHANGE
  ========================= */

  const handleChange = (
    event
  ) => {

    const {
      name,
      value
    } =
      event.target;


    setForm({

      ...form,

      [name]: value

    });


    setError("");

    setSuccess("");

  };


  /* =========================
     SUBMIT
  ========================= */

  const handleSubmit =
    async (event) => {

      event.preventDefault();


      setError("");

      setSuccess("");


      if (
        form.name.trim() === "" ||
        form.email.trim() === "" ||
        form.subject.trim() === "" ||
        form.message.trim() === ""
      ) {

        setError(
          "Please complete all required fields."
        );

        return;

      }


      try {

        setSaving(true);


        await axios.post(
          "http://localhost:3000/messages",
          {

            userId:
              currentUser?.id ||
              null,

            name:
              form.name.trim(),

            email:
              form.email.trim(),

            phone:
              form.phone.trim(),

            subject:
              form.subject,

            message:
              form.message.trim(),

            status:
              "new",

            createdAt:
              new Date()
                .toISOString()

          }
        );


        setSuccess(
          "Your message has been sent successfully."
        );


        setForm({

          name:
            currentUser?.name ||
            "",

          email:
            currentUser?.email ||
            "",

          phone:
            currentUser?.phone ||
            "",

          subject: "",

          message: ""

        });


      } catch (error) {

        console.log(
          "CONTACT ERROR:",
          error
        );


        setError(
          "Unable to send your message. Please try again."
        );


      } finally {

        setSaving(false);

      }

    };


  return (

    <main className="public-page">


      {/* =========================
          HERO
      ========================= */}

      <section className="public-page-hero">

        <div className="public-page-container">


          <span className="public-page-label">

            CONTACT US

          </span>


          <h1>

            We are here to
            <span>
              {" "}
              help
            </span>

          </h1>


          <p>

            Have a question about MediBook,
            appointments or your account?
            Send us a message.

          </p>


        </div>

      </section>


      {/* =========================
          CONTACT
      ========================= */}

      <section className="public-page-section">

        <div className="public-page-container">


          <div className="contact-page-layout">


            {/* INFO */}

            <div className="contact-info-card">


              <span className="public-page-label">

                GET IN TOUCH

              </span>


              <h2>

                Contact MediBook

              </h2>


              <p>

                Our support team is available
                to help with questions about
                doctors, appointments and your
                MediBook account.

              </p>


              <div className="contact-info-list">


                <div>

                  <span className="contact-info-icon">
                    ✉
                  </span>

                  <div>

                    <small>
                      Email
                    </small>

                    <strong>

                      support@medibook.com

                    </strong>

                  </div>

                </div>


                <div>

                  <span className="contact-info-icon">
                    ☎
                  </span>

                  <div>

                    <small>
                      Phone
                    </small>

                    <strong>

                      +20 100 000 0000

                    </strong>

                  </div>

                </div>


                <div>

                  <span className="contact-info-icon">
                    ⌖
                  </span>

                  <div>

                    <small>
                      Location
                    </small>

                    <strong>

                      Cairo, Egypt

                    </strong>

                  </div>

                </div>


                <div>

                  <span className="contact-info-icon">
                    ◷
                  </span>

                  <div>

                    <small>
                      Working Hours
                    </small>

                    <strong>

                      Sun - Thu
                      9:00 AM - 6:00 PM

                    </strong>

                  </div>

                </div>


              </div>


            </div>


            {/* FORM */}

            <div className="contact-form-card">


              <div className="contact-form-heading">

                <span>
                  SEND MESSAGE
                </span>

                <h2>

                  How can we help?

                </h2>

              </div>


              <form
                onSubmit={
                  handleSubmit
                }
              >


                <div className="contact-form-grid">


                  <div className="contact-field">

                    <label>
                      Full Name *
                    </label>

                    <input
                      type="text"
                      name="name"
                      value={form.name}
                      onChange={
                        handleChange
                      }
                      placeholder="Enter your name"
                    />

                  </div>


                  <div className="contact-field">

                    <label>
                      Email Address *
                    </label>

                    <input
                      type="email"
                      name="email"
                      value={form.email}
                      onChange={
                        handleChange
                      }
                      placeholder="Enter your email"
                    />

                  </div>


                  <div className="contact-field">

                    <label>
                      Phone Number
                    </label>

                    <input
                      type="text"
                      name="phone"
                      value={form.phone}
                      onChange={
                        handleChange
                      }
                      placeholder="Enter your phone"
                    />

                  </div>


                  <div className="contact-field">

                    <label>
                      Subject *
                    </label>

                    <select
                      name="subject"
                      value={
                        form.subject
                      }
                      onChange={
                        handleChange
                      }
                    >

                      <option value="">
                        Select subject
                      </option>

                      <option value="Appointment">
                        Appointment
                      </option>

                      <option value="Doctor">
                        Doctor
                      </option>

                      <option value="Payment">
                        Payment
                      </option>

                      <option value="Account">
                        Account
                      </option>

                      <option value="Technical Support">
                        Technical Support
                      </option>

                      <option value="Other">
                        Other
                      </option>

                    </select>

                  </div>


                </div>


                <div className="contact-field">

                  <label>
                    Message *
                  </label>

                  <textarea
                    name="message"
                    value={
                      form.message
                    }
                    onChange={
                      handleChange
                    }
                    placeholder="Write your message..."
                    rows="7"
                  ></textarea>

                </div>


                {error && (

                  <div className="contact-form-error">

                    {error}

                  </div>

                )}


                {success && (

                  <div className="contact-form-success">

                    ✓ {success}

                  </div>

                )}


                <button
                  type="submit"
                  className="contact-submit-button"
                  disabled={saving}
                >

                  {saving
                    ? "Sending..."
                    : "Send Message"
                  }

                  {!saving && (
                    <span>
                      →
                    </span>
                  )}

                </button>


              </form>


            </div>


          </div>


        </div>

      </section>


    </main>

  );

}

export default Contact;