import React from 'react';
import { motion } from 'framer-motion';
import { FaMapMarkerAlt, FaStar } from 'react-icons/fa';

const TrendingCities = ({ onCityClick }) => {
  const cities = [
    // India
    {
      id: 1,
      name: 'Mumbai',
      country: 'India',
      description: 'The City of Dreams with stunning beaches and vibrant nightlife',
      image: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400&h=300&fit=crop',
      hotels: 450,
      avgPrice: 8500,
      currency: 'INR',
      rating: 4.6
    },
    {
      id: 2,
      name: 'Delhi',
      country: 'India',
      description: 'Historic capital with rich culture and amazing street food',
      image: 'https://images.unsplash.com/photo-1587474260584-136574528ed5?w=400&h=300&fit=crop',
      hotels: 380,
      avgPrice: 7200,
      currency: 'INR',
      rating: 4.4
    },
    {
      id: 3,
      name: 'Goa',
      country: 'India',
      description: 'Paradise beaches and Portuguese heritage',
      image: 'https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=400&h=300&fit=crop',
      hotels: 320,
      avgPrice: 6500,
      currency: 'INR',
      rating: 4.7
    },

    // Malaysia
    {
      id: 4,
      name: 'Kuala Lumpur',
      country: 'Malaysia',
      description: 'Modern metropolis with iconic Petronas Towers and rich culture',
      image: 'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=400&h=300&fit=crop',
      hotels: 280,
      avgPrice: 12000,
      currency: 'INR',
      rating: 4.5
    },
    {
      id: 5,
      name: 'Penang',
      country: 'Malaysia',
      description: 'Historic island with colonial architecture and amazing street food',
      image: 'https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=400&h=300&fit=crop',
      hotels: 180,
      avgPrice: 9500,
      currency: 'INR',
      rating: 4.6
    },

    // Australia
    {
      id: 6,
      name: 'Sydney',
      country: 'Australia',
      description: 'Harbour city with iconic Opera House and beautiful beaches',
      image: 'https://images.unsplash.com/photo-1506973035872-a4ec16b8e8d9?w=400&h=300&fit=crop',
      hotels: 420,
      avgPrice: 18000,
      currency: 'INR',
      rating: 4.7
    },
    {
      id: 7,
      name: 'Melbourne',
      country: 'Australia',
      description: 'Cultural capital with world-class dining and arts scene',
      image: 'https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=400&h=300&fit=crop',
      hotels: 380,
      avgPrice: 16500,
      currency: 'INR',
      rating: 4.5
    },

    // Qatar
    {
      id: 8,
      name: 'Doha',
      country: 'Qatar',
      description: 'Modern desert city with stunning architecture and luxury shopping',
      image: 'https://images.unsplash.com/photo-1571003123894-1f0594d2b5d9?w=400&h=300&fit=crop',
      hotels: 220,
      avgPrice: 25000,
      currency: 'INR',
      rating: 4.4
    },

    // China
    {
      id: 9,
      name: 'Shanghai',
      country: 'China',
      description: 'Futuristic megacity with stunning skyline and rich history',
      image: 'https://images.unsplash.com/photo-1536599018102-9f803c140fc1?w=400&h=300&fit=crop',
      hotels: 520,
      avgPrice: 15000,
      currency: 'INR',
      rating: 4.6
    },
    {
      id: 10,
      name: 'Beijing',
      country: 'China',
      description: 'Ancient capital with Forbidden City and Great Wall',
      image: 'https://images.unsplash.com/photo-1508804185872-d7badad00f7d?w=400&h=300&fit=crop',
      hotels: 480,
      avgPrice: 13500,
      currency: 'INR',
      rating: 4.5
    },

    // United States
    {
      id: 11,
      name: 'New York',
      country: 'United States',
      description: 'The Big Apple with iconic landmarks and endless entertainment',
      image: 'https://images.unsplash.com/photo-1496442226666-8d4d0e62e6e9?w=400&h=300&fit=crop',
      hotels: 520,
      avgPrice: 20000,
      currency: 'INR',
      rating: 4.3
    },
    {
      id: 12,
      name: 'Los Angeles',
      country: 'United States',
      description: 'City of Angels with Hollywood glamour and beautiful beaches',
      image: 'https://images.unsplash.com/photo-1515894201831-9e128e045a19?w=400&h=300&fit=crop',
      hotels: 450,
      avgPrice: 18500,
      currency: 'INR',
      rating: 4.4
    },

    // Belgium
    {
      id: 13,
      name: 'Brussels',
      country: 'Belgium',
      description: 'European capital with stunning architecture and delicious chocolates',
      image: 'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=400&h=300&fit=crop',
      hotels: 280,
      avgPrice: 22000,
      currency: 'INR',
      rating: 4.5
    },
    {
      id: 14,
      name: 'Bruges',
      country: 'Belgium',
      description: 'Medieval fairytale city with canals and historic charm',
      image: 'https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=400&h=300&fit=crop',
      hotels: 180,
      avgPrice: 19500,
      currency: 'INR',
      rating: 4.7
    },

    // Saudi Arabia
    {
      id: 15,
      name: 'Riyadh',
      country: 'Saudi Arabia',
      description: 'Modern capital with traditional souks and futuristic architecture',
      image: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=400&h=300&fit=crop',
      hotels: 320,
      avgPrice: 28000,
      currency: 'INR',
      rating: 4.4
    },
    {
      id: 16,
      name: 'Jeddah',
      country: 'Saudi Arabia',
      description: 'Coastal city with historic Al-Balad and Red Sea beaches',
      image: 'https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=400&h=300&fit=crop',
      hotels: 250,
      avgPrice: 24000,
      currency: 'INR',
      rating: 4.6
    }
  ];

  const getCurrencySymbol = (currency) => {
    switch (currency) {
      case 'INR':
        return '₹';
      case 'USD':
        return '$';
      case 'GBP':
        return '£';
      case 'EUR':
        return '€';
      default:
        return '₹';
    }
  };

  return (
    <section className="py-16 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center mb-12"
        >
          <h2 className="text-4xl font-bold text-gray-900 mb-4">Trending Destinations</h2>
          <p className="text-xl text-gray-600">Explore the most popular cities for hotel bookings</p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {cities.map((city, index) => (
            <motion.div
              key={city.id}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              whileHover={{ y: -10, scale: 1.02 }}
              className="bg-white rounded-xl shadow-lg overflow-hidden cursor-pointer transform transition-all duration-300 hover:shadow-2xl"
              onClick={() => onCityClick(city)}
            >
              <div className="relative">
                <img
                  src={city.image}
                  alt={city.name}
                  className="w-full h-48 object-cover"
                />
                <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm rounded-full px-3 py-1 flex items-center">
                  <FaStar className="text-yellow-400 mr-1" />
                  <span className="text-sm font-semibold text-gray-800">{city.rating}</span>
                </div>
              </div>

              <div className="p-6">
                <div className="flex items-center mb-2">
                  <FaMapMarkerAlt className="text-primary-600 mr-2" />
                  <span className="text-sm text-gray-600">{city.country}</span>
                </div>
                
                <h3 className="text-2xl font-bold text-gray-900 mb-3">{city.name}</h3>
                <p className="text-gray-600 mb-4 leading-relaxed">{city.description}</p>

                <div className="grid grid-cols-3 gap-4 text-center">
                  <div>
                    <div className="text-2xl font-bold text-primary-600">{city.hotels}</div>
                    <div className="text-sm text-gray-600">Hotels</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-primary-600">
                      {getCurrencySymbol(city.currency)}{city.avgPrice.toLocaleString()}
                    </div>
                    <div className="text-sm text-gray-600">Avg Price</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-primary-600">{city.rating}</div>
                    <div className="text-sm text-gray-600">Rating</div>
                  </div>
                </div>

                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="w-full mt-6 bg-primary-600 text-white py-3 px-6 rounded-lg hover:bg-primary-700 transition-colors duration-200 font-medium"
                  onClick={(e) => {
                    e.stopPropagation();
                    onCityClick(city);
                  }}
                >
                  Explore Hotels
                </motion.button>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default TrendingCities;
