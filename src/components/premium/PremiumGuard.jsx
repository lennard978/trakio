import { usePremium } from "../../hooks/usePremium";

export default function PremiumGuard({
  children,
  fallback = null,
}) {
  const { isPremium, loading } = usePremium();

  if (loading) return null;

  if (!isPremium) {
    return (
      fallback || (
        <div className="text-xs text-gray-400 italic">
          Premium feature
        </div>
      )
    );
  }

  return children;
}
