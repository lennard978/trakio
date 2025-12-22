import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { usePremium } from "../../hooks/usePremium";
import { useCurrency } from "../../context/CurrencyContext";
import Card from "../../components/ui/Card";
import SettingButton from "../../components/ui/SettingButton";
import CurrencySelector from "../../components/CurrencySelector";

export default function SettingsCurrency() {
  const navigate = useNavigate();
  const premium = usePremium();
  const { currency, setCurrency } = useCurrency();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  return (
    <div className="max-w-lg mx-auto px-2 pb-6 space-y-4">
      <h1 className="text-xl font-bold text-center">Base Currency</h1>

      <Card>
        {premium.isPremium ? (
          <>
            <p className="text-sm mb-3 text-gray-600 dark:text-gray-300">
              Choose your default currency.
            </p>
            <CurrencySelector
              value={currency}
              onChange={setCurrency}
              onOpenChange={setIsDropdownOpen}
            />
          </>
        ) : (
          <>
            <p className="text-sm mb-3 text-gray-600 dark:text-gray-300">
              Currency selection is a Premium feature.
            </p>
            <SettingButton
              variant="success"
              onClick={() => navigate("/premium?reason=currency")}
            >
              Upgrade to Premium
            </SettingButton>
          </>
        )}
      </Card>

      <div
        className={`
    fixed bottom-4 left-1/2 -translate-x-1/2 w-[90%]
    transition-all duration-200
    ${isDropdownOpen ? "blur-sm opacity-0 pointer-events-none" : "opacity-100"}
    z-30
  `}
      >
        <SettingButton onClick={() => navigate("/settings")}>
          Back to Settings
        </SettingButton>
      </div>

    </div>
  );
}
