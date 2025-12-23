import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import CurrencyPickerSheet from "../../components/settings/CurrencyPickerSheet";

export default function SettingsCurrency() {
  const navigate = useNavigate();
  const [open, setOpen] = useState(true);

  return (
    <>
      {open && (
        <CurrencyPickerSheet
          onClose={() => {
            setOpen(false);
            navigate("/settings");
          }}
        />
      )}
    </>
  );
}
