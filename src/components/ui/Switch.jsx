'use client';

// an on/off toggle with a sliding knob; a button with role="switch", so it works with Space and Enter
export default function Switch({ checked, onChange, children }) {
  return (
    <button type="button" role="switch" aria-checked={checked} className="switch" onClick={() => onChange(!checked)}>
      <span className="switch-track" aria-hidden="true"><span className="switch-knob" /></span>
      <span>{children}</span>
    </button>
  );
}
