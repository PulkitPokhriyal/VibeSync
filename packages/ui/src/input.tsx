"use client";
import { RefObject } from "react";
interface InputProps {
  placeholder: string;
  required?: boolean;
  className?: string;
  ref?: RefObject<HTMLInputElement | null>;
  value?: string;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

export const Input = (props: InputProps) => {
  return (
    <div>
      <input
        value={props.value}
        ref={props.ref}
        onChange={props.onChange}
        className={`w-[280px] opacity-70 text-black rounded-md p-1 mb-2 ${props.className}`}
        placeholder={props.placeholder}
        required={props.required}
      />
    </div>
  );
};
