import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaChevronLeft, FaChevronRight, FaStar, FaMapMarkerAlt, FaRupeeSign, FaDollarSign, FaPoundSign, FaShoppingCart, FaTimes } from 'react-icons/fa';
import { useCart } from '../context/CartContext';
import ApiService from '../services/api';

const RecommendationsSlider = ({ filters, search, purpose }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [selectedHotel, setSelectedHotel] = useState(null);
  const [bookingForm, setBookingForm] = useState({
    checkIn: '',
    checkOut: '',
    rooms: 1,
    guests: 2
  });
  const [hotels, setHotels] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const { addToCart } = useCart();

  // Static fallback hotels (keep as backup)
  const staticHotels = [
    {
      id: 1,
      name: "Taj Mahal Palace",
      location: "Mumbai, India",
      rating: 4.8,
      price: 25000,
      currency: "INR",
      image: "https://images.unsplash.com/photo-1566073771259-6a8506099945?w=400&h=300&fit=crop",
      amenities: ["Free WiFi", "Spa", "Pool", "Restaurant"]
    },
    {
      id: 2,
      name: "The Oberoi",
      location: "Delhi, India",
      rating: 4.7,
      price: 22000,
      currency: "INR",
      image: "https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=400&h=300&fit=crop",
      amenities: ["Free WiFi", "Gym", "Spa", "Bar"]
    },
    {
      id: 3,
      name: "Goa Beach Resort",
      location: "Goa, India",
      rating: 4.6,
      price: 18000,
      currency: "INR",
      image: "https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=400&h=300&fit=crop",
      amenities: ["Beach Access", "Pool", "Restaurant", "Water Sports"]
    },
    {
      id: 4,
      name: "Heritage Palace Hotel",
      location: "Jaipur, India",
      rating: 4.5,
      price: 15000,
      currency: "INR",
      image: "https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=400&h=300&fit=crop",
      amenities: ["Historic", "Garden", "Restaurant", "Cultural Tours"]
    },
    {
      id: 5,
      name: "Ritz-Carlton",
      location: "New York, USA",
      rating: 4.9,
      price: 450,
      currency: "USD",
      image: "https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=400&h=300&fit=crop",
      amenities: ["Luxury", "Central Park View", "Spa", "Fine Dining"]
    },
    {
      id: 6,
      name: "The Savoy",
      location: "London, UK",
      rating: 4.8,
      price: 380,
      currency: "GBP",
      image: "https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?w=400&h=300&fit=crop",
      amenities: ["Historic", "River View", "Afternoon Tea", "Concierge"]
    }
  ];

  // Generate random prices based on location
  const generatePrice = (location) => {
    if (location.includes('India')) {
      return Math.floor(Math.random() * 25000) + 10000; // 10k-35k INR
    } else if (location.includes('USA')) {
      return Math.floor(Math.random() * 400) + 200; // 200-600 USD
    } else if (location.includes('UK')) {
      return Math.floor(Math.random() * 300) + 150; // 150-450 GBP
    }
    return Math.floor(Math.random() * 300) + 100; // Default
  };

  // Get currency based on location
  const getCurrencyFromLocation = (location) => {
    if (location.includes('India')) return 'INR';
    if (location.includes('USA')) return 'USD';
    if (location.includes('UK')) return 'GBP';
    return 'USD';
  };

  // Generate random image
  const getRandomImage = () => {
    const imageIds = [
      'photo-1566073771259-6a8506099945',
      'photo-1571896349842-33c89424de2d',
      'photo-1544551763-46a013bb70d5',
      'photo-1582719478250-c89cae4dc85b',
      'photo-1520250497591-112f2f40a3f4',
      'photo-1551882547-ff40c63fe5fa',
      'photo-1571003123894-1f0594d2b5d9',
      'photo-1496442226666-8d4d0e62e6e9'
    ];
    const randomId = imageIds[Math.floor(Math.random() * imageIds.length)];
    return `https://images.unsplash.com/${randomId}?w=400&h=300&fit=crop`;
  };

  // Fetch recommendations from backend
  useEffect(() => {
    const fetchRecommendations = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Convert filters and search to backend format
        const preferences = {
          country: extractCountryFromSearch(filters?.location || search?.destination || ''),
          hotel_star: filters?.starRating?.[0] || null,
          amenities: filters?.amenities?.join(', ') || '',
          services: 4.0, // Default value
          cleanliness: 4.5, // Default value
          value_for_money: 4.0, // Default value
        };

        console.log('Fetching recommendations with preferences:', preferences);
        const response = await ApiService.getRecommendations(preferences);
        
        if (response && response.recommendations && response.recommendations.length > 0) {
          // Transform backend data to frontend format
          const transformedHotels = response.recommendations.map((hotel, index) => ({
            id: Date.now() + index, // Generate unique ID
            name: hotel.name || `Hotel ${index + 1}`,
            location: hotel.location || 'Location not specified',
            rating: Number(hotel.rating) || 4.0,
            price: generatePrice(hotel.location || ''),
            currency: getCurrencyFromLocation(hotel.location || ''),
            image: getRandomImage(),
            amenities: hotel.amenities ? hotel.amenities.split(', ').slice(0, 4) : ['WiFi', 'Restaurant'],
            hybrid_score: hotel.hybrid_score || 0
          }));
          
          console.log('Transformed hotels:', transformedHotels);
          setHotels(transformedHotels);
        } else {
          // Fallback to static data if no recommendations
          console.log('No recommendations from backend, using static data');
          setHotels(staticHotels);
        }
      } catch (error) {
        console.error('Error fetching recommendations:', error);
        setError('Failed to fetch recommendations');
        // Fallback to static data on error
        setHotels(staticHotels);
      } finally {
        setLoading(false);
      }
    };

    fetchRecommendations();
  }, [filters, search, purpose]);

  // Extract country from search string
  const extractCountryFromSearch = (searchStr) => {
    if (!searchStr) return null;
    const str = searchStr.toLowerCase();
    if (str.includes('india') || str.includes('mumbai') || str.includes('delhi') || str.includes('goa') || str.includes('jaipur') || str.includes('kolkata')) {
      return 'India';
    }
    if (str.includes('usa') || str.includes('america') || str.includes('new york') || str.includes('california')) {
      return 'USA';
    }
    if (str.includes('uk') || str.includes('britain') || str.includes('london') || str.includes('england')) {
      return 'UK';
    }
    return null;
  };

  const getCurrencySymbol = (currency) => {
    switch (currency) {
      case 'INR':
        return <FaRupeeSign className="inline" />;
      case 'USD':
        return <FaDollarSign className="inline" />;
      case 'GBP':
        return <FaPoundSign className="inline" />;
      default:
        return currency;
    }
  };

  const nextSlide = () => {
    setCurrentIndex((prevIndex) => 
      prevIndex === hotels.length - 1 ? 0 : prevIndex + 1
    );
  };

  const prevSlide = () => {
    setCurrentIndex((prevIndex) => 
      prevIndex === 0 ? hotels.length - 1 : prevIndex - 1
    );
  };

  const goToSlide = (index) => {
    setCurrentIndex(index);
  };

  const handleAddToCart = (hotel) => {
    addToCart({
      id: hotel.id,
      name: hotel.name,
      location: hotel.location,
      price: hotel.price,
      currency: hotel.currency,
      image: hotel.image
    });
  };

  const handleBookNow = (hotel) => {
    setSelectedHotel(hotel);
    setShowBookingModal(true);
  };

  const handleBookingSubmit = (e) => {
    e.preventDefault();
    
    // Validate form data
    if (!bookingForm.checkIn || !bookingForm.checkOut) {
      alert('Please fill in all required fields');
      return;
    }

    // Check if check-out is after check-in
    if (new Date(bookingForm.checkOut) <= new Date(bookingForm.checkIn)) {
      alert('Check-out date must be after check-in date');
      return;
    }

    // Simulate booking process
    console.log('Booking submitted:', { hotel: selectedHotel, ...bookingForm });
    
    // Show success message and close modal
    alert('Booking submitted successfully! We\'ll send you a confirmation shortly.');
    setShowBookingModal(false);
    setSelectedHotel(null);
    setBookingForm({ checkIn: '', checkOut: '', rooms: 1, guests: 2 });
  };

  const getMinCheckOutDate = () => {
    if (!bookingForm.checkIn) return '';
    const checkInDate = new Date(bookingForm.checkIn);
    const nextDay = new Date(checkInDate);
    nextDay.setDate(nextDay.getDate() + 1);
    return nextDay.toISOString().split('T')[0];
  };

  // Apply basic filters to the hotels
  const normalizedLocation = (filters?.location || '').toLowerCase();
  const filtered = hotels.filter((h) => {
    const inPrice = h.currency === 'INR'
      ? h.price >= (filters?.priceRange?.[0] ?? 0) && h.price <= (filters?.priceRange?.[1] ?? Infinity)
      : true;
    const inLocation = normalizedLocation
      ? h.location.toLowerCase().includes(normalizedLocation) || h.name.toLowerCase().includes(normalizedLocation)
      : true;
    const inStars = (filters?.starRating?.length ?? 0) > 0
      ? filters.starRating.some((r) => Math.floor(h.rating) >= r)
      : true;
    const inAmenities = (filters?.amenities?.length ?? 0) > 0
      ? filters.amenities.every((a) => h.amenities.includes(a))
      : true;
    return inPrice && inLocation && inStars && inAmenities;
  });

  // Purpose weighting
  const purposeToAmenities = {
    Leisure: ["Pool", "Spa", "Beach Access", "Restaurant", "Water Sports"],
    Business: ["Gym", "Free WiFi", "Concierge"],
    Family: ["Pool", "Restaurant", "Garden"],
    Honeymoon: ["Luxury", "Spa", "Beach Access"],
    Adventure: ["Water Sports", "Beach Access", "Gym"],
    Pilgrimage: ["Historic", "Cultural Tours"],
    Other: []
  };

  const amenityBoost = (hotel) => {
    if (!purpose) return 0;
    const prefs = purposeToAmenities[purpose] || [];
    return prefs.reduce((score, pref) => score + (hotel.amenities.includes(pref) ? 1 : 0), 0);
  };

  // Sort hotels
  const sorted = [...filtered].sort((a, b) => {
    const sortBy = filters?.sortBy || 'price-low';
    if (sortBy === 'price-low') return ((a.price || 0) - (b.price || 0)) || (amenityBoost(b) - amenityBoost(a));
    if (sortBy === 'price-high') return ((b.price || 0) - (a.price || 0)) || (amenityBoost(b) - amenityBoost(a));
    if (sortBy === 'rating') return ((b.rating || 0) - (a.rating || 0)) || (amenityBoost(b) - amenityBoost(a));
    if (sortBy === 'name') return a.name.localeCompare(b.name) || (amenityBoost(b) - amenityBoost(a));
    return 0;
  });

  const visibleHotels = sorted.length > 0 ? sorted : hotels;
  const safeIndex = Math.min(currentIndex, Math.max(0, visibleHotels.length - 1));

  // Loading state
  if (loading) {
    return (
      <section id="results" className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="loading-spinner mx-auto mb-4"></div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Finding Perfect Hotels</h2>
            <p className="text-gray-600">We're searching for the best accommodations for you...</p>
          </div>
        </div>
      </section>
    );
  }

  // Error state
  if (error && hotels.length === 0) {
    return (
      <section id="results" className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Unable to Load Hotels</h2>
            <p className="text-gray-600 mb-4">{error}</p>
            <button 
              onClick={() => window.location.reload()}
              className="bg-primary-600 text-white px-6 py-2 rounded-lg hover:bg-primary-700 transition-colors"
            >
              Try Again
            </button>
          </div>
        </div>
      </section>
    );
  }

  // No hotels found
  if (visibleHotels.length === 0) {
    return (
      <section id="results" className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">No Hotels Found</h2>
            <p className="text-gray-600">Try adjusting your filters or search criteria.</p>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section id="results" className="py-16 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center mb-12"
        >
          <h2 className="text-4xl font-bold text-gray-900 mb-4">Recommended Hotels</h2>
          <p className="text-xl text-gray-600">
            {hotels.length > staticHotels.length ? 
              'AI-powered recommendations based on your preferences' : 
              'Handpicked accommodations for your perfect stay'
            }
          </p>
          {search?.destination && (
            <p className="text-lg text-primary-600 mt-2">
              Showing results for: <strong>{search.destination}</strong>
            </p>
          )}
        </motion.div>

        <div className="relative">
          {/* Navigation Arrows */}
          {visibleHotels.length > 1 && (
            <>
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={prevSlide}
                className="absolute left-4 top-1/2 transform -translate-y-1/2 z-10 bg-white/90 backdrop-blur-sm text-gray-800 p-3 rounded-full shadow-lg hover:bg-white transition-all duration-200"
              >
                <FaChevronLeft />
              </motion.button>

              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={nextSlide}
                className="absolute right-4 top-1/2 transform -translate-y-1/2 z-10 bg-white/90 backdrop-blur-sm text-gray-800 p-3 rounded-full shadow-lg hover:bg-white transition-all duration-200"
              >
                <FaChevronRight />
              </motion.button>
            </>
          )}

          {/* Hotel Cards */}
          <div className="overflow-hidden">
            <AnimatePresence mode="wait">
              <motion.div
                key={currentIndex}
                initial={{ opacity: 0, x: 100 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -100 }}
                transition={{ duration: 0.5 }}
                className="flex justify-center"
              >
                <div className="bg-white rounded-2xl shadow-xl overflow-hidden max-w-4xl w-full">
                  <div className="md:flex">
                    <div className="md:w-1/2">
                      <img
                        src={visibleHotels[safeIndex]?.image}
                        alt={visibleHotels[safeIndex]?.name}
                        className="w-full h-64 md:h-full object-cover"
                        onError={(e) => {
                          e.target.src = 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=400&h=300&fit=crop';
                        }}
                      />
                    </div>
                    <div className="md:w-1/2 p-8">
                      <div className="flex items-center mb-4">
                        <div className="flex items-center text-yellow-400 mr-4">
                          <FaStar />
                          <span className="ml-1 text-gray-700 font-semibold">{visibleHotels[safeIndex]?.rating}</span>
                        </div>
                        <div className="flex items-center text-gray-600">
                          <FaMapMarkerAlt className="mr-2" />
                          <span>{visibleHotels[safeIndex]?.location}</span>
                        </div>
                      </div>

                      <h3 className="text-3xl font-bold text-gray-900 mb-4">{visibleHotels[safeIndex]?.name}</h3>
                      
                      <div className="mb-6">
                        <div className="text-4xl font-bold text-primary-600 mb-2">
                          {getCurrencySymbol(visibleHotels[safeIndex]?.currency)}{visibleHotels[safeIndex]?.price?.toLocaleString()}
                          <span className="text-lg text-gray-500 font-normal"> / night</span>
                        </div>
                        {visibleHotels[safeIndex]?.hybrid_score && (
                          <div className="text-sm text-gray-500">
                            Match Score: {(visibleHotels[safeIndex].hybrid_score * 100).toFixed(0)}%
                          </div>
                        )}
                      </div>

                      <div className="mb-6">
                        <h4 className="text-lg font-semibold text-gray-900 mb-3">Amenities</h4>
                        <div className="flex flex-wrap gap-2">
                          {visibleHotels[safeIndex]?.amenities?.map((amenity, index) => (
                            <span
                              key={index}
                              className="bg-gray-100 text-gray-700 px-3 py-1 rounded-full text-sm"
                            >
                              {amenity}
                            </span>
                          ))}
                        </div>
                      </div>

                      <div className="flex space-x-3">
                        <motion.button
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          onClick={() => handleAddToCart(visibleHotels[safeIndex])}
                          className="flex-1 bg-green-600 text-white py-3 px-6 rounded-lg hover:bg-green-700 transition-colors duration-200 font-medium flex items-center justify-center"
                        >
                          <FaShoppingCart className="mr-2" />
                          Add to Cart
                        </motion.button>
                        <motion.button
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          onClick={() => handleBookNow(visibleHotels[safeIndex])}
                          className="flex-1 bg-primary-600 text-white py-3 px-6 rounded-lg hover:bg-primary-700 transition-colors duration-200 font-medium"
                        >
                          Book Now
                        </motion.button>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Dots Indicator */}
          {visibleHotels.length > 1 && (
            <div className="flex justify-center mt-8 space-x-2">
              {visibleHotels.map((_, index) => (
                <motion.button
                  key={index}
                  whileHover={{ scale: 1.2 }}
                  whileTap={{ scale: 0.8 }}
                  onClick={() => goToSlide(index)}
                  className={`w-3 h-3 rounded-full transition-all duration-200 ${
                    index === currentIndex ? 'bg-primary-600' : 'bg-gray-300'
                  }`}
                />
              ))}
            </div>
          )}
        </div>

        {/* Results Summary */}
        <div className="mt-8 text-center text-gray-600">
          Showing {currentIndex + 1} of {visibleHotels.length} recommended hotels
        </div>
      </div>

      {/* Booking Modal */}
      {showBookingModal && selectedHotel && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-white rounded-2xl p-6 w-full max-w-md"
          >
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-gray-900">Book {selectedHotel.name}</h2>
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={() => setShowBookingModal(false)}
                className="text-gray-400 hover:text-gray-600 transition-colors duration-200"
              >
                <FaTimes className="text-2xl" />
              </motion.button>
            </div>

            <form onSubmit={handleBookingSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Check In</label>
                  <input
                    type="date"
                    name="checkIn"
                    value={bookingForm.checkIn}
                    onChange={(e) => setBookingForm({...bookingForm, checkIn: e.target.value})}
                    min={new Date().toISOString().split('T')[0]}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Check Out</label>
                  <input
                    type="date"
                    name="checkOut"
                    value={bookingForm.checkOut}
                    onChange={(e) => setBookingForm({...bookingForm, checkOut: e.target.value})}
                    min={getMinCheckOutDate()}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Rooms</label>
                  <select
                    name="rooms"
                    value={bookingForm.rooms}
                    onChange={(e) => setBookingForm({...bookingForm, rooms: parseInt(e.target.value)})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  >
                    {[1, 2, 3, 4, 5].map(num => (
                      <option key={num} value={num}>{num} Room{num > 1 ? 's' : ''}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Guests</label>
                  <select
                    name="guests"
                    value={bookingForm.guests}
                    onChange={(e) => setBookingForm({...bookingForm, guests: parseInt(e.target.value)})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  >
                    {[1, 2, 3, 4, 5, 6, 7, 8].map(num => (
                      <option key={num} value={num}>{num} Guest{num > 1 ? 's' : ''}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="bg-gray-50 rounded-lg p-4">
                <div className="flex justify-between items-center text-lg font-semibold">
                  <span>Total Price:</span>
                  <span className="text-primary-600">
                    {getCurrencySymbol(selectedHotel.currency)}{(selectedHotel.price * bookingForm.rooms).toLocaleString()}
                  </span>
                </div>
              </div>

              <div className="flex space-x-3">
                <button
                  type="button"
                  onClick={() => setShowBookingModal(false)}
                  className="flex-1 px-4 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors duration-200 font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 bg-primary-600 text-white py-3 px-6 rounded-lg hover:bg-primary-700 transition-colors duration-200 font-medium"
                >
                  Confirm Booking
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </section>
  );
};

export default RecommendationsSlider;
