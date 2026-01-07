import React, { useEffect, useRef } from "react";
import PropTypes from "prop-types";
import { useTranslation } from "react-i18next";
import { motion } from "framer-motion";
import { FiInbox } from "react-icons/fi";

export default function EmptyState({
  title,
  description,
  icon: Icon = FiInbox,
  action,
  color = "text-gray-400",
}) {
  const { t } = useTranslation();
  const buttonRef = useRef(null);

  useEffect(() => {
    if (buttonRef.current && action) buttonRef.current.focus();
  }, [action]);

  return (
    <motion.div
      role="status"
      aria-live="polite"
      className="flex flex-col items-center justify-center py-10 px-4 text-center"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <Icon className={`text-3xl sm:text-4xl ${color} mb-3`} />
      <h2 className="text-lg font-semibold text-gray-700 dark:text-gray-200">
        {t(title, { defaultValue: title })}
      </h2>
      {description && (
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
          {t(description, { defaultValue: description })}
        </p>
      )}
      {action && (
        <div className="mt-4" ref={buttonRef}>
          {action}
        </div>
      )}
    </motion.div>
  );
}

EmptyState.propTypes = {
  title: PropTypes.string.isRequired,
  description: PropTypes.string,
  icon: PropTypes.elementType,
  action: PropTypes.node,
  color: PropTypes.string,
};
