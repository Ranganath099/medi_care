import React, { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import api from "../api/api";

export default function RegisterSuccess() {
  const location = useLocation();
  const navigate = useNavigate();
  const data = (location && location.state) || {};
  const [resending, setResending] = useState(false);
  const [message, setMessage] = useState(null);

  async function resend(verifType) {
    setResending(true);
    setMessage(null);
    try {
      const payload = {
        verif_type: verifType,
        target: verifType === "email" ? data.email : data.phone,
        user_id: data.user_id,
      };
      const res = await api.post("/api/otp/send/", payload);
      setMessage({ type: "success", text: "OTP resent." });
    } catch (err) {
      const text = err.response?.data?.detail || err.response?.data?.error || err.message;
      setMessage({ type: "error", text });
    } finally {
      setResending(false);
    }
  }

  return (
    <div style={{ maxWidth: 680, margin: "36px auto", padding: 20 }}>
      <h2>Registration Successful</h2>
      <p>Your account was created. Verification codes were sent where possible.</p>

      <ul>
        <li>Email: {data.email ? data.email : "No email provided"}</li>
        <li>Email OTP: {data.email_sent ? "Sent" : "Not sent"}</li>
        <li>Phone: {data.phone ? data.phone : "No phone provided"}</li>
        {data.phone && <li>Phone OTP: {data.phone_sent ? "Sent" : "Not sent"}</li>}
      </ul>

      <div style={{ marginTop: 16 }}>
        <button
          onClick={() =>
            navigate("/verify", { state: { email: data.email, phone: data.phone, user_id: data.user_id } })
          }
        >
          Go to Verify
        </button>
      </div>

      <div style={{ marginTop: 18 }}>
        <strong>Resend OTP</strong>
        <div style={{ marginTop: 8 }}>
          <button disabled={resending || !data.email} onClick={() => resend("email")}>
            Resend Email OTP
          </button>

          {data.phone && (
            <button disabled={resending} onClick={() => resend("phone")} style={{ marginLeft: 8 }}>
              Resend Phone OTP
            </button>
          )}
        </div>
        {message && (
          <p style={{ marginTop: 12, color: message.type === "error" ? "crimson" : "green" }}>{message.text}</p>
        )}
      </div>
    </div>
  );
}
