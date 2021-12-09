import * as React from "react";
import { Routes, Route } from "react-router-dom";
import Home from "./Home";
import Signature from "./Signature";
import "./App.css";

function App() {
  return (
    <div>
      <header>
        <h1>Welcome to LOT GAME</h1>
      </header>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="signature" element={<Signature />} />
      </Routes>
    </div>
  );
}

export default App;
