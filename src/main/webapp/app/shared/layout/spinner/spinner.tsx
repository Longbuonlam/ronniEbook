import React from 'react';
import './spinner.scss';

interface SpinnerProps {
  size?: string;
  color?: string;
  thickness?: string;
  speed?: string;
}

const Spinner: React.FC<SpinnerProps> = ({ size = '40px', color = '#319795', thickness = '8px', speed = '1s' }) => {
  return (
    <div
      className="spinner"
      style={{
        width: size,
        height: size,
      }}
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        className="spinner__svg"
        style={{
          animationDuration: speed,
        }}
        viewBox="0 0 100 100"
      >
        {/* Base circle (track) */}
        <circle cx="50" cy="50" r="40" fill="none" stroke="#e2e8f0" strokeWidth={thickness} />

        {/* Spinner arc */}
        <circle
          cx="50"
          cy="50"
          r="40"
          fill="none"
          stroke={color}
          strokeWidth={thickness}
          strokeLinecap="round"
          strokeDasharray="62.8 188.4"
        />
      </svg>
    </div>
  );
};

export default Spinner;
