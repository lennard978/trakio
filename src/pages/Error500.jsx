export default function Error500() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen text-center p-5">
      <h1 className="text-5xl font-bold mb-4">500</h1>
      <p className="text-lg mb-6">Something went wrong.</p>
      <a href="/" className="text-blue-600 underline">Go Home</a>
    </div>
  );
}
