import React, { useState, useEffect, useRef } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import api from "../api/api";

function maskEmail(email = "") {
  const [local, domain] = (email || "").split("@");
  if (!domain) return email;
  const show = Math.min(3, local.length);
  return `${local.slice(0, show)}${local.length > show ? "..." : ""}@${domain}`;
}
function maskPhone(phone = "") {
  if (!phone) return "";
  const last = phone.slice(-4);
  return `***${last}`;
}

export default function Verify() {
  const location = useLocation();
  const navigate = useNavigate();
  const state = (location && location.state) || {};
  const initialEmail = state.email || "";
  const initialPhone = state.phone || "";
  const userId = state.user_id || state.id || null;

  const [verifType, setVerifType] = useState(initialEmail ? "email" : "phone");
  const [target, setTarget] = useState(verifType === "email" ? initialEmail : initialPhone);
  const [otp, setOtp] = useState("");
  const [statusMsg, setStatusMsg] = useState(null);
  const [loading, setLoading] = useState(false);

    
  const ttlMinutes =
    (typeof import.meta !== "undefined" &&
      import.meta.env &&
      import.meta.env.VITE_OTP_TTL_MINUTES)
      ? Number(import.meta.env.VITE_OTP_TTL_MINUTES)
      : 10;

  const TTL_SECONDS = Math.max(1, ttlMinutes) * 60;
  const [secondsLeft, setSecondsLeft] = useState(TTL_SECONDS);
  const timerRef = useRef(null);
  const [resendCooldown, setResendCooldown] = useState(0);
  const RESEND_COOLDOWN_SECONDS = 60;

  useEffect(() => setTarget(verifType === "email" ? initialEmail : initialPhone), [verifType, initialEmail, initialPhone]);

  useEffect(() => {
    setSecondsLeft(TTL_SECONDS);
    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = setInterval(() => {
      setSecondsLeft((s) => {
        if (s <= 1) {
          clearInterval(timerRef.current);
          return 0;
        }
        return s - 1;
      });
    }, 1000);
    return () => clearInterval(timerRef.current);
  }, [target, TTL_SECONDS]);

  useEffect(() => {
    let id;
    if (resendCooldown > 0) {
      id = setInterval(() => setResendCooldown((c) => c - 1), 1000);
    }
    return () => id && clearInterval(id);
  }, [resendCooldown]);

  function formatTime(sec) {
    const m = Math.floor(sec / 60).toString().padStart(2, "0");
    const s = (sec % 60).toString().padStart(2, "0");
    return `${m}:${s}`;
  }

  async function handleVerify(e) {
    e.preventDefault();
    setLoading(true);
    setStatusMsg(null);
    try {
      const payload = { verif_type: verifType, target, otp: otp, user_id: userId };
       
      await api.post("/otp/verify/", payload);
      setStatusMsg({ type: "success", text: "Verified successfully. Redirecting..." });
      setTimeout(() => navigate("/login"), 900);
    } catch (err) {
      const detail = err.response?.data?.detail || err.response?.data?.error || err.message || "Verification failed";
      setStatusMsg({ type: "error", text: detail });
    } finally {
      setLoading(false);
    }
  }

  async function handleResend() {
    if (resendCooldown > 0) return;
    setStatusMsg(null);
    setResendCooldown(RESEND_COOLDOWN_SECONDS);
    try {
      const payload = { verif_type: verifType, target, user_id: userId };
      await api.post("/otp/send/", payload);
      setStatusMsg({ type: "success", text: "OTP resent — check your inbox / phone." });
      setSecondsLeft(TTL_SECONDS);
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = setInterval(() => {
          setSecondsLeft((s) => (s <= 1 ? (clearInterval(timerRef.current), 0) : s - 1));
        }, 1000);
      }
    } catch (err) {
      const text = err.response?.data?.detail || err.response?.data?.error || err.message;
      setStatusMsg({ type: "error", text });
    }
  }

  return (
    <div style={{ maxWidth: 560, margin: "32px auto", padding: 20 }}>
      <h2>Verify {verifType === "email" ? "Email" : "Phone"}</h2>

      <div style={{ marginBottom: 12 }}>
        <label>
          <input
            type="radio"
            name="verifType"
            checked={verifType === "email"}
            onChange={() => setVerifType("email")}
            disabled={!initialEmail}
          />{" "}
          Email {initialEmail ? `(${maskEmail(initialEmail)})` : ""}
        </label>
        <label style={{ marginLeft: 12 }}>
          <input
            type="radio"
            name="verifType"
            checked={verifType === "phone"}
            onChange={() => setVerifType("phone")}
            disabled={!initialPhone}
          />{" "}
          Phone {initialPhone ? `(${maskPhone(initialPhone)})` : ""}
        </label>
      </div>

      <form onSubmit={handleVerify}>
        <div style={{ marginBottom: 12 }}>
          <input
            placeholder="Enter 6-digit OTP"
            value={otp}
            onChange={(e) => setOtp(e.target.value.replace(/\D/g, "").slice(0, 6))}
            inputMode="numeric"
            pattern="\d{6}"
            style={{ fontSize: 18, padding: "8px 12px", width: "100%" }}
            required
          />
        </div>

        <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
          <button type="submit" disabled={loading} style={{ padding: "8px 16px" }}>
            {loading ? "Verifying..." : "Verify"}
          </button>

          <button type="button" onClick={handleResend} disabled={resendCooldown > 0} style={{ padding: "8px 12px" }}>
            {resendCooldown > 0 ? `Resend in ${resendCooldown}s` : "Resend OTP"}
          </button>

          <div style={{ marginLeft: "auto" }}>
            <small>Expires in: {formatTime(secondsLeft)}</small>
          </div>
        </div>

        {statusMsg && (
          <div style={{ marginTop: 12, color: statusMsg.type === "error" ? "crimson" : "green" }}>
            {statusMsg.text}
          </div>
        )}
      </form>

      <div style={{ marginTop: 18 }}>
        <small>If you don't receive the code, try sending again or check your spam folder.</small>
      </div>
    </div>
  );
}
