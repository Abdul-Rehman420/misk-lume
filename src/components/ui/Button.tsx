interface ButtonProps {
  variant: "primary" | "outline" | "ghost";
  size?: "sm" | "md" | "lg";
  fullWidth?: boolean;
  children: React.ReactNode;
  className?: string;
  type?: "button" | "submit" | "reset";
  disabled?: boolean;
  onClick?: () => void;
}

const variantStyles = {
  primary:
    "bg-accent-gold text-bg-primary hover:bg-accent-gold-hover hover:shadow-gold",
  outline:
    "border border-accent-gold text-accent-gold hover:bg-accent-gold-muted",
  ghost: "text-text-primary hover:text-accent-gold",
};

const sizeStyles = {
  sm: "px-3 py-2 text-xs",
  md: "px-8 py-3 text-sm",
  lg: "px-10 py-4 text-base",
};

export default function Button({
  variant,
  size = "md",
  fullWidth = false,
  children,
  className = "",
  type = "button",
  disabled = false,
  onClick,
}: ButtonProps) {
  return (
    <button
      type={type}
      disabled={disabled}
      onClick={onClick}
      className={`inline-flex min-h-[44px] items-center justify-center gap-2 rounded-sm font-semibold uppercase tracking-wider transition-all duration-200 ${variantStyles[variant]} ${sizeStyles[size]} ${
        fullWidth ? "w-full" : ""
      } ${disabled ? "pointer-events-none opacity-50" : ""} ${className}`}
    >
      {children}
    </button>
  );
}
