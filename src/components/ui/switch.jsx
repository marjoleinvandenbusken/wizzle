import React from 'react';

export function Switch({ checked, onChange }) {
  return (
    <input
      type="checkbox"
      checked={checked}
      onChange={(e) => onChange(e.target.checked)}
      className="w-5 h-5 accent-blue-600"
    />
  );
}
