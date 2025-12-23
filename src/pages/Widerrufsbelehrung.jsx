export default function Widerrufsbelehrung() {
  return (
    <div className="max-w-3xl mx-auto p-4 text-sm space-y-4">
      <h1 className="text-xl font-semibold">
        Widerrufsbelehrung
      </h1>

      <h2 className="font-semibold">Widerrufsrecht</h2>
      <p>
        Verbraucher haben das Recht, binnen vierzehn Tagen ohne Angabe von
        Gründen diesen Vertrag zu widerrufen.
      </p>

      <p>
        Die Widerrufsfrist beträgt vierzehn Tage ab dem Tag des
        Vertragsabschlusses.
      </p>

      <h2 className="font-semibold">Ausübung des Widerrufs</h2>
      <p>
        Um Ihr Widerrufsrecht auszuüben, müssen Sie uns (Trakio, Kassel,
        Deutschland, E-Mail: support@trakio.de) mittels einer eindeutigen
        Erklärung (z. B. per E-Mail) über Ihren Entschluss informieren.
      </p>

      <h2 className="font-semibold">
        Ausschluss des Widerrufsrechts bei digitalen Inhalten
      </h2>
      <p>
        Das Widerrufsrecht erlischt vorzeitig, wenn wir mit der Ausführung des
        Vertrags begonnen haben, nachdem Sie ausdrücklich zugestimmt haben,
        dass wir vor Ablauf der Widerrufsfrist mit der Ausführung beginnen,
        und Sie Ihre Kenntnis davon bestätigt haben, dass Sie durch Ihre
        Zustimmung Ihr Widerrufsrecht verlieren.
      </p>

      <p className="text-gray-500">
        Stand: {new Date().toLocaleDateString("de-DE")}
      </p>
    </div>
  );
}
