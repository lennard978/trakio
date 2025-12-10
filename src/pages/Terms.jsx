// src/pages/Terms.jsx
import React from "react";
import { Link } from "react-router-dom";

export default function Terms() {
  return (
    <div className="max-w-2xl mx-auto px-4 py-10 text-sm text-gray-800 dark:text-gray-200">
      <h1 className="text-2xl font-bold mb-6">Nutzungsbedingungen (AGB)</h1>

      <p className="mb-4">
        Mit der Nutzung dieser App akzeptieren Sie die nachfolgenden allgemeinen Geschäftsbedingungen (AGB). Bitte lesen Sie diese sorgfältig durch.
      </p>

      <h2 className="text-lg font-semibold mt-6 mb-2">1. Geltungsbereich</h2>
      <p className="mb-4">
        Diese AGB gelten für alle Nutzer der App „Trakio – Subscription Tracker“. Mit der Registrierung stimmen Sie diesen Bedingungen zu.
      </p>

      <h2 className="text-lg font-semibold mt-6 mb-2">2. Leistungsbeschreibung</h2>
      <p className="mb-4">
        Die App ermöglicht das Verwalten von wiederkehrenden Zahlungen und Abonnements. Bestimmte Funktionen sind nur in der kostenpflichtigen Premium-Version verfügbar.
      </p>

      <h2 className="text-lg font-semibold mt-6 mb-2">3. Registrierung & Nutzung</h2>
      <p className="mb-4">
        Für die Nutzung bestimmter Funktionen ist eine Registrierung erforderlich. Die angegebenen Daten müssen korrekt und vollständig sein.
      </p>

      <h2 className="text-lg font-semibold mt-6 mb-2">4. Zahlungsbedingungen</h2>
      <p className="mb-4">
        Die Premium-Version wird über Stripe abgerechnet. Es gelten die dort aufgeführten Zahlungsbedingungen. Eine Kündigung ist jederzeit zum Ende des Abrechnungszeitraums möglich.
      </p>

      <h2 className="text-lg font-semibold mt-6 mb-2">5. Haftung</h2>
      <p className="mb-4">
        Die Nutzung der App erfolgt auf eigenes Risiko. Wir übernehmen keine Gewähr für die Richtigkeit der eingegebenen oder berechneten Daten.
      </p>

      <h2 className="text-lg font-semibold mt-6 mb-2">6. Änderungen der AGB</h2>
      <p className="mb-4">
        Wir behalten uns das Recht vor, diese Nutzungsbedingungen jederzeit zu ändern. Über Änderungen werden Sie in der App informiert.
      </p>

      <h2 className="text-lg font-semibold mt-6 mb-2">7. Gerichtsstand</h2>
      <p className="mb-4">
        Es gilt das Recht der Bundesrepublik Deutschland. Gerichtsstand ist – soweit gesetzlich zulässig – Berlin.
      </p>

      <p className="mt-8">
        <Link to="/" className="underline text-blue-600 hover:text-blue-800">Zurück zur Startseite</Link>
      </p>
    </div>
  );
}
