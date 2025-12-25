import { motion } from "framer-motion";

export default function SectionHeader({ title, subtitle }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        duration: 0.35,
        ease: "easeOut",
      }}
      className="px-2 mb-3"
    >
      <h2 className="text-xs uppercase tracking-wide text-gray-500">
        {title}
      </h2>
      {subtitle && (
        <p className="text-[11px] text-gray-400 mt-0.5">
          {subtitle}
        </p>
      )}
    </motion.div>
  );
}
