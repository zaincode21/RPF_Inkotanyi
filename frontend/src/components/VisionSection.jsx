import { motion, useInView } from 'framer-motion';
import { useRef } from 'react';
import { Check } from 'lucide-react';

export function VisionSection({
  id,
  imageUrl,
  imageAlt,
  label,
  title,
  description,
  points,
  decorativeLetter
}) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-100px' });

  const isEven = id % 2 === 0;
  const imageOrder = isEven ? 'order-2' : 'order-1';
  const contentOrder = isEven ? 'order-1' : 'order-2';

  return (
    <section id={`vision-${id}`} ref={ref} className="relative py-20 md:py-32 overflow-hidden">
      {/* Vertical Accent Line */}
      <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-track/0 via-track/30 to-track/0" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className={`grid md:grid-cols-2 gap-12 items-center`}>
          {/* Image Side */}
          <motion.div
            initial={{ opacity: 0, x: isEven ? 50 : -50 }}
            animate={isInView ? { opacity: 1, x: 0 } : { opacity: 0, x: isEven ? 50 : -50 }}
            transition={{ duration: 0.8, ease: 'easeOut' }}
            className={`relative ${imageOrder}`}
          >
            <div className="relative overflow-hidden rounded-2xl shadow-2xl">
              <img
                src={imageUrl}
                alt={imageAlt}
                className="w-full h-80 md:h-96 object-cover"
              />
              {/* Semi-transparent overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-track/40 to-transparent pointer-events-none" />
            </div>
          </motion.div>

          {/* Content Side */}
          <motion.div
            initial={{ opacity: 0, x: isEven ? -50 : 50 }}
            animate={isInView ? { opacity: 1, x: 0 } : { opacity: 0, x: isEven ? -50 : 50 }}
            transition={{ duration: 0.8, delay: 0.2, ease: 'easeOut' }}
            className={`${contentOrder}`}
          >
            {/* Label */}
            <div className="inline-block bg-track/10 text-track px-4 py-1 rounded-full text-sm font-semibold mb-4">
              {label}
            </div>

            {/* Title */}
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-track mb-6 leading-tight">
              {title}
            </h2>

            {/* Description */}
            <p className="text-gray-600 text-lg mb-6 leading-relaxed">
              {description}
            </p>

            {/* Bullet Points */}
            <ul className="space-y-3 mb-8">
              {points.map((point, idx) => (
                <li key={idx} className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-track/10 flex items-center justify-center mt-0.5 flex-shrink-0">
                    <Check className="w-4 h-4 text-track" />
                  </div>
                  <span className="text-gray-700">{point}</span>
                </li>
              ))}
            </ul>

            {/* Decorative Large Letter */}
            <div className="hidden md:block absolute right-0 bottom-0 text-9xl font-bold text-track/5 pointer-events-none select-none">
              {decorativeLetter}
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
