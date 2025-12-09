import React from "react";
import { CSSTransition, SwitchTransition } from "react-transition-group";
import { useLocation } from "react-router-dom";
import { useTranslation } from "react-i18next";
import "./PageTransition.css";

export default function AnimatedPage({ children }) {
  const location = useLocation();
  const { i18n } = useTranslation();
  const dir = i18n.dir();

  return (
    <div className={`page-wrapper ${dir === "rtl" ? "rtl" : ""}`}>
      <SwitchTransition>
        <CSSTransition
          key={location.pathname}
          timeout={240}
          classNames={{
            enter: "page-enter",
            enterActive: "page-enter-active",
            exit: "page-exit",
            exitActive: "page-exit-active",
          }}
          unmountOnExit
        >
          <div className="page-content">{children}</div>
        </CSSTransition>
      </SwitchTransition>
    </div>
  );
}
