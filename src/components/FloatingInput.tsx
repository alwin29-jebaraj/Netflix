/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import { Eye, EyeOff } from "lucide-react";

interface FloatingInputProps {
  id: string;
  label: string;
  type?: string;
  error?: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  autoFocus?: boolean;
}

export default function FloatingInput({
  id,
  label,
  type = "text",
  error,
  value,
  onChange,
  ...props
}: FloatingInputProps) {
  const [focused, setFocused] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const isFilled = value !== undefined && value !== null && value.toString().length > 0;
  const isPassword = type === "password";
  const inputType = isPassword ? (showPassword ? "text" : "password") : type;

  return (
    <div className="w-full flex flex-col mb-4">
      <div id={`floating-input-container-${id}`} className="relative w-full">
        <input
          id={id}
          type={inputType}
          value={value}
          onChange={onChange}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          className={`w-full bg-zinc-800/80 hover:bg-zinc-800 text-white rounded px-5 pt-6 pb-2 text-base outline-hidden transition-all duration-200 border-b-2 ${
            error
              ? "border-orange-500 focus:border-orange-500"
              : focused
              ? "border-white focus:border-white"
              : "border-transparent"
          }`}
          {...props}
        />
        <label
          htmlFor={id}
          id={`floating-label-${id}`}
          className={`absolute left-5 text-zinc-400 transition-all duration-200 cursor-text select-none pointer-events-none ${
            focused || isFilled
              ? "top-1.5 text-xs font-semibold text-zinc-400"
              : "top-4 text-base"
          }`}
        >
          {label}
        </label>

        {isPassword && isFilled && (
          <button
            id={`toggle-password-visibility-${id}`}
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-4 top-4 text-zinc-400 hover:text-white transition-colors duration-200"
            aria-label={showPassword ? "Hide password" : "Show password"}
          >
            {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
          </button>
        )}
      </div>

      {error && (
        <span id={`input-error-${id}`} className="text-orange-500 text-xs mt-1.5 flex items-center gap-1 font-medium">
          <svg className="w-4 h-4 shrink-0 fill-current" viewBox="0 0 16 16">
            <path d="M8 15A7 7 0 1 1 8 1a7 7 0 0 1 0 14zm0 1A8 8 0 1 0 8 0a8 8 0 0 0 0 16z"/>
            <path d="M7.002 11a1 1 0 1 1 2 0 1 1 0 0 1-2 0zM7.1 4.995a.905.905 0 1 1 1.8 0l-.35 3.507a.552.552 0 0 1-1.1 0L7.1 4.995z"/>
          </svg>
          {error}
        </span>
      )}
    </div>
  );
}
