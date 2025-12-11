// src/pages/Impressum.jsx
import React from "react";
import { Link } from "react-router-dom";
export default function Impressum() {
  return (
    <div className="max-w-3xl mx-auto px-4 py-12 text-sm text-gray-800 dark:text-gray-200">
      <h1 className="text-2xl font-bold mb-6">Impressum</h1>

      <p><strong>Angaben gemäß § 5 TMG</strong></p>
      <p>Trakio<br />
        Nenad Sparavalo<br />
        Paul-Heidelbach-Strasse 10<br />
        34134 Kassel<br />
        Deutschland</p>

      <p className="mt-4"><strong>Vertreten durch:</strong><br />
        Nenad Sparavalo</p>

      <p className="mt-4"><strong>Kontakt:</strong><br />
        E-Mail: shparavalo78nenad@yahoo.com<br />
        Telefon: +49 152 07934274</p>

      <p className="mt-4"><strong>Umsatzsteuer-ID:</strong><br />
        Umsatzsteuer-Identifikationsnummer gemäß §27 a Umsatzsteuergesetz: DE123456789</p>

      <p className="mt-4"><strong>Verantwortlich für den Inhalt nach § 55 Abs. 2 RStV:</strong><br />
        Nenad Sparavalo<br />
        Paul-Heidelbach-Strasse 10<br />
        34134 Kassel</p>

      <p className="mt-4"><strong>Online-Streitbeilegung:</strong><br />
        Die Europäische Kommission stellt eine Plattform zur Online-Streitbeilegung (OS) bereit:<br />
        <a href="https://ec.europa.eu/consumers/odr" target="_blank" rel="noreferrer" className="text-blue-600 underline">https://ec.europa.eu/consumers/odr</a><br />
        Unsere E-Mail-Adresse finden Sie oben im Impressum.</p>

      <p className="mt-4"><strong>Haftungsausschluss:</strong><br />
        Trotz sorgfältiger inhaltlicher Kontrolle übernehmen wir keine Haftung für die Inhalte externer Links.<br />
        Für den Inhalt der verlinkten Seiten sind ausschließlich deren Betreiber verantwortlich.</p>

      <p className="mt-4"><strong>Urheberrecht:</strong><br />
        Die durch die Seitenbetreiber erstellten Inhalte und Werke auf diesen Seiten unterliegen dem deutschen Urheberrecht.</p>
      <p className="mt-8">
        <Link to="/" className="underline text-blue-600 hover:text-blue-800">Zurück zur Startseite</Link>
      </p>
    </div>
  );
}
