import React from "react";
import { motion } from "framer-motion";

interface ButtonProps {
  children: React.ReactNode;
  variant?: "primary" | "secondary" | "outline" | "ghost" | "glass";
  size?: "sm" | "md" | "lg";
  className?: string;
  onClick?: () => void;
  [key: string]: any;
}

export const Button: React.FC<ButtonProps> = ({
  children,
  variant = "primary",
  size = "md",
  className = "",
  ...props
}) => {
  const baseStyles =
    "font-bold transition-all active:scale-95 rounded-lg md:rounded-xl";

  const variants: Record<string, string> = {
    primary:
      "bg-primary text-on-primary hover:shadow-lg hover:shadow-primary/20 shadow-sm",
    secondary:
      "bg-secondary text-on-secondary hover:shadow-lg hover:shadow-secondary/20 shadow-sm",
    outline: "border border-primary text-primary hover:bg-primary/5",
    ghost: "text-primary hover:bg-primary/10",
    glass:
      "bg-white/10 text-white border border-white/20 backdrop-blur-md hover:bg-white/20",
  };

  const sizes: Record<string, string> = {
    sm: "px-4 py-2 text-sm",
    md: "px-6 py-2.5 text-base",
    lg: "px-8 py-4 text-lg",
  };

  return (
    <motion.button
      whileHover={{ y: -2 }}
      whileTap={{ scale: 0.95 }}
      className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${className}`}
      {...props}
    >
      {children}
    </motion.button>
  );
};
