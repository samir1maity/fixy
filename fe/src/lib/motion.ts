
import { Variants } from "framer-motion";

// Staggered animation for lists
export const staggerContainer = (staggerChildren?: number, delayChildren?: number): Variants => ({
  hidden: {},
  show: {
    transition: {
      staggerChildren,
      delayChildren,
    },
  },
});

// Fade up animation
export const fadeUp = (duration: number = 0.5, delay: number = 0): Variants => ({
  hidden: {
    opacity: 0,
    y: 20,
  },
  show: {
    opacity: 1,
    y: 0,
    transition: {
      type: "tween",
      duration,
      delay,
      ease: [0.25, 0.1, 0.25, 1],
    },
  },
});

// Fade in animation
export const fadeIn = (direction: "left" | "right" | "up" | "down" = "up", type: string = "tween", duration: number = 0.5, delay: number = 0): Variants => ({
  hidden: {
    x: direction === "left" ? 50 : direction === "right" ? -50 : 0,
    y: direction === "up" ? 50 : direction === "down" ? -50 : 0,
    opacity: 0,
  },
  show: {
    x: 0,
    y: 0,
    opacity: 1,
    transition: {
      type,
      duration,
      delay,
      ease: [0.25, 0.1, 0.25, 1],
    },
  },
});

// Scale animation
export const scaleIn = (duration: number = 0.5, delay: number = 0): Variants => ({
  hidden: {
    scale: 0.9,
    opacity: 0,
  },
  show: {
    scale: 1,
    opacity: 1,
    transition: {
      type: "tween",
      duration,
      delay,
      ease: [0.25, 0.1, 0.25, 1],
    },
  },
});

// Slide in from side animation
export const slideIn = (direction: "left" | "right" | "up" | "down", type: string = "tween", duration: number = 0.5, delay: number = 0): Variants => ({
  hidden: {
    x: direction === "left" ? "-100%" : direction === "right" ? "100%" : 0,
    y: direction === "up" ? "100%" : direction === "down" ? "-100%" : 0,
  },
  show: {
    x: 0,
    y: 0,
    transition: {
      type,
      duration,
      delay,
      ease: [0.25, 0.1, 0.25, 1],
    },
  },
});

// Pulse animation
export const pulse = (duration: number = 2, delay: number = 0): Variants => ({
  hidden: {
    opacity: 0.8,
    scale: 0.95,
  },
  show: {
    opacity: 1,
    scale: 1,
    transition: {
      duration,
      delay,
      repeat: Infinity,
      repeatType: "reverse",
    },
  },
});
