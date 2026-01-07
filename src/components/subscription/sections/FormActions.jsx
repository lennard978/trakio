import React from "react";
import PropTypes from "prop-types";
import SettingButton from "../../ui/SettingButton";

/**
 * FormActions
 * - Submit / Cancel / Delete / Undo buttons
 *
 * PURE UI COMPONENT
 */
export default function FormActions({
  isEdit,
  hasUndo,
  onSubmit,
  onCancel,
  onDelete,
  onUndo,
  t
}) {
  return (
    <div className="flex flex-col sm:flex-row gap-2 pt-2">
      <SettingButton type="submit" variant="primary" onClick={onSubmit}>
        {isEdit ? t("form_save") : t("add_subscription")}
      </SettingButton>

      <SettingButton
        type="button"
        variant="neutral"
        onClick={onCancel}
      >
        {t("button_cancel")}
      </SettingButton>

      {isEdit && (
        <SettingButton
          type="button"
          variant="danger"
          onClick={onDelete}
          aria-label={t("button_delete")}
        >
          {t("button_delete")}
        </SettingButton>
      )}

      {isEdit && hasUndo && (
        <SettingButton
          type="button"
          variant="neutral"
          onClick={onUndo}
        >
          {t("undo_changes")}
        </SettingButton>
      )}
    </div>
  );
}

FormActions.propTypes = {
  isEdit: PropTypes.bool.isRequired,
  hasUndo: PropTypes.bool,

  onSubmit: PropTypes.func.isRequired,
  onCancel: PropTypes.func.isRequired,
  onDelete: PropTypes.func,
  onUndo: PropTypes.func,

  t: PropTypes.func.isRequired
};

FormActions.defaultProps = {
  hasUndo: false,
  onDelete: undefined,
  onUndo: undefined
};
