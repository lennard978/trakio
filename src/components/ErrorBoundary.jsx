// import React from "react";
// import PropTypes from "prop-types";
// import { FiAlertCircle } from "react-icons/fi";
// import { motion } from "framer-motion";

// export default class ErrorBoundary extends React.Component {
//   constructor(props) {
//     super(props);
//     this.state = { hasError: false, error: null };
//   }

//   static getDerivedStateFromError(error) {
//     return { hasError: true, error };
//   }

//   componentDidCatch(error, errorInfo) {
//     console.error("ErrorBoundary caught an error:", error, errorInfo);

//     if (process.env.NODE_ENV === "production") {
//       fetch("/api/log-error", {
//         method: "POST",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify({ error: error.toString(), errorInfo }),
//       });
//     }
//   }

//   handleReload = () => {
//     window.location.reload();
//   };

//   handleRetry = () => {
//     this.setState({ hasError: false, error: null });
//   };

//   render() {
//     if (this.state.hasError) {
//       return (
//         <motion.div
//           role="alert"
//           aria-live="assertive"
//           className="flex flex-col items-center justify-center h-screen text-center p-6"
//           initial={{ opacity: 0, y: 20 }}
//           animate={{ opacity: 1, y: 0 }}
//           transition={{ duration: 0.4 }}
//         >
//           <FiAlertCircle className="text-5xl text-red-500 mb-4" />
//           <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-200">
//             Something went wrong
//           </h2>
//           <p className="text-gray-600 dark:text-gray-400 mb-4">
//             Please try again or reload the app.
//           </p>

//           <div className="flex gap-3 mt-2">
//             <button
//               onClick={this.handleRetry}
//               className="px-4 py-2 rounded-lg bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-gray-100 font-medium"
//             >
//               Try Again
//             </button>
//             <button
//               onClick={this.handleReload}
//               className="px-4 py-2 rounded-lg bg-red-500 text-white font-semibold"
//             >
//               Reload App
//             </button>
//           </div>

//           {process.env.NODE_ENV === "development" && this.state.error && (
//             <pre className="bg-gray-100 dark:bg-gray-800 p-4 rounded-lg text-sm text-left overflow-auto mt-4">
//               {this.state.error.toString()}
//             </pre>
//           )}
//         </motion.div>
//       );
//     }

//     return this.props.children;
//   }
// }

// ErrorBoundary.propTypes = {
//   children: PropTypes.node.isRequired,
// };
