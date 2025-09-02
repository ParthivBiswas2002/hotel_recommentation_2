import React, { useState, useEffect, useMemo, useCallback } from 'react';
import ApiService from '../services/api';
import { useCart } from '../context/CartContext';

const HotelRecommendations = ({ filters, searchData }) => {
  const [hotels, setHotels] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  
  // ✅ Get cart functionality
  const { addToCart, items } = useCart();

  // ✅ CRITICAL FIX: Remove items from dependency to prevent refresh flicker
  useEffect(() => {
    fetchFilteredHotels();
  }, [filters, searchData]); // Only fetch when filters/search changes

  // ✅ NEW: Helper function to calculate nights
  const calculateNights = useCallback((checkIn, checkOut) => {
    if (!checkIn || !checkOut) return 1;
    const nights = Math.ceil((new Date(checkOut) - new Date(checkIn)) / (1000 * 60 * 60 * 24));
    return Math.max(1, nights);
  }, []);

  // ✅ OPTIMIZED: Memoized cart check function
  const isHotelInCart = useMemo(() => {
    return (hotelName) => {
      return items.some(item => {
        const nameMatch = item.hotel_name === hotelName || item.name === hotelName;
        const dateMatch = !searchData || (
          item.details?.checkIn === searchData?.checkIn &&
          item.details?.checkOut === searchData?.checkOut
        );
        return nameMatch && dateMatch;
      });
    };
  }, [items, searchData]); // Only recalculate when items or searchData changes

  const fetchFilteredHotels = async () => {
    try {
      setLoading(true);
      setError(null);
      console.log('🔍 Current filters:', filters);
      console.log('🔍 Search data:', searchData);

      const preferences = {
        country: filters?.location || null,
        hotel_star: filters?.starRating || null,
        amenities: filters?.amenities?.join(', ') || '',
        services: filters?.service || null,
        cleanliness: filters?.cleanliness || null,
        value_for_money: filters?.valueForMoney || null,
        check_in: searchData?.checkIn || null,
        check_out: searchData?.checkOut || null,
      };

      console.log('📨 API Request with exact filters:', preferences);
      const response = await ApiService.getRecommendations(preferences);

      if (response && response.recommendations) {
        let filteredHotels = response.recommendations;

        // Client-side filtering for exact country match
        if (filters?.location) {
          const targetCountry = filters.location.toLowerCase().trim();
          console.log(`🎯 Client-side filtering for country: "${targetCountry}"`);

          filteredHotels = filteredHotels.filter(hotel => {
            const hotelCountry = (hotel.location || '').toLowerCase().trim();
            const isMatch = hotelCountry === targetCountry;
            console.log(`🏨 Hotel: ${hotel.name}, Country: "${hotel.location}", Match: ${isMatch}`);
            return isMatch;
          });

          console.log(`✅ After exact country filtering: ${filteredHotels.length} hotels remain`);
        }

        // Apply star rating filter
        if (filters?.starRating > 0) {
          filteredHotels = filteredHotels.filter(hotel =>
            (hotel.hotel_star || 0) >= filters.starRating
          );
          console.log(`⭐ After star rating filter: ${filteredHotels.length} hotels remain`);
        }

        // Apply guest rating filter
        if (filters?.hotelRating > 0) {
          filteredHotels = filteredHotels.filter(hotel =>
            (hotel.rating || 0) >= filters.hotelRating
          );
          console.log(`📊 After guest rating filter: ${filteredHotels.length} hotels remain`);
        }

        // Apply sorting
        if (filters?.sortBy) {
          filteredHotels = sortHotels(filteredHotels, filters.sortBy);
        }

        console.log(`🎉 Final filtered hotels count: ${filteredHotels.length}`);
        setHotels(filteredHotels);
      } else {
        console.log('⚠️ No hotels returned from API');
        setHotels([]);
      }
    } catch (error) {
      console.error('❌ Error fetching hotels:', error);
      setError('Failed to fetch hotels');
      setHotels([]);
    } finally {
      setLoading(false);
    }
  };

  const sortHotels = useCallback((hotelsArray, sortBy) => {
    const sorted = [...hotelsArray];
    switch (sortBy) {
      case 'price-low':
        return sorted.sort((a, b) => (a.price || 0) - (b.price || 0));
      case 'price-high':
        return sorted.sort((a, b) => (b.price || 0) - (a.price || 0));
      case 'rating':
        return sorted.sort((a, b) => (b.rating || 0) - (a.rating || 0));
      case 'name':
        return sorted.sort((a, b) => (a.name || '').localeCompare(b.name || ''));
      default:
        return sorted;
    }
  }, []);

  // ✅ OPTIMIZED: Handle adding hotel to cart without triggering refresh
  const handleAddToCart = useCallback(async (hotel) => {
    const nights = calculateNights(searchData?.checkIn, searchData?.checkOut);
    
    const cartItem = {
      id: `hotel_${hotel.name.replace(/\s+/g, '_')}_${searchData?.checkIn || Date.now()}`,
      type: 'hotel',
      name: hotel.name,
      location: hotel.location,
      image: hotel.image || null,
      price: hotel.price,
      originalPrice: hotel.price,
      quantity: 1,
      details: {
        rating: hotel.rating,
        hotel_star: hotel.hotel_star,
        amenities: hotel.amenities,
        checkIn: searchData?.checkIn || 'Not specified',
        checkOut: searchData?.checkOut || 'Not specified',
        nights: nights,
        rooms: searchData?.rooms || 1,
        guests: searchData?.guests || 2,
        pricePerNight: Math.round(hotel.price / nights),
        totalPrice: hotel.price
      }
    };

    try {
      console.log('🛒 Adding hotel to cart:', hotel.name);
      const result = await addToCart(cartItem);
      
      if (result && result.success) {
        // ✅ IMPROVED: Non-blocking notification
        showNotification(hotel.name);
        console.log('✅ Hotel added successfully');
      } else {
        console.error('❌ Failed to add to cart:', result?.message);
        alert(`Failed to add ${hotel.name} to cart: ${result?.message || 'Unknown error'}`);
      }
      
    } catch (error) {
      console.error('❌ Error adding to cart:', error);
      alert('Failed to add hotel to cart. Please try again.');
    }
  }, [addToCart, calculateNights, searchData]);

  // ✅ OPTIMIZED: Non-blocking notification function
  const showNotification = useCallback((hotelName) => {
    const notification = document.createElement('div');
    notification.className = 'fixed top-4 right-4 bg-green-500 text-white p-4 rounded-lg shadow-lg z-50 transition-all duration-300';
    notification.innerHTML = `
      <div class="flex items-center">
        <span class="mr-2">✅</span>
        <div>
          <div class="font-semibold">${hotelName}</div>
          <div class="text-sm">Added to cart successfully!</div>
        </div>
      </div>
    `;
    
    document.body.appendChild(notification);
    
    // Animate in
    requestAnimationFrame(() => {
      notification.style.transform = 'translateX(0)';
      notification.style.opacity = '1';
    });
    
    // Remove after 3 seconds
    setTimeout(() => {
      if (notification.parentNode) {
        notification.style.transform = 'translateX(100%)';
        notification.style.opacity = '0';
        setTimeout(() => {
          notification.parentNode?.removeChild(notification);
        }, 300);
      }
    }, 3000);
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading amazing hotels...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-8 bg-red-50 rounded-lg border border-red-200">
        <div className="text-red-500 text-4xl mb-4">⚠️</div>
        <p className="text-red-600 mb-4 font-medium">{error}</p>
        <button
          onClick={fetchFilteredHotels}
          className="bg-primary-600 text-white px-6 py-2 rounded-lg hover:bg-primary-700 transition-colors"
        >
          Try Again
        </button>
      </div>
    );
  }

  const nights = calculateNights(searchData?.checkIn, searchData?.checkOut);

  function getSortByLabel(sortBy) {
    switch (sortBy) {
      case 'price-high': return 'Price: High to Low';
      case 'rating': return 'Highest Rated';
      case 'name': return 'Name: A to Z';
      default: return sortBy;
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center">
        <h2 className="text-3xl font-bold text-gray-900 mb-4">
          {filters?.location ?
            `Top Hotels in ${filters.location}` :
            'Discover Amazing Hotels'
          }
        </h2>
        <p className="text-gray-600">
          {filters?.location ?
            `Discover the best hotels in ${filters.location}` :
            'Browse our curated selection of premium accommodations'
          }
        </p>

        {/* Enhanced search summary */}
        {searchData && (
          <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg max-w-2xl mx-auto">
            <div className="flex items-center justify-center space-x-4 text-sm text-blue-700">
              <span>📅 {nights} night{nights > 1 ? 's' : ''}</span>
              <span>🏨 {searchData.rooms} room{searchData.rooms > 1 ? 's' : ''}</span>
              <span>👥 {searchData.guests} guest{searchData.guests > 1 ? 's' : ''}</span>
            </div>
            <div className="text-xs text-blue-600 mt-1">
              {searchData.checkIn} to {searchData.checkOut}
            </div>
          </div>
        )}

        {/* Show active filters */}
        <div className="mt-4 flex flex-wrap justify-center gap-2">
          {filters?.location && (
            <span className="px-3 py-1 bg-primary-100 text-primary-800 rounded-full text-sm">
              📍 {filters.location}
            </span>
          )}
          {filters?.starRating > 0 && (
            <span className="px-3 py-1 bg-primary-100 text-primary-800 rounded-full text-sm">
              ⭐ {filters.starRating}+ stars
            </span>
          )}
          {filters?.amenities?.length > 0 && (
            <span className="px-3 py-1 bg-primary-100 text-primary-800 rounded-full text-sm">
              🎯 {filters.amenities.length} amenities
            </span>
          )}
        </div>
      </div>

      {/* Results Count */}
      <div className="flex justify-between items-center">
        <p className="text-gray-600">
          {hotels.length > 0
            ? `Showing ${hotels.length} hotel${hotels.length === 1 ? '' : 's'}`
            : 'No hotels found'
          }
          {filters?.location && ` in ${filters.location}`}
          <span className="text-xs text-gray-400 ml-2">
            (Cart: {items.length} items)
          </span>
        </p>

        {filters?.sortBy && filters.sortBy !== 'price-low' && (
          <p className="text-sm text-gray-500">
            Sorted by: {getSortByLabel(filters.sortBy)}
          </p>
        )}
      </div>

      {/* Hotels Grid - ✅ OPTIMIZED with stable keys */}
      {hotels.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {hotels.map((hotel, index) => (
            <HotelCard 
              key={`${hotel.name}-${index}`} // Stable key without cart state
              hotel={hotel} 
              searchData={searchData}
              nights={nights}
              onAddToCart={handleAddToCart}
              isInCart={isHotelInCart(hotel.name)}
              recommendationNumber={index + 1}
            />
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <div className="text-6xl mb-4">🏨</div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">No hotels found</h3>
          <p className="text-gray-600 mb-6">
            {filters?.location ?
              `We couldn't find any hotels in ${filters.location} matching your criteria.` :
              'Please adjust your filters to find hotels.'
            }
          </p>
          <button
            onClick={() => window.location.reload()}
            className="bg-primary-600 text-white px-6 py-2 rounded-lg hover:bg-primary-700 transition-colors"
          >
            Clear All Filters
          </button>
        </div>
      )}
    </div>
  );
};

// ✅ OPTIMIZED: HotelCard component with React.memo for performance
const HotelCard = React.memo(({ hotel, searchData, nights, onAddToCart, isInCart, recommendationNumber }) => {
  const price = hotel.price || 0;
  const hasValidPrice = price > 0;
  const pricePerNight = nights > 0 ? Math.round(price / nights) : price;

  const handleAddToCart = useCallback(() => {
    if (hasValidPrice && onAddToCart && !isInCart) {
      onAddToCart(hotel);
    }
  }, [hasValidPrice, onAddToCart, isInCart, hotel]);

  return (
    <div className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-all duration-300 border border-gray-100">
      {/* Recommendation Number Header */}
      <div className="bg-gradient-to-r from-primary-600 to-primary-700 text-white px-4 py-2">
        <div className="flex items-center justify-between">
          <span className="font-bold text-sm">
            Recommendation #{recommendationNumber}
          </span>
          <span className="text-xs opacity-90">
            Top Choice
          </span>
        </div>
      </div>

      {/* Hotel Image */}
      <div className="relative">
        <img
          src={hotel.image || "https://images.unsplash.com/photo-1566073771259-6a8506099945?w=400&h=250&fit=crop"}
          alt={hotel.name}
          className="w-full h-48 object-cover"
          onError={(e) => {
            e.target.src = "https://images.unsplash.com/photo-1566073771259-6a8506099945?w=400&h=250&fit=crop";
          }}
        />
        
        {/* Rating Badge */}
        <div className="absolute top-3 right-3 bg-white bg-opacity-95 px-2 py-1 rounded-full shadow-md">
          <span className="text-sm font-semibold flex items-center">
            <span className="text-yellow-500 mr-1">⭐</span>
            {hotel.rating || 'N/A'}
          </span>
        </div>
        
        {/* Star Rating Badge */}
        {hotel.hotel_star > 0 && (
          <div className="absolute top-3 left-3 bg-primary-600 text-white px-2 py-1 rounded-full">
            <span className="text-sm font-semibold">
              {hotel.hotel_star}★
            </span>
          </div>
        )}
        
        {/* Cart Status Badge */}
        {isInCart && (
          <div className="absolute bottom-3 right-3 bg-green-500 text-white px-3 py-2 rounded-full text-sm font-medium shadow-lg">
            ✓ In Cart
          </div>
        )}
      </div>

      {/* Hotel Details */}
      <div className="p-6">
        <h3 className="font-bold text-lg text-gray-900 mb-2 line-clamp-2">
          {hotel.name}
        </h3>
        
        <div className="flex items-center text-gray-600 text-sm mb-3">
          <span className="mr-1">📍</span>
          <span className="truncate">{hotel.location}</span>
        </div>

        {/* Amenities Preview */}
        {hotel.amenities && (
          <div className="mb-4">
            <div className="text-gray-500 text-xs flex items-start">
              <span className="mr-1 flex-shrink-0">🎯</span>
              <span className="line-clamp-2">
                {hotel.amenities.length > 80 ? 
                  `${hotel.amenities.substring(0, 80)}...` : 
                  hotel.amenities
                }
              </span>
            </div>
          </div>
        )}

        {/* Pricing section */}
        {hasValidPrice ? (
          <div className="mb-4">
            <div className={`border rounded-lg p-3 mb-3 transition-colors ${
              isInCart 
                ? 'bg-green-50 border-green-200' 
                : 'bg-blue-50 border-blue-200'
            }`}>
              <div className={`text-xs font-medium mb-1 ${
                isInCart ? 'text-green-700' : 'text-blue-700'
              }`}>
                {isInCart ? '✅ Added to Cart' : ` Price`}
              </div>
              {nights > 1 ? (
                <div className="space-y-1">
                  <div className="flex justify-between items-center text-sm text-gray-600">
                    <span>Per night:</span>
                    <span>₹{pricePerNight.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-lg font-bold text-primary-600">
                      Total ({nights} nights):
                    </span>
                    <span className="text-xl font-bold text-primary-600">
                      ₹{price.toLocaleString()}
                    </span>
                  </div>
                  {searchData && (
                    <div className="text-xs text-gray-500">
                      {searchData.rooms} room{searchData.rooms > 1 ? 's' : ''} • {searchData.guests} guest{searchData.guests > 1 ? 's' : ''}
                    </div>
                  )}
                </div>
              ) : (
                <div className="flex justify-between items-center">
                  <span className="text-2xl font-bold text-primary-600">
                    ₹{price.toLocaleString()}
                  </span>
                  <span className="text-gray-500 text-sm">per night</span>
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="mb-4">
            <span className="text-lg text-gray-500">Price unavailable</span>
          </div>
        )}

        {/* Action buttons */}
        <div className="flex space-x-2">
          <button
            onClick={handleAddToCart}
            disabled={!hasValidPrice || isInCart}
            className={`flex-1 py-3 px-4 rounded-lg font-medium transition-all duration-200 flex items-center justify-center text-sm ${
              !hasValidPrice 
                ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                : isInCart
                ? 'bg-green-100 text-green-700 border-2 border-green-300 cursor-default'
                : 'bg-gradient-to-r from-primary-600 to-primary-700 text-white hover:from-primary-700 hover:to-primary-800 hover:shadow-lg transform hover:-translate-y-0.5'
            }`}
          >
            {!hasValidPrice ? (
              <>
                <span className="mr-2">❌</span>
                Unavailable
              </>
            ) : isInCart ? (
              <>
                <span className="mr-2">✅</span>
                Added to Cart
              </>
            ) : (
              <>
                <span className="mr-2">🛒</span>
                Add to Cart
              </>
            )}
          </button>
          
          {/* View Details Button */}
          <button
            className="bg-gray-100 hover:bg-gray-200 text-gray-700 py-3 px-4 rounded-lg transition-colors duration-200 flex items-center justify-center"
            title={`View details for Recommendation #${recommendationNumber}`}
            onClick={() => {
              console.log(`View details for Recommendation #${recommendationNumber}:`, hotel.name);
              alert(`Viewing details for Recommendation #${recommendationNumber}: ${hotel.name}`);
            }}
          >
            <span className="text-sm">ℹ️</span>
          </button>
        </div>

        
      </div>
    </div>
  );
});

HotelCard.displayName = 'HotelCard';

export default HotelRecommendations;
