import { useState } from "react";
import { Link, useNavigate } from "react-router";
import axios from "axios";

function Register() {
  const navigate = useNavigate();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");


  const handleRegister = async (event) => {
    event.preventDefault();

    setError("");


    if (
      name === "" ||
      email === "" ||
      phone === "" ||
      password === ""
    ) {
      setError("Please complete all fields.");
      return;
    }


    try {
      setLoading(true);


      /*
        هات كل المستخدمين
      */

      const usersResponse = await axios.get(
        "http://localhost:3000/users"
      );


      /*
        شوف هل الإيميل موجود قبل كده
      */

      const existingUser =
        usersResponse.data.find((user) => {
          return user.email === email;
        });


      if (existingUser) {
        setError("Email already exists.");

        return;
      }


      /*
        بيانات المستخدم الجديد
      */

      const newUser = {
        name: name,
        email: email,
        phone: phone,
        password: password,
        role: "patient"
      };


      /*
        إضافة المستخدم
      */

      await axios.post(
        "http://localhost:3000/users",
        newUser
      );


      /*
        بعد التسجيل روح Login
      */

      navigate("/login");

    } catch (error) {
      console.log(error);

      setError("Registration failed.");

    } finally {
      setLoading(false);
    }
  };


  return (
    <main className="auth-page">

      <div className="auth-card">

        <div className="auth-header">

          <span className="section-small-title">
            CREATE ACCOUNT
          </span>

          <h1>
            Join MediBook
          </h1>

          <p>
            Create your patient account to book
            and manage appointments.
          </p>

        </div>


        <form
          className="auth-form"
          onSubmit={handleRegister}
        >


          <div className="auth-group">

            <label>
              Full Name
            </label>

            <input
              type="text"
              placeholder="Enter your full name"
              value={name}
              onChange={(event) =>
                setName(event.target.value)
              }
            />

          </div>


          <div className="auth-group">

            <label>
              Email Address
            </label>

            <input
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={(event) =>
                setEmail(event.target.value)
              }
            />

          </div>


          <div className="auth-group">

            <label>
              Phone Number
            </label>

            <input
              type="text"
              placeholder="Enter your phone number"
              value={phone}
              onChange={(event) =>
                setPhone(event.target.value)
              }
            />

          </div>


          <div className="auth-group">

            <label>
              Password
            </label>

            <input
              type="password"
              placeholder="Create password"
              value={password}
              onChange={(event) =>
                setPassword(event.target.value)
              }
            />

          </div>


          {error && (
            <div className="auth-error">
              {error}
            </div>
          )}


          <button
            type="submit"
            className="auth-submit"
            disabled={loading}
          >
            {loading
              ? "Creating Account..."
              : "Create Account"
            }
          </button>


          <p className="auth-bottom-text">
            Already have an account?

            <Link to="/login">
              Login
            </Link>
          </p>

        </form>

      </div>

    </main>
  );
}

export default Register;