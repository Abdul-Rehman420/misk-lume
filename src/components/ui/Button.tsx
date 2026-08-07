interface ButtonProps {
  variant: "primary" | "outline" | "ghost";
  size?: "sm" | "md" | "lg";
  fullWidth?: boolean;
  children: React.ReactNode;
  className?: string;
  type?: "button" | "submit" | "reset";
  disabled?: boolean;
  loading?: boolean;
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
  loading = false,
  className = "",
  type = "button",
  disabled = false,
  onClick,
}: ButtonProps) {
  return (
    <button
      type={type}
      disabled={disabled || loading}
      onClick={onClick}
      suppressHydrationWarning
      className={`inline-flex min-h-[44px] items-center justify-center gap-2 rounded-sm font-semibold uppercase tracking-wider transition-all duration-200 ${variantStyles[variant]} ${sizeStyles[size]} ${
        fullWidth ? "w-full" : ""
      } ${disabled || loading ? "pointer-events-none opacity-50" : ""} ${className}`}
    >
      {loading ? (
        <span className="flex items-center gap-2">
          <span className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
          <span>Loading</span>
        </span>
      ) : children}
    </button>
  );
}
