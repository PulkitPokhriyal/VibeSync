"use client";

import { RefObject } from "react";

interface InputProps {
  placeholder: string;
  required?: boolean;
  ref?: RefObject<HTMLInputElement | null>;
}

export const Input = (props: InputProps) => {
  return (
    <div>
      <input
        ref={props.ref}
        className="border border-black border-solid rounded-md p-1 mb-2 "
        placeholder={props.placeholder}
        required={props.required}
      />
    </div>
  );
};
