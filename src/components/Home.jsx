import React from "react";
import bowvalley from "../assets/bowvalley.png";

import "../App.css";

export default function Home() {
  return (
    <div className="page-container">
      <h1>Welcome to Bow Valley College</h1>
      <img src={bowvalley} alt="Bow Valley College" className="hero-image" />
    </div>
  );
}
