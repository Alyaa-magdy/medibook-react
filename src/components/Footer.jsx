function Footer() {
  return (
    <footer className="footer">

      <div className="section-container footer-grid">

        <div className="footer-about">

          <div className="footer-logo">
            Medi<span>Book</span>
          </div>

          <p>
            MediBook helps patients find trusted doctors,
            compare specialties and book appointments easily.
          </p>

        </div>


        <div className="footer-column">

          <h4>Patients</h4>

          <a href="#">Find Doctors</a>
          <a href="#">Specialties</a>
          <a href="#">Appointments</a>
          <a href="#">Patient Login</a>

        </div>


        <div className="footer-column">

          <h4>Doctors</h4>

          <a href="#">Join MediBook</a>
          <a href="#">Doctor Login</a>
          <a href="#">Manage Appointments</a>
          <a href="#">Doctor Dashboard</a>

        </div>


        <div className="footer-column">

          <h4>Company</h4>

          <a href="#">About Us</a>
          <a href="#">How It Works</a>
          <a href="#">Contact</a>
          <a href="#">Privacy Policy</a>

        </div>


        <div className="footer-column footer-contact">

          <h4>Contact</h4>

          <p>
            📍 Cairo, Egypt
          </p>

          <p>
            📞 +20 100 000 0000
          </p>

          <p>
            ✉ support@medibook.com
          </p>

        </div>

      </div>


      <div className="section-container footer-bottom">

        <p>
          © 2026 MediBook. All rights reserved.
        </p>

        <div>
          <a href="#">Terms</a>
          <a href="#">Privacy</a>
          <a href="#">Cookies</a>
        </div>

      </div>

    </footer>
  );
}

export default Footer;