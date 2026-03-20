import React from 'react';
import { Canvas } from '@/components/editor/Canvas';
import { Toolbar } from '@/components/editor/Toolbar';
import { motion } from 'framer-motion';

interface HomeProps {
  credits?: number;
}

export default function Home({ credits }: HomeProps) {
  return (
    <div className="w-full h-[calc(100dvh-4rem)] flex flex-col md:flex-row gap-0 md:gap-4 md:p-4 overflow-hidden">
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: "easeOut" }}
        className="flex-1 min-h-[45vh] md:min-h-0 md:h-full"
      >
        <Canvas />
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.1, ease: "easeOut" }}
        className="h-[55vh] md:h-full md:w-[380px] lg:w-[420px] flex-shrink-0"
      >
        <Toolbar credits={credits} />
      </motion.div>
    </div>
  );
}
