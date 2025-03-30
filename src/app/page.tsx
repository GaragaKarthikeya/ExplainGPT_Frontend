'use client';

import Link from "next/link";
import { motion } from "framer-motion";
import { useState, useEffect } from "react";

const HomePage = () => {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const containerVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.6,
        when: "beforeChildren",
        staggerChildren: 0.2,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, scale: 0.95 },
    visible: { opacity: 1, scale: 1 },
  };

  const generateParticle = (i) => ({
    key: i,
    className: "absolute bg-white rounded-full",
    initial: {
      x: `${Math.random() * 100}%`,
      y: `${Math.random() * 100}%`,
      scale: Math.random() * 0.3 + 0.1,
    },
    animate: {
      y: [null, "-100%"],
      opacity: [0, 0.5, 0],
    },
    transition: {
      duration: Math.random() * 5 + 5,
      repeat: Infinity,
      delay: Math.random() * 2,
    },
  });

  return (
    <main className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 via-blue-950 to-gray-900 text-white overflow-hidden">
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="text-center p-6"
      >
        <motion.h1
          variants={itemVariants}
          className="text-5xl md:text-6xl font-bold mb-8 bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-400"
        >
          ExplainGPT is Live!{" "}
          <span className="inline-block animate-bounce">🚀</span>
        </motion.h1>

        <motion.div variants={itemVariants}>
          <Link href="/chat">
            <button className="group relative px-8 py-4 bg-blue-600 hover:bg-blue-700 rounded-xl text-lg font-semibold overflow-hidden transition-all duration-300 shadow-lg hover:shadow-xl">
              <span className="relative z-10">Try Chatbot 💬</span>
              <span className="absolute inset-0 bg-gradient-to-r from-blue-500 to-purple-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              <span className="absolute -inset-1 bg-blue-400 rounded-xl blur-xl opacity-20 group-hover:opacity-30 transition-opacity" />
            </button>
          </Link>
        </motion.div>

        {isMounted && (
          <div className="absolute inset-0 pointer-events-none">
            {[...Array(20)].map((_, i) => {
              const particle = generateParticle(i);
              return (
                <motion.div
                  key={particle.key}
                  className={particle.className}
                  initial={particle.initial}
                  animate={particle.animate}
                  transition={particle.transition}
                />
              );
            })}
          </div>
        )}
      </motion.div>
    </main>
  );
};

export default HomePage;