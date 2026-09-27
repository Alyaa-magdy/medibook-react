import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router";
import axios from "axios";

function AdminPatients() {
  const [users, setUsers] = useState([]);
  const [appointments, setAppointments] = useState([]);

  const [search, setSearch] = useState("");

  const [selectedPatient, setSelectedPatient] = useState(null);

  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState(null);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");


  /* ========================================
     GET DATA
  ======================================== */

  const getData = async () => {
    try {
      setError("");

      const usersResponse = await axios.get(
        "http://localhost:3000/users"
      );

      const appointmentsResponse = await axios.get(
        "http://localhost:3000/appointments"
      );

      setUsers(usersResponse.data);

      setAppointments(
        appointmentsResponse.data
      );

    } catch (error) {
      console.log(
        "ADMIN PATIENTS ERROR:",
        error
      );

      setError(
        "Unable to load patients."
      );

    } finally {
      setLoading(false);
    }
  };


  useEffect(() => {
    getData();
  }, []);


  /* ========================================
     PATIENTS ONLY
  ======================================== */

  const patients = useMemo(() => {
    return users.filter((user) => {
      return user.role === "patient";
    });
  }, [users]);


  /* ========================================
     FILTER PATIENTS
  ======================================== */

  const filteredPatients =
    useMemo(() => {

      if (search.trim() === "") {
        return patients;
      }


      const keyword =
        search
          .toLowerCase()
          .trim();


      return patients.filter((patient) => {

        const name =
          patient.name
            ?.toLowerCase() || "";

        const email =
          patient.email
            ?.toLowerCase() || "";

        const phone =
          String(
            patient.phone || ""
          ).toLowerCase();


        return (
          name.includes(keyword) ||
          email.includes(keyword) ||
          phone.includes(keyword)
        );

      });

    }, [patients, search]);


  /* ========================================
     GET PATIENT APPOINTMENTS
  ======================================== */

  const getPatientAppointments =
    (patientId) => {

      return appointments.filter(
        (appointment) => {

          return (
            String(
              appointment.userId
            ) ===
            String(
              patientId
            )
          );

        }
      );

    };


  /* ========================================
     GET STATUS COUNT
  ======================================== */

  const getStatusCount = (
    patientId,
    status
  ) => {

    return getPatientAppointments(
      patientId
    ).filter(
      (appointment) => {

        return (
          appointment.status ===
          status
        );

      }
    ).length;

  };


  /* ========================================
     TOTAL PATIENT APPOINTMENTS
  ======================================== */

  const patientsWithAppointments =
    patients.filter((patient) => {

      return (
        getPatientAppointments(
          patient.id
        ).length > 0
      );

    }).length;


  const patientsWithoutAppointments =
    patients.length -
    patientsWithAppointments;


  /* ========================================
     OPEN DETAILS
  ======================================== */

  const openPatientDetails = (
    patient
  ) => {

    setSelectedPatient(
      patient
    );

  };


  /* ========================================
     CLOSE DETAILS
  ======================================== */

  const closePatientDetails = () => {

    setSelectedPatient(null);

  };


  /* ========================================
     DELETE PATIENT
  ======================================== */

  const handleDeletePatient =
    async (patient) => {

      const patientAppointments =
        getPatientAppointments(
          patient.id
        );


      /*
        لو المريض عنده تاريخ حجوزات
        منمسحش الحساب
      */

      if (
        patientAppointments.length > 0
      ) {

        alert(
          "This patient has appointment history and cannot be deleted."
        );

        return;

      }


      const confirmDelete =
        window.confirm(
          `Delete patient ${patient.name}?`
        );


      if (!confirmDelete) {
        return;
      }


      try {
        setDeletingId(
          patient.id
        );

        setError("");
        setSuccess("");


        await axios.delete(
          `http://localhost:3000/users/${patient.id}`
        );


        setUsers(
          users.filter((user) => {

            return (
              String(user.id) !==
              String(patient.id)
            );

          })
        );


        if (
          selectedPatient &&
          String(
            selectedPatient.id
          ) ===
          String(patient.id)
        ) {

          setSelectedPatient(null);

        }


        setSuccess(
          "Patient deleted successfully."
        );


      } catch (error) {

        console.log(
          "DELETE PATIENT ERROR:",
          error
        );


        setError(
          "Unable to delete patient."
        );


      } finally {

        setDeletingId(null);

      }

    };


  /* ========================================
     SELECTED PATIENT APPOINTMENTS
  ======================================== */

  const selectedPatientAppointments =
    selectedPatient
      ? getPatientAppointments(
          selectedPatient.id
        )
      : [];


  /* ========================================
     LOADING
  ======================================== */

  if (loading) {

    return (

      <div className="admin-patients-loading">

        Loading patients...

      </div>

    );

  }


  return (

    <main className="admin-patients-page">

      <style>
        {`

          .admin-patients-page {
            padding: 32px;
          }

          .admin-patients-container {
            max-width: 1250px;
            margin: 0 auto;
          }

          .admin-patients-back {
            display: inline-flex;
            margin-bottom: 18px;
            color: #2563eb;
            font-size: 11px;
            font-weight: 700;
            text-decoration: none;
          }

          .admin-patients-header {
            display: flex;
            align-items: center;
            justify-content: space-between;
            gap: 20px;
            margin-bottom: 24px;
          }

          .admin-patients-header span {
            display: block;
            margin-bottom: 6px;
            color: #2563eb;
            font-size: 9px;
            font-weight: 800;
            letter-spacing: 1px;
          }

          .admin-patients-header h1 {
            margin: 0 0 7px;
            color: #0f172a;
            font-size: 27px;
          }

          .admin-patients-header p {
            margin: 0;
            color: #64748b;
            font-size: 12px;
          }

          .admin-patient-stats {
            display: grid;
            grid-template-columns: repeat(3, 1fr);
            gap: 14px;
            margin-bottom: 20px;
          }

          .admin-patient-stat-card {
            padding: 18px;
            border: 1px solid #e2e8f0;
            border-radius: 13px;
            background: white;
          }

          .admin-patient-stat-card span {
            display: block;
            margin-bottom: 7px;
            color: #64748b;
            font-size: 10px;
            font-weight: 700;
          }

          .admin-patient-stat-card strong {
            color: #0f172a;
            font-size: 25px;
          }

          .admin-patients-search {
            padding: 16px;
            margin-bottom: 18px;
            border: 1px solid #e2e8f0;
            border-radius: 13px;
            background: white;
          }

          .admin-patients-search input {
            width: 100%;
            min-height: 44px;
            padding: 0 14px;
            border: 1px solid #dbe2ea;
            border-radius: 9px;
            outline: none;
            font-size: 12px;
          }

          .admin-patients-search input:focus {
            border-color: #2563eb;
          }

          .admin-patient-message {
            padding: 12px 15px;
            margin-bottom: 15px;
            border-radius: 9px;
            font-size: 11px;
            font-weight: 700;
          }

          .admin-patient-message.success {
            background: #dcfce7;
            color: #15803d;
          }

          .admin-patient-message.error {
            background: #fee2e2;
            color: #dc2626;
          }

          .admin-patients-card {
            overflow: hidden;
            border: 1px solid #e2e8f0;
            border-radius: 15px;
            background: white;
          }

          .admin-patients-card-header {
            padding: 18px 20px;
            display: flex;
            align-items: center;
            justify-content: space-between;
            gap: 15px;
            border-bottom: 1px solid #e2e8f0;
          }

          .admin-patients-card-header h2 {
            margin: 0;
            color: #0f172a;
            font-size: 17px;
          }

          .admin-patients-card-header span {
            color: #64748b;
            font-size: 10px;
            font-weight: 700;
          }

          .admin-patients-table-wrap {
            overflow-x: auto;
          }

          .admin-patients-table {
            width: 100%;
            min-width: 1050px;
            border-collapse: collapse;
          }

          .admin-patients-table th {
            padding: 13px 15px;
            background: #f8fafc;
            color: #64748b;
            text-align: left;
            font-size: 9px;
            font-weight: 800;
            text-transform: uppercase;
          }

          .admin-patients-table td {
            padding: 15px;
            border-top: 1px solid #f1f5f9;
            vertical-align: middle;
            font-size: 11px;
          }

          .admin-patient-main {
            display: flex;
            align-items: center;
            gap: 10px;
          }

          .admin-patient-main-avatar {
            width: 40px;
            height: 40px;
            flex-shrink: 0;
            display: flex;
            align-items: center;
            justify-content: center;
            border-radius: 50%;
            background: #eff6ff;
            color: #2563eb;
            font-weight: 900;
          }

          .admin-patient-main strong {
            display: block;
            color: #0f172a;
            font-size: 11px;
          }

          .admin-patient-main span {
            display: block;
            margin-top: 3px;
            color: #94a3b8;
            font-size: 8px;
          }

          .admin-patient-contact strong {
            display: block;
            margin-bottom: 4px;
            color: #334155;
            font-size: 10px;
          }

          .admin-patient-contact span {
            color: #64748b;
            font-size: 9px;
          }

          .admin-patient-count {
            display: inline-flex;
            min-width: 32px;
            height: 28px;
            align-items: center;
            justify-content: center;
            border-radius: 8px;
            background: #f1f5f9;
            color: #0f172a;
            font-size: 10px;
            font-weight: 800;
          }

          .admin-patient-mini-status {
            display: inline-flex;
            min-width: 29px;
            height: 26px;
            padding: 0 7px;
            align-items: center;
            justify-content: center;
            border-radius: 7px;
            font-size: 9px;
            font-weight: 800;
          }

          .admin-patient-mini-status.pending {
            background: #fef3c7;
            color: #b45309;
          }

          .admin-patient-mini-status.confirmed {
            background: #dbeafe;
            color: #1d4ed8;
          }

          .admin-patient-mini-status.completed {
            background: #dcfce7;
            color: #15803d;
          }

          .admin-patient-mini-status.cancelled {
            background: #fee2e2;
            color: #dc2626;
          }

          .admin-patient-actions {
            display: flex;
            gap: 7px;
          }

          .admin-patient-view-btn,
          .admin-patient-delete-btn {
            padding: 8px 11px;
            border: none;
            border-radius: 7px;
            font-size: 9px;
            font-weight: 800;
            cursor: pointer;
          }

          .admin-patient-view-btn {
            background: #eff6ff;
            color: #2563eb;
          }

          .admin-patient-delete-btn {
            background: #fee2e2;
            color: #dc2626;
          }

          .admin-patient-delete-btn:disabled {
            opacity: .45;
            cursor: not-allowed;
          }

          .admin-patients-empty {
            padding: 60px 20px;
            text-align: center;
          }

          .admin-patients-empty div {
            font-size: 30px;
          }

          .admin-patients-empty h3 {
            margin: 10px 0 5px;
            color: #0f172a;
          }

          .admin-patients-empty p {
            margin: 0;
            color: #64748b;
            font-size: 11px;
          }

          .admin-patient-modal-overlay {
            position: fixed;
            inset: 0;
            z-index: 3000;
            padding: 20px;
            display: flex;
            align-items: center;
            justify-content: center;
            background: rgba(15, 23, 42, .58);
          }

          .admin-patient-modal {
            width: 100%;
            max-width: 850px;
            max-height: 90vh;
            overflow-y: auto;
            border-radius: 17px;
            background: white;
            box-shadow: 0 25px 70px rgba(15, 23, 42, .2);
          }

          .admin-patient-modal-header {
            position: sticky;
            top: 0;
            z-index: 10;
            padding: 18px 20px;
            display: flex;
            align-items: center;
            justify-content: space-between;
            border-bottom: 1px solid #e2e8f0;
            background: white;
          }

          .admin-patient-modal-header span {
            display: block;
            margin-bottom: 4px;
            color: #2563eb;
            font-size: 8px;
            font-weight: 800;
          }

          .admin-patient-modal-header h2 {
            margin: 0;
            color: #0f172a;
            font-size: 18px;
          }

          .admin-patient-modal-close {
            width: 36px;
            height: 36px;
            border: 0;
            border-radius: 8px;
            background: #f1f5f9;
            cursor: pointer;
            font-size: 18px;
          }

          .admin-patient-modal-body {
            padding: 20px;
          }

          .admin-patient-profile {
            padding: 16px;
            display: flex;
            align-items: center;
            gap: 14px;
            border: 1px solid #e2e8f0;
            border-radius: 12px;
            background: #f8fafc;
          }

          .admin-patient-profile-avatar {
            width: 54px;
            height: 54px;
            flex-shrink: 0;
            display: flex;
            align-items: center;
            justify-content: center;
            border-radius: 50%;
            background: #2563eb;
            color: white;
            font-size: 20px;
            font-weight: 900;
          }

          .admin-patient-profile h3 {
            margin: 0 0 5px;
            color: #0f172a;
            font-size: 15px;
          }

          .admin-patient-profile p {
            margin: 3px 0;
            color: #64748b;
            font-size: 10px;
          }

          .admin-patient-modal-stats {
            margin: 18px 0;
            display: grid;
            grid-template-columns: repeat(5, 1fr);
            gap: 9px;
          }

          .admin-patient-modal-stat {
            padding: 12px;
            border: 1px solid #e2e8f0;
            border-radius: 10px;
            text-align: center;
          }

          .admin-patient-modal-stat span {
            display: block;
            margin-bottom: 5px;
            color: #64748b;
            font-size: 8px;
          }

          .admin-patient-modal-stat strong {
            color: #0f172a;
            font-size: 17px;
          }

          .admin-patient-history-title {
            margin: 22px 0 10px;
            color: #0f172a;
            font-size: 14px;
          }

          .admin-patient-history {
            display: flex;
            flex-direction: column;
            gap: 8px;
          }

          .admin-patient-history-row {
            padding: 12px;
            display: grid;
            grid-template-columns: 1.4fr 1fr 1fr .8fr;
            gap: 10px;
            align-items: center;
            border: 1px solid #e2e8f0;
            border-radius: 9px;
          }

          .admin-patient-history-row span {
            display: block;
            color: #94a3b8;
            font-size: 8px;
          }

          .admin-patient-history-row strong {
            display: block;
            margin-top: 3px;
            color: #334155;
            font-size: 10px;
          }

          .admin-patient-history-status {
            padding: 6px 8px;
            border-radius: 50px;
            text-align: center;
            font-size: 8px;
            font-weight: 800;
            text-transform: capitalize;
          }

          .admin-patient-history-status.pending {
            background: #fef3c7;
            color: #b45309;
          }

          .admin-patient-history-status.confirmed {
            background: #dbeafe;
            color: #1d4ed8;
          }

          .admin-patient-history-status.completed {
            background: #dcfce7;
            color: #15803d;
          }

          .admin-patient-history-status.cancelled {
            background: #fee2e2;
            color: #dc2626;
          }

          .admin-patient-no-history {
            padding: 30px;
            text-align: center;
            border-radius: 10px;
            background: #f8fafc;
            color: #64748b;
            font-size: 11px;
          }

          .admin-patients-loading {
            min-height: 60vh;
            display: flex;
            align-items: center;
            justify-content: center;
            font-weight: 700;
          }

          @media (max-width: 800px) {

            .admin-patients-page {
              padding: 20px 14px;
            }

            .admin-patient-stats {
              grid-template-columns: 1fr;
            }

            .admin-patient-modal-stats {
              grid-template-columns: repeat(2, 1fr);
            }

            .admin-patient-history-row {
              grid-template-columns: 1fr 1fr;
            }

          }

          @media (max-width: 500px) {

            .admin-patients-header {
              align-items: flex-start;
              flex-direction: column;
            }

            .admin-patient-modal-overlay {
              padding: 8px;
            }

            .admin-patient-modal-body {
              padding: 14px;
            }

            .admin-patient-modal-stats {
              grid-template-columns: 1fr 1fr;
            }

            .admin-patient-history-row {
              grid-template-columns: 1fr;
            }

          }

        `}
      </style>


      <div className="admin-patients-container">


        <Link
          to="/admin/dashboard"
          className="admin-patients-back"
        >
          ← Back to Admin Dashboard
        </Link>


        {/* HEADER */}

        <div className="admin-patients-header">

          <div>

            <span>
              ADMIN / PATIENTS
            </span>

            <h1>
              Manage Patients
            </h1>

            <p>
              View registered patients
              and their appointment history.
            </p>

          </div>

        </div>


        {/* STATS */}

        <div className="admin-patient-stats">

          <div className="admin-patient-stat-card">

            <span>
              Total Patients
            </span>

            <strong>
              {patients.length}
            </strong>

          </div>


          <div className="admin-patient-stat-card">

            <span>
              Patients With Appointments
            </span>

            <strong>
              {patientsWithAppointments}
            </strong>

          </div>


          <div className="admin-patient-stat-card">

            <span>
              No Appointment History
            </span>

            <strong>
              {patientsWithoutAppointments}
            </strong>

          </div>

        </div>


        {/* SEARCH */}

        <div className="admin-patients-search">

          <input
            type="text"
            value={search}
            placeholder="Search by name, email or phone..."
            onChange={(event) =>
              setSearch(
                event.target.value
              )
            }
          />

        </div>


        {success && (

          <div className="admin-patient-message success">

            ✓ {success}

          </div>

        )}


        {error && (

          <div className="admin-patient-message error">

            {error}

          </div>

        )}


        {/* PATIENTS */}

        <div className="admin-patients-card">


          <div className="admin-patients-card-header">

            <h2>
              Registered Patients
            </h2>

            <span>
              {filteredPatients.length} results
            </span>

          </div>


          {filteredPatients.length === 0 ? (

            <div className="admin-patients-empty">

              <div>
                👤
              </div>

              <h3>
                No Patients Found
              </h3>

              <p>
                No patients match your search.
              </p>

            </div>

          ) : (

            <div className="admin-patients-table-wrap">

              <table className="admin-patients-table">

                <thead>

                  <tr>

                    <th>
                      Patient
                    </th>

                    <th>
                      Contact
                    </th>

                    <th>
                      Appointments
                    </th>

                    <th>
                      Pending
                    </th>

                    <th>
                      Confirmed
                    </th>

                    <th>
                      Completed
                    </th>

                    <th>
                      Cancelled
                    </th>

                    <th>
                      Actions
                    </th>

                  </tr>

                </thead>


                <tbody>

                  {filteredPatients.map(
                    (patient) => {

                      const patientAppointments =
                        getPatientAppointments(
                          patient.id
                        );


                      return (

                        <tr key={patient.id}>


                          {/* PATIENT */}

                          <td>

                            <div className="admin-patient-main">

                              <div className="admin-patient-main-avatar">

                                {patient.name
                                  ? patient.name
                                      .charAt(0)
                                      .toUpperCase()
                                  : "P"
                                }

                              </div>


                              <div>

                                <strong>
                                  {patient.name}
                                </strong>

                                <span>
                                  Patient ID: {patient.id}
                                </span>

                              </div>

                            </div>

                          </td>


                          {/* CONTACT */}

                          <td>

                            <div className="admin-patient-contact">

                              <strong>
                                {patient.email}
                              </strong>

                              <span>
                                {patient.phone}
                              </span>

                            </div>

                          </td>


                          {/* TOTAL */}

                          <td>

                            <span className="admin-patient-count">

                              {patientAppointments.length}

                            </span>

                          </td>


                          {/* PENDING */}

                          <td>

                            <span className="admin-patient-mini-status pending">

                              {getStatusCount(
                                patient.id,
                                "pending"
                              )}

                            </span>

                          </td>


                          {/* CONFIRMED */}

                          <td>

                            <span className="admin-patient-mini-status confirmed">

                              {getStatusCount(
                                patient.id,
                                "confirmed"
                              )}

                            </span>

                          </td>


                          {/* COMPLETED */}

                          <td>

                            <span className="admin-patient-mini-status completed">

                              {getStatusCount(
                                patient.id,
                                "completed"
                              )}

                            </span>

                          </td>


                          {/* CANCELLED */}

                          <td>

                            <span className="admin-patient-mini-status cancelled">

                              {getStatusCount(
                                patient.id,
                                "cancelled"
                              )}

                            </span>

                          </td>


                          {/* ACTIONS */}

                          <td>

                            <div className="admin-patient-actions">

                              <button
                                type="button"
                                className="admin-patient-view-btn"
                                onClick={() =>
                                  openPatientDetails(
                                    patient
                                  )
                                }
                              >
                                View
                              </button>


                              <button
                                type="button"
                                className="admin-patient-delete-btn"
                                disabled={
                                  deletingId ===
                                  patient.id
                                }
                                onClick={() =>
                                  handleDeletePatient(
                                    patient
                                  )
                                }
                              >

                                {deletingId ===
                                patient.id
                                  ? "Deleting..."
                                  : "Delete"
                                }

                              </button>

                            </div>

                          </td>


                        </tr>

                      );

                    }
                  )}

                </tbody>

              </table>

            </div>

          )}

        </div>


      </div>


      {/* ====================================
          PATIENT DETAILS POPUP
      ==================================== */}

      {selectedPatient && (

        <div
          className="admin-patient-modal-overlay"
          onClick={closePatientDetails}
        >

          <div
            className="admin-patient-modal"
            onClick={(event) =>
              event.stopPropagation()
            }
          >


            <div className="admin-patient-modal-header">

              <div>

                <span>
                  PATIENT DETAILS
                </span>

                <h2>
                  Patient Profile
                </h2>

              </div>


              <button
                type="button"
                className="admin-patient-modal-close"
                onClick={
                  closePatientDetails
                }
              >
                ×
              </button>

            </div>


            <div className="admin-patient-modal-body">


              {/* PROFILE */}

              <div className="admin-patient-profile">

                <div className="admin-patient-profile-avatar">

                  {selectedPatient.name
                    ? selectedPatient.name
                        .charAt(0)
                        .toUpperCase()
                    : "P"
                  }

                </div>


                <div>

                  <h3>
                    {selectedPatient.name}
                  </h3>

                  <p>
                    Email: {selectedPatient.email}
                  </p>

                  <p>
                    Phone: {selectedPatient.phone}
                  </p>

                  <p>
                    Patient ID: {selectedPatient.id}
                  </p>

                </div>

              </div>


              {/* STATS */}

              <div className="admin-patient-modal-stats">

                <div className="admin-patient-modal-stat">

                  <span>
                    Total
                  </span>

                  <strong>
                    {
                      selectedPatientAppointments.length
                    }
                  </strong>

                </div>


                <div className="admin-patient-modal-stat">

                  <span>
                    Pending
                  </span>

                  <strong>
                    {getStatusCount(
                      selectedPatient.id,
                      "pending"
                    )}
                  </strong>

                </div>


                <div className="admin-patient-modal-stat">

                  <span>
                    Confirmed
                  </span>

                  <strong>
                    {getStatusCount(
                      selectedPatient.id,
                      "confirmed"
                    )}
                  </strong>

                </div>


                <div className="admin-patient-modal-stat">

                  <span>
                    Completed
                  </span>

                  <strong>
                    {getStatusCount(
                      selectedPatient.id,
                      "completed"
                    )}
                  </strong>

                </div>


                <div className="admin-patient-modal-stat">

                  <span>
                    Cancelled
                  </span>

                  <strong>
                    {getStatusCount(
                      selectedPatient.id,
                      "cancelled"
                    )}
                  </strong>

                </div>

              </div>


              {/* HISTORY */}

              <h3 className="admin-patient-history-title">

                Appointment History

              </h3>


              {selectedPatientAppointments.length ===
              0 ? (

                <div className="admin-patient-no-history">

                  This patient has no appointment history.

                </div>

              ) : (

                <div className="admin-patient-history">

                  {[
                    ...selectedPatientAppointments
                  ]
                    .reverse()
                    .map(
                      (appointment) => (

                        <div
                          className="admin-patient-history-row"
                          key={appointment.id}
                        >


                          <div>

                            <span>
                              Doctor
                            </span>

                            <strong>
                              {appointment.doctorName}
                            </strong>

                          </div>


                          <div>

                            <span>
                              Date
                            </span>

                            <strong>
                              {appointment.date}
                            </strong>

                          </div>


                          <div>

                            <span>
                              Time / Fee
                            </span>

                            <strong>

                              {appointment.time}

                              {" · "}

                              {appointment.fee} EGP

                            </strong>

                          </div>


                          <div>

                            <span
                              className={`admin-patient-history-status ${appointment.status}`}
                            >

                              {appointment.status}

                            </span>

                          </div>


                        </div>

                      )
                    )}

                </div>

              )}


            </div>

          </div>

        </div>

      )}


    </main>

  );

}

export default AdminPatients;