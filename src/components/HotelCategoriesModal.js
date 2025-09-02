import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaTimes, FaStar, FaMapMarkerAlt, FaRupeeSign, FaDollarSign, FaPoundSign, FaEuroSign } from 'react-icons/fa';
import ApiService from '../services/api';

const HotelCategoriesModal = ({ isOpen, onClose, city }) => {
  // ✅ ALL HOOKS FIRST - Before any conditional returns
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // ✅ useEffect BEFORE conditional return
  useEffect(() => {
    if (isOpen && city) {
      fetchHotelCategories();
    }
  }, [isOpen, city]);

  // ✅ Now conditional return AFTER all hooks
  if (!isOpen || !city) return null;

  const getCurrencySymbol = (currency) => {
    switch (currency) {
      case 'INR':
        return <FaRupeeSign className="inline" />;
      case 'USD':
        return <FaDollarSign className="inline" />;
      case 'GBP':
        return <FaPoundSign className="inline" />;
      case 'EUR':
        return <FaEuroSign className="inline" />;
      default:
        return currency;
    }
  };

  const getCurrency = () => {
    if (city.country === 'India') return 'INR';
    if (city.country === 'United States' || city.country === 'USA') return 'USD';
    if (city.country === 'United Kingdom' || city.country === 'UK') return 'GBP';
    if (city.country === 'Germany' || city.country === 'France' || city.country === 'Italy') return 'EUR';
    return 'USD';
  };

  const currency = getCurrency();

  const fetchHotelCategories = async () => {
    try {
      setLoading(true);
      setError(null);

      console.log(`🔍 Fetching hotels for: ${city.name}, ${city.country}`);

      // ✅ CRITICAL FIX: Use the exact location from your filter
      const locationQuery = city.country || city.name;
      
      console.log(`📍 Location Query: "${locationQuery}"`);

      // Fetch different categories with STRICT location filtering
      const [bestRated, budget, luxury, resorts] = await Promise.all([
        fetchHotelsByCategory('best-rated', locationQuery),
        fetchHotelsByCategory('budget', locationQuery),
        fetchHotelsByCategory('luxury', locationQuery),
        fetchHotelsByCategory('resorts', locationQuery)
      ]);

      const categoriesData = [
        {
          id: 1,
          name: 'Best Rated',
          description: 'Top-rated hotels with excellent guest reviews',
          icon: '🏆',
          hotels: bestRated
        },
        {
          id: 2,
          name: 'Budget Friendly',
          description: 'Affordable accommodations without compromising comfort',
          icon: '💰',
          hotels: budget
        },
        {
          id: 3,
          name: 'Luxury',
          description: 'Premium hotels with world-class amenities and service',
          icon: '✨',
          hotels: luxury
        },
        {
          id: 4,
          name: 'Resorts & Villas',
          description: 'Exclusive resorts and private villas for ultimate relaxation',
          icon: '🏖️',
          hotels: resorts
        }
      ];

      setCategories(categoriesData);
      console.log(`✅ Successfully loaded ${categoriesData.length} categories`);
    } catch (error) {
      console.error('Error fetching hotel categories:', error);
      setError('Failed to load hotel categories');
    } finally {
      setLoading(false);
    }
  };

  const fetchHotelsByCategory = async (category, location) => {
    try {
      console.log(`🏨 Fetching ${category} hotels for "${location}"`);
      
      // ✅ CRITICAL FIX: Use EXACT location matching
      const preferences = {
        country: location, // This MUST match exactly with your backend filtering
        amenities: getAmenitiesForCategory(category),
        services: category === 'luxury' ? 5.0 : category === 'budget' ? 3.0 : 4.0,
        cleanliness: category === 'luxury' ? 5.0 : 4.0,
        value_for_money: category === 'budget' ? 5.0 : 4.0,
      };

      console.log('📨 API Request Preferences:', preferences);

      const response = await ApiService.getRecommendations(preferences);
      
      if (response && response.recommendations && response.recommendations.length > 0) {
        console.log(`✅ API returned ${response.recommendations.length} hotels for ${category}`);
        
        // ✅ ADDITIONAL CLIENT-SIDE FILTERING for extra safety
        const locationFilteredHotels = response.recommendations.filter(hotel => {
          const hotelLocation = hotel.location ? hotel.location.toLowerCase() : '';
          const hotelCountry = hotel.country ? hotel.country.toLowerCase() : '';
          const searchLocation = location.toLowerCase();
          
          // Check if hotel is from the correct location
          const isCorrectLocation = hotelLocation.includes(searchLocation) || 
                                  hotelCountry.includes(searchLocation) ||
                                  hotelCountry === searchLocation;
          
          console.log(`🔍 Hotel: ${hotel.name}, Location: "${hotel.location}", Country: "${hotel.country}", Match: ${isCorrectLocation}`);
          
          return isCorrectLocation;
        });
        
        console.log(`🎯 After client filtering: ${locationFilteredHotels.length} hotels remain`);
        
        return locationFilteredHotels.slice(0, 3).map(hotel => ({
          name: hotel.name,
          rating: hotel.rating,
          price: generatePrice(hotel.location, category),
          image: getRandomImage(),
          location: hotel.location,
          amenities: hotel.amenities,
          country: hotel.country || location // Ensure country is set
        }));
      } else {
        console.log(`⚠️ No hotels found for ${category} in ${location}`);
        return [];
      }
      
    } catch (error) {
      console.error(`❌ Error fetching ${category} hotels:`, error);
      return [];
    }
  };

  const getAmenitiesForCategory = (category) => {
    switch (category) {
      case 'luxury':
        return 'Spa, Pool, Restaurant, Bar, Room Service, Concierge';
      case 'budget':
        return 'WiFi, Parking, Breakfast';
      case 'resorts':
        return 'Pool, Beach Access, Spa, Restaurant, Water Sports';
      case 'best-rated':
        return 'WiFi, Restaurant, Pool, Gym';
      default:
        return 'WiFi, Restaurant';
    }
  };

  const generatePrice = (location, category) => {
    const basePrices = {
      luxury: currency === 'INR' ? 45000 : currency === 'USD' ? 800 : 650,
      budget: currency === 'INR' ? 3500 : currency === 'USD' ? 89 : 75,
      resorts: currency === 'INR' ? 28000 : currency === 'USD' ? 450 : 380,
      'best-rated': currency === 'INR' ? 18000 : currency === 'USD' ? 350 : 280
    };
    
    const variation = Math.random() * 0.4 + 0.8;
    return Math.round(basePrices[category] * variation);
  };

  const getRandomImage = () => {
    const imageIds = [
      'photo-1566073771259-6a8506099945',
      'photo-1571896349842-33c89424de2d',
      'photo-1544551763-46a013bb70d5',
      'photo-1582719478250-c89cae4dc85b',
      'photo-1520250497591-112f2f40a3f4',
      'photo-1551882547-ff40c63fe5fa'
    ];
    const randomId = imageIds[Math.floor(Math.random() * imageIds.length)];
    return `https://images.unsplash.com/${randomId}?w=300&h=200&fit=crop`;
  };

  if (loading) {
    return (
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center"
          >
            <div className="bg-white rounded-2xl p-8 text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
              <p className="mt-4 text-gray-600">Loading hotels for {city.name}...</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    );
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4"
        >
          <motion.div
            initial={{ scale: 0.8 }}
            animate={{ scale: 1 }}
            exit={{ scale: 0.8 }}
            className="bg-white rounded-2xl shadow-2xl w-full max-w-7xl max-h-[90vh] overflow-hidden"
          >
            {/* Header */}
            <div className="bg-primary-600 text-white p-6 relative">
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={onClose}
                className="absolute top-4 right-4 text-white hover:text-primary-100 transition-colors duration-200"
              >
                <FaTimes className="text-2xl" />
              </motion.button>
              <h2 className="text-3xl font-bold mb-2">Hotels in {city.name}</h2>
              <p className="text-primary-100 flex items-center">
                <FaMapMarkerAlt className="mr-2" />
                {city.country}
              </p>
            </div>

            {/* Content */}
            <div className="p-6 overflow-y-auto max-h-[calc(90vh-140px)]">
              {error ? (
                <div className="text-center py-8">
                  <p className="text-red-600 mb-4">{error}</p>
                  <button
                    onClick={fetchHotelCategories}
                    className="bg-primary-600 text-white px-6 py-2 rounded-lg hover:bg-primary-700 transition-colors"
                  >
                    Try Again
                  </button>
                </div>
              ) : categories.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-gray-600 mb-4">No hotels found for {city.name}, {city.country}</p>
                  <p className="text-sm text-gray-500">Try selecting a different location or check your filters.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {categories.map((category, index) => (
                    <motion.div
                      key={category.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className="bg-gray-50 rounded-xl p-6"
                    >
                      <div className="flex items-center mb-4">
                        <span className="text-3xl mr-3">{category.icon}</span>
                        <div>
                          <h3 className="text-xl font-bold text-gray-900">{category.name}</h3>
                          <p className="text-gray-600 text-sm">{category.description}</p>
                        </div>
                      </div>

                      {category.hotels.length > 0 ? (
                        <div className="space-y-4">
                          {category.hotels.map((hotel, hotelIndex) => (
                            <motion.div
                              key={hotelIndex}
                              whileHover={{ scale: 1.02 }}
                              className="bg-white rounded-lg p-4 shadow-sm hover:shadow-md transition-all duration-200"
                            >
                              <div className="flex items-center space-x-4">
                                <img
                                  src={hotel.image}
                                  alt={hotel.name}
                                  className="w-20 h-20 rounded-lg object-cover"
                                />
                                <div className="flex-1">
                                  <h4 className="font-semibold text-gray-900 mb-1">{hotel.name}</h4>
                                  <p className="text-xs text-gray-500 mb-1">📍 {hotel.location}</p>
                                  <div className="flex items-center mb-2">
                                    <FaStar className="text-yellow-400 mr-1" />
                                    <span className="text-sm font-medium">{hotel.rating}</span>
                                  </div>
                                  <div className="text-lg font-bold text-primary-600">
                                    {getCurrencySymbol(currency)}{hotel.price.toLocaleString()}
                                    <span className="text-sm text-gray-500 font-normal ml-1">per night</span>
                                  </div>
                                </div>
                              </div>
                            </motion.div>
                          ))}
                        </div>
                      ) : (
                        <div className="text-center py-8 text-gray-500">
                          <p>No {category.name.toLowerCase()} hotels available in {city.name}</p>
                        </div>
                      )}

                      <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        className="w-full mt-4 bg-primary-600 text-white py-3 rounded-lg hover:bg-primary-700 transition-colors duration-200 font-medium"
                      >
                        View All {category.name} Hotels
                      </motion.button>
                    </motion.div>
                  ))}
                </div>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default HotelCategoriesModal;
