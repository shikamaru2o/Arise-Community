import React, { useEffect, useRef, useState } from "react";

const API_BASE = import.meta.env.VITE_API_URL || "/api";

const EMPTY_FORM = {
  firstName: "",
  lastName: "",
  mobileNumber: "",
  email: "",
  area: "",
  city: "",
  consentConfirmed: false,
};

function validate(form) {
  const errors = {};
  if (!form.firstName.trim()) errors.firstName = "First name is required.";
  if (!form.lastName.trim()) errors.lastName = "Last name is required.";
  if (!form.mobileNumber.trim()) errors.mobileNumber = "Mobile number is required.";
  else if (!/^[0-9+()\-\s]{7,20}$/.test(form.mobileNumber.trim())) errors.mobileNumber = "Enter a valid mobile number.";
  if (!form.email.trim()) errors.email = "Email address is required.";
  else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim())) errors.email = "Enter a valid email address.";
  if (!form.area.trim()) errors.area = "Area is required.";
  if (!form.city.trim()) errors.city = "City is required.";
  if (!form.consentConfirmed) errors.consentConfirmed = "You must confirm that registration is voluntary.";
  return errors;
}

function Field({ label, required, error, children }) {
  return (
    <div className="er-field">
      <label className="er-label">{label}{required && <span className="er-required"> *</span>}</label>
      {children}
      {error && <span className="er-error">{error}</span>}
    </div>
  );
}

export default function EventRegistration() {
  const [form, setForm] = useState(EMPTY_FORM);
  const [errors, setErrors] = useState({});
  const [status, setStatus] = useState("idle");
  const [registrationId, setRegistrationId] = useState("");
  const [serverMessage, setServerMessage] = useState("");
  const submittingRef = useRef(false);

  useEffect(() => {
    document.title = "Event Registration | Arise Association";
  }, []);

  const update = (key) => (event) => {
    const value = key === "consentConfirmed" ? event.target.checked : event.target.value;
    setForm((current) => ({ ...current, [key]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (submittingRef.current || status === "submitting") return;
    const fieldErrors = validate(form);
    setErrors(fieldErrors);
    if (Object.keys(fieldErrors).length > 0) return;

    submittingRef.current = true;
    setStatus("submitting");
    setServerMessage("");
    try {
      const response = await fetch(`${API_BASE}/event-registrations`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await response.json();
      if (!response.ok) {
        if (data.errors) setErrors(data.errors);
        setServerMessage(data.error || "Something went wrong. Please check the form.");
        setStatus("error");
        return;
      }
      setRegistrationId(data.registrationId);
      setStatus("success");
      setForm(EMPTY_FORM);
    } catch {
      setServerMessage("Could not reach the server. Check your connection and try again.");
      setStatus("error");
    } finally {
      submittingRef.current = false;
    }
  };

  return (
    <div className="er-root">
      <EventRegistrationStyles />
      {status === "success" ? (
        <section className="er-success" aria-live="polite">
          <span className="er-eyebrow">Arise Conference 2026</span>
          <h1>Registration Successful</h1>
          <p>Thank you for registering for the event.</p>
          <div className="er-id-label">Your Event Registration ID</div>
          <div className="er-id">{registrationId}</div>
          <p className="er-note">Please save this ID. You may need it when checking in at the event.</p>
          <button className="er-button" type="button" onClick={() => setStatus("idle")}>Register another person</button>
        </section>
      ) : (
        <form className="er-form" onSubmit={handleSubmit} noValidate>
          <span className="er-eyebrow">Arise Conference 2026</span>
          <h1>Event registration</h1>
          <p className="er-subtitle">Register to attend the event. Fields marked * are required.</p>
          <div className="er-row">
            <Field label="First name" required error={errors.firstName}><input value={form.firstName} onChange={update("firstName")} type="text" /></Field>
            <Field label="Last name" required error={errors.lastName}><input value={form.lastName} onChange={update("lastName")} type="text" /></Field>
          </div>
          <div className="er-row">
            <Field label="Mobile number" required error={errors.mobileNumber}><input value={form.mobileNumber} onChange={update("mobileNumber")} type="tel" /></Field>
            <Field label="Email address" required error={errors.email}><input value={form.email} onChange={update("email")} type="email" /></Field>
          </div>
          <div className="er-row">
            <Field label="Area" required error={errors.area}><input value={form.area} onChange={update("area")} type="text" /></Field>
            <Field label="City" required error={errors.city}><input value={form.city} onChange={update("city")} type="text" /></Field>
          </div>
          <label className={`er-consent ${errors.consentConfirmed ? "er-consent-error" : ""}`}>
            <input checked={form.consentConfirmed} onChange={update("consentConfirmed")} type="checkbox" />
            <span>I confirm that I am registering voluntarily and have not been forced or coerced.</span>
          </label>
          {errors.consentConfirmed && <span className="er-error">{errors.consentConfirmed}</span>}
          {serverMessage && <p className="er-server-message">{serverMessage}</p>}
          <button className="er-button er-submit" type="submit" disabled={status === "submitting"}>
            {status === "submitting" ? "Registering..." : "Register for the event"}
          </button>
        </form>
      )}
    </div>
  );
}

function EventRegistrationStyles() {
  return (
    <style>{`
      .er-root { --er-ink: #1F1B2E; --er-gold: #E3A857; --er-cream: #F7F3EC; --er-lav: #A79FBF; --er-panel: #2A2440; --er-danger: #E0645A; min-height: 100vh; padding: 60px 6vw; display: flex; justify-content: center; align-items: flex-start; background: var(--er-ink); color: var(--er-cream); font-family: 'Work Sans', sans-serif; }
      .er-form, .er-success { width: 100%; max-width: 640px; margin: 20px 0; padding: 40px; background: var(--er-panel); border: 1px solid rgba(227,168,87,0.3); border-radius: 6px; }
      .er-success { max-width: 520px; text-align: center; }
      .er-eyebrow { color: var(--er-gold); font-size: 12px; font-weight: 500; letter-spacing: 0.18em; text-transform: uppercase; }
      .er-form h1, .er-success h1 { margin: 8px 0; font-family: 'Fraunces', serif; font-size: 34px; font-weight: 500; }
      .er-subtitle, .er-success p { margin: 0 0 28px; color: var(--er-lav); font-size: 13px; line-height: 1.7; }
      .er-row { display: grid; grid-template-columns: 1fr 1fr; gap: 18px; }
      .er-field { display: flex; flex-direction: column; gap: 6px; margin-bottom: 18px; }
      .er-label { color: var(--er-lav); font-size: 13px; }
      .er-required { color: var(--er-gold); }
      .er-field input { width: 100%; padding: 10px 12px; border: 1px solid rgba(255,255,255,0.15); border-radius: 3px; background: rgba(255,255,255,0.04); color: var(--er-cream); font: inherit; }
      .er-field input:focus { outline: none; border-color: var(--er-gold); }
      .er-error, .er-server-message { color: var(--er-danger); font-size: 12px; }
      .er-consent { display: flex; align-items: flex-start; gap: 10px; margin: 4px 0 8px; color: var(--er-lav); font-size: 13px; line-height: 1.6; cursor: pointer; }
      .er-consent input { flex: 0 0 auto; margin-top: 3px; accent-color: var(--er-gold); }
      .er-consent-error { color: var(--er-danger); }
      .er-server-message { margin: 10px 0; }
      .er-button { padding: 13px 30px; border: 1px solid var(--er-gold); border-radius: 2px; background: var(--er-gold); color: var(--er-ink); font: 500 14px 'Work Sans', sans-serif; cursor: pointer; }
      .er-button:disabled { cursor: not-allowed; opacity: 0.6; }
      .er-submit { width: 100%; margin-top: 14px; }
      .er-id-label { margin-top: 28px; color: var(--er-lav); font-size: 12px; letter-spacing: 0.12em; text-transform: uppercase; }
      .er-id { margin: 10px 0 18px; color: var(--er-gold); font-family: 'Fraunces', serif; font-size: 38px; letter-spacing: 0.04em; }
      .er-note { max-width: 360px; margin-left: auto !important; margin-right: auto !important; }
      @media (max-width: 560px) { .er-root { padding: 32px 6vw; } .er-form, .er-success { padding: 26px; } .er-row { grid-template-columns: 1fr; gap: 0; } .er-id { font-size: 29px; } }
    `}</style>
  );
}
