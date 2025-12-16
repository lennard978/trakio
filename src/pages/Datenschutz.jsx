// src/pages/Datenschutz.jsx
import React from "react";
import { Link } from "react-router-dom";

export default function Datenschutz() {
  return (
    <div className="max-w-2xl mx-auto px-4 py-10 text-sm text-gray-800 dark:text-gray-200">
      <h1 className="text-2xl font-bold mb-6">Datenschutzerklärung</h1>

      <p className="mb-4">
        Der Schutz Ihrer persönlichen Daten ist uns sehr wichtig. Nachfolgend informieren wir Sie über die Erhebung, Verarbeitung und Nutzung Ihrer Daten im Rahmen der Nutzung dieser App gemäß der Datenschutz-Grundverordnung (DSGVO).
      </p>

      <h2 className="text-lg font-semibold mt-6 mb-2">1. Verantwortlicher</h2>
      <p className="mb-4">
        Verantwortlich für die Datenverarbeitung in dieser App ist:
        <br />
        Ihr Firmenname<br />
        Musterstraße 1<br />
        12345 Berlin<br />
        E-Mail: kontakt@beispiel.de
      </p>

      <h2 className="text-lg font-semibold mt-6 mb-2">2. Erhobene Daten</h2>
      <p className="mb-4">
        Bei der Nutzung dieser App werden folgende personenbezogene Daten verarbeitet:
        <ul className="list-disc ml-6 mt-2">
          <li>E-Mail-Adresse bei der Registrierung</li>
          <li>Zahlungsdaten (z. B. via Stripe)</li>
          <li>Nutzungsdaten (z. B. angelegte Abonnements)</li>
        </ul>
      </p>

      <h2 className="text-lg font-semibold mt-6 mb-2">3. Zweck der Verarbeitung</h2>
      <p className="mb-4">
        Die Verarbeitung erfolgt zur Bereitstellung der App-Funktionen, zur Verwaltung von Abonnements und zur Abrechnung bei Premium-Nutzung.
      </p>

      <h2 className="text-lg font-semibold mt-6 mb-2">4. Weitergabe von Daten</h2>
      <p className="mb-4">
        Eine Weitergabe an Dritte erfolgt ausschließlich im Rahmen der Zahlungsabwicklung (z. B. Stripe).
      </p>

      <h2 className="text-lg font-semibold mt-6 mb-2">5. Ihre Rechte</h2>
      <p className="mb-4">
        Sie haben jederzeit das Recht auf Auskunft über Ihre gespeicherten Daten, deren Berichtigung oder Löschung. Bitte kontaktieren Sie uns hierzu unter der oben genannten E-Mail-Adresse.
      </p>

      <p className="mt-8">
        <Link to="/" className="underline text-blue-600 hover:text-blue-800">Zurück zur Startseite</Link>
      </p>
    </div>
  );
}
