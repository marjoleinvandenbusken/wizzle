import React, { useState } from 'react';

export function Tabs({ children, defaultValue }) {
  const [active, setActive] = useState(defaultValue);
  return (
    <div>
      {React.Children.map(children, (child) =>
        child.type.displayName === 'TabsList'
          ? React.cloneElement(child, { active, setActive })
          : child.type.displayName === 'TabsContent'
          ? active === child.props.value
            ? child
            : null
          : child
      )}
    </div>
  );
}

export function TabsList({ children, active, setActive }) {
  return (
    <div className="flex gap-2 mb-4">
      {React.Children.map(children, (child) =>
        React.cloneElement(child, { active, setActive })
      )}
    </div>
  );
}
TabsList.displayName = 'TabsList';

export function TabsTrigger({ value, children, active, setActive }) {
  return (
    <button
      onClick={() => setActive(value)}
      className={`px-3 py-1 rounded ${
        active === value ? 'bg-blue-600 text-white' : 'bg-gray-200'
      }`}
    >
      {children}
    </button>
  );
}
TabsTrigger.displayName = 'TabsTrigger';

export function TabsContent({ value, children }) {
  return <div>{children}</div>;
}
TabsContent.displayName = 'TabsContent';
