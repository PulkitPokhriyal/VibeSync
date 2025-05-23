"use client";
import { RefObject } from "react";
interface InputProps {
  placeholder: string;
  required?: boolean;
  ref?: RefObject<HTMLInputElement | null>;
  className?: string;
  value?: string;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

export const Input = (props: InputProps) => {
  return (
    <div>
      <input
        ref={props.ref}
        value={props.value}
        onChange={props.onChange}
        className={`border border-black border-solid rounded-md p-1 mb-2 ${props.className}`}
        placeholder={props.placeholder}
        required={props.required}
      />
    </div>
  );
};
