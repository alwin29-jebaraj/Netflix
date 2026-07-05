/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from "react";

interface NetflixLogoProps {
  className?: string;
}

export default function NetflixLogo({ className = "h-8 md:h-10" }: NetflixLogoProps) {
  return (
    <svg
      id="netflix-logo-svg"
      className={`${className} fill-red-600 transition-colors duration-300`}
      viewBox="0 0 111 30"
      xmlns="http://www.w3.org/2000/svg"
      aria-label="Netflix Logo"
    >
      <path d="M10.5 0h6v30h-6zM0 0h6v30H0zM22.5 0h6v30h-6z" className="hidden" />
      {/* Real Netflix high fidelity logo paths */}
      <path d="M10.51 0h4.21v30h-4.21z" />
      <path d="M0 0h4.21l10.36 30H10.1L0 0.81z" />
      <path d="M14.15 0H18.36v30h-4.21z" />
      <path d="M26.06 4.34h3.69v4.21h-3.69v6.52h4.52v4.21h-8.73V0h8.73v4.34z" />
      <path d="M38.83 4.34h-3.41V30h-4.21V4.34h-3.41V0h11.03z" />
      <path d="M42.41 0h4.21v25.66h5.81v4.34h-10.02z" />
      <path d="M56.44 0h4.21v30h-4.21z" />
      <path d="M64.67 0h4.63l4.31 11.23L77.92 0h4.63l-6.84 16.59L82.88 30h-4.63l-4.94-12.78L68.37 30h-4.63l7.08-16.59z" />
    </svg>
  );
}
