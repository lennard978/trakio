// /src/pages/AccountDeleted.jsx
export default function AccountDeleted() {
  return (
    <div className="min-h-screen flex items-center justify-center px-6">
      <div className="max-w-md text-center space-y-4">
        <h1 className="text-2xl font-semibold text-gray-800 dark:text-gray-100">
          Account deleted successfully
        </h1>

        <p className="text-gray-600 dark:text-gray-300">
          Your Trakio account and all associated personal data have been permanently deleted.
        </p>

        <p className="text-gray-600 dark:text-gray-300">
          Any active subscriptions have been cancelled and no further charges will be made.
        </p>

        <p className="text-sm text-gray-500">
          If you have questions, contact{" "}
          <a href="mailto:support@trakio.de" className="underline">
            support@trakio.de
          </a>
        </p>

        <a
          href="/"
          className="inline-block mt-4 px-4 py-2 rounded bg-orange-600 text-white"
        >
          Back to homepage
        </a>
      </div>
    </div>
  );
}
