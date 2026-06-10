import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useIsMutating } from "@tanstack/react-query";
import Lottie from "lottie-react";

const ANIMATION_URL = "https://media.base44.com/files/public/6a2402b3a9b98ed1e7bf2a16/33257fb17_232ca578-117d-11ee-a574-5bcc50b1bc8f.json";

export default function GlobalLoader() {
  const isMutating = useIsMutating();

  return (
    <AnimatePresence>
      {isMutating > 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.25 }}
          className="fixed inset-0 z-[9999] flex items-center justify-center bg-background/80 backdrop-blur-sm"
        >
          <div className="w-64 h-64 sm:w-80 sm:h-80">
            <Lottie
              animationData={ANIMATION_URL}
              loop={true}
              autoplay={true}
              style={{ width: "100%", height: "100%" }}
            />
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}