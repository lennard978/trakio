import React from "react";
import Card from "../components/ui/Card";

export default function Datenschutz() {
  // You provided:
  // Individual, Germany, email: shparavalo78nenad@yahoo.com, Kassel 34134
  // Stripe: yes, Vercel: yes, Upstash: yes, Push notifications: no (for now)

  const controllerName = "PLEASE ENTER YOUR FULL NAME";
  const controllerStreet = "PLEASE ENTER STREET + HOUSE NUMBER";
  const controllerCity = "34134 Kassel, Germany";
  const controllerEmail = "shparavalo78nenad@yahoo.com";

  return (
    <div className="max-w-3xl mx-auto p-4 space-y-4">
      <div className="px-1">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
          Datenschutzerklärung
        </h1>
        <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
          Informationen zur Verarbeitung personenbezogener Daten
        </p>
      </div>

      <Card className="space-y-6">
        <section className="space-y-2">
          <h2 className="text-lg font-semibold">1. Verantwortlicher</h2>
          <div className="text-sm text-gray-700 dark:text-gray-300 leading-6">
            <div>{controllerName}</div>
            <div>{controllerStreet}</div>
            <div>{controllerCity}</div>
            <div>
              E-Mail:{" "}
              <a className="underline" href={`mailto:${controllerEmail}`}>
                {controllerEmail}
              </a>
            </div>
          </div>
        </section>

        <section className="space-y-2">
          <h2 className="text-lg font-semibold">2. Welche Daten verarbeiten wir?</h2>
          <div className="text-sm text-gray-700 dark:text-gray-300 space-y-2">
            <p>
              Bei der Nutzung der App verarbeiten wir insbesondere:
            </p>
            <ul className="list-disc pl-5 space-y-1">
              <li>Account-Daten (z. B. E-Mail-Adresse, Login-Token).</li>
              <li>App-Inhalte (z. B. Abonnements, Kategorien, Zahlungsdaten/History, Einstellungen).</li>
              <li>Technische Daten (z. B. IP-Adresse, Geräte-/Browserdaten, Log-Daten), soweit für Betrieb/Sicherheit erforderlich.</li>
            </ul>
          </div>
        </section>

        <section className="space-y-2">
          <h2 className="text-lg font-semibold">3. Zwecke & Rechtsgrundlagen</h2>
          <div className="text-sm text-gray-700 dark:text-gray-300 space-y-2">
            <p>Wir verarbeiten Daten für folgende Zwecke:</p>
            <ul className="list-disc pl-5 space-y-1">
              <li>Bereitstellung der App-Funktionen und Verwaltung von Accounts.</li>
              <li>Speicherung und Synchronisierung deiner Abonnement-Daten.</li>
              <li>Abwicklung von Zahlungen und Premium-Funktionen (Stripe).</li>
              <li>IT-Sicherheit, Missbrauchsprävention und Fehleranalyse.</li>
            </ul>
            <p className="text-xs text-gray-500">
              Rechtsgrundlagen sind je nach Kontext insbesondere Art. 6 Abs. 1 lit. b DSGVO (Vertrag/Account),
              Art. 6 Abs. 1 lit. f DSGVO (berechtigtes Interesse, z. B. Sicherheit) sowie ggf. Art. 6 Abs. 1 lit. a DSGVO (Einwilligung),
              sofern du eine solche erteilst.
            </p>
          </div>
        </section>

        <section className="space-y-2">
          <h2 className="text-lg font-semibold">4. Empfänger / Dienstleister</h2>
          <div className="text-sm text-gray-700 dark:text-gray-300 space-y-2">
            <p>
              Wir setzen Dienstleister (Auftragsverarbeiter) ein, um die App zuverlässig zu betreiben:
            </p>
            <ul className="list-disc pl-5 space-y-1">
              <li>
                Hosting/Deployment: Vercel (Server- und Log-Verarbeitung).
              </li>
              <li>
                Datenbank/Storage: Upstash (Speicherung deiner App-Daten).
              </li>
              <li>
                Zahlungsabwicklung: Stripe (Zahlung, Billing-Portal, Abos).
              </li>
            </ul>
            <p className="text-xs text-gray-500">
              Weitere Informationen findest du in den Datenschutzhinweisen der Anbieter:
              {" "}
              <a className="underline" href="https://vercel.com/legal/privacy-policy" target="_blank" rel="noreferrer">
                Vercel
              </a>
              ,{" "}
              <a className="underline" href="https://upstash.com/privacy" target="_blank" rel="noreferrer">
                Upstash
              </a>
              ,{" "}
              <a className="underline" href="https://stripe.com/privacy" target="_blank" rel="noreferrer">
                Stripe
              </a>
              .
            </p>
          </div>
        </section>

        <section className="space-y-2">
          <h2 className="text-lg font-semibold">5. Speicherdauer</h2>
          <p className="text-sm text-gray-700 dark:text-gray-300">
            Wir speichern deine Daten grundsätzlich nur so lange, wie es für die Bereitstellung der App
            und der jeweiligen Zwecke erforderlich ist. Account- und App-Daten kannst du durch Löschen
            deines Accounts entfernen lassen (sofern implementiert). Gesetzliche Aufbewahrungspflichten
            (z. B. bei zahlungsrelevanten Vorgängen) bleiben unberührt.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-lg font-semibold">6. Deine Rechte</h2>
          <div className="text-sm text-gray-700 dark:text-gray-300 space-y-2">
            <p>
              Du hast das Recht auf Auskunft, Berichtigung, Löschung, Einschränkung der Verarbeitung,
              Datenübertragbarkeit sowie Widerspruch gegen Verarbeitung, soweit die gesetzlichen Voraussetzungen erfüllt sind.
            </p>
            <p>
              Du kannst dich außerdem bei einer Datenschutzaufsichtsbehörde beschweren.
              Für Hessen ist dies der Hessische Beauftragte für Datenschutz und Informationsfreiheit.
            </p>
          </div>
        </section>

        <section className="space-y-2">
          <h2 className="text-lg font-semibold">7. Kontakt</h2>
          <p className="text-sm text-gray-700 dark:text-gray-300">
            Bei Fragen zur Verarbeitung deiner Daten kontaktiere uns unter{" "}
            <a className="underline" href={`mailto:${controllerEmail}`}>
              {controllerEmail}
            </a>
            .
          </p>
        </section>
      </Card>
    </div>
  );
}
