// App.js - COMPLETE FIXED VERSION with BookingsProvider and Complete Booking Flow
import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import Navbar from './components/Navbar';
import HeroSection from './components/HeroSection';
import FilterSection from './components/FilterSection';
import HotelRecommendations from './components/HotelRecommendations';
import TrendingCities from './components/TrendingCities';
import HotelCategoriesModal from './components/HotelCategoriesModal';
import BookingsSection from './components/BookingsSection';
import Footer from './components/Footer';
import Chatbot from './components/Chatbot';
import Cart from './components/Cart';
import { CartProvider } from './context/CartContext';
import { BookingsProvider } from './context/BookingsContext';
// ✅ ADD MISSING IMPORTS
import { useCart } from './context/CartContext';
import { useBookings } from './context/BookingsContext';
import ApiService from './services/api';

// Safe usePersistedState hook with loop prevention
const usePersistedState = (key, initialValue) => {
  const isInitialized = useRef(false);

  const [state, setState] = useState(() => {
    try {
      const item = localStorage.getItem(key);
      const parsed = item ? JSON.parse(item) : initialValue;
      isInitialized.current = true;
      return parsed;
    } catch (error) {
      console.error(`Error reading localStorage key "${key}":`, error);
      isInitialized.current = true;
      return initialValue;
    }
  });

  // Only update localStorage after initial load
  useEffect(() => {
    if (!isInitialized.current) return;

    try {
      const currentStored = localStorage.getItem(key);
      const newValue = JSON.stringify(state);

      // Only update if value actually changed
      if (currentStored !== newValue) {
        localStorage.setItem(key, newValue);
      }
    } catch (error) {
      console.error(`Error setting localStorage key "${key}":`, error);
    }
  }, [key, state]);

  return [state, setState];
};

// Simple session state (resets on refresh)
const useSessionState = (initialValue) => {
  const [state, setState] = useState(initialValue);
  return [state, setState];
};

// ✅ CREATE INNER COMPONENT TO USE HOOKS
function AppContent() {
  console.log('App rendering...');

  // ✅ USE HOOKS AT TOP LEVEL OF COMPONENT
  const cart = useCart();
  const bookings = useBookings();

  // UI State - Simple, no persistence
  const [isHotelCategoriesOpen, setIsHotelCategoriesOpen] = useState(false);
  const [selectedCity, setSelectedCity] = useState(null);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);

  // Search State - Session only (resets on refresh)
  const [searchData, setSearchData] = useSessionState(null);
  const [showResults, setShowResults] = useSessionState(false);
  const [lastSearch, setLastSearch] = useSessionState(null);
  const [searchLocation, setSearchLocation] = useSessionState('');

  // Filters - Session only with proper initialization
  const [activeFilters, setActiveFilters] = useSessionState({
    valueForMoney: 0,
    starRating: 0,
    hotelRating: 0,
    cleanliness: 0,
    service: 0,
    location: '',
    amenities: [],
    sortBy: 'price-low'
  });

  // User State - Persistent (survives refresh)
  const [isSignedIn, setIsSignedIn] = usePersistedState('isSignedIn', false);
  const [userProfile, setUserProfile] = usePersistedState('userProfile', null);
  const [travelPurpose, setTravelPurpose] = usePersistedState('travelPurpose', '');

  // User Data - Persistent
  const [travelHistory, setTravelHistory] = usePersistedState('travelHistory', [
    { id: 1, city: 'Goa', hotel: 'Goa Beach Resort', date: '2023-12-05' },
    { id: 2, city: 'Jaipur', hotel: 'Heritage Palace Hotel', date: '2023-11-20' }
  ]);

  const [orders, setOrders] = usePersistedState('orders', [
    { id: 'ORD-1024', item: 'Taj Mahal Palace - 2 nights', date: '2024-01-02', status: 'Completed' },
    { id: 'ORD-1025', item: 'The Oberoi - 3 nights', date: '2024-02-10', status: 'Confirmed' }
  ]);

  // Safe useEffect - runs only ONCE on mount
  useEffect(() => {
    console.log('App initialized');

    // Log user status without triggering re-renders
    if (isSignedIn && userProfile) {
      console.log('User restored:', userProfile.email);
    }

    // No state updates here to prevent loops
    return () => {
      console.log('App cleanup');
    };
  }, []); // Empty dependency array - runs once only

  // Handle city clicks for trending cities
  const handleCityClick = (city) => {
    console.log('City clicked:', city?.name);
    setSelectedCity(city);
    setIsHotelCategoriesOpen(true);
  };

  const closeHotelCategories = () => {
    setIsHotelCategoriesOpen(false);
    setSelectedCity(null);
  };

  // Handle filter changes from FilterSection
  const handleFiltersChange = (filters) => {
    console.log('Filters changed in App:', filters);
    setActiveFilters(filters);
  };

  // MAIN SEARCH HANDLER - Fixed Location Sync
  const handleSearch = (searchFormData) => {
    console.log('Search initiated:', searchFormData);

    // Update all related states
    setSearchData(searchFormData);
    setLastSearch(searchFormData);
    setSearchLocation(searchFormData.destination || '');
    setShowResults(true);

    // Update filters with search location immediately
    setActiveFilters(prevFilters => {
      const newFilters = {
        ...prevFilters,
        location: searchFormData.destination || ''
      };
      console.log('Setting filters with search location:', newFilters);
      return newFilters;
    });

    // Smooth scroll to results
    setTimeout(() => {
      const resultsSection = document.getElementById('hotel-results');
      if (resultsSection) {
        resultsSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }, 100);
  };

  // Navbar search handler
  const handleNavbarSearch = (navSearchData) => {
    console.log('Navbar search:', navSearchData);

    const searchFormData = {
      destination: navSearchData.destination || '',
      checkIn: new Date().toISOString().split('T')[0],
      checkOut: new Date(Date.now() + 86400000).toISOString().split('T')[0],
      rooms: 1,
      guests: 2
    };

    handleSearch(searchFormData);
  };

  // ✅ FIXED: Authentication handlers with hooks inside component
  const handleSignIn = async (signInData) => {
    console.log('🔐 User signing in:', signInData.email);

    try {
      // 1. Set user state first
      setIsSignedIn(true);
      setUserProfile(signInData);
      setTravelPurpose(signInData.purpose || '');

      // 2. Add to travel history
      const newHistoryItem = {
        id: Date.now(),
        city: 'Recent Login',
        hotel: 'Signed in to HotelHub',
        date: new Date().toISOString().split('T')[0]
      };
      setTravelHistory(prev => [newHistoryItem, ...prev.slice(0, 9)]);

      // 3. ✅ FIXED: Use cart context properly
      if (cart && cart.reloadCart && typeof cart.reloadCart === 'function') {
        setTimeout(() => {
          cart.reloadCart();
        }, 500); // Small delay to ensure auth tokens are set
      }

      console.log('✅ Login complete, cart will be reloaded');

    } catch (error) {
      console.error('❌ Login completion error:', error);
    }
  };

  const handleSignUp = (signUpData) => {
    console.log('User signing up:', signUpData.email);

    setIsSignedIn(true);
    setUserProfile(signUpData);

    // Welcome order
    const welcomeOrder = {
      id: `ORD-${Date.now()}`,
      item: 'Welcome Bonus - Hotel Search Credits',
      date: new Date().toISOString().split('T')[0],
      status: 'Active'
    };

    setOrders(prev => [welcomeOrder, ...prev]);
  };

  // ✅ FIXED: Enhanced sign out with context reset
  const handleSignOut = async () => {
    console.log('🚪 User signing out');

    try {
      // 1. ✅ FIXED: Use context methods properly
      if (cart && cart.resetCartContext && typeof cart.resetCartContext === 'function') {
        cart.resetCartContext();
      }
      if (bookings && bookings.resetBookingsContext && typeof bookings.resetBookingsContext === 'function') {
        bookings.resetBookingsContext();
      }

      // 2. Call API logout first
      await ApiService.logout();

      // 3. Clear user state
      setIsSignedIn(false);
      setUserProfile(null);
      setTravelPurpose('');
      setIsProfileOpen(false);

      // 4. Clear search data
      setSearchData(null);
      setShowResults(false);
      setSearchLocation('');

      // 5. Reset filters
      setActiveFilters({
        valueForMoney: 0,
        starRating: 0,
        hotelRating: 0,
        cleanliness: 0,
        service: 0,
        location: '',
        amenities: [],
        sortBy: 'price-low'
      });

      // 6. Clear storage LAST
      localStorage.clear();
      sessionStorage.clear();

      console.log('✅ Complete logout successful');

    } catch (error) {
      console.error('❌ Logout error:', error);

      // Even if API fails, clear everything locally
      localStorage.clear();
      sessionStorage.clear();

      // Force page reload as fallback
      window.location.href = '/';
    }
  };

  // UI handlers
  const openProfile = () => setIsProfileOpen(true);
  const closeProfile = () => setIsProfileOpen(false);

  // Navigate to bookings section
  const goToBookings = () => {
    try {
      const bookingsEl = document.getElementById('bookings-section');
      if (bookingsEl) {
        bookingsEl.scrollIntoView({ behavior: 'smooth' });
      } else {
        // Fallback - show bookings and scroll
        setTimeout(() => {
          const fallbackBookings = document.getElementById('bookings-section');
          if (fallbackBookings) {
            fallbackBookings.scrollIntoView({ behavior: 'smooth' });
          }
        }, 100);
      }
    } catch (error) {
      console.warn('Could not navigate to bookings:', error);
    }
  };

  const handleCartOpen = () => setIsCartOpen(true);
  const handleCartClose = () => setIsCartOpen(false);

  // Handle successful booking completion
  const handleBookingComplete = () => {
    console.log('Booking completed successfully!');

    // Close cart
    setIsCartOpen(false);

    // Navigate to bookings section
    setTimeout(() => {
      goToBookings();
    }, 500); // Small delay for better UX
  };

  // Clear all data function
  const clearAllData = () => {
    if (window.confirm('Clear all stored data? This will log you out and reset all preferences.')) {
      try {
        localStorage.clear();
        sessionStorage.clear();
        console.log('All data cleared');
        window.location.reload();
      } catch (error) {
        console.error('Error clearing data:', error);
      }
    }
  };

  // Clear only search data - Fixed
  const clearSearchData = () => {
    setSearchData(null);
    setShowResults(false);
    setLastSearch(null);
    setSearchLocation('');
    setActiveFilters({
      valueForMoney: 0,
      starRating: 0,
      hotelRating: 0,
      cleanliness: 0,
      service: 0,
      location: '',
      amenities: [],
      sortBy: 'price-low'
    });
    console.log('Search data cleared');
  };

  return (
    <div className="App">
      {/* Navbar with stable props */}
      <Navbar
        onCartOpen={handleCartOpen}
        onSearch={handleNavbarSearch}
        onSignIn={handleSignIn}
        onOpenProfile={openProfile}
        onGoToBookings={goToBookings}
        onSignUp={handleSignUp}
        isSignedIn={isSignedIn}
        userData={userProfile}
        onSignOut={handleSignOut}
      />

      {/* Hero Section */}
      <HeroSection onSearch={handleSearch} />

      {/* Search Results Section */}
      {showResults && searchData && (
        <section id="hotel-results" className="py-12 bg-gray-50">
          <div className="max-w-7xl mx-auto px-4">
            {/* Search Results Header */}
            <div className="text-center mb-8">
              <motion.h2
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-3xl font-bold text-gray-900 mb-4"
              >
                Hotels in {searchData.destination}
              </motion.h2>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="text-gray-600 space-y-1"
              >
                <p>📅 {searchData.checkIn} to {searchData.checkOut}</p>
                <p>
                  🏨 {searchData.rooms} room{searchData.rooms > 1 ? 's' : ''} •
                  👥 {searchData.guests} guest{searchData.guests > 1 ? 's' : ''}
                </p>
              </motion.div>
            </div>

            {/* Filter Section with correct props */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <FilterSection
                onFiltersChange={handleFiltersChange}
                searchLocation={searchLocation}
              />
            </motion.div>

            {/* Hotel Results with merged filters */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              <HotelRecommendations
                filters={{
                  ...activeFilters,
                  location: searchLocation || activeFilters.location
                }}
                searchData={searchData}
              />
            </motion.div>
          </div>
        </section>
      )}

      {/* Default Landing Content */}
      {!showResults && (
        <section className="py-12 bg-gray-50">
          <div className="max-w-7xl mx-auto px-4">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">
                Discover Amazing Hotels
              </h2>
              <p className="text-gray-600 mb-6">
                Use the search form above to find hotels in your desired destination
              </p>

              {/* Welcome message for signed-in users */}
              {isSignedIn && userProfile && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="max-w-md mx-auto mb-8 p-4 bg-primary-50 border border-primary-200 rounded-lg"
                >
                  <p className="text-primary-700">
                    👋 Welcome back, <strong>{userProfile.name || userProfile.email}</strong>!
                  </p>
                  <p className="text-sm text-primary-600 mt-1">
                    Ready to discover your next perfect stay?
                  </p>
                </motion.div>
              )}
            </div>

            <TrendingCities onCityClick={handleCityClick} />
          </div>
        </section>
      )}

      {/* Bookings Section - Always rendered */}
      <BookingsSection />

      {/* Other Destinations Section */}
      {showResults && (
        <section className="py-12">
          <div className="max-w-7xl mx-auto px-4">
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                Other Popular Destinations
              </h2>
            </div>
            <TrendingCities onCityClick={handleCityClick} />
          </div>
        </section>
      )}

      {/* Footer Components */}
      <Footer />
      <Chatbot />

      {/* Modals */}
      <HotelCategoriesModal
        isOpen={isHotelCategoriesOpen}
        onClose={closeHotelCategories}
        city={selectedCity}
      />

      {/* Enhanced Cart with booking completion */}
      <Cart
        isOpen={isCartOpen}
        onClose={handleCartClose}
        onBookingComplete={handleBookingComplete}
      />

      {/* User Profile Modal */}
      {isProfileOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            className="bg-white rounded-2xl p-6 w-full max-w-md max-h-[80vh] overflow-y-auto"
          >
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-bold">My Profile</h2>
              <button
                onClick={closeProfile}
                className="text-gray-500 hover:text-gray-700 text-2xl font-bold transition-colors"
              >
                ×
              </button>
            </div>

            <div className="space-y-4">
              {/* Account Status */}
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="flex items-center justify-between mb-3">
                  <div className="text-sm font-semibold text-gray-700">Account Status</div>
                  <div className={`px-3 py-1 text-xs rounded-full font-medium ${
                    isSignedIn 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-red-100 text-red-800'
                  }`}>
                    {isSignedIn ? '✓ Signed In' : '✗ Not Signed In'}
                  </div>
                </div>

                {userProfile && (
                  <div className="space-y-3">
                    <div>
                      <div className="text-sm text-gray-500">Email</div>
                      <div className="font-medium text-gray-900">{userProfile.email}</div>
                    </div>
                    {userProfile.name && (
                      <div>
                        <div className="text-sm text-gray-500">Name</div>
                        <div className="font-medium text-gray-900">{userProfile.name}</div>
                      </div>
                    )}
                    {userProfile.age && (
                      <div>
                        <div className="text-sm text-gray-500">Age</div>
                        <div className="font-medium text-gray-900">{userProfile.age}</div>
                      </div>
                    )}
                    <div>
                      <div className="text-sm text-gray-500">Purpose of Travel</div>
                      <div className="font-medium text-gray-900">
                        {userProfile.purpose || travelPurpose || 'Not specified'}
                      </div>
                    </div>
                    {/* Show current search location */}
                    {searchLocation && (
                      <div>
                        <div className="text-sm text-gray-500">Current Search</div>
                        <div className="font-medium text-primary-600">{searchLocation}</div>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Travel History */}
              {travelHistory.length > 0 && (
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <div className="text-sm font-semibold text-gray-700">Travel History</div>
                    <span className="text-xs text-gray-500">{travelHistory.length} entries</span>
                  </div>
                  <div className="space-y-2 max-h-32 overflow-y-auto">
                    {travelHistory.map(h => (
                      <div key={h.id} className="bg-blue-50 rounded-lg p-3">
                        <div className="flex justify-between items-start">
                          <div>
                            <div className="font-medium text-blue-900">{h.city}</div>
                            <div className="text-sm text-blue-700">{h.hotel}</div>
                          </div>
                          <div className="text-xs text-blue-600">{h.date}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Orders */}
              {orders.length > 0 && (
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <div className="text-sm font-semibold text-gray-700">Recent Orders</div>
                    <span className="text-xs text-gray-500">{orders.length} orders</span>
                  </div>
                  <div className="space-y-2 max-h-32 overflow-y-auto">
                    {orders.map(o => (
                      <div key={o.id} className="bg-green-50 rounded-lg p-3">
                        <div className="flex justify-between items-start">
                          <div>
                            <div className="font-medium text-green-900">{o.id}</div>
                            <div className="text-sm text-green-700">{o.item}</div>
                            <div className="text-xs text-green-600">{o.date}</div>
                          </div>
                          <span className={`text-xs px-2 py-1 rounded-full ${
                            o.status === 'Completed' 
                              ? 'bg-green-200 text-green-800' 
                              : o.status === 'Active'
                              ? 'bg-blue-200 text-blue-800'
                              : 'bg-yellow-200 text-yellow-800'
                          }`}>
                            {o.status}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Data Management */}
              <div className="border-t pt-4">
                <div className="text-sm font-semibold text-gray-700 mb-3">Data Management</div>
                <div className="space-y-2">
                  {searchData && (
                    <button
                      onClick={clearSearchData}
                      className="w-full px-3 py-2 text-sm text-blue-600 border border-blue-300 rounded-lg hover:bg-blue-50 transition-colors"
                    >
                      Clear Search Data
                    </button>
                  )}
                  <button
                    onClick={goToBookings}
                    className="w-full px-3 py-2 text-sm text-primary-600 border border-primary-300 rounded-lg hover:bg-primary-50 transition-colors"
                  >
                    View My Bookings
                  </button>
                  <button
                    onClick={clearAllData}
                    className="w-full px-3 py-2 text-sm text-red-600 border border-red-300 rounded-lg hover:bg-red-50 transition-colors"
                  >
                    Clear All Data & Reset App
                  </button>
                </div>
              </div>
            </div>

            <div className="mt-6 flex justify-between">
              {isSignedIn && (
                <button
                  onClick={handleSignOut}
                  className="px-4 py-2 text-red-600 border border-red-300 rounded-lg hover:bg-red-50 transition-colors"
                >
                  Sign Out
                </button>
              )}
              <button
                onClick={closeProfile}
                className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors ml-auto"
              >
                Close
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}

// ✅ MAIN APP COMPONENT WITH PROVIDERS
function App() {
  return (
    <CartProvider>
      <BookingsProvider>
        <AppContent />
      </BookingsProvider>
    </CartProvider>
  );
}

export default App;
