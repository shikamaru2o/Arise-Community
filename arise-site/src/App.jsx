import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import ArisePage from "./AriseCommunitySite";
import VolunteerForm from "./VolunteerForm";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<ArisePage />} />
        <Route path="/volunteer" element={<VolunteerForm />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
