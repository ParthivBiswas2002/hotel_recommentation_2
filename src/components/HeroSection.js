import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { FaSearch, FaCalendarAlt, FaBed, FaUsers, FaMapMarkerAlt, FaChevronDown } from 'react-icons/fa';

const HeroSection = ({ onSearch }) => {
  const [formData, setFormData] = useState({
    destination: '',
    checkIn: '',
    checkOut: '',
    rooms: 1,
    guests: 2
  });
  const [showBookingSuccess, setShowBookingSuccess] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [filteredSuggestions, setFilteredSuggestions] = useState([]);

  // Available countries for autocomplete
  const availableCountries = [
    'Afghanistan', 'Albania', 'Algeria', 'American Samoa', 'Andorra', 'Angola', 'Argentina', 'Armenia',
    'Australia', 'Austria', 'Azerbaijan', 'Bahrain', 'Bangladesh', 'Belarus', 'Belgium', 'Belize',
    'Benin', 'Bhutan', 'Bolivia', 'Bosnia and Herzegovina', 'Botswana', 'Brazil', 'Brunei Darussalam',
    'Bulgaria', 'Burkina Faso', 'Cambodia', 'Cameroon', 'Canada', 'Cape Verde', 'Caribbean',
    'Central African Republic', 'Chad', 'Chile', 'China', 'Colombia', 'Comoros', 'Cook Islands',
    'Costa Rica', 'Croatia', 'Cyprus', 'Czech Republic', 'Democratic Republic of the Congo',
    'Denmark', 'Djibouti', 'East Timor', 'Ecuador', 'Egypt', 'El Salvador', 'Equatorial Guinea',
    'Eritrea', 'Estonia', 'Ethiopia', 'Eswatini (Swaziland)', 'Falkland Islands', 'Faroe Islands',
    'Federated States of Micronesia', 'Fiji', 'Finland', 'France', 'French Guiana', 'French Polynesia',
    'Gabon', 'Gambia', 'Georgia', 'Germany', 'Ghana', 'Greece', 'Greenland', 'Guatemala', 'Guinea',
    'Guinea-Bissau', 'Guyana', 'Honduras', 'Hungary', 'Iceland', 'India', 'Indonesia', 'Iran', 'Iraq',
    'Ireland', 'Israel', 'Italy', 'Ivory Coast', 'Japan', 'Jordan', 'Kazakhstan', 'Kenya', 'Kosovo',
    'Kuwait', 'Kyrgyzstan', 'Laos', 'Latvia', 'Lebanon', 'Lesotho', 'Liberia', 'Libya',
    'Liechtenstein', 'Lithuania', 'Luxembourg', 'Madagascar', 'Malawi', 'Malaysia', 'Mali', 'Malta',
    'Mariana Islands', 'Mauritania', 'Mayotte', 'Mexico', 'Moldova', 'Monaco', 'Mongolia',
    'Montenegro', 'Morocco', 'Mozambique', 'Myanmar', 'Namibia', 'Nepal', 'New Caledonia',
    'New Zealand', 'Nicaragua', 'Niger', 'Nigeria', 'Niue', 'North Korea', 'Norway', 'Oman',
    'Pakistan', 'Palau', 'Palestinian Territories', 'Panama', 'Papua New Guinea', 'Paraguay',
    'Peru', 'Philippines', 'Poland', 'Portugal', 'Qatar', 'Republic of Kiribati',
    'Republic of North Macedonia', 'Republic of the Congo', 'Reunion Island', 'Romania', 'Russia',
    'Rwanda', 'Samoa', 'San Marino', 'Sao Tome and Principe', 'Saudi Arabia', 'Senegal', 'Serbia',
    'Seychelles', 'Sierra Leone', 'Singapore', 'Slovakia', 'Slovenia', 'Solomon Islands',
    'South Africa', 'South Korea', 'South Sudan', 'Spain', 'Sri Lanka', 'Sudan', 'Suriname',
    'Sweden', 'Switzerland', 'Syria', 'Taiwan', 'Tajikistan', 'Tanzania', 'Thailand',
    'The Netherlands', 'Togo', 'Tonga', 'Tunisia', 'Turkey', 'Turkmenistan', 'Tuvalu', 'Uganda',
    'Ukraine', 'United Arab Emirates', 'United Kingdom', 'United States', 'Uruguay', 'Uzbekistan',
    'Vanuatu', 'Venezuela', 'Vietnam', 'Zambia', 'Zimbabwe'
  ];

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));

    // Handle destination autocomplete
    if (name === 'destination') {
      if (value.trim() === '') {
        setFilteredSuggestions([]);
        setShowSuggestions(false);
      } else {
        const filtered = availableCountries.filter(country =>
          country.toLowerCase().includes(value.toLowerCase())
        );
        setFilteredSuggestions(filtered);
        setShowSuggestions(filtered.length > 0);
      }
    }
  };

  const selectDestination = (country) => {
    setFormData(prev => ({
      ...prev,
      destination: country
    }));
    setShowSuggestions(false);
    setFilteredSuggestions([]);
  };

  const handleDestinationFocus = () => {
    if (formData.destination.trim() === '') {
      setFilteredSuggestions(availableCountries);
      setShowSuggestions(true);
    }
  };

  const handleDestinationBlur = () => {
    // Delay hiding suggestions to allow clicking on them
    setTimeout(() => {
      setShowSuggestions(false);
    }, 200);
  };

  const handleNumberChange = (name, increment) => {
    setFormData(prev => {
      const newValue = prev[name] + increment;
      const minValue = name === 'rooms' ? 1 : 1;
      const maxValue = name === 'rooms' ? 10 : 20;
      return {
        ...prev,
        [name]: Math.max(minValue, Math.min(maxValue, newValue))
      };
    });
  };

  // In HeroSection.js - Replace the handleSubmit function
  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validate form data
    if (!formData.destination || !formData.checkIn || !formData.checkOut) {
      alert('Please fill in all required fields');
      return;
    }

    // Check if check-out is after check-in
    if (new Date(formData.checkOut) <= new Date(formData.checkIn)) {
      alert('Check-out date must be after check-in date');
      return;
    }

    // ✅ CRITICAL FIX: Actually search for hotels instead of showing success message
    try {
      setShowBookingSuccess(false); // Don't show success message

      console.log('🔍 Searching hotels for:', formData);

      // Call the search function properly
      if (typeof onSearch === 'function') {
        // Pass the search data to parent component
        onSearch({
          destination: formData.destination,
          checkIn: formData.checkIn,
          checkOut: formData.checkOut,
          rooms: formData.rooms,
          guests: formData.guests
        });

        // Navigate to results section
        setTimeout(() => {
          const resultsSection = document.getElementById('results');
          if (resultsSection) {
            resultsSection.scrollIntoView({ behavior: 'smooth' });
          }
        }, 100);
      }

    } catch (error) {
      console.error('❌ Search error:', error);
      alert('Failed to search hotels. Please try again.');
    }
  };


  const getMinCheckOutDate = () => {
    if (!formData.checkIn) return '';
    const checkInDate = new Date(formData.checkIn);
    const nextDay = new Date(checkInDate);
    nextDay.setDate(nextDay.getDate() + 1);
    return nextDay.toISOString().split('T')[0];
  };

  return (
    <section className="relative h-screen bg-gradient-to-br from-primary-600 via-primary-700 to-primary-800 overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent rounded-full blur-3xl"></div>
      </div>

      {/* Floating Elements */}
      <motion.div
        animate={{ y: [0, -20, 0] }}
        transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
        className="absolute top-20 left-10 w-20 h-20 bg-white/10 rounded-full blur-xl"
      />
      <motion.div
        animate={{ y: [0, 20, 0] }}
        transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
        className="absolute top-40 right-20 w-32 h-32 bg-white/10 rounded-full blur-xl"
      />

      <div className="relative z-10 flex items-center justify-center h-full px-4">
        <div className="text-center text-white max-w-4xl mx-auto">
          {/* Main Title */}
          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-5xl md:text-7xl font-bold mb-6"
          >
            Find Your Perfect
            <span className="block text-yellow-300">Hotel Stay</span>
          </motion.h1>

          {/* Subtitle */}
          <motion.p
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="text-xl md:text-2xl mb-12 text-blue-100"
          >
            Discover amazing deals on hotels worldwide. Book with confidence and enjoy your stay.
          </motion.p>

          {/* Booking Form */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 md:p-8 border border-white/20"
          >
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
                {/* Destination */}
                <div className="relative">
                  <FaMapMarkerAlt className="absolute left-3 top-3 text-gray-400" />
                  <input
                    type="text"
                    name="destination"
                    value={formData.destination}
                    onChange={handleInputChange}
                    onFocus={handleDestinationFocus}
                    onBlur={handleDestinationBlur}
                    placeholder="Where to?"
                    className="w-full pl-10 pr-4 py-3 bg-white rounded-lg text-gray-900 placeholder-gray-500 focus:ring-2 focus:ring-primary-500 focus:outline-none"
                    required
                  />
                  {showSuggestions && (
                    <div className="absolute z-50 mt-1 w-full bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-y-auto">
                      {filteredSuggestions.map((suggestion, index) => (
                        <div
                          key={index}
                          className="px-4 py-2 cursor-pointer hover:bg-gray-100 text-gray-700"
                          onClick={() => selectDestination(suggestion)}
                        >
                          {suggestion}
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Check-in Date */}
                <div className="relative">
                  <FaCalendarAlt className="absolute left-3 top-3 text-gray-400" />
                  <input
                    type="date"
                    name="checkIn"
                    value={formData.checkIn}
                    onChange={handleInputChange}
                    min={new Date().toISOString().split('T')[0]}
                    className="w-full pl-10 pr-4 py-3 bg-white rounded-lg text-gray-900 focus:ring-2 focus:ring-primary-500 focus:outline-none"
                    required
                  />
                </div>

                {/* Check-out Date */}
                <div className="relative">
                  <FaCalendarAlt className="absolute left-3 top-3 text-gray-400" />
                  <input
                    type="date"
                    name="checkOut"
                    value={formData.checkOut}
                    onChange={handleInputChange}
                    min={getMinCheckOutDate()}
                    className="w-full pl-10 pr-4 py-3 bg-white rounded-lg text-gray-900 focus:ring-2 focus:ring-primary-500 focus:outline-none"
                    required
                  />
                </div>

                {/* Rooms */}
                <div className="relative">
                  <FaBed className="absolute left-3 top-3 text-gray-400" />
                  <div className="flex items-center bg-white rounded-lg">
                    <button
                      type="button"
                      onClick={() => handleNumberChange('rooms', -1)}
                      disabled={formData.rooms <= 1}
                      className={`px-3 py-3 transition-colors ${formData.rooms <= 1
                        ? 'text-gray-300 cursor-not-allowed'
                        : 'text-gray-600 hover:text-primary-600'
                        }`}
                    >
                      -
                    </button>
                    <span className="flex-1 text-center text-gray-900 font-medium">
                      {formData.rooms} {formData.rooms === 1 ? 'Room' : 'Rooms'}
                    </span>
                    <button
                      type="button"
                      onClick={() => handleNumberChange('rooms', 1)}
                      disabled={formData.rooms >= 10}
                      className={`px-3 py-3 transition-colors ${formData.rooms >= 10
                        ? 'text-gray-300 cursor-not-allowed'
                        : 'text-gray-600 hover:text-primary-600'
                        }`}
                    >
                      +
                    </button>
                  </div>
                </div>

                {/* Guests */}
                <div className="relative">
                  <FaUsers className="absolute left-3 top-3 text-gray-400" />
                  <div className="flex items-center bg-white rounded-lg">
                    <button
                      type="button"
                      onClick={() => handleNumberChange('guests', -1)}
                      disabled={formData.guests <= 1}
                      className={`px-3 py-3 transition-colors ${formData.guests <= 1
                        ? 'text-gray-300 cursor-not-allowed'
                        : 'text-gray-600 hover:text-primary-600'
                        }`}
                    >
                      -
                    </button>
                    <span className="flex-1 text-center text-gray-900 font-medium">
                      {formData.guests} {formData.guests === 1 ? 'Guest' : 'Guests'}
                    </span>
                    <button
                      type="button"
                      onClick={() => handleNumberChange('guests', 1)}
                      disabled={formData.guests >= 20}
                      className={`px-3 py-3 transition-colors ${formData.guests >= 20
                        ? 'text-gray-300 cursor-not-allowed'
                        : 'text-gray-600 hover:text-primary-600'
                        }`}
                    >
                      +
                    </button>
                  </div>
                </div>
              </div>

              {/* Search Button */}
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                type="submit"
                className="w-full bg-gradient-to-r from-yellow-400 to-yellow-500 text-gray-900 font-bold py-4 px-8 rounded-lg hover:from-yellow-500 hover:to-yellow-600 transition-all duration-300 transform hover:shadow-lg"
              >
                <FaSearch className="inline mr-2" />
                Search Hotels
              </motion.button>
            </form>


          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
