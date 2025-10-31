 // filepath: src/components/Programs.jsx
import React, { useState } from 'react';
import '../App.css';
import PROGRAMS from '../data/programs';

export default function Programs() {
  const [selected, setSelected] = useState(null);

  return (
    <div className='signup-container programs-page'>
      <h2>Programs  Software Development (SD)</h2>

      <div className='programs-list'>
        {PROGRAMS.map(p => (
          <div key={p.id} className='program-card'>
            <div className='program-header'>
              <h3 className='program-title'>{p.title}</h3>
              <div className='program-term'>{p.term}</div>
            </div>
            <p className='program-snippet'>{p.description.slice(0, 120)}{p.description.length>120?'...':''}</p>
            <div style={{display:'flex', gap:8, marginTop:8}}>
              <button className='btn' onClick={() => setSelected(p)}>View Details</button>
              <button className='btn add-btn' onClick={() => window.location.href = '/signup'}>Sign Up</button>
            </div>
          </div>
        ))}
      </div>

      {selected && (
        <div className='program-details'>
          <h3>{selected.title}</h3>
          <p><strong>Term:</strong> {selected.term}</p>
          <p><strong>Start:</strong> {new Date(selected.startDate).toLocaleDateString()}</p>
          <p><strong>End:</strong> {new Date(selected.endDate).toLocaleDateString()}</p>
          <p><strong>Fees:</strong> Domestic  / International </p>
          <p>{selected.description}</p>
          <div style={{display:'flex', gap:8}}>
            <button className='btn' onClick={() => setSelected(null)}>Close</button>
            <button className='btn primary' onClick={() => window.location.href = '/signup'}>Register for Program</button>
          </div>
        </div>
      )}
    </div>
  );
}
