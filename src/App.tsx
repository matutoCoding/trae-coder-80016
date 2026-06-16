import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import Layout from "@/components/Layout";
import Dashboard from "@/pages/Dashboard";
import Schedule from "@/pages/Schedule";
import Rooms from "@/pages/Rooms";
import Waitlist from "@/pages/Waitlist";
import Pricing from "@/pages/Pricing";
import Bills from "@/pages/Bills";
import CheckIn from "@/pages/CheckIn";

export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        <Route element={<Layout />}>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/schedule" element={<Schedule />} />
          <Route path="/rooms" element={<Rooms />} />
          <Route path="/waitlist" element={<Waitlist />} />
          <Route path="/pricing" element={<Pricing />} />
          <Route path="/bills" element={<Bills />} />
          <Route path="/checkin" element={<CheckIn />} />
        </Route>
      </Routes>
    </Router>
  );
}
