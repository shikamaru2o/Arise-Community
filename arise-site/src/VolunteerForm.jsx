import React, { useState, useRef, useEffect } from "react";
import { Link } from "react-router-dom";
import LanguageSelector from "./LanguageSelector";
import { useI18n } from "./i18n";

const API_BASE = import.meta.env.VITE_API_URL || "/api";

const AGE_GROUPS = ["15-21", "21-30", "30 Above"];
const GENDERS = ["Male", "Female"];
const ROLES = [
  "Registration", "Ushers", "Parking", "Security", "Hospitality",
  "Prayer and Counselling", "Production", "Media", "Stage",
  "Medical", "Logistics",
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

function validate(form, t) {
  const errors = {};
  if (!form.firstName.trim()) errors.firstName = t("volunteer.required", { field: t("volunteer.firstName") });
  if (!form.lastName.trim()) errors.lastName = t("volunteer.required", { field: t("volunteer.lastName") });
  if (!form.email.trim()) errors.email = t("volunteer.required", { field: t("volunteer.email") });
  else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim())) {
    errors.email = t("volunteer.invalidEmail");
  }
  if (!form.mobileNumber.trim()) errors.mobileNumber = t("volunteer.required", { field: t("volunteer.mobile") });
  else if (!/^[0-9+()\-\s]{7,20}$/.test(form.mobileNumber.trim())) {
    errors.mobileNumber = t("volunteer.invalidMobile");
  }
  if (!form.ageGroup) errors.ageGroup = t("volunteer.selectAge");
  if (!form.churchName.trim()) errors.churchName = t("volunteer.required", { field: t("volunteer.church") });
  if (!form.volunteerRole) errors.volunteerRole = t("volunteer.selectVolunteerRole");
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
  const { t } = useI18n();
  const [form, setForm] = useState(EMPTY_FORM);
  const [errors, setErrors] = useState({});
  const [status, setStatus] = useState("idle");
  const [serverMessage, setServerMessage] = useState("");
  const submittingRef = useRef(false);

  useEffect(() => {
    document.title = `${t("volunteer.title")} | ${t("brand")}`;
  }, [t]);

  const update = (key) => (e) => {
    setForm((f) => ({ ...f, [key]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    // Guard against duplicate submissions (double Enter clicks / quick resubmits).
    if (submittingRef.current || status === "submitting") return;
    const fieldErrors = validate(form, t);
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
        setServerMessage(data.error || t("volunteer.genericError"));
        setStatus("error");
        return;
      }
      setStatus("success");
      setForm(EMPTY_FORM);
    } catch (err) {
      setServerMessage(t("volunteer.serverError"));
      setStatus("error");
    } finally {
      submittingRef.current = false;
    }
  };

  if (status === "success") {
    return (
      <div className="vf-root">
        <VfStyles />
        <div className="vf-language"><LanguageSelector /></div>
        <Link to="/" className="vf-home">{t("common.backHome")}</Link>
        <div className="vf-success">
          <h2>{t("volunteer.successTitle")}</h2>
          <p>{t("volunteer.successText")}</p>
          <button className="vf-btn" onClick={() => setStatus("idle")}>
            {t("volunteer.another")}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="vf-root">
      <VfStyles />
      <div className="vf-language"><LanguageSelector /></div>
      <Link to="/" className="vf-home">{t("common.backHome")}</Link>
      <form className="vf-form" onSubmit={handleSubmit} noValidate>
        <h2 className="vf-title">{t("volunteer.title")}</h2>
        <p className="vf-subtitle">{t("volunteer.subtitle")}</p>

        <div className="vf-row">
          <Field label={t("volunteer.firstName")} required error={errors.firstName}>
            <input value={form.firstName} onChange={update("firstName")} type="text" />
          </Field>
          <Field label={t("volunteer.lastName")} required error={errors.lastName}>
            <input value={form.lastName} onChange={update("lastName")} type="text" />
          </Field>
        </div>

        <div className="vf-row">
          <Field label={t("volunteer.mobile")} required error={errors.mobileNumber}>
            <input value={form.mobileNumber} onChange={update("mobileNumber")} type="tel" autoComplete="tel" />
          </Field>
          <Field label={t("volunteer.email")} required error={errors.email}>
            <input value={form.email} onChange={update("email")} type="email" />
          </Field>
        </div>

        <div className="vf-row">
          <Field label={t("volunteer.age")} required error={errors.ageGroup}>
            <select value={form.ageGroup} onChange={update("ageGroup")}>
              <option value="">{t("volunteer.select")}</option>
              {AGE_GROUPS.map((g) => <option key={g} value={g}>{t(`volunteer.${g === "15-21" ? "age15" : g === "21-30" ? "age21" : "age30"}`)}</option>)}
            </select>
          </Field>
          <Field label={t("volunteer.gender")} error={errors.gender}>
            <select value={form.gender} onChange={update("gender")}>
              <option value="">{t("volunteer.preferNot")}</option>
              {GENDERS.map((g) => <option key={g} value={g}>{t(g === "Male" ? "volunteer.male" : "volunteer.female")}</option>)}
            </select>
          </Field>
        </div>

        <div className="vf-row">
          <Field label={t("volunteer.church")} required error={errors.churchName}>
            <input value={form.churchName} onChange={update("churchName")} type="text" />
          </Field>
          <Field label={`${t("volunteer.pastor")} ${t("volunteer.optional")}`} error={errors.pastorName}>
            <input value={form.pastorName} onChange={update("pastorName")} type="text" />
          </Field>
        </div>

        <Field label={`${t("volunteer.churchLocation")} ${t("volunteer.optional")}`} error={errors.churchLocation}>
          <input value={form.churchLocation} onChange={update("churchLocation")} type="text" />
        </Field>

        <Field label={t("volunteer.role")} required error={errors.volunteerRole}>
          <select value={form.volunteerRole} onChange={update("volunteerRole")}>
            <option value="">{t("volunteer.selectRole")}</option>
              {ROLES.map((r) => <option key={r} value={r}>{t(`volunteer.roles.${r}`)}</option>)}
          </select>
        </Field>

        {serverMessage && <p className="vf-server-message">{serverMessage}</p>}

        <button className="vf-btn vf-submit" type="submit" disabled={status === "submitting"}>
          {status === "submitting" ? t("volunteer.submitting") : t("volunteer.submit")}
        </button>
      </form>
    </div>
  );
}

function VfStyles() {
  return (
    <style>{`
      .vf-root {
        position: relative;
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
        color-scheme: dark;
      }
      .vf-language { position: absolute; top: 24px; right: 6vw; }
      .vf-home {
        position: absolute;
        top: 24px;
        left: 6vw;
        display: inline-flex;
        align-items: center;
        color: var(--lav);
        font-size: 13px;
        font-weight: 500;
        letter-spacing: 0.04em;
        text-decoration: none;
        border: 1px solid rgba(227,168,87,0.35);
        border-radius: 999px;
        padding: 8px 18px;
        transition: color 0.25s ease, border-color 0.25s ease;
      }
      .vf-home:hover { color: var(--gold); border-color: var(--gold); }
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
      .vf-field option { background: #241F38; color: #F7F3EC; }
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
