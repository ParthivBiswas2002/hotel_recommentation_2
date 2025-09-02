// FilterSection.js - COMPLETE UPDATED VERSION with Page Refresh Fix
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaFilter, FaTimes, FaInfoCircle } from 'react-icons/fa';

const FilterSection = ({ onFiltersChange, searchLocation }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  
  // ✅ CRITICAL FIX: Don't initialize with searchLocation to prevent stale data
  const [filters, setFilters] = useState({
    valueForMoney: 0,
    starRating: 0,
    hotelRating: 0,
    cleanliness: 0,
    service: 0,
    location: '', // ✅ Always start empty on mount
    amenities: [],
    sortBy: 'price-low'
  });

  // ✅ FIXED: Only update location when searchLocation changes AND is different
  useEffect(() => {
    console.log('🔄 searchLocation changed:', searchLocation);
    
    if (searchLocation && searchLocation !== filters.location) {
      console.log('📍 Updating filter location to:', searchLocation);
      setFilters(prev => ({
        ...prev,
        location: searchLocation
      }));
    } else if (!searchLocation && filters.location) {
      // ✅ Clear location when no search is active
      console.log('🧹 Clearing location filter (no active search)');
      setFilters(prev => ({
        ...prev,
        location: ''
      }));
    }
  }, [searchLocation]); // Only depend on searchLocation

  // ✅ Trigger filtering whenever filters change
  useEffect(() => {
    console.log('🔄 Filters changed, notifying parent:', filters);
    if (typeof onFiltersChange === 'function') {
      onFiltersChange(filters);
    }
  }, [filters, onFiltersChange]);

  // ✅ Reset filters when component unmounts or remounts
  useEffect(() => {
    return () => {
      console.log('🧹 FilterSection unmounting, cleaning up...');
    };
  }, []);

  const locations = [
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

  const amenities = [
    'Free WiFi', 'Pool', 'Spa', 'Gym', 'Restaurant', 'Bar', 'Parking', 'Air Conditioning',
    'Room Service', 'Beach Access', 'Breakfast', 'Pet Friendly', 'Business Center',
    'Meeting Rooms', 'Laundry Service', 'Concierge', 'Elevator', 'Non-smoking Rooms'
  ];

  const handleFilterChange = (filterType, value) => {
    console.log(`🎯 Filter changing: ${filterType} = ${value}`);
    
    let newFilters = { ...filters };
    
    switch (filterType) {
      case 'valueForMoney':
        newFilters.valueForMoney = value;
        break;
      case 'starRating':
        newFilters.starRating = value;
        break;
      case 'hotelRating':
        newFilters.hotelRating = value;
        break;
      case 'location':
        // ✅ ENHANCED: Don't allow location change if controlled by search
        if (!searchLocation) {
          newFilters.location = value;
          console.log(`📍 Manual location filter set to: "${value}"`);
        } else {
          console.log(`🚫 Location change blocked - controlled by search: "${searchLocation}"`);
          return; // Don't update if location is controlled by search
        }
        break;
      case 'cleanliness':
        newFilters.cleanliness = value;
        break;
      case 'service':
        newFilters.service = value;
        break;
      case 'amenities':
        if (filters.amenities.includes(value)) {
          newFilters.amenities = filters.amenities.filter(amenity => amenity !== value);
        } else {
          newFilters.amenities = [...filters.amenities, value];
        }
        break;
      case 'sortBy':
        newFilters.sortBy = value;
        break;
      default:
        console.warn(`Unknown filter type: ${filterType}`);
        return;
    }
    
    console.log('✅ Setting new filters:', newFilters);
    setFilters(newFilters);
  };

  // ✅ ENHANCED: Clear all filters but preserve search location
  const clearFilters = () => {
    console.log('🧹 Clearing all filters, preserving search location:', searchLocation);
    
    const clearedFilters = {
      valueForMoney: 0,
      starRating: 0,
      hotelRating: 0,
      cleanliness: 0,
      service: 0,
      location: searchLocation || '', // ✅ Preserve search location
      amenities: [],
      sortBy: 'price-low'
    };
    
    setFilters(clearedFilters);
  };

  // ✅ ENHANCED: Count active filters (excluding search-controlled location)
  const getActiveFiltersCount = () => {
    let count = 0;
    if (filters.valueForMoney > 0) count += 1;
    if (filters.starRating > 0) count += 1;
    if (filters.hotelRating > 0) count += 1;
    if (filters.cleanliness > 0) count += 1;
    if (filters.service > 0) count += 1;
    // ✅ Only count location if it's manually set (not from search)
    if (filters.location && !searchLocation) count += 1;
    if (filters.amenities.length > 0) count += filters.amenities.length;
    if (filters.sortBy !== 'price-low') count += 1;
    return count;
  };

  // ✅ Helper function for range labels
  const getRangeLabel = (value, type) => {
    if (value === 0) return 'Any';
    
    switch (type) {
      case 'starRating':
        return `${value}+ Star${value > 1 ? 's' : ''}`;
      case 'hotelRating':
        return `${value}+ Rating`;
      default:
        return `${value}+`;
    }
  };

  return (
    <div className="mb-8">
      {/* ✅ ENHANCED: Search Location Notice */}
      {searchLocation && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-4 p-4 bg-blue-50 border border-blue-200 rounded-lg"
        >
          <div className="flex items-start space-x-2">
            <FaInfoCircle className="text-blue-500 mt-0.5 flex-shrink-0" />
            <div>
              <p className="text-sm text-blue-700">
                <strong>Showing hotels in {searchLocation}</strong> from your search.
              </p>
              <p className="text-xs text-blue-600 mt-1">
                Use the search form above to change your destination.
              </p>
            </div>
          </div>
        </motion.div>
      )}

      {/* Filter Controls Row */}
      <div className="flex flex-wrap items-center gap-3 mb-4">
        {/* Filter Toggle Button */}
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => setIsExpanded(!isExpanded)}
          className="flex items-center space-x-2 px-6 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors duration-200 font-medium shadow-md"
        >
          <FaFilter />
          <span>Filters & Sort</span>
          {getActiveFiltersCount() > 0 && (
            <motion.span
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className="bg-white text-primary-600 px-2 py-1 rounded-full text-xs font-bold"
            >
              {getActiveFiltersCount()}
            </motion.span>
          )}
        </motion.button>

        {/* Clear Filters Button */}
        {getActiveFiltersCount() > 0 && (
          <motion.button
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            onClick={clearFilters}
            className="flex items-center space-x-2 px-4 py-2 text-primary-600 border-2 border-primary-600 rounded-lg hover:bg-primary-50 transition-colors duration-200 font-medium"
          >
            <FaTimes />
            <span>Clear Filters</span>
          </motion.button>
        )}

        {/* Active Filters Summary */}
        {getActiveFiltersCount() > 0 && (
          <div className="text-sm text-gray-600">
            {getActiveFiltersCount()} active filter{getActiveFiltersCount() !== 1 ? 's' : ''}
          </div>
        )}
      </div>

      {/* ✅ ENHANCED: Expanded Filters Section */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
            className="overflow-hidden"
          >
            <div className="bg-white rounded-xl shadow-lg border border-gray-200">
              <div className="p-6">
                {/* Filters Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  
                  {/* ✅ ENHANCED: Location Filter with Clear States */}
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700">
                      Location {searchLocation && '(From Search)'}
                    </label>
                    
                    {searchLocation ? (
                      // ✅ Read-only display when controlled by search
                      <div className="w-full px-3 py-2 bg-gray-100 border-2 border-gray-200 rounded-lg text-gray-700 cursor-not-allowed flex items-center space-x-2">
                        <span>📍</span>
                        <span className="font-medium">{searchLocation}</span>
                      </div>
                    ) : (
                      // ✅ Interactive dropdown when not controlled by search
                      <select
                        value={filters.location}
                        onChange={(e) => handleFilterChange('location', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors"
                      >
                        <option value="">All Locations</option>
                        {locations.map((location) => (
                          <option key={location} value={location}>
                            {location}
                          </option>
                        ))}
                      </select>
                    )}
                    
                    {searchLocation && (
                      <p className="text-xs text-gray-500">
                        This location is set by your search and cannot be changed here.
                      </p>
                    )}
                  </div>

                  {/* ✅ ENHANCED: Star Rating Filter */}
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700">
                      Minimum Star Rating: {getRangeLabel(filters.starRating, 'starRating')}
                    </label>
                    <input
                      type="range"
                      min="0"
                      max="5"
                      value={filters.starRating}
                      onChange={(e) => handleFilterChange('starRating', parseInt(e.target.value))}
                      className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
                    />
                    <div className="flex justify-between text-xs text-gray-500">
                      {[0,1,2,3,4,5].map((n) => (
                        <span key={n} className={filters.starRating === n ? 'font-bold text-primary-600' : ''}>
                          {n === 0 ? 'Any' : `${n}★`}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* ✅ ENHANCED: Guest Rating Filter */}
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700">
                      Minimum Guest Rating: {filters.hotelRating === 0 ? 'Any' : `${filters.hotelRating}+`}
                    </label>
                    <input
                      type="range"
                      min="0"
                      max="5"
                      step="0.5"
                      value={filters.hotelRating}
                      onChange={(e) => handleFilterChange('hotelRating', parseFloat(e.target.value))}
                      className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
                    />
                    <div className="flex justify-between text-xs text-gray-500">
                      {[0,1,2,3,4,5].map((n) => (
                        <span key={n} className={filters.hotelRating === n ? 'font-bold text-primary-600' : ''}>
                          {n === 0 ? 'Any' : n}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Value for Money Filter */}
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700">
                      Value for Money: {filters.valueForMoney === 0 ? 'Any' : `${filters.valueForMoney}+`}
                    </label>
                    <input
                      type="range"
                      min="0"
                      max="5"
                      value={filters.valueForMoney}
                      onChange={(e) => handleFilterChange('valueForMoney', parseInt(e.target.value))}
                      className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
                    />
                    <div className="flex justify-between text-xs text-gray-500">
                      {[0,1,2,3,4,5].map((n) => (
                        <span key={n} className={filters.valueForMoney === n ? 'font-bold text-primary-600' : ''}>
                          {n === 0 ? 'Any' : n}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Cleanliness Filter */}
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700">
                      Cleanliness: {filters.cleanliness === 0 ? 'Any' : `${filters.cleanliness}+`}
                    </label>
                    <input
                      type="range"
                      min="0"
                      max="5"
                      value={filters.cleanliness}
                      onChange={(e) => handleFilterChange('cleanliness', parseInt(e.target.value))}
                      className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
                    />
                    <div className="flex justify-between text-xs text-gray-500">
                      {[0,1,2,3,4,5].map((n) => (
                        <span key={n} className={filters.cleanliness === n ? 'font-bold text-primary-600' : ''}>
                          {n === 0 ? 'Any' : n}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Service Filter */}
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700">
                      Service Quality: {filters.service === 0 ? 'Any' : `${filters.service}+`}
                    </label>
                    <input
                      type="range"
                      min="0"
                      max="5"
                      value={filters.service}
                      onChange={(e) => handleFilterChange('service', parseInt(e.target.value))}
                      className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
                    />
                    <div className="flex justify-between text-xs text-gray-500">
                      {[0,1,2,3,4,5].map((n) => (
                        <span key={n} className={filters.service === n ? 'font-bold text-primary-600' : ''}>
                          {n === 0 ? 'Any' : n}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* ✅ ENHANCED: Sort By */}
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700">Sort Results By</label>
                    <select
                      value={filters.sortBy}
                      onChange={(e) => handleFilterChange('sortBy', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors"
                    >
                      <option value="price-low">💰 Price: Low to High</option>
                      <option value="price-high">💎 Price: High to Low</option>
                      <option value="rating">⭐ Highest Rated</option>
                      <option value="name">🔤 Name: A to Z</option>
                    </select>
                  </div>
                </div>

                {/* ✅ ENHANCED: Amenities Section */}
                <div className="mt-8 pt-6 border-t border-gray-200">
                  <div className="flex items-center justify-between mb-4">
                    <label className="text-sm font-medium text-gray-700">
                      Amenities
                    </label>
                    <span className="text-xs text-gray-500">
                      {filters.amenities.length} of {amenities.length} selected
                    </span>
                  </div>
                  
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3">
                    {amenities.map((amenity) => (
                      <motion.label 
                        key={amenity} 
                        whileHover={{ scale: 1.02 }}
                        className={`flex items-center space-x-2 p-2 rounded-lg border cursor-pointer transition-colors ${
                          filters.amenities.includes(amenity) 
                            ? 'border-primary-300 bg-primary-50 text-primary-700' 
                            : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={filters.amenities.includes(amenity)}
                          onChange={() => handleFilterChange('amenities', amenity)}
                          className="text-primary-600 focus:ring-primary-500 rounded"
                        />
                        <span className="text-sm font-medium">{amenity}</span>
                      </motion.label>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default FilterSection;
