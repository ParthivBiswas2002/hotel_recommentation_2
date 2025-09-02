// src/components/Navbar.js - Enhanced with JWT Authentication and User-Specific Features
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FaSearch, FaGlobe, FaUser, FaCalendarAlt, FaChevronDown, FaShoppingCart } from 'react-icons/fa';
import { useCart } from '../context/CartContext';
import { useBookings } from '../context/BookingsContext';
import ApiService from '../services/api';

const Navbar = ({
  onCartOpen,
  onSearch,
  onSignIn,
  onOpenProfile,
  onGoToBookings,
  onSignUp,
  // ✅ Props from parent for persistent state
  isSignedIn,
  userData,
  onSignOut
}) => {
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [isCurrencyOpen, setIsCurrencyOpen] = useState(false);
  const [showSignInForm, setShowSignInForm] = useState(false);
  const [showSignUpForm, setShowSignUpForm] = useState(false);

  // ✅ Authentication loading states
  const [isLoading, setIsLoading] = useState(false);
  const [authError, setAuthError] = useState('');

  // ✅ Persistent currency and country state
  const [selectedCurrency, setSelectedCurrency] = useState(() => {
    return localStorage.getItem('selectedCurrency') || 'INR';
  });
  const [selectedCountry, setSelectedCountry] = useState(() => {
    return localStorage.getItem('selectedCountry') || 'India';
  });

  const { getCartCount } = useCart();
  const { refreshBookings } = useBookings();

  const currencies = ['USD', 'EUR', 'GBP', 'JPY', 'CAD', 'INR'];
  const countries = ['United States', 'United Kingdom', 'Germany', 'France', 'Japan', 'India'];

  // ✅ Save currency/country preferences to localStorage
  useEffect(() => {
    localStorage.setItem('selectedCurrency', selectedCurrency);
  }, [selectedCurrency]);

  useEffect(() => {
    localStorage.setItem('selectedCountry', selectedCountry);
  }, [selectedCountry]);

  // ✅ ENHANCED: Sign-in handler with JWT token management
  const handleSignIn = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setAuthError('');

    const formData = new FormData(e.target);
    const email = formData.get('email');
    const password = formData.get('password');
    const purpose = formData.get('purpose');

    try {
      console.log('🔐 Attempting login...');

      // ✅ Login using JWT endpoint
      const loginResponse = await ApiService.login({
        username: email,
        password
      });

      if (loginResponse.access_token) {
        console.log('✅ JWT token received');

        // ✅ Get current user data
        const currentUser = await ApiService.getCurrentUser();

        const enhancedUserData = {
          ...currentUser,
          email,
          purpose,
          loginTime: new Date().toISOString()
        };

        setShowSignInForm(false);

        // ✅ Call parent's sign-in handler
        if (typeof onSignIn === 'function') {
          onSignIn(enhancedUserData);
        }

        // ✅ Refresh bookings for the user
        if (refreshBookings) {
          refreshBookings();
        }

        console.log('✅ Signed in successfully:', enhancedUserData);
      } else {
        throw new Error('No access token received');
      }
    } catch (error) {
      console.error('❌ Sign in error:', error);
      setAuthError(error.message || 'Login failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // ✅ ENHANCED: Sign-up handler with automatic login
  const handleSignUp = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setAuthError('');

    const formData = new FormData(e.target);
    const name = formData.get('name');
    const email = formData.get('email');
    const password = formData.get('password');
    const age = formData.get('age');
    const purpose = formData.get('purpose');

    try {
      console.log('📝 Attempting registration...');

      // ✅ Register user
      const registerResponse = await ApiService.register({
        name,
        email,
        password,
        age: Number(age)
      });

      if (registerResponse.msg === 'User created successfully') {
        console.log('✅ Registration successful');

        // ✅ Automatically log in the user after registration
        const loginResponse = await ApiService.login({
          username: email,
          password
        });

        if (loginResponse.access_token) {
          // Get user data
          const currentUser = await ApiService.getCurrentUser();

          const newUserData = {
            ...currentUser,
            name,
            email,
            age: Number(age),
            purpose,
            registrationDate: new Date().toISOString()
          };

          setShowSignUpForm(false);

          // ✅ Call parent's sign-up handler
          if (typeof onSignUp === 'function') {
            onSignUp(newUserData);
          }

          console.log('✅ Signed up and logged in successfully:', newUserData);
        }
      } else {
        throw new Error('Registration failed');
      }
    } catch (error) {
      console.error('❌ Sign up error:', error);
      setAuthError(error.message || 'Registration failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // In Navbar.js - Enhanced logout handler
  const handleSignOut = async () => {
    setIsUserMenuOpen(false);

    try {
      console.log('🚪 Starting comprehensive logout...');

      // ✅ 1. Clear API tokens and call logout endpoint
      await ApiService.logout();

      // ✅ 2. Clear all localStorage data
      localStorage.clear();

      // ✅ 3. Clear sessionStorage data
      sessionStorage.clear();

      // ✅ 4. Clear all cookies (if any)
      document.cookie.split(";").forEach(function (c) {
        document.cookie = c.replace(/^ +/, "").replace(/=.*/, "=;expires=" + new Date().toUTCString() + ";path=/");
      });

      // ✅ 5. Force reload to clear all in-memory state
      console.log('✅ All data cleared, reloading page...');
      window.location.href = '/'; // Full page reload to clear everything

    } catch (error) {
      console.error('❌ Logout error:', error);
      // Even if API fails, clear local data
      localStorage.clear();
      sessionStorage.clear();
      window.location.href = '/';
    }
  };


  const handleCurrencyChange = (currency) => {
    setSelectedCurrency(currency);
    setIsCurrencyOpen(false);
  };

  const handleCountryChange = (country) => {
    setSelectedCountry(country);
    setIsCurrencyOpen(false);
  };

  // ✅ Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (isUserMenuOpen && !event.target.closest('[data-dropdown="user"]')) {
        setIsUserMenuOpen(false);
      }
      if (isCurrencyOpen && !event.target.closest('[data-dropdown="currency"]')) {
        setIsCurrencyOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isUserMenuOpen, isCurrencyOpen]);

  // ✅ Clear auth error when forms are closed
  useEffect(() => {
    if (!showSignInForm && !showSignUpForm) {
      setAuthError('');
    }
  }, [showSignInForm, showSignUpForm]);

  return (
    <motion.nav
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      className="bg-white shadow-lg sticky top-0 z-50"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <motion.div
            whileHover={{ scale: 1.05 }}
            className="flex-shrink-0 cursor-pointer"
            onClick={() => window.location.href = '/'}
          >
            <h1 className="text-2xl font-bold text-primary-600">HotelHub</h1>
          </motion.div>

          {/* Search Bar */}
          <div className="hidden md:flex flex-1 max-w-lg mx-8">
            <div className="relative w-full">
              <input
                type="text"
                placeholder="Search destinations, hotels..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && typeof onSearch === 'function') {
                    onSearch({ destination: searchQuery });
                    try { window.location.hash = '#results'; } catch (_) { }
                  }
                }}
                className={`w-full pl-10 pr-12 py-2 border rounded-lg transition-all duration-300 ${isSearchFocused
                    ? 'border-primary-500 ring-2 ring-primary-200'
                    : 'border-gray-300'
                  }`}
                onFocus={() => setIsSearchFocused(true)}
                onBlur={() => setIsSearchFocused(false)}
              />
              <FaSearch className="absolute left-3 top-3 text-gray-400" />
              <button
                aria-label="Search"
                onClick={() => {
                  if (typeof onSearch === 'function') {
                    onSearch({ destination: searchQuery });
                    try { window.location.hash = '#results'; } catch (_) { }
                  }
                }}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-primary-600 hover:text-primary-700 transition-colors"
              >
                <FaSearch />
              </button>
            </div>
          </div>

          {/* Right side items */}
          <div className="flex items-center space-x-4">
            {/* Currency/Country Selector */}
            <div className="relative hidden lg:block" data-dropdown="currency">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setIsCurrencyOpen(!isCurrencyOpen)}
                className="flex items-center space-x-2 px-3 py-2 text-gray-700 hover:text-primary-600 transition-colors duration-200"
              >
                <FaGlobe />
                <span className="text-sm">{selectedCurrency}</span>
                <FaChevronDown className="text-xs" />
              </motion.button>

              {isCurrencyOpen && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="absolute top-full right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border py-2 z-50"
                >
                  <div className="px-4 py-2 text-xs font-medium text-gray-500 border-b">
                    Currency
                  </div>
                  {currencies.map((currency) => (
                    <button
                      key={currency}
                      className="w-full text-left px-4 py-2 hover:bg-gray-100 transition-colors text-sm"
                      onClick={() => handleCurrencyChange(currency)}
                    >
                      {currency}
                    </button>
                  ))}
                </motion.div>
              )}
            </div>

            {/* Bookings */}
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="hidden lg:flex items-center space-x-2 px-4 py-2 text-gray-700 hover:text-primary-600 transition-colors duration-200"
              onClick={() => {
                if (typeof onGoToBookings === 'function') {
                  onGoToBookings();
                } else {
                  window.location.href = '#bookings-section';
                }
              }}
            >
              <FaCalendarAlt />
              <span>Bookings</span>
            </motion.button>

            {/* Cart */}
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={onCartOpen}
              className="relative flex items-center space-x-2 px-4 py-2 text-gray-700 hover:text-primary-600 transition-colors duration-200"
            >
              <FaShoppingCart />
              <span className="hidden sm:block">Cart</span>
              {getCartCount() > 0 && (
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold"
                >
                  {getCartCount()}
                </motion.div>
              )}
            </motion.button>

            {/* ✅ Enhanced User Menu with Authentication Status */}
            <div className="relative" data-dropdown="user">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                className="flex items-center space-x-2 px-4 py-2 text-gray-700 hover:text-primary-600 transition-colors duration-200"
              >
                <FaUser />
                <span className="hidden sm:block">
                  {isSignedIn
                    ? (userData?.name || userData?.username || userData?.email?.split('@')[0] || 'My Account')
                    : 'Sign In'
                  }
                </span>
                <FaChevronDown className="text-xs" />
                {/* ✅ Online indicator for signed-in users */}
                {isSignedIn && (
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                )}
              </motion.button>

              {/* User Menu Dropdown */}
              {isUserMenuOpen && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="absolute top-full right-0 mt-2 w-56 bg-white rounded-lg shadow-lg border py-2 z-50"
                >
                  {isSignedIn ? (
                    <>
                      {/* ✅ Enhanced user info section */}
                      <div className="px-4 py-3 border-b border-gray-100">
                        <div className="text-sm font-medium text-gray-900">
                          {userData?.name || userData?.username || 'User'}
                        </div>
                        <div className="text-xs text-gray-500">
                          {userData?.email || 'No email'}
                        </div>
                        {userData?.Age && (
                          <div className="text-xs text-gray-400 mt-1">
                            Age: {userData.Age}
                          </div>
                        )}
                      </div>

                      <button
                        className="w-full text-left px-4 py-2 hover:bg-gray-100 transition-colors flex items-center space-x-2"
                        onClick={() => {
                          setIsUserMenuOpen(false);
                          if (typeof onOpenProfile === 'function') onOpenProfile();
                        }}
                      >
                        <FaUser className="text-sm" />
                        <span>My Profile</span>
                      </button>

                      <button
                        className="w-full text-left px-4 py-2 hover:bg-gray-100 transition-colors flex items-center space-x-2"
                        onClick={() => {
                          setIsUserMenuOpen(false);
                          if (typeof onGoToBookings === 'function') onGoToBookings();
                        }}
                      >
                        <FaCalendarAlt className="text-sm" />
                        <span>My Bookings</span>
                      </button>

                      <hr className="my-1" />

                      <button
                        className="w-full text-left px-4 py-2 hover:bg-red-50 text-red-600 transition-colors flex items-center space-x-2"
                        onClick={handleSignOut}
                      >
                        <span className="text-sm">🚪</span>
                        <span>Sign Out</span>
                      </button>
                    </>
                  ) : (
                    <>
                      <button
                        className="w-full text-left px-4 py-2 hover:bg-gray-100 transition-colors"
                        onClick={() => {
                          setShowSignInForm(true);
                          setIsUserMenuOpen(false);
                        }}
                      >
                        Sign In
                      </button>
                      <button
                        className="w-full text-left px-4 py-2 hover:bg-gray-100 transition-colors"
                        onClick={() => {
                          setShowSignUpForm(true);
                          setIsUserMenuOpen(false);
                        }}
                      >
                        Sign Up
                      </button>
                    </>
                  )}
                </motion.div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* ✅ ENHANCED Sign In Modal with Error Handling */}
      {showSignInForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.8, opacity: 0 }}
            className="bg-white rounded-lg p-6 w-full max-w-md"
          >
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-bold">Welcome Back</h2>
              <button
                onClick={() => setShowSignInForm(false)}
                className="text-gray-400 hover:text-gray-600 transition-colors text-2xl"
                disabled={isLoading}
              >
                ×
              </button>
            </div>

            {/* ✅ Error display */}
            {authError && (
              <div className="mb-4 p-3 bg-red-100 border border-red-300 text-red-700 rounded-lg text-sm">
                {authError}
              </div>
            )}

            <form onSubmit={handleSignIn} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email Address
                </label>
                <input
                  type="email"
                  name="email"
                  required
                  disabled={isLoading}
                  placeholder="Enter your email"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all disabled:opacity-50"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Password
                </label>
                <input
                  type="password"
                  name="password"
                  required
                  disabled={isLoading}
                  placeholder="Enter your password"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all disabled:opacity-50"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Purpose of Travel
                </label>
                <select
                  name="purpose"
                  required
                  disabled={isLoading}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all disabled:opacity-50"
                >
                  <option value="">Select purpose</option>
                  <option value="Leisure">Leisure</option>
                  <option value="Business">Business</option>
                  <option value="Family">Family</option>
                  <option value="Honeymoon">Honeymoon</option>
                  <option value="Adventure">Adventure</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              <div className="flex space-x-3 pt-2">
                <motion.button
                  whileHover={{ scale: isLoading ? 1 : 1.02 }}
                  whileTap={{ scale: isLoading ? 1 : 0.98 }}
                  type="submit"
                  disabled={isLoading}
                  className="flex-1 bg-primary-600 text-white py-2 px-4 rounded-lg hover:bg-primary-700 transition-colors duration-200 font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                >
                  {isLoading ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Signing In...
                    </>
                  ) : (
                    'Sign In'
                  )}
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  type="button"
                  onClick={() => setShowSignInForm(false)}
                  disabled={isLoading}
                  className="flex-1 bg-gray-200 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-300 transition-colors duration-200 disabled:opacity-50"
                >
                  Cancel
                </motion.button>
              </div>
            </form>
          </motion.div>
        </div>
      )}

      {/* ✅ ENHANCED Sign Up Modal with Error Handling */}
      {showSignUpForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.8, opacity: 0 }}
            className="bg-white rounded-lg p-6 w-full max-w-md max-h-[90vh] overflow-y-auto"
          >
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-bold">Create Account</h2>
              <button
                onClick={() => setShowSignUpForm(false)}
                className="text-gray-400 hover:text-gray-600 transition-colors text-2xl"
                disabled={isLoading}
              >
                ×
              </button>
            </div>

            {/* ✅ Error display */}
            {authError && (
              <div className="mb-4 p-3 bg-red-100 border border-red-300 text-red-700 rounded-lg text-sm">
                {authError}
              </div>
            )}

            <form onSubmit={handleSignUp} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Full Name
                </label>
                <input
                  type="text"
                  name="name"
                  required
                  disabled={isLoading}
                  placeholder="Enter your full name"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all disabled:opacity-50"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email Address
                </label>
                <input
                  type="email"
                  name="email"
                  required
                  disabled={isLoading}
                  placeholder="Enter your email"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all disabled:opacity-50"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Password
                </label>
                <input
                  type="password"
                  name="password"
                  required
                  disabled={isLoading}
                  placeholder="Create a password"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all disabled:opacity-50"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Age
                </label>
                <input
                  type="number"
                  name="age"
                  min="13"
                  max="120"
                  required
                  disabled={isLoading}
                  placeholder="Enter your age"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all disabled:opacity-50"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Purpose of Travel
                </label>
                <select
                  name="purpose"
                  required
                  disabled={isLoading}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all disabled:opacity-50"
                >
                  <option value="">Select purpose</option>
                  <option value="Leisure">Leisure</option>
                  <option value="Business">Business</option>
                  <option value="Family">Family</option>
                  <option value="Honeymoon">Honeymoon</option>
                  <option value="Adventure">Adventure</option>
                  <option value="Pilgrimage">Pilgrimage</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              <div className="flex space-x-3 pt-2">
                <motion.button
                  whileHover={{ scale: isLoading ? 1 : 1.02 }}
                  whileTap={{ scale: isLoading ? 1 : 0.98 }}
                  type="submit"
                  disabled={isLoading}
                  className="flex-1 bg-primary-600 text-white py-2 px-4 rounded-lg hover:bg-primary-700 transition-colors duration-200 font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                >
                  {isLoading ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Creating Account...
                    </>
                  ) : (
                    'Sign Up'
                  )}
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  type="button"
                  onClick={() => setShowSignUpForm(false)}
                  disabled={isLoading}
                  className="flex-1 bg-gray-200 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-300 transition-colors duration-200 disabled:opacity-50"
                >
                  Cancel
                </motion.button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </motion.nav>
  );
};

export default Navbar;
