import "./App.css";
import Payment from "./Payment";
import Success from "./Success";
import Cancel from "./Cancel";

import { BrowserRouter, Routes, Route } from "react-router-dom";

function App() {
  return (
    <main>
      <BrowserRouter basename="/Stripe-Exercise-3">
        <Routes>
          <Route path="/" element={<Payment />} />
          <Route path="/success" element={<Success />} />
          <Route path="/cancel" element={<Cancel />} />
        </Routes>
      </BrowserRouter>
    </main>
  );
}

export default App;
