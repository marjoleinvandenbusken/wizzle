import React from 'react';

export function Input({
  value,
  onChange,
  placeholder,
  onKeyDown,
  className = '',
}) {
  return (
    <input
      value={value}
      onChange={onChange}
      onKeyDown={onKeyDown}
      placeholder={placeholder}
      className={`border px-2 py-1 rounded w-full ${className}`}
    />
  );
}
