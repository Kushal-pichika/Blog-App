import React from "react";
import { motion } from "framer-motion";

function AnimatedBg() {
  return (
    <div className="absolute inset-0 overflow-hidden -z-10">
      <motion.div
        className="w-[600px] h-[600px] bg-neon-blue/20 rounded-full blur-3xl absolute top-20 left-1/3"
        animate={{ scale: [1, 1.3, 1] }}
        transition={{ duration: 8, repeat: Infinity }}
      />
      <motion.div
        className="w-[500px] h-[500px] bg-neon-pink/20 rounded-full blur-3xl absolute bottom-10 right-1/4"
        animate={{ scale: [1, 1.4, 1] }}
        transition={{ duration: 10, repeat: Infinity }}
      />
    </div>
  );
}

export default AnimatedBg;
