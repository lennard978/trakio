export default function ThemeSwitch({ checked, onChange }) {
  return (
    <button
      onClick={onChange}
      className={`
        relative w-11 h-6 rounded-full transition
        ${checked ? "bg-orange-600" : "bg-gray-300"}
      `}
    >
      <span
        className={`
          absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white
          transition-transform
          ${checked ? "translate-x-5" : ""}
        `}
      />
    </button>
  );
}
