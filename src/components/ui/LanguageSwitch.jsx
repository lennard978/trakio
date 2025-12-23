export default function LanguageSwitch({ value, onChange }) {
  return (
    <button
      onClick={onChange}
      className="px-3 py-1.5 text-xs rounded-full
                 bg-gray-200 dark:bg-gray-700
                 text-gray-900 dark:text-gray-100
                 font-medium"
    >
      {value.toUpperCase()}
    </button>
  );
}
