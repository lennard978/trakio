// src/components/ui/Footer.jsx
import React from "react";
import { Link } from "react-router-dom";

export default function Footer() {
  return (
    <footer className="text-xs text-gray-500 dark:text-gray-400 text-center py-6 border-t border-gray-200 dark:border-gray-700 mt-10">
      <p>
        &copy; {new Date().getFullYear()} Trakio. All rights reserved.{" "}
        <Link to="/impressum" className="underline hover:text-blue-600">Impressum</Link>
      </p>
    </footer>
  );
}
