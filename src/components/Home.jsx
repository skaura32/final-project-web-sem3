import React from "react";
import bowvalley from "../assets/bowvalley.png";

import "../App.css";

export default function Home() {
  return (
    <>
      <header
        className="hero"
        style={{ backgroundImage: `url(${bowvalley})` }}
        aria-label="Bow Valley College hero"
      >
        <div className="hero-overlay">
          <div className="container hero-content">
            <h1>Welcome to Bow Valley College</h1>
            <p className="hero-sub">Register for courses, manage your profile, and explore programs.</p>
          </div>
        </div>
      </header>

      <main className="container page-content">
        {/* Keep this area for intro or quick links if needed */}
        <section className="intro-card card">
          <h2>Get started</h2>
          <p className="muted">Sign up or log in to begin registering for courses.</p>
        </section>
      </main>
    </>
  );
}
