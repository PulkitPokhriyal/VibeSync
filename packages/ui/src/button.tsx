"use client";

interface ButtonProps {
  variant: "primary" | "secondary";
  size: "sm" | "md" | "lg";
  children: React.ReactNode;
  onClick?: () => void;
  disabled?: boolean;
}

const sizeStyles = {
  sm: "py-1 px-2",
  md: "py-2 px-4",
  lg: "py-4 px-6",
};

const defaultStyles = "rounded-lg hover:cursor-pointer";

export const Button = (props: ButtonProps) => {
  let variantStyle = "";

  if (props.variant === "primary") {
    variantStyle = props.disabled
      ? "bg-[#00F5FF] shadow-cyan-500/50 text-white cursor-not-allowed"
      : "bg-[#00AEEF] shadow-lg hover:bg-[#00F5FF] hover:shadow-cyan-500/50 transition-all duration-300 text-white";
  } else if (props.variant === "secondary") {
    variantStyle = props.disabled
      ? "bg-[#7a5ef3] shadow-purple-500/50 text-white cursor-not-allowed"
      : "bg-[#5D3FD3] shadow-lg hover:bg-[#7a5ef3] hover:shadow-purple-500/50 transition-all duration-300 text-white";
  }

  return (
    <button
      className={`${variantStyle} ${sizeStyles[props.size]} ${defaultStyles}`}
      onClick={props.onClick}
      disabled={props.disabled}
    >
      {props.children}
    </button>
  );
};
