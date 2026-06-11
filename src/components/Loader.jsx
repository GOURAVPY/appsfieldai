import React from "react";
import { motion } from "framer-motion";

export default function Loader({ size = "default", text, className = "" }) {
  const sizeMap = {
    sm: { s: 24, cls: "three-body-sm" },
    default: { s: 35, cls: "three-body-default" },
    lg: { s: 50, cls: "three-body-lg" },
  };
  const { s, cls } = sizeMap[size] || sizeMap.default;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      className={`flex flex-col items-center justify-center gap-4 ${className}`}
    >
      <div className={`three-body ${cls}`}>
        <div className="three-body__dot" />
        <div className="three-body__dot" />
        <div className="three-body__dot" />
      </div>
      {text && (
        <p className="text-sm text-muted-foreground animate-pulse">{text}</p>
      )}
    </motion.div>
  );
}

export function PageLoader() {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm">
      <Loader size="lg" text="Loading..." />
    </div>
  );
}