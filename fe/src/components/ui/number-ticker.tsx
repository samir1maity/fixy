import { useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';

// ── Single digit slot ─────────────────────────────────────────────────────────

const DIGIT_HEIGHT = 28; // px — must match the line-height below

interface DigitProps {
  value: string;
  delay: number;
}

const Digit = ({ value, delay }: DigitProps) => {
  const isNumeric = /\d/.test(value);

  if (!isNumeric) {
    // Punctuation / separators render instantly
    return (
      <span
        className="inline-block tabular-nums"
        style={{ height: DIGIT_HEIGHT, lineHeight: `${DIGIT_HEIGHT}px` }}
      >
        {value}
      </span>
    );
  }

  return (
    <span
      className="inline-block overflow-hidden relative"
      style={{ height: DIGIT_HEIGHT, lineHeight: `${DIGIT_HEIGHT}px` }}
    >
      <AnimatePresence mode="popLayout" initial={false}>
        <motion.span
          key={value}
          className="inline-block tabular-nums"
          initial={{ y: DIGIT_HEIGHT, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: -DIGIT_HEIGHT, opacity: 0 }}
          transition={{
            duration: 0.35,
            delay,
            ease: [0.16, 1, 0.3, 1], // expo out — snappy then smooth
          }}
          style={{ lineHeight: `${DIGIT_HEIGHT}px` }}
        >
          {value}
        </motion.span>
      </AnimatePresence>
    </span>
  );
};

// ── NumberTicker ──────────────────────────────────────────────────────────────

interface NumberTickerProps {
  value: number;
  /** Delay before the animation starts (seconds). Default: 0 */
  delay?: number;
  /** Locale formatting. Default: 'en-US' */
  locale?: string;
  className?: string;
}

const NumberTicker = ({
  value,
  delay = 0,
  locale = 'en-US',
  className,
}: NumberTickerProps) => {
  const [displayed, setDisplayed] = useState(0);
  const prevRef = useRef(0);

  useEffect(() => {
    prevRef.current = displayed;
    setDisplayed(value);
  }, [value]); // eslint-disable-line react-hooks/exhaustive-deps

  const formatted = displayed.toLocaleString(locale);
  const digits = formatted.split('');

  return (
    <span
      className={`inline-flex items-end leading-none font-bold ${className ?? ''}`}
      aria-label={formatted}
    >
      {digits.map((char, i) => (
        <Digit
          key={i}
          value={char}
          // Stagger from right → left so the least-significant digit leads
          delay={delay + (digits.length - 1 - i) * 0.04}
        />
      ))}
    </span>
  );
};

export default NumberTicker;
