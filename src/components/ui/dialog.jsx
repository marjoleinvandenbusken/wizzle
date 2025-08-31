import React from "react";

export function Dialog({ children }) {
  return <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-40">{children}</div>;
}

export function DialogContent({ children }) {
  return <div className="bg-white p-4 rounded shadow">{children}</div>;
}

export function DialogHeader({ children }) {
  return <div className="mb-2">{children}</div>;
}

export function DialogTitle({ children }) {
  return <h2 className="text-lg font-bold">{children}</h2>;
}

export function DialogDescription({ children }) {
  return <p className="text-sm text-gray-500">{children}</p>;
}

export function DialogFooter({ children }) {
  return <div className="mt-2">{children}</div>;
}