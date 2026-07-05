/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  Play, 
  Info, 
  Check, 
  Plus, 
  Search, 
  LogOut, 
  Volume2, 
  VolumeX, 
  ChevronDown, 
  X, 
  Maximize2, 
  Heart,
  ChevronRight,
  Filter
} from "lucide-react";
import NetflixLogo from "./components/NetflixLogo";
import FloatingInput from "./components/FloatingInput";
import ProfileSelector, { profilesList } from "./components/ProfileSelector";
import { Movie, Profile, User } from "./types";

export default function App() {
  // Session / Navigation States
  const [user, setUser] = useState<User | null>(() => {
    const savedUser = localStorage.getItem("netflix_user");
    return savedUser ? JSON.parse(savedUser) : null;
  });
  const [selectedProfile, setSelectedProfile] = useState<Profile | null>(() => {
    const savedProfile = localStorage.getItem("netflix_profile");
    return savedProfile ? JSON.parse(savedProfile) : null;
  });

  // Login Form States
  const [email, setEmail] = useState(() => localStorage.getItem("netflix_remembered_email") || "");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(() => !!localStorage.getItem("netflix_remembered_email"));
  const [formErrors, setFormErrors] = useState<{ email?: string; password?: string }>({});
  const [serverError, setServerError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Browse Dashboard States
  const [movies, setMovies] = useState<Movie[]>([]);
  const [selectedGenre, setSelectedGenre] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [myList, setMyList] = useState<string[]>(() => {
    const savedList = localStorage.getItem("netflix_my_list");
    return savedList ? JSON.parse(savedList) : [];
  });
  
  // Active Interactive States
  const [selectedMovie, setSelectedMovie] = useState<Movie | null>(null);
  const [isMuted, setIsMuted] = useState(true);
  const [showNavbarBg, setShowNavbarBg] = useState(false);
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const [fullscreenVideo, setFullscreenVideo] = useState<Movie | null>(null);
  const [loginNotification, setLoginNotification] = useState<string | null>(null);

  // Fetch movies from API
  useEffect(() => {
    if (user && selectedProfile) {
      fetch("/api/movies")
        .then((res) => {
          if (!res.ok) throw new Error("Failed to load movies catalog");
          return res.json();
        })
        .then((data) => setMovies(data))
        .catch((err) => console.error(err));
    }
  }, [user, selectedProfile]);

  // Handle scroll to change navbar background transparency
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 50) {
        setShowNavbarBg(true);
      } else {
        setShowNavbarBg(false);
      }
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Save 'My List' to localStorage
  useEffect(() => {
    localStorage.setItem("netflix_my_list", JSON.stringify(myList));
  }, [myList]);

  // Form input validation
  const validateForm = () => {
    const errors: { email?: string; password?: string } = {};
    
    if (!email) {
      errors.email = "Please enter a valid email or phone number.";
    } else {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        errors.email = "Please enter a valid email address.";
      }
    }

    if (!password) {
      errors.password = "Your password must contain between 4 and 60 characters.";
    } else if (password.length < 4) {
      errors.password = "Your password must be at least 4 characters long.";
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Submit Login
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setServerError(null);

    if (!validateForm()) return;

    setIsSubmitting(true);

    try {
      const response = await fetch("/api/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Authentication failed. Please check your credentials.");
      }

      // Store in memory and storage
      setUser(data.user);
      localStorage.setItem("netflix_user", JSON.stringify(data.user));

      if (rememberMe) {
        localStorage.setItem("netflix_remembered_email", email);
      } else {
        localStorage.removeItem("netflix_remembered_email");
      }

      setLoginNotification("Access granted. Welcome to Netflix!");
      setTimeout(() => setLoginNotification(null), 4000);
    } catch (err: any) {
      setServerError(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Logging Out
  const handleSignOut = () => {
    setUser(null);
    setSelectedProfile(null);
    localStorage.removeItem("netflix_user");
    localStorage.removeItem("netflix_profile");
    setProfileDropdownOpen(false);
  };

  // Add/Remove item from 'My List'
  const toggleMyList = (movieId: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setMyList((prev) =>
      prev.includes(movieId) ? prev.filter((id) => id !== movieId) : [...prev, movieId]
    );
  };

  // Get filtered movies
  const getGenresList = () => {
    const list = new Set<string>();
    list.add("All");
    movies.forEach(m => list.add(m.genre));
    return Array.from(list);
  };

  const filteredMovies = movies.filter((movie) => {
    const matchesGenre = selectedGenre === "All" || movie.genre === selectedGenre;
    const matchesSearch = movie.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          movie.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase())) ||
                          movie.genre.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesGenre && matchesSearch;
  });

  // Main featured movie (first one matching selected genre, or standard "Stranger Things")
  const featuredMovie = movies.find(m => selectedGenre === "All" ? m.id === "stranger-things" : m.genre === selectedGenre) || movies[0];

  return (
    <div id="netflix-applet" className="min-h-screen bg-black text-white font-sans overflow-x-hidden antialiased selection:bg-[#E50914] selection:text-white">
      
      {/* 1. LOGIN SCREEN */}
      {!user && (
        <div 
          id="login-view-container" 
          className="relative min-h-screen flex flex-col justify-between"
          style={{ 
            backgroundColor: "#000000",
            backgroundImage: "radial-gradient(circle at center, #251a1a 0%, #000000 100%)"
          }}
        >
          {/* Top Header */}
          <header id="login-header" className="w-full py-6 px-4 md:px-16 flex justify-between items-center z-20">
            <NetflixLogo className="h-10 md:h-12 text-[#E50914] fill-[#E50914]" />
            <div id="header-actions" className="flex items-center gap-4">
              <div className="relative inline-block">
                <select id="lang-selector-header" className="bg-black/40 border border-zinc-600 rounded text-zinc-300 text-sm py-1.5 px-3 focus:outline-hidden focus:border-white transition-all cursor-pointer">
                  <option>🌐 English</option>
                  <option>🌐 Español</option>
                  <option>🌐 Français</option>
                </select>
              </div>
            </div>
          </header>

          {/* Central Login Card */}
          <main id="login-card-main" className="flex-grow flex items-center justify-center px-4 py-8 z-10">
            <motion.div 
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
              className="bg-black/75 p-8 md:p-16 rounded-md w-full max-w-[450px] shadow-2xl border border-zinc-900/50 backdrop-blur-md"
            >
              <h1 id="signin-header-title" className="text-white text-3xl font-bold mb-8 tracking-tight">Sign In</h1>
              
              {serverError && (
                <div id="login-server-error" className="bg-[#e87c03]/15 border-b-2 border-orange-500 rounded p-4 mb-6 text-sm text-zinc-200">
                  <p className="font-semibold text-orange-400 mb-1">Authorization issue</p>
                  {serverError}
                </div>
              )}

              <form onSubmit={handleLogin} className="space-y-4">
                <FloatingInput
                  id="login-email"
                  label="Email or phone number"
                  type="text"
                  value={email}
                  error={formErrors.email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    if (formErrors.email) setFormErrors({ ...formErrors, email: undefined });
                  }}
                  autoFocus
                />

                <FloatingInput
                  id="login-password"
                  label="Password"
                  type="password"
                  value={password}
                  error={formErrors.password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    if (formErrors.password) setFormErrors({ ...formErrors, password: undefined });
                  }}
                />

                <button
                  id="login-submit-button"
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full bg-[#E50914] text-white font-semibold py-3.5 mt-4 rounded hover:bg-[#C11119] active:scale-[0.98] transition-all duration-200 shadow-lg flex items-center justify-center gap-2 cursor-pointer disabled:bg-zinc-700 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? (
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    "Sign In"
                  )}
                </button>

                <div id="form-help-container" className="flex justify-between items-center text-[#B3B3B3] text-sm pt-3">
                  <label className="flex items-center cursor-pointer group select-none">
                    <input 
                      id="remember-me-checkbox"
                      type="checkbox" 
                      checked={rememberMe}
                      onChange={(e) => setRememberMe(e.target.checked)}
                      className="mr-2.5 accent-zinc-500 w-4.5 h-4.5 rounded cursor-pointer border border-zinc-500" 
                    />
                    <span className="group-hover:text-white transition-colors duration-200 text-xs">Remember me</span>
                  </label>
                  <a href="#help" className="hover:underline text-xs text-zinc-400 hover:text-white transition-colors">Need help?</a>
                </div>
              </form>

              <div id="login-foot-notes" className="mt-8 text-zinc-500 space-y-4">
                <div className="text-sm">
                  New to Netflix? <a href="#signup" className="text-white hover:underline font-medium">Sign up now</a>.
                </div>
                <p className="text-[11px] leading-relaxed text-zinc-500">
                  This page is protected by Google reCAPTCHA to ensure you're not a bot. 
                  <span className="text-[#0071EB] hover:underline cursor-pointer ml-1">Learn more.</span>
                </p>
              </div>
            </motion.div>
          </main>

          {/* Sticky Footer */}
          <footer id="login-view-footer" className="w-full bg-black/90 border-t border-zinc-800 px-6 md:px-16 py-10 z-20 text-zinc-500 text-sm">
            <div className="max-w-4xl mx-auto">
              <p className="text-zinc-400 mb-8 font-medium">Questions? Call 1-844-505-2993</p>
              
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-xs text-zinc-500">
                <ul className="space-y-3">
                  <li className="hover:underline cursor-pointer">FAQ</li>
                  <li className="hover:underline cursor-pointer">Cookie Preferences</li>
                </ul>
                <ul className="space-y-3">
                  <li className="hover:underline cursor-pointer">Help Center</li>
                  <li className="hover:underline cursor-pointer">Corporate Information</li>
                </ul>
                <ul className="space-y-3">
                  <li className="hover:underline cursor-pointer">Terms of Use</li>
                </ul>
                <ul className="space-y-3">
                  <li className="hover:underline cursor-pointer">Privacy</li>
                </ul>
              </div>
              
              <div className="mt-10 flex items-center justify-between">
                <div className="inline-flex items-center px-3 py-1.5 border border-zinc-800 rounded bg-zinc-950 text-zinc-400 text-xs">
                  🌐 English
                </div>
                <span className="text-[10px] text-zinc-600">Netflix Clone © 2026</span>
              </div>
            </div>
          </footer>
        </div>
      )}

      {/* 2. PROFILE SELECTOR SCREEN */}
      {user && !selectedProfile && (
        <ProfileSelector 
          onSelect={(profile) => {
            setSelectedProfile(profile);
            localStorage.setItem("netflix_profile", JSON.stringify(profile));
          }} 
        />
      )}

      {/* 3. BROWSE DASHBOARD */}
      {user && selectedProfile && (
        <div id="browse-dashboard-container" className="relative min-h-screen pb-20">
          
          {/* Notification Alert */}
          <AnimatePresence>
            {loginNotification && (
              <motion.div 
                initial={{ opacity: 0, y: -50 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -50 }}
                id="toast-notification"
                className="fixed top-20 right-4 md:right-8 bg-zinc-900 border-l-4 border-emerald-500 text-white px-5 py-4 rounded shadow-2xl flex items-center gap-3 z-50 max-w-sm"
              >
                <div className="bg-emerald-500/20 p-1.5 rounded-full text-emerald-400">
                  <Check size={18} />
                </div>
                <div>
                  <h4 className="text-xs text-zinc-400 font-semibold uppercase tracking-wider">Success</h4>
                  <p className="text-sm font-medium">{loginNotification}</p>
                </div>
                <button onClick={() => setLoginNotification(null)} className="ml-auto text-zinc-400 hover:text-white">
                  <X size={16} />
                </button>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Dynamic Top Navbar */}
          <nav 
            id="browse-navbar"
            className={`fixed top-0 w-full z-40 transition-all duration-300 px-4 md:px-12 py-4 flex items-center justify-between ${
              showNavbarBg ? "bg-[#141414] shadow-lg border-b border-zinc-900" : "bg-linear-to-b from-black/80 to-transparent"
            }`}
          >
            <div className="flex items-center gap-6 md:gap-10">
              {/* Reset view on logo click */}
              <button 
                onClick={() => {
                  setSelectedGenre("All");
                  setSearchQuery("");
                }} 
                className="focus:outline-hidden cursor-pointer"
              >
                <NetflixLogo className="h-6 md:h-8 fill-red-600" />
              </button>

              <ul id="navbar-links" className="hidden lg:flex items-center gap-5 text-sm font-light text-zinc-300">
                <li>
                  <button 
                    onClick={() => { setSelectedGenre("All"); setSearchQuery(""); }} 
                    className={`hover:text-zinc-400 transition-colors cursor-pointer ${selectedGenre === "All" && searchQuery === "" ? "text-white font-medium" : ""}`}
                  >
                    Home
                  </button>
                </li>
                <li>
                  <button 
                    onClick={() => { setSelectedGenre("Drama"); setSearchQuery(""); }} 
                    className={`hover:text-zinc-400 transition-colors cursor-pointer ${selectedGenre === "Drama" ? "text-white font-medium" : ""}`}
                  >
                    TV Shows
                  </button>
                </li>
                <li>
                  <button 
                    onClick={() => { setSelectedGenre("Sci-Fi"); setSearchQuery(""); }} 
                    className={`hover:text-zinc-400 transition-colors cursor-pointer ${selectedGenre === "Sci-Fi" ? "text-white font-medium" : ""}`}
                  >
                    Movies
                  </button>
                </li>
                <li>
                  <button 
                    onClick={() => { setSelectedGenre("Thriller"); setSearchQuery(""); }} 
                    className={`hover:text-zinc-400 transition-colors cursor-pointer ${selectedGenre === "Thriller" ? "text-white font-medium" : ""}`}
                  >
                    New & Popular
                  </button>
                </li>
                <li>
                  <button 
                    onClick={() => { setSelectedGenre("MyList"); setSearchQuery(""); }} 
                    className={`hover:text-zinc-400 transition-colors cursor-pointer ${selectedGenre === "MyList" ? "text-white font-medium" : ""}`}
                  >
                    My List {myList.length > 0 && `(${myList.length})`}
                  </button>
                </li>
              </ul>
            </div>

            {/* Right Navbar Actions */}
            <div id="navbar-right-actions" className="flex items-center gap-4 md:gap-6 relative">
              {/* Search Bar */}
              <div id="search-bar-container" className="relative flex items-center">
                <Search size={18} className="absolute left-3 text-zinc-400" />
                <input
                  id="browse-search-input"
                  type="text"
                  placeholder="Titles, genres, tags..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="bg-zinc-900/80 hover:bg-zinc-900 border border-zinc-800 rounded-full py-1.5 pl-9 pr-4 text-xs text-white focus:outline-hidden focus:border-zinc-500 w-44 md:w-64 transition-all duration-300"
                />
                {searchQuery && (
                  <button onClick={() => setSearchQuery("")} className="absolute right-3 text-zinc-400 hover:text-white">
                    <X size={14} />
                  </button>
                )}
              </div>

              {/* Profile Dropdown Trigger */}
              <div id="profile-dropdown-container" className="relative">
                <button
                  id="profile-dropdown-trigger"
                  onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
                  className="flex items-center gap-2 focus:outline-hidden cursor-pointer"
                >
                  <div className={`w-8 h-8 rounded-md flex items-center justify-center text-xs font-bold ${
                    selectedProfile.avatarUrl === "blue" ? "bg-[#1f80eb]" :
                    selectedProfile.avatarUrl === "red" ? "bg-[#e50914]" :
                    selectedProfile.avatarUrl === "green" ? "bg-[#2bb85c]" : "bg-[#e2b007]"
                  }`}>
                    {/* Tiny representation of the smiley */}
                    <svg className="w-5 h-5 text-white" viewBox="0 0 100 100" fill="none">
                      <circle cx="32" cy="40" r="6" fill="currentColor" />
                      <circle cx="68" cy="40" r="6" fill="currentColor" />
                      <path d="M 30 62 C 30 62, 50 80, 70 62" stroke="currentColor" strokeWidth="8" strokeLinecap="round" />
                    </svg>
                  </div>
                  <ChevronDown size={14} className={`text-zinc-400 transition-transform duration-300 ${profileDropdownOpen ? "rotate-180" : ""}`} />
                </button>

                {/* Dropdown Menu */}
                <AnimatePresence>
                  {profileDropdownOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 10 }}
                      id="profile-menu-dropdown"
                      className="absolute right-0 mt-3 bg-zinc-950 border border-zinc-800 rounded shadow-2xl py-2 w-56 z-50"
                    >
                      {/* Profiles header */}
                      <div className="px-4 py-2 border-b border-zinc-900 text-xs text-zinc-500 uppercase tracking-widest font-semibold">
                        Switch Profile
                      </div>

                      {/* Alternate profiles */}
                      {profilesList.filter(p => p.id !== selectedProfile.id).map(profile => (
                        <button
                          key={profile.id}
                          onClick={() => {
                            setSelectedProfile(profile);
                            localStorage.setItem("netflix_profile", JSON.stringify(profile));
                            setProfileDropdownOpen(false);
                          }}
                          className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-zinc-900 text-sm text-zinc-300 hover:text-white transition-colors"
                        >
                          <div className={`w-6 h-6 rounded flex items-center justify-center ${
                            profile.avatarUrl === "blue" ? "bg-[#1f80eb]" :
                            profile.avatarUrl === "red" ? "bg-[#e50914]" :
                            profile.avatarUrl === "green" ? "bg-[#2bb85c]" : "bg-[#e2b007]"
                          }`}>
                            <svg className="w-4 h-4 text-white" viewBox="0 0 100 100" fill="none">
                              <circle cx="32" cy="40" r="6" fill="currentColor" />
                              <circle cx="68" cy="40" r="6" fill="currentColor" />
                              <path d="M 30 62 C 30 62, 50 80, 70 62" stroke="currentColor" strokeWidth="8" strokeLinecap="round" />
                            </svg>
                          </div>
                          <span>{profile.name}</span>
                        </button>
                      ))}

                      <div className="border-t border-zinc-900 my-2"></div>

                      <button
                        id="signout-dropdown-btn"
                        onClick={handleSignOut}
                        className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-red-950/40 text-sm text-red-400 hover:text-red-300 transition-colors"
                      >
                        <LogOut size={16} />
                        <span>Sign out of Netflix</span>
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
          </nav>

          {/* Featured Hero Banner */}
          {featuredMovie && !searchQuery && selectedGenre !== "MyList" && (
            <div id="hero-showcase" className="relative h-[56.25vw] min-h-[500px] max-h-[800px] w-full overflow-hidden bg-black">
              {/* Background cover image or auto-playing muted video loop */}
              <div className="absolute inset-0">
                <img
                  src={featuredMovie.bannerUrl}
                  alt={featuredMovie.title}
                  className="w-full h-full object-cover brightness-60"
                />
                <div className="absolute inset-0 bg-linear-to-t from-[#141414] via-[#141414]/20 to-transparent"></div>
                <div className="absolute inset-0 bg-linear-to-r from-[#141414]/80 via-transparent to-transparent"></div>
              </div>

              {/* Hero Details Card */}
              <div id="hero-details-card" className="absolute bottom-16 md:bottom-28 left-4 md:left-12 max-w-xl z-20 space-y-4">
                <div className="flex items-center gap-2">
                  <span className="bg-[#E50914] text-white text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 rounded-sm">
                    Original
                  </span>
                  <span className="text-zinc-400 text-xs font-semibold">
                    {featuredMovie.genre}
                  </span>
                </div>

                <h1 className="text-4xl md:text-6xl font-black text-white leading-tight tracking-tight drop-shadow-md">
                  {featuredMovie.title}
                </h1>

                {/* Rating & tags */}
                <div className="flex flex-wrap items-center gap-3 text-xs md:text-sm font-medium">
                  <span className="border border-zinc-500 rounded px-1.5 py-0.2 text-zinc-300">{featuredMovie.rating}</span>
                  <span className="text-emerald-400 font-semibold">{featuredMovie.duration}</span>
                  <span className="text-zinc-400">{featuredMovie.year}</span>
                  <div className="flex items-center gap-1.5">
                    {featuredMovie.tags.map((tag, idx) => (
                      <span key={tag} className="text-zinc-300 text-xs">
                        {tag}{idx < featuredMovie.tags.length - 1 && <span className="text-zinc-600 ml-1.5">•</span>}
                      </span>
                    ))}
                  </div>
                </div>

                <p className="text-zinc-300 text-sm md:text-base leading-relaxed line-clamp-3 font-light drop-shadow-sm">
                  {featuredMovie.description}
                </p>

                {/* Hero Button Actions */}
                <div className="flex items-center gap-3 pt-2">
                  <button
                    id="hero-play-button"
                    onClick={() => setFullscreenVideo(featuredMovie)}
                    className="flex items-center justify-center gap-2 bg-white text-black font-semibold rounded px-6 md:px-8 py-2.5 hover:bg-zinc-200 active:scale-95 transition-all cursor-pointer text-sm shadow-xl"
                  >
                    <Play className="fill-black" size={18} />
                    <span>Play</span>
                  </button>

                  <button
                    id="hero-info-button"
                    onClick={() => setSelectedMovie(featuredMovie)}
                    className="flex items-center justify-center gap-2 bg-zinc-600/60 hover:bg-zinc-600 text-white font-semibold rounded px-6 py-2.5 active:scale-95 transition-all cursor-pointer text-sm backdrop-blur-xs"
                  >
                    <Info size={18} />
                    <span>More Info</span>
                  </button>

                  {/* Add to list */}
                  <button
                    id="hero-list-button"
                    onClick={(e) => toggleMyList(featuredMovie.id, e)}
                    className="flex items-center justify-center w-10 h-10 rounded-full border border-zinc-400 text-zinc-300 hover:text-white hover:border-white transition-all cursor-pointer bg-black/40"
                    title={myList.includes(featuredMovie.id) ? "Remove from list" : "Add to list"}
                  >
                    {myList.includes(featuredMovie.id) ? <Check size={18} className="text-emerald-400" /> : <Plus size={18} />}
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Genre & Filter Navigation Strip */}
          <div id="genre-filter-strip" className={`px-4 md:px-12 py-6 flex flex-wrap items-center justify-between gap-4 border-b border-zinc-900 bg-zinc-950 ${searchQuery ? "mt-24" : ""}`}>
            <div className="flex items-center gap-2 text-zinc-400 text-sm">
              <Filter size={16} />
              <span className="font-semibold uppercase tracking-wider text-xs">Categories:</span>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              {["All", "Sci-Fi", "Thriller", "Fantasy", "Drama", "Anime", "Action", "MyList"].map((g) => (
                <button
                  key={g}
                  onClick={() => setSelectedGenre(g)}
                  className={`px-4 py-1.5 rounded-full text-xs transition-all duration-200 cursor-pointer ${
                    selectedGenre === g
                      ? "bg-[#E50914] text-white font-medium shadow-md"
                      : "bg-zinc-900 text-zinc-400 hover:bg-zinc-800 hover:text-white"
                  }`}
                >
                  {g === "MyList" ? "My List" : g}
                </button>
              ))}
            </div>
          </div>

          {/* Movies Catalog Grid Section */}
          <main id="catalog-section" className="px-4 md:px-12 mt-8 space-y-12">
            <div className="flex items-baseline justify-between border-b border-zinc-900 pb-3">
              <h2 id="catalog-section-title" className="text-xl md:text-2xl font-semibold tracking-tight text-white flex items-center gap-2">
                {selectedGenre === "MyList" ? "Your Customized List" : `${selectedGenre} Titles`}
                <span className="text-xs text-zinc-500 font-light font-mono">({filteredMovies.length} found)</span>
              </h2>
            </div>

            {filteredMovies.length === 0 ? (
              <div id="no-movies-view" className="bg-zinc-950/50 border border-zinc-900 rounded-xl p-16 text-center space-y-4 max-w-lg mx-auto">
                <div className="w-16 h-16 bg-zinc-900 rounded-full flex items-center justify-center mx-auto text-zinc-500">
                  <Info size={28} />
                </div>
                <h3 className="text-lg font-medium text-zinc-200">No matching titles found</h3>
                <p className="text-zinc-500 text-sm leading-relaxed">
                  {selectedGenre === "MyList" 
                    ? "You haven't added any movies to your list yet. Start browsing the catalog and click the '+' sign to save favorites!"
                    : "Try adjusting your search criteria or explore a different category."
                  }
                </p>
                <button 
                  onClick={() => { setSelectedGenre("All"); setSearchQuery(""); }} 
                  className="bg-zinc-900 hover:bg-zinc-800 text-zinc-300 hover:text-white px-5 py-2 rounded text-xs transition-colors"
                >
                  Browse All Categories
                </button>
              </div>
            ) : (
              <div id="movies-grid" className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {filteredMovies.map((movie) => {
                  const isInList = myList.includes(movie.id);

                  return (
                    <motion.div
                      layoutId={`movie-card-${movie.id}`}
                      onClick={() => setSelectedMovie(movie)}
                      key={movie.id}
                      className="group bg-zinc-900 border border-zinc-800/80 rounded-md overflow-hidden relative cursor-pointer shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-1.5"
                    >
                      {/* Image Frame */}
                      <div className="relative aspect-video w-full bg-zinc-950 overflow-hidden">
                        <img
                          src={movie.cardUrl}
                          alt={movie.title}
                          loading="lazy"
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                        {/* Overlay Gradient on Hover */}
                        <div className="absolute inset-0 bg-linear-to-t from-black via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-4">
                          <p className="text-xs text-emerald-400 font-semibold">{movie.rating} • {movie.duration}</p>
                        </div>
                      </div>

                      {/* Movie brief text */}
                      <div className="p-4 space-y-2">
                        <div className="flex items-start justify-between">
                          <h3 className="font-semibold text-sm text-zinc-100 tracking-tight group-hover:text-white transition-colors duration-200 line-clamp-1">
                            {movie.title}
                          </h3>
                          <span className="text-[10px] bg-zinc-800 text-zinc-400 font-mono px-1.5 py-0.5 rounded">
                            {movie.year}
                          </span>
                        </div>

                        <p className="text-zinc-400 text-xs font-light line-clamp-2">
                          {movie.description}
                        </p>

                        <div className="flex items-center justify-between pt-2 border-t border-zinc-800/80">
                          <div className="flex gap-1.5 flex-wrap">
                            {movie.tags.slice(0, 2).map(tag => (
                              <span key={tag} className="text-[9px] text-zinc-500 bg-zinc-950 px-1.5 py-0.5 rounded-sm">
                                {tag}
                              </span>
                            ))}
                          </div>

                          <div className="flex items-center gap-1.5">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                setFullscreenVideo(movie);
                              }}
                              className="w-7 h-7 bg-white text-black hover:bg-zinc-200 rounded-full flex items-center justify-center shadow-md active:scale-90 transition-all"
                              title="Play trailer"
                            >
                              <Play size={12} className="fill-black ml-0.5" />
                            </button>

                            <button
                              onClick={(e) => toggleMyList(movie.id, e)}
                              className={`w-7 h-7 rounded-full border flex items-center justify-center transition-all ${
                                isInList 
                                  ? "border-emerald-500 bg-emerald-500/10 text-emerald-400" 
                                  : "border-zinc-700 text-zinc-400 hover:text-white hover:border-zinc-400"
                              }`}
                              title={isInList ? "Remove from my list" : "Add to my list"}
                            >
                              {isInList ? <Check size={12} /> : <Plus size={12} />}
                            </button>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            )}
          </main>

          {/* 4. DETAIL OVERLAY MODAL */}
          <AnimatePresence>
            {selectedMovie && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                id="movie-modal-backdrop"
                className="fixed inset-0 bg-black/85 flex items-center justify-center z-50 p-4 overflow-y-auto backdrop-blur-xs"
                onClick={() => setSelectedMovie(null)}
              >
                <motion.div
                  initial={{ scale: 0.95, y: 20 }}
                  animate={{ scale: 1, y: 0 }}
                  exit={{ scale: 0.95, y: 20 }}
                  transition={{ type: "spring", damping: 25 }}
                  id="movie-modal-content"
                  className="bg-zinc-950 border border-zinc-900 rounded-xl overflow-hidden max-w-3xl w-full relative shadow-2xl my-8 text-left"
                  onClick={(e) => e.stopPropagation()}
                >
                  {/* Banner/Video Section */}
                  <div className="relative aspect-video bg-black overflow-hidden w-full">
                    <video
                      id={`modal-trailer-${selectedMovie.id}`}
                      src={selectedMovie.videoUrl}
                      autoPlay
                      loop
                      muted={isMuted}
                      className="w-full h-full object-cover"
                    />

                    {/* Left shadow overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-zinc-950/20 to-transparent"></div>

                    {/* Top close button */}
                    <button
                      id="close-modal-btn"
                      onClick={() => setSelectedMovie(null)}
                      className="absolute top-4 right-4 bg-black/70 hover:bg-black border border-zinc-800 text-white rounded-full p-2 hover:scale-105 active:scale-95 transition-all cursor-pointer"
                    >
                      <X size={20} />
                    </button>

                    {/* Bottom control bar */}
                    <div className="absolute bottom-6 left-6 right-6 flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <button
                          id="modal-play-btn"
                          onClick={() => {
                            setFullscreenVideo(selectedMovie);
                            setSelectedMovie(null);
                          }}
                          className="bg-white hover:bg-zinc-200 text-black font-semibold text-sm px-6 py-2.5 rounded flex items-center gap-2 shadow-lg transition-colors cursor-pointer"
                        >
                          <Play className="fill-black" size={14} /> Play
                        </button>

                        <button
                          id="modal-list-toggle"
                          onClick={() => toggleMyList(selectedMovie.id)}
                          className="w-10 h-10 rounded-full border border-zinc-500 bg-zinc-950/80 hover:border-white text-zinc-300 hover:text-white flex items-center justify-center transition-colors cursor-pointer"
                          title={myList.includes(selectedMovie.id) ? "Remove from my list" : "Add to my list"}
                        >
                          {myList.includes(selectedMovie.id) ? <Check size={18} className="text-emerald-400" /> : <Plus size={18} />}
                        </button>
                      </div>

                      <button
                        id="modal-mute-toggle"
                        onClick={() => setIsMuted(!isMuted)}
                        className="w-10 h-10 rounded-full border border-zinc-500 bg-zinc-950/80 hover:border-white text-zinc-300 hover:text-white flex items-center justify-center transition-colors cursor-pointer"
                      >
                        {isMuted ? <VolumeX size={18} /> : <Volume2 size={18} />}
                      </button>
                    </div>
                  </div>

                  {/* Metadata & Description */}
                  <div className="p-8 space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      
                      {/* Left: General Meta */}
                      <div className="md:col-span-2 space-y-4">
                        <div className="flex items-center gap-3 text-sm">
                          <span className="text-emerald-400 font-bold font-mono">{selectedMovie.year}</span>
                          <span className="border border-zinc-700 px-2 py-0.5 rounded text-xs text-zinc-300">{selectedMovie.rating}</span>
                          <span className="text-zinc-400">{selectedMovie.duration}</span>
                          <span className="bg-zinc-900 border border-zinc-800 text-zinc-300 px-2 py-0.5 rounded text-xs uppercase tracking-wider">{selectedMovie.genre}</span>
                        </div>

                        <p className="text-zinc-300 text-base leading-relaxed font-light">
                          {selectedMovie.description}
                        </p>
                      </div>

                      {/* Right: Technical Details */}
                      <div className="space-y-4 text-sm border-t md:border-t-0 md:border-l border-zinc-900 pt-4 md:pt-0 md:pl-6">
                        <div>
                          <span className="text-zinc-500 block mb-1">Tags:</span>
                          <div className="flex flex-wrap gap-1.5">
                            {selectedMovie.tags.map(t => (
                              <span key={t} className="text-xs bg-zinc-900 border border-zinc-800 text-zinc-300 px-2 py-0.5 rounded">
                                {t}
                              </span>
                            ))}
                          </div>
                        </div>

                        <div>
                          <span className="text-zinc-500 block mb-1">Interactive Quality:</span>
                          <span className="text-zinc-300 text-xs flex items-center gap-1">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 inline-block animate-pulse"></span>
                            Ultra HD 4K, HDR, Surround 5.1
                          </span>
                        </div>
                      </div>

                    </div>
                  </div>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* 5. FULLSCREEN TRAILER PREVIEW PLAYER */}
          <AnimatePresence>
            {fullscreenVideo && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                id="fullscreen-player-container"
                className="fixed inset-0 bg-black z-50 flex flex-col justify-between"
              >
                {/* Custom Overlay Controls */}
                <div className="absolute top-0 inset-x-0 bg-gradient-to-b from-black/80 to-transparent p-6 flex items-center justify-between z-10">
                  <button
                    id="exit-fullscreen-btn"
                    onClick={() => setFullscreenVideo(null)}
                    className="flex items-center gap-2 bg-zinc-900/80 border border-zinc-800 hover:bg-zinc-800 hover:text-white text-zinc-300 px-4 py-2 rounded-full text-sm cursor-pointer transition-colors"
                  >
                    <X size={16} /> Exit Playback
                  </button>

                  <h3 className="text-base md:text-lg font-semibold text-zinc-100 tracking-tight">
                    Now Playing: <span className="text-white">{fullscreenVideo.title}</span>
                  </h3>

                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => setIsMuted(!isMuted)}
                      className="bg-zinc-900/80 hover:bg-zinc-800 border border-zinc-800 rounded-full p-2 text-white"
                    >
                      {isMuted ? <VolumeX size={18} /> : <Volume2 size={18} />}
                    </button>
                  </div>
                </div>

                {/* Main Video element */}
                <div className="flex-grow bg-black flex items-center justify-center">
                  <video
                    id={`fullscreen-trailer-video-${fullscreenVideo.id}`}
                    src={fullscreenVideo.videoUrl}
                    autoPlay
                    loop
                    controls
                    muted={isMuted}
                    className="w-full max-h-screen object-contain"
                  />
                </div>

                {/* Bottom Footer Info */}
                <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/80 to-transparent p-6 z-10 text-center">
                  <p className="text-xs text-zinc-500 font-mono">
                    Streaming source hosted on Mixkit assets • Enjoy real-time interaction
                  </p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

        </div>
      )}

    </div>
  );
}
