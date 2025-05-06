"use client";

interface ButtonProps {
  variant: "primary" | "secondary";
  size: "sm" | "md" | "lg";
  children: React.ReactNode;
  onClick?: () => void;
}

const variantStyles = {
  primary:
    "bg-[#00AEEF] shadow-lg hover:bg-[#00F5FF] hover:shadow-cyan-500/50 transition-all duration-300 text-white",
  secondary:
    "bg-[#5D3FD3] shadow-lg hover:bg-[#7a5ef3] hover:shadow-purple-500/50 transition-all duration-300 text-white",
};

const sizeStyles = {
  sm: "py-1 px-2",
  md: "py-2 px-4",
  lg: "py-4 px-6",
};

const defaultStyles = "rounded-lg hover:cursor-pointer";

export const Button = (props: ButtonProps) => {
  return (
    <button
      className={`${variantStyles[props.variant]} ${sizeStyles[props.size]} ${defaultStyles}`}
      onClick={props.onClick}
    >
      {props.children}
    </button>
  );
};
