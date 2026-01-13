import React from "react";
import PropTypes from "prop-types";

export default function PageLayout({
  children,
  maxWidth = "max-w-4xl",
  padded = true,
}) {
  return (
    <div
      className={`
        w-full
        ${maxWidth}
        mx-auto
        ${padded ? "px-3 sm:px-4 lg:px-6" : ""}
        pt-3

        /* 👇 CRITICAL FIX */
        pb-[90px] md:pb-30
      `}
    >
      {children}
    </div>
  );
}

PageLayout.propTypes = {
  children: PropTypes.node.isRequired,
  maxWidth: PropTypes.string,
  padded: PropTypes.bool,
};
