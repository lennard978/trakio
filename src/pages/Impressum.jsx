import React from "react";
import Card from "../components/ui/Card";

export default function Impressum() {
  // IMPORTANT (Germany):
  // For a compliant "Impressum", you typically need full name + full address (street + house no.).
  // You provided: Individual, Germany, email, Kassel 34134, no VAT-ID.
  // Please fill the missing street/house number below.

  const name = "PLEASE ENTER YOUR FULL NAME";
  const streetAndNo = "PLEASE ENTER STREET + HOUSE NUMBER";
  const zipCity = "34134 Kassel";
  const country = "Germany";
  const email = "shparavalo78nenad@yahoo.com";

  return (
    <div className="max-w-3xl mx-auto p-4 space-y-4">
      <div className="px-1">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
          Impressum
        </h1>
        <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
          Anbieterkennzeichnung
        </p>
      </div>

      <Card className="space-y-4">
        <section className="space-y-2">
          <h2 className="text-lg font-semibold">Anbieter</h2>
          <div className="text-sm text-gray-700 dark:text-gray-300 leading-6">
            <div>{name}</div>
            <div>{streetAndNo}</div>
            <div>{zipCity}</div>
            <div>{country}</div>
          </div>
        </section>

        <section className="space-y-2">
          <h2 className="text-lg font-semibold">Kontakt</h2>
          <div className="text-sm text-gray-700 dark:text-gray-300 leading-6">
            <div>
              E-Mail:{" "}
              <a className="underline" href={`mailto:${email}`}>
                {email}
              </a>
            </div>
          </div>
        </section>

        <section className="space-y-2">
          <h2 className="text-lg font-semibold">Umsatzsteuer</h2>
          <p className="text-sm text-gray-700 dark:text-gray-300">
            Umsatzsteuer-Identifikationsnummer (USt-IdNr.): Nicht vorhanden.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-lg font-semibold">Haftungsausschluss</h2>
          <p className="text-sm text-gray-700 dark:text-gray-300">
            Trotz sorgfältiger inhaltlicher Kontrolle übernehmen wir keine Haftung
            für die Inhalte externer Links. Für den Inhalt der verlinkten Seiten
            sind ausschließlich deren Betreiber verantwortlich.
          </p>
        </section>
      </Card>
    </div>
  );
}
