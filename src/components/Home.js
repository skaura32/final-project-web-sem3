import React from 'react';
import { Link } from 'react-router-dom';

export default function Home({ programs, courses }){
  return (
    <div>
      <section className="card">
        <h2>Programs</h2>
        <div className="grid">
          {programs.map(p=> (
            <div key={p.id} className="card">
              <h3>{p.name}</h3>
              <p><strong>Term:</strong> {p.term}</p>
              <p>{p.description}</p>
              <p><strong>Fees:</strong> Domestic ${p.fees.domestic} / International ${p.fees.international}</p>
            </div>
          ))}
        </div>
      </section>

      <section style={{marginTop:12}} className="card">
        <h2>Courses</h2>
        <div className="grid" style={{marginTop:8}}>
          {courses.map(c=> (
            <div key={c.id} className="course">
              <h4>{c.code} — {c.name}</h4>
              <p className="small">Term: {c.term} | {c.startDate} - {c.endDate}</p>
              <p>{c.description}</p>
            </div>
          ))}
        </div>
      </section>

      <section style={{marginTop:12}} className="card">
        <h3>How to start</h3>
        <ol>
          <li>Signup as a student (or admin for demo).</li>
          <li>Login and select a term.</li>
          <li>Register for 2-5 courses per term.</li>
        </ol>
        <p>Use Signup / Login links above.</p>
      </section>
    </div>
  );
}
