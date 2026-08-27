import React from "react";
import { BrowserRouter, Routes, Route, Link } from "react-router-dom";
import ArisePage from "./AriseCommunitySite";
import VolunteerForm from "./VolunteerForm";
import EventRegistration from "./EventRegistration";
import GivePage from "./GivePage";
import { I18nProvider } from "./i18n";
import { useI18n } from "./i18n";

function NotFoundPage() {
  const { t } = useI18n();
  return (
    <div
      style={{
        fontFamily: "'Work Sans', sans-serif",
        background: "#1F1B2E",
        color: "#F7F3EC",
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        textAlign: "center",
        padding: "40px 6vw",
        gap: 12,
      }}
    >
      <h1 style={{ fontFamily: "'Fraunces', serif", fontWeight: 500, fontSize: 48, margin: 0 }}>
        {t("common.notFound")}
      </h1>
      <p style={{ color: "#A79FBF", margin: 0, maxWidth: 420, lineHeight: 1.7 }}>
        {t("common.notFoundText")}
      </p>
      <Link
        to="/"
        style={{
          marginTop: 14,
          display: "inline-block",
          fontFamily: "'Work Sans', sans-serif",
          fontWeight: 500,
          fontSize: 14,
          padding: "13px 32px",
          borderRadius: 2,
          background: "#E3A857",
          color: "#1F1B2E",
          textDecoration: "none",
          border: "1px solid #E3A857",
        }}
      >
        {t("common.backHome")}
      </Link>
    </div>
  );
}

function App() {
  return (
    <I18nProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<ArisePage />} />
          <Route path="/volunteer" element={<VolunteerForm />} />
          <Route path="/register" element={<EventRegistration />} />
          <Route path="/give" element={<GivePage />} />
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </BrowserRouter>
    </I18nProvider>
  );
}

export default App;