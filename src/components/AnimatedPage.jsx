// src/components/AnimatedPage.jsx
import React from "react";

export default function AnimatedPage({ children }) {
  return (
    <div className="page-fade-enter">
      {children}
    </div>
  );
}
