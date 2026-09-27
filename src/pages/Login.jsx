import { useState } from "react";
import { Link, useNavigate } from "react-router";
import axios from "axios";

function Login() {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");


  /* =========================
     LOGIN
  ========================= */

  const handleLogin = async (event) => {
    event.preventDefault();

    setError("");


    /* تأكد إن البيانات موجودة */

    if (email === "" || password === "") {
      setError("Please enter email and password.");

      return;
    }


    try {
      setLoading(true);


      /* =========================
         GET USERS
      ========================= */

      const response = await axios.get(
        "http://localhost:3000/users"
      );


      /* =========================
         FIND USER
      ========================= */

      const user = response.data.find((user) => {
        return (
          user.email === email &&
          user.password === password
        );
      });


      /* =========================
         WRONG LOGIN
      ========================= */

      if (!user) {
        setError("Invalid email or password.");

        return;
      }


      /* =========================
         SAVE CURRENT USER
      ========================= */
localStorage.setItem(
  "currentUser",
  JSON.stringify(user)
);

window.dispatchEvent(
  new Event("authChanged")
);


if (user.role === "admin") {

  navigate("/admin/dashboard");

} else if (user.role === "doctor") {

  navigate("/doctor/dashboard");

} else {

  navigate("/");

}

    } catch (error) {
      console.log(error);

      setError("Login failed.");

    } finally {
      setLoading(false);
    }
  };


  return (
    <main className="auth-page">

      <div className="auth-card">

        {/* HEADER */}

        <div className="auth-header">

          <span className="section-small-title">
            WELCOME BACK
          </span>

          <h1>
            Login to MediBook
          </h1>

          <p>
            Login to manage your appointments
            and access your patient account.
          </p>

        </div>


        {/* FORM */}

        <form
          className="auth-form"
          onSubmit={handleLogin}
        >


          {/* EMAIL */}

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


          {/* PASSWORD */}

          <div className="auth-group">

            <label>
              Password
            </label>

            <input
              type="password"
              placeholder="Enter your password"
              value={password}
              onChange={(event) =>
                setPassword(event.target.value)
              }
            />

          </div>


          {/* ERROR */}

          {error && (
            <div className="auth-error">
              {error}
            </div>
          )}


          {/* SUBMIT */}

          <button
            type="submit"
            className="auth-submit"
            disabled={loading}
          >
            {loading
              ? "Logging in..."
              : "Login"
            }
          </button>


          <p className="auth-bottom-text">

            Don't have an account?

            <Link to="/register">
              Create Account
            </Link>

          </p>

        </form>

      </div>

    </main>
  );
}

export default Login;