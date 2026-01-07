import React from "react";
import { FiAlertCircle } from "react-icons/fi";
import { motion } from "framer-motion";

export default class HardErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { crashed: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { crashed: true, error };
  }

  logError = (error, info) => {
    if (process.env.NODE_ENV === "production") {
      fetch("/api/log-error", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "HARD_ERROR",
          error: error?.toString(),
          info,
        }),
      });
    }
  };

  componentDidCatch(error, errorInfo) {
    console.error("Critical app error:", error, errorInfo);
    this.logError(error, errorInfo);
  }

  handleGlobalError = (e) => {
    this.setState({ crashed: true, error: e.error });
    this.logError(e.error, "window.onerror");
  };

  handleRejection = (e) => {
    this.setState({ crashed: true, error: e.reason });
    this.logError(e.reason, "unhandledrejection");
  };

  componentDidMount() {
    window.addEventListener("error", this.handleGlobalError);
    window.addEventListener("unhandledrejection", this.handleRejection);
  }

  componentWillUnmount() {
    window.removeEventListener("error", this.handleGlobalError);
    window.removeEventListener("unhandledrejection", this.handleRejection);
  }

  handleRetry = () => {
    this.setState({ crashed: false, error: null });
  };

  render() {
    if (this.state.crashed) {
      return (
        <motion.div
          role="alert"
          aria-live="assertive"
          className="flex flex-col items-center justify-center h-screen text-center p-4"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          <FiAlertCircle className="text-6xl text-red-500 mb-3" />
          <h1 className="text-xl font-bold text-gray-800 dark:text-gray-200">
            App failed to load
          </h1>
          <p className="text-gray-500 dark:text-gray-400 mb-4">
            Please refresh or try again later.
          </p>

          <div className="flex gap-3 mt-2">
            <button
              onClick={this.handleRetry}
              className="px-4 py-2 rounded-lg bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-gray-100 font-medium"
            >
              Try Again
            </button>
            <button
              onClick={() => window.location.reload()}
              className="px-4 py-2 rounded-lg bg-red-500 text-white font-semibold"
            >
              Reload App
            </button>
          </div>

          {process.env.NODE_ENV === "development" && this.state.error && (
            <pre className="bg-gray-100 dark:bg-gray-800 text-left text-sm p-4 mt-3 rounded-lg overflow-auto max-w-md">
              {this.state.error?.stack || this.state.error?.toString()}
            </pre>
          )}
        </motion.div>
      );
    }

    return this.props.children;
  }
}
