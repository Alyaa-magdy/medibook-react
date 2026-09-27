import axios from "axios";

const API_URL = "http://localhost:3000";

export const createNotification = async ({
  recipientUserId,
  recipientRole,
  type,
  title,
  message,
  appointmentId = null,
  link = null
}) => {
  if (!recipientUserId) {
    return null;
  }

  const response = await axios.post(
    `${API_URL}/notifications`,
    {
      recipientUserId,
      recipientRole,
      type,
      title,
      message,
      appointmentId,
      link,
      read: false,
      createdAt: new Date().toISOString()
    }
  );

  window.dispatchEvent(
    new Event("notificationsChanged")
  );

  return response.data;
};

export const getDoctorUserByDoctorId = async (
  doctorId
) => {
  const response = await axios.get(
    `${API_URL}/users`
  );

  return response.data.find((user) => {
    return (
      user.role === "doctor" &&
      String(user.doctorId) ===
        String(doctorId)
    );
  });
};