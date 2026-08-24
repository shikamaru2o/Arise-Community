import React, { useState, useRef, useEffect } from "react";

const API_BASE = import.meta.env.VITE_API_URL || "/api";

const AGE_GROUPS = ["15-21", "21-30", "30 Above"];
const GENDERS = ["Male", "Female", "Third Choice"];
const ROLES = [
  "Registration", "Ushers", "Parking", "Security", "Hospitality",
  "Prayers & Counselling", "Production", "Media", "Stage",
  "Medical", "Logistics", "Leadership",
];

const EMPTY_FORM = {
  firstName: "",
  lastName: "",
  mobileNumber: "",
  email: "",
  ageGroup: "",
  gender: "",
  churchName: "",
  pastorName: "",
  churchLocation: "",
  volunteerRole: "",
};

function validate(form) {
  const errors = {};
  if (!form.firstName.trim()) errors.firstName = "First name is required.";
  if (!form.lastName.trim()) errors.lastName = "Last name is required.";
  if (!form.email.trim()) errors.email = "Email address is required.";
  else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim())) {
    errors.email = "Enter a valid email address.";
  }
  if (form.mobileNumber && !/^[0-9+()\-\s]{7,20}$/.test(form.mobileNumber.trim())) {
    errors.mobileNumber = "Enter a valid mobile number.";
  }
  if (!form.ageGroup) errors.ageGroup = "Select an age group.";
  if (!form.churchName.trim()) errors.churchName = "Church name is required.";
  if (!form.pastorName.trim()) errors.pastorName = "Pastor's name is required.";
  if (!form.churchLocation.trim()) errors.churchLocation = "Church location is required.";
  if (!form.volunteerRole) errors.volunteerRole = "Select a preferred volunteer role.";
  return errors;
}

function Field({ label, required, error, children }) {
  return (
    <div className="vf-field">
      <label className="vf-label">
        {label}{required && <span className="vf-required"> *</span>}
      </label>
      {children}
      {error && <span className="vf-error">{error}</span>}
    </div>
  );
}

export default function VolunteerForm() {
  const [form, setForm] = useState(EMPTY_FORM);
  const [errors, setErrors] = useState({});
  const [status, setStatus] = useState("idle");
  const [serverMessage, setServerMessage] = useState("");
  const submittingRef = useRef(false);

  useEffect(() => {
    document.title = "Volunteer Registration | Arise Association";
  }, []);

  const update = (key) => (e) => {
    setForm((f) => ({ ...f, [key]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    // Guard against duplicate submissions (double Enter clicks / quick resubmits).
    if (submittingRef.current || status === "submitting") return;
    const fieldErrors = validate(form);
    setErrors(fieldErrors);
    if (Object.keys(fieldErrors).length > 0) return;

    submittingRef.current = true;
    setStatus("submitting");
    setServerMessage("");
    try {
      const res = await fetch(`${API_BASE}/volunteers`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) {
        if (data.errors) setErrors(data.errors);
        setServerMessage(data.error || "Something went wrong. Please check the form.");
        setStatus("error");
        return;
      }
      setStatus("success");
      setForm(EMPTY_FORM);
    } catch (err) {
      setServerMessage("Could not reach the server. Check your connection and try again.");
      setStatus("error");
    } finally {
      submittingRef.current = false;
    }
  };

  if (status === "success") {
    return (
      <div className="vf-root">
        <VfStyles />
        <div className="vf-success">
          <h2>You're registered</h2>
          <p>Thanks for signing up to volunteer. We'll be in touch with next steps.</p>
          <button className="vf-btn" onClick={() => setStatus("idle")}>
            Register another volunteer
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="vf-root">
      <VfStyles />
      <form className="vf-form" onSubmit={handleSubmit} noValidate>
        <h2 className="vf-title">Volunteer registration</h2>
        <p className="vf-subtitle">Fields marked * are required.</p>

        <div className="vf-row">
          <Field label="First name" required error={errors.firstName}>
            <input value={form.firstName} onChange={update("firstName")} type="text" />
          </Field>
          <Field label="Last name" required error={errors.lastName}>
            <input value={form.lastName} onChange={update("lastName")} type="text" />
          </Field>
        </div>

        <div className="vf-row">
          <Field label="Mobile number" error={errors.mobileNumber}>
            <input value={form.mobileNumber} onChange={update("mobileNumber")} type="tel" placeholder="+91 98765 43210" />
          </Field>
          <Field label="Email address" required error={errors.email}>
            <input value={form.email} onChange={update("email")} type="email" />
          </Field>
        </div>

        <div className="vf-row">
          <Field label="Age group" required error={errors.ageGroup}>
            <select value={form.ageGroup} onChange={update("ageGroup")}>
              <option value="">Select</option>
              {AGE_GROUPS.map((g) => <option key={g} value={g}>{g}</option>)}
            </select>
          </Field>
          <Field label="Gender" error={errors.gender}>
            <select value={form.gender} onChange={update("gender")}>
              <option value="">Prefer not to say</option>
              {GENDERS.map((g) => <option key={g} value={g}>{g}</option>)}
            </select>
          </Field>
        </div>

        <div className="vf-row">
          <Field label="Church name" required error={errors.churchName}>
            <input value={form.churchName} onChange={update("churchName")} type="text" />
          </Field>
          <Field label="Pastor's name" required error={errors.pastorName}>
            <input value={form.pastorName} onChange={update("pastorName")} type="text" />
          </Field>
        </div>

        <Field label="Church location" required error={errors.churchLocation}>
          <input value={form.churchLocation} onChange={update("churchLocation")} type="text" />
        </Field>

        <Field label="Preferred volunteer role" required error={errors.volunteerRole}>
          <select value={form.volunteerRole} onChange={update("volunteerRole")}>
            <option value="">Select a role</option>
            {ROLES.map((r) => <option key={r} value={r}>{r}</option>)}
          </select>
        </Field>

        {serverMessage && <p className="vf-server-message">{serverMessage}</p>}

        <button className="vf-btn vf-submit" type="submit" disabled={status === "submitting"}>
          {status === "submitting" ? "Submitting..." : "Register to volunteer"}
        </button>
      </form>
    </div>
  );
}

function VfStyles() {
  return (
    <style>{`
      .vf-root {
        --ink: #1F1B2E;
        --gold: #E3A857;
        --cream: #F7F3EC;
        --lav: #A79FBF;
        --panel: #2A2440;
        --danger: #E0645A;
        font-family: 'Work Sans', sans-serif;
        background: var(--ink);
        color: var(--cream);
        padding: 60px 6vw;
        display: flex;
        justify-content: center;
      }
      .vf-form {
        width: 100%;
        max-width: 640px;
        background: var(--panel);
        border: 1px solid rgba(227,168,87,0.3);
        border-radius: 6px;
        padding: 40px;
      }
      .vf-title { font-family: 'Fraunces', serif; font-size: 28px; margin: 0 0 6px; font-weight: 500; }
      .vf-subtitle { color: var(--lav); font-size: 13px; margin: 0 0 28px; }
      .vf-row { display: grid; grid-template-columns: 1fr 1fr; gap: 18px; }
      .vf-field { margin-bottom: 18px; display: flex; flex-direction: column; gap: 6px; }
      .vf-label { font-size: 13px; color: var(--lav); }
      .vf-required { color: var(--gold); }
      .vf-field input, .vf-field select {
        background: rgba(255,255,255,0.04);
        border: 1px solid rgba(255,255,255,0.15);
        border-radius: 3px;
        padding: 10px 12px;
        color: var(--cream);
        font-size: 14px;
        font-family: inherit;
      }
      .vf-field input:focus, .vf-field select:focus {
        outline: none;
        border-color: var(--gold);
      }
      .vf-error { color: var(--danger); font-size: 12px; }
      .vf-server-message { color: var(--danger); font-size: 13px; margin: 4px 0 16px; }
      .vf-btn {
        font-family: 'Work Sans', sans-serif;
        font-weight: 500;
        font-size: 14px;
        padding: 13px 30px;
        border-radius: 2px;
        background: var(--gold);
        color: #1F1B2E;
        border: 1px solid var(--gold);
        cursor: pointer;
      }
      .vf-btn:disabled { opacity: 0.6; cursor: not-allowed; }
      .vf-submit { width: 100%; margin-top: 8px; }
      .vf-success {
        max-width: 480px;
        text-align: center;
        background: var(--panel);
        border: 1px solid rgba(227,168,87,0.3);
        border-radius: 6px;
        padding: 48px 36px;
      }
      .vf-success h2 { font-family: 'Fraunces', serif; margin: 0 0 10px; }
      .vf-success p { color: var(--lav); margin: 0 0 24px; line-height: 1.6; }
      @media (max-width: 560px) {
        .vf-row { grid-template-columns: 1fr; }
        .vf-form { padding: 26px; }
      }
    `}</style>
  );
}
