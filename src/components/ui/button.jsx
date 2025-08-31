import React from 'react';

export function Button({
  children,
  onClick,
  type = 'button',
  variant = 'primary', // primary | secondary | outline | ghost
  className = '',
  disabled = false,
}) {
  const base = 'btn ' + className;
  const map = {
    primary: 'btn-primary',
    secondary: 'btn-secondary',
    outline: 'btn-outline',
    ghost: '',
  };
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`${base} ${map[variant] || ''} ${
        disabled ? 'opacity-60 cursor-not-allowed' : ''
      }`}
    >
      {children}
    </button>
  );
}
