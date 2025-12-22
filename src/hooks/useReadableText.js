export function useReadableText({
  isDarkMode,
  isSwiping,
  isLightCard,
}) {
  // Swipe always wins
  if (isSwiping) {
    return {
      text: "text-white",
      subText: "text-gray-200",
      label: "text-gray-300",
      shadow: "drop-shadow-[0_1px_2px_rgba(0,0,0,0.7)]",
    };
  }

  // 🌙 Dark mode + light-colored card → force white text
  if (isDarkMode && isLightCard) {
    return {
      text: "text-white",
      subText: "text-gray-200",
      label: "text-gray-300",
      shadow: "drop-shadow-[0_1px_2px_rgba(0,0,0,0.6)]",
    };
  }

  // 🌙 Dark mode + dark card
  if (isDarkMode) {
    return {
      text: "text-gray-100",
      subText: "text-gray-300",
      label: "text-gray-400",
      shadow: "",
    };
  }

  // 🌤 Light mode
  return {
    text: "text-gray-900",
    subText: "text-gray-700",
    label: "text-gray-600",
    shadow: "drop-shadow-[0_1px_1px_rgba(0,0,0,0.25)]",
  };
}
