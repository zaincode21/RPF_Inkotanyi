import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { ChevronDown } from 'lucide-react';

export function Hero() {
  const [scrollY, setScrollY] = useState(0);

  useEffect(() => {
    const handleScroll = () => setScrollY(window.scrollY);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <section id="home" className="relative h-screen overflow-hidden">
      {/* Background Image with Parallax */}
      <div
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{
          transform: `translateY(${scrollY * 0.5}px)`,
          backgroundImage: `url('/hero-inkotanyi.png')`,
        }}
      />
      <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-black/40 to-black/70" />

      {/* Track Motif - Horizontal Lines */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {/* Line 1 - Top */}
        <div className="absolute top-1/4 left-0 right-0 h-px bg-white/20" />
        {/* Line 2 - Middle */}
        <div className="absolute top-1/2 left-0 right-0 h-px bg-white/30" />
        {/* Line 3 - Bottom */}
        <div className="absolute top-3/4 left-0 right-0 h-px bg-white/10" />
      </div>

      {/* Content */}
      <div className="relative h-full flex flex-col items-center justify-center text-center px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="max-w-4xl mx-auto"
        >
          <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold text-white tracking-tight leading-tight mb-6" style={{ lineHeight: '1.15', letterSpacing: '-0.02em' }}>
            Inkotanyi
            <br />
            <span className="text-white/90">Rwandan Patriotic Front</span>
          </h1>

          <p className="text-lg sm:text-xl md:text-2xl text-white/80 mb-10 max-w-2xl mx-auto font-light">
            Unity, work, and patriotism — serving Rwanda through disciplined membership and national progress.
          </p>

           {/* CTA Buttons */}
           <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
             <button
               onClick={() => document.querySelector('#policy').scrollIntoView({ behavior: 'smooth' })}
               className="w-full sm:w-auto bg-white text-track px-8 py-4 rounded-lg font-semibold text-lg hover:bg-white/90 transition-all duration-200 shadow-lg hover:shadow-xl"
             >
               Join Our Cause
             </button>
             <button
               onClick={() => document.querySelector('#vision-1').scrollIntoView({ behavior: 'smooth' })}
               className="w-full sm:w-auto border-2 border-white text-white px-8 py-4 rounded-lg font-semibold text-lg hover:bg-white/10 transition-all duration-200"
             >
               Learn More
             </button>
           </div>
        </motion.div>
      </div>

      {/* Bounce Indicator */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.5, duration: 0.5 }}
        className="absolute bottom-8 left-1/2 transform -translate-x-1/2"
      >
        <motion.div
          animate={{ y: [0, 10, 0] }}
          transition={{ repeat: Infinity, duration: 1.5, ease: 'easeInOut' }}
          className="flex flex-col items-center text-white/70"
        >
          <span className="text-xs uppercase tracking-widest mb-2">Scroll</span>
          <ChevronDown className="w-6 h-6" />
        </motion.div>
      </motion.div>
    </section>
  );
}
