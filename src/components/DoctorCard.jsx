function DoctorCard({ doctor }) {
  return (
    <div className="doctor-card">

      <div className="doctor-image-wrapper">

        <img
          src={doctor.image}
          alt={doctor.name}
          className="doctor-image"
        />

        <span className="doctor-status">
          {doctor.available}
        </span>

      </div>


      <div className="doctor-info">

        <div className="doctor-title-row">

          <h3>
            {doctor.name}
          </h3>

          <span className="verified-badge">
            ✓
          </span>

        </div>


        <p className="doctor-specialty">
          {doctor.specialty}
        </p>


        <div className="doctor-meta">
          <span>📍</span>

          <span>
            {doctor.location}
          </span>
        </div>


        <div className="doctor-rating">

          <span className="star">
            ★
          </span>

          <strong>
            {doctor.rating}
          </strong>

          <span>
            ({doctor.reviews} reviews)
          </span>

        </div>


        <div className="doctor-footer">

          <div className="doctor-fee">

            <span>
              Consultation Fee
            </span>

            <strong>
              {doctor.fee} EGP
            </strong>

          </div>


          <button className="book-doctor-btn">
            Book Now
          </button>

        </div>

      </div>

    </div>
  );
}

export default DoctorCard;