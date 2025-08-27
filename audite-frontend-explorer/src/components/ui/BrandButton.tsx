import React from "react";
import { Button as ShadcnButton, ButtonProps } from "./button";
import { cn } from "@/lib/utils";

interface BrandButtonProps extends Omit<ButtonProps, 'variant'> {
  variant?: "primary" | "secondary" | "outline" | "ghost" | "destructive";
  size?: "sm" | "default" | "lg";
}

const BrandButton: React.FC<BrandButtonProps> = ({ 
  variant = "primary", 
  size = "default",
  className,
  children,
  ...props 
}) => {
  const baseClasses = "font-brand font-medium transition-all duration-200 focus:ring-2 focus:ring-ring focus:ring-offset-2";
  
  const variantClasses = {
    primary: "btn-primary",
    secondary: "btn-secondary", 
    outline: "btn-outline",
    ghost: "bg-transparent hover:bg-audite-accent-soft text-audite-dark hover:text-audite-dark border-none",
    destructive: "bg-destructive text-destructive-foreground hover:bg-destructive/90 shadow-sm"
  };

  const sizeClasses = {
    sm: "px-3 py-2 text-sm",
    default: "px-4 py-3",
    lg: "px-6 py-4 text-lg"
  };

  return (
    <ShadcnButton
      className={cn(
        baseClasses,
        variantClasses[variant],
        sizeClasses[size],
        className
      )}
      {...props}
    >
      {children}
    </ShadcnButton>
  );
};

export default BrandButton; 