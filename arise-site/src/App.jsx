import React from "react";
import { BrowserRouter, Routes, Route, Link } from "react-router-dom";
import ArisePage from "./AriseCommunitySite";
import VolunteerForm from "./VolunteerForm";
import EventRegistration from "./EventRegistration";
import GivePage from "./GivePage";

function NotFoundPage() {
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
        Page not found
      </h1>
      <p style={{ color: "#A79FBF", margin: 0, maxWidth: 420, lineHeight: 1.7 }}>
        The page you're looking for doesn't exist or has moved.
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
        Back to home
      </Link>
    </div>
  );
}

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<ArisePage />} />
        <Route path="/volunteer" element={<VolunteerForm />} />
        <Route path="/register" element={<EventRegistration />} />
        <Route path="/give" element={<GivePage />} />
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;