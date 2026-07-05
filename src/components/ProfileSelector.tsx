/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from "react";
import { motion } from "motion/react";
import { Profile } from "../types";

// High-fidelity Netflix-style colorful flat avatar SVGs
const AVATAR_COLORS = {
  blue: "bg-[#1f80eb]",
  red: "bg-[#e50914]",
  green: "bg-[#2bb85c]",
  yellow: "bg-[#e2b007]",
};

interface ProfileSelectorProps {
  onSelect: (profile: Profile) => void;
}

export const profilesList: Profile[] = [
  { id: "guest", name: "Guest User", avatarUrl: "blue" },
  { id: "movie-buff", name: "Movie Buff", avatarUrl: "red" },
  { id: "family", name: "Family", avatarUrl: "green" },
  { id: "kids", name: "Kids Mode", avatarUrl: "yellow" },
];

export default function ProfileSelector({ onSelect }: ProfileSelectorProps) {
  return (
    <div
      id="profile-selection-container"
      className="min-h-screen bg-[#141414] text-white flex flex-col items-center justify-center font-sans select-none px-4"
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="flex flex-col items-center max-w-4xl w-full"
      >
        <h1 id="profile-selection-title" className="text-3xl md:text-5xl font-medium tracking-wide mb-10 text-center text-zinc-100">
          Who's watching?
        </h1>

        <div id="profile-list" className="grid grid-cols-2 sm:grid-cols-4 gap-6 md:gap-8 mb-16">
          {profilesList.map((profile) => {
            const bgColorClass =
              AVATAR_COLORS[profile.avatarUrl as keyof typeof AVATAR_COLORS] || AVATAR_COLORS.blue;

            return (
              <button
                key={profile.id}
                id={`profile-btn-${profile.id}`}
                onClick={() => onSelect(profile)}
                className="group flex flex-col items-center focus:outline-hidden"
              >
                {/* Profile Avatar Box */}
                <div
                  id={`profile-avatar-${profile.id}`}
                  className={`w-28 h-28 md:w-36 md:h-36 rounded-md relative flex items-center justify-center transition-all duration-200 border-2 border-transparent group-hover:border-white group-focus:border-white overflow-hidden ${bgColorClass} shadow-lg`}
                >
                  {/* High fidelity smiley face inside */}
                  <svg
                    className="w-16 h-16 md:w-20 md:h-20 text-white/90 group-hover:scale-105 transition-transform duration-200"
                    viewBox="0 0 100 100"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    {/* Eyes */}
                    <circle cx="32" cy="40" r="6" fill="currentColor" />
                    <circle cx="68" cy="40" r="6" fill="currentColor" />
                    {/* Smile */}
                    <path
                      d="M 28 62 C 28 62, 50 82, 72 62"
                      stroke="currentColor"
                      strokeWidth="8"
                      strokeLinecap="round"
                      fill="none"
                    />
                  </svg>
                </div>

                {/* Profile Name */}
                <span
                  id={`profile-name-${profile.id}`}
                  className="mt-4 text-zinc-400 text-sm md:text-lg group-hover:text-white transition-colors duration-200 text-center truncate max-w-full font-light"
                >
                  {profile.name}
                </span>
              </button>
            );
          })}
        </div>

        {/* Manage Profiles Button */}
        <button
          id="manage-profiles-button"
          className="border border-zinc-500 text-zinc-500 px-6 py-2 tracking-widest text-xs md:text-sm uppercase hover:border-zinc-200 hover:text-zinc-200 transition-colors duration-200 font-light"
        >
          Manage Profiles
        </button>
      </motion.div>
    </div>
  );
}
