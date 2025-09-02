// src/components/BookingsSection.js - Enhanced with Real Bookings Data and Error Fixes
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FaCalendarAlt, 
  FaMapMarkerAlt, 
  FaStar, 
  FaHotel, 
  FaClock, 
  FaCheckCircle, 
  FaTimesCircle,
  FaEye,
  FaTrash,
  FaRedo,
  FaUserFriends,
  FaBed
} from 'react-icons/fa';
import { useBookings } from '../context/BookingsContext';

const BookingsSection = () => {
  const [activeTab, setActiveTab] = useState('current');
  const [selectedBooking, setSelectedBooking] = useState(null);
  
  // ✅ Get real bookings data from context
  const { 
    currentBookings = [], 
    pastBookings = [], 
    cancelBooking, 
    loading, 
    error,
    clearError 
  } = useBookings();

  // ✅ FIXED: Safe price formatting function
  const formatPrice = (price, currency = 'INR') => {
    if (price === undefined || price === null || isNaN(price)) {
      return 'Price not available';
    }
    
    const numericPrice = Number(price);
    if (numericPrice === 0) {
      return 'Free';
    }
    
    // ✅ FIXED: Use HTML entity for rupee symbol to avoid syntax errors
    return `\u20B9${numericPrice.toLocaleString()}`;
  };

  // ✅ FIXED: Safe date formatting function
  const formatDate = (dateString) => {
    if (!dateString) {
      return 'Date not available';
    }
    
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) {
        return 'Invalid date';
      }
      return date.toLocaleDateString();
    } catch (error) {
      console.error('Date formatting error:', error);
      return 'Date not available';
    }
  };

  // ✅ FIXED: Safe customer info extraction
  const getCustomerInfo = (booking) => {
    if (!booking || !booking.customer_info) {
      return {
        name: 'Guest',
        email: 'Not provided',
        phone: 'Not provided'
      };
    }

    let customerInfo;
    
    // Handle if customer_info is a string (JSON)
    if (typeof booking.customer_info === 'string') {
      try {
        customerInfo = JSON.parse(booking.customer_info);
      } catch (error) {
        console.error('Error parsing customer info:', error);
        return {
          name: 'Guest',
          email: 'Not provided',
          phone: 'Not provided'
        };
      }
    } else {
      customerInfo = booking.customer_info;
    }

    return {
      name: customerInfo.name || 'Guest',
      email: customerInfo.email || 'Not provided',
      phone: customerInfo.phone || 'Not provided',
      address: customerInfo.address || null
    };
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'confirmed':
        return 'text-green-600 bg-green-100';
      case 'completed':
        return 'text-blue-600 bg-blue-100';
      case 'cancelled':
        return 'text-red-600 bg-red-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'confirmed':
        return <FaCheckCircle className="text-green-600" />;
      case 'completed':
        return <FaCheckCircle className="text-blue-600" />;
      case 'cancelled':
        return <FaTimesCircle className="text-red-600" />;
      default:
        return <FaClock className="text-gray-600" />;
    }
  };

  // ✅ Handle booking cancellation
  const handleCancelBooking = (bookingId, hotelName) => {
    if (window.confirm(`Are you sure you want to cancel the booking for ${hotelName}?`)) {
      cancelBooking(bookingId);
    }
  };

  // ✅ Handle view details
  const handleViewDetails = (booking) => {
    setSelectedBooking(booking);
  };

  // ✅ Close details modal
  const closeDetailsModal = () => {
    setSelectedBooking(null);
  };

  // ✅ Handle book again functionality
  const handleBookAgain = (booking) => {
    console.log('Book again:', booking);
    alert(`Book again functionality for ${booking.hotel_name || booking.hotelName} - Feature coming soon!`);
  };

  if (loading) {
    return (
      <section id="bookings-section" className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading your bookings...</p>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section id="bookings-section" className="py-16 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center mb-12"
        >
          <h2 className="text-4xl font-bold text-gray-900 mb-4">My Bookings</h2>
          <p className="text-xl text-gray-600">Manage your current and past hotel reservations</p>
        </motion.div>

        {/* ✅ Error Display */}
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6"
          >
            <div className="flex items-center justify-between">
              <p className="text-red-600">{error}</p>
              <button
                onClick={clearError}
                className="text-red-600 hover:text-red-800"
              >
                ×
              </button>
            </div>
          </motion.div>
        )}

        {/* Tab Navigation */}
        <div className="flex justify-center mb-8">
          <div className="bg-white rounded-lg p-1 shadow-md">
            <button
              onClick={() => setActiveTab('current')}
              className={`px-6 py-3 rounded-md font-medium transition-all duration-200 ${
                activeTab === 'current'
                  ? 'bg-primary-600 text-white shadow-md'
                  : 'text-gray-600 hover:text-primary-600'
              }`}
            >
              Current Bookings ({currentBookings.length})
            </button>
            <button
              onClick={() => setActiveTab('past')}
              className={`px-6 py-3 rounded-md font-medium transition-all duration-200 ${
                activeTab === 'past'
                  ? 'bg-primary-600 text-white shadow-md'
                  : 'text-gray-600 hover:text-primary-600'
              }`}
            >
              Past Bookings ({pastBookings.length})
            </button>
          </div>
        </div>

        {/* Bookings Content */}
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
          className="space-y-6"
        >
          {activeTab === 'current' ? (
            currentBookings.length > 0 ? (
              currentBookings.map((booking) => {
                const customerInfo = getCustomerInfo(booking);
                
                return (
                  <motion.div
                    key={booking.id}
                    whileHover={{ y: -5 }}
                    className="bg-white rounded-xl shadow-lg overflow-hidden border border-gray-100"
                  >
                    <div className="md:flex">
                      <div className="md:w-1/3">
                        <img
                          src={booking.image || "https://images.unsplash.com/photo-1566073771259-6a8506099945?w=400&h=300&fit=crop"}
                          alt={booking.hotel_name || booking.hotelName || 'Hotel'}
                          className="w-full h-48 md:h-full object-cover"
                          onError={(e) => {
                            e.target.src = "https://images.unsplash.com/photo-1566073771259-6a8506099945?w=400&h=300&fit=crop";
                          }}
                        />
                      </div>
                      <div className="md:w-2/3 p-6">
                        <div className="flex justify-between items-start mb-4">
                          <div>
                            <h3 className="text-2xl font-bold text-gray-900 mb-2">
                              {booking.hotel_name || booking.hotelName || 'Unknown Hotel'}
                            </h3>
                            <div className="flex items-center text-gray-600 mb-2">
                              <FaMapMarkerAlt className="mr-2" />
                              <span>{booking.location || 'Location not specified'}</span>
                            </div>
                            {booking.rating > 0 && (
                              <div className="flex items-center mb-2">
                                <FaStar className="text-yellow-400 mr-1" />
                                <span className="text-gray-600">{booking.rating}/5.0</span>
                              </div>
                            )}
                            <div className="text-xs text-gray-500 font-mono">
                              Booking ID: {booking.id || 'Not available'}
                            </div>
                          </div>
                          <div className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(booking.status)}`}>
                            <div className="flex items-center">
                              {getStatusIcon(booking.status)}
                              <span className="ml-1 capitalize">{booking.status || 'Unknown'}</span>
                            </div>
                          </div>
                        </div>

                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                          <div className="text-center">
                            <div className="text-xl font-bold text-primary-600">
                              {formatDate(booking.check_in || booking.checkIn)}
                            </div>
                            <div className="text-sm text-gray-600 flex items-center justify-center">
                              <FaCalendarAlt className="mr-1" />
                              Check In
                            </div>
                          </div>
                          <div className="text-center">
                            <div className="text-xl font-bold text-primary-600">
                              {formatDate(booking.check_out || booking.checkOut)}
                            </div>
                            <div className="text-sm text-gray-600 flex items-center justify-center">
                              <FaCalendarAlt className="mr-1" />
                              Check Out
                            </div>
                          </div>
                          <div className="text-center">
                            <div className="text-xl font-bold text-primary-600">
                              {booking.rooms || 1}
                            </div>
                            <div className="text-sm text-gray-600 flex items-center justify-center">
                              <FaBed className="mr-1" />
                              Rooms
                            </div>
                          </div>
                          <div className="text-center">
                            <div className="text-xl font-bold text-primary-600">
                              {booking.guests || 2}
                            </div>
                            <div className="text-sm text-gray-600 flex items-center justify-center">
                              <FaUserFriends className="mr-1" />
                              Guests
                            </div>
                          </div>
                        </div>

                        {/* Enhanced booking details */}
                        <div className="bg-gray-50 rounded-lg p-3 mb-4">
                          <div className="text-sm text-gray-600">
                            <span className="font-medium">Guest:</span> {customerInfo.name}
                          </div>
                          <div className="text-sm text-gray-600">
                            <span className="font-medium">Email:</span> {customerInfo.email}
                          </div>
                          {customerInfo.phone !== 'Not provided' && (
                            <div className="text-sm text-gray-600">
                              <span className="font-medium">Phone:</span> {customerInfo.phone}
                            </div>
                          )}
                          <div className="text-sm text-gray-600">
                            <span className="font-medium">Booked on:</span> {formatDate(booking.booking_date)}
                          </div>
                        </div>

                        <div className="flex justify-between items-center">
                          <div className="text-3xl font-bold text-gray-900">
                            {formatPrice(booking.total_price || booking.totalPrice, booking.currency)}
                          </div>
                          <div className="flex space-x-3">
                            <button 
                              onClick={() => handleViewDetails(booking)}
                              className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors duration-200 flex items-center"
                            >
                              <FaEye className="mr-2" />
                              View Details
                            </button>
                            {booking.status === 'confirmed' && (
                              <button 
                                onClick={() => handleCancelBooking(
                                  booking.id, 
                                  booking.hotel_name || booking.hotelName || 'this booking'
                                )}
                                className="px-4 py-2 border border-red-500 text-red-500 rounded-lg hover:bg-red-50 transition-colors duration-200 flex items-center"
                              >
                                <FaTrash className="mr-2" />
                                Cancel
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                );
              })
            ) : (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-center py-16"
              >
                <FaHotel className="mx-auto text-6xl text-gray-300 mb-4" />
                <h3 className="text-xl font-medium text-gray-600 mb-2">No Current Bookings</h3>
                <p className="text-gray-500">You don't have any active hotel reservations at the moment.</p>
              </motion.div>
            )
          ) : (
            pastBookings.length > 0 ? (
              pastBookings.map((booking) => {
                const customerInfo = getCustomerInfo(booking);
                
                return (
                  <motion.div
                    key={booking.id}
                    whileHover={{ y: -5 }}
                    className="bg-white rounded-xl shadow-lg overflow-hidden border border-gray-100 opacity-90"
                  >
                    <div className="md:flex">
                      <div className="md:w-1/3">
                        <img
                          src={booking.image || "https://images.unsplash.com/photo-1566073771259-6a8506099945?w=400&h=300&fit=crop"}
                          alt={booking.hotel_name || booking.hotelName || 'Hotel'}
                          className="w-full h-48 md:h-full object-cover"
                          onError={(e) => {
                            e.target.src = "https://images.unsplash.com/photo-1566073771259-6a8506099945?w=400&h=300&fit=crop";
                          }}
                        />
                      </div>
                      <div className="md:w-2/3 p-6">
                        <div className="flex justify-between items-start mb-4">
                          <div>
                            <h3 className="text-2xl font-bold text-gray-900 mb-2">
                              {booking.hotel_name || booking.hotelName || 'Unknown Hotel'}
                            </h3>
                            <div className="flex items-center text-gray-600 mb-2">
                              <FaMapMarkerAlt className="mr-2" />
                              <span>{booking.location || 'Location not specified'}</span>
                            </div>
                            {booking.rating > 0 && (
                              <div className="flex items-center mb-2">
                                <FaStar className="text-yellow-400 mr-1" />
                                <span className="text-gray-600">{booking.rating}/5.0</span>
                              </div>
                            )}
                            <div className="text-xs text-gray-500 font-mono">
                              Booking ID: {booking.id || 'Not available'}
                            </div>
                          </div>
                          <div className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(booking.status)}`}>
                            <div className="flex items-center">
                              {getStatusIcon(booking.status)}
                              <span className="ml-1 capitalize">{booking.status || 'Unknown'}</span>
                            </div>
                          </div>
                        </div>

                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                          <div className="text-center">
                            <div className="text-xl font-bold text-gray-600">
                              {formatDate(booking.check_in || booking.checkIn)}
                            </div>
                            <div className="text-sm text-gray-500">Check In</div>
                          </div>
                          <div className="text-center">
                            <div className="text-xl font-bold text-gray-600">
                              {formatDate(booking.check_out || booking.checkOut)}
                            </div>
                            <div className="text-sm text-gray-500">Check Out</div>
                          </div>
                          <div className="text-center">
                            <div className="text-xl font-bold text-gray-600">{booking.rooms || 1}</div>
                            <div className="text-sm text-gray-500">Rooms</div>
                          </div>
                          <div className="text-center">
                            <div className="text-xl font-bold text-gray-600">{booking.guests || 2}</div>
                            <div className="text-sm text-gray-500">Guests</div>
                          </div>
                        </div>

                        <div className="flex justify-between items-center">
                          <div className="text-3xl font-bold text-gray-700">
                            {formatPrice(booking.total_price || booking.totalPrice, booking.currency)}
                          </div>
                          <div className="flex space-x-3">
                            <button 
                              onClick={() => handleViewDetails(booking)}
                              className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors duration-200 flex items-center"
                            >
                              <FaEye className="mr-2" />
                              View Details
                            </button>
                            <button 
                              onClick={() => handleBookAgain(booking)}
                              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors duration-200 flex items-center"
                            >
                              <FaRedo className="mr-2" />
                              Book Again
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                );
              })
            ) : (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-center py-16"
              >
                <FaHotel className="mx-auto text-6xl text-gray-300 mb-4" />
                <h3 className="text-xl font-medium text-gray-600 mb-2">No Past Bookings</h3>
                <p className="text-gray-500">You haven't completed any hotel stays yet.</p>
              </motion.div>
            )
          )}
        </motion.div>

        {/* ✅ Booking Details Modal */}
        <AnimatePresence>
          {selectedBooking && (
            <BookingDetailsModal
              booking={selectedBooking}
              onClose={closeDetailsModal}
              formatPrice={formatPrice}
              formatDate={formatDate}
              getCustomerInfo={getCustomerInfo}
            />
          )}
        </AnimatePresence>
      </div>
    </section>
  );
};

// ✅ FIXED: Detailed Booking Modal Component
const BookingDetailsModal = ({ booking, onClose, formatPrice, formatDate, getCustomerInfo }) => {
  const customerInfo = getCustomerInfo(booking);
  
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.8 }}
        className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
      >
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 rounded-t-2xl">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-bold text-gray-900">Booking Details</h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 text-2xl font-bold"
            >
              ×
            </button>
          </div>
        </div>

        <div className="p-6">
          <div className="space-y-6">
            {/* Hotel Information */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-3">Hotel Information</h3>
              <div className="bg-gray-50 rounded-lg p-4">
                <h4 className="font-bold text-xl text-gray-900">
                  {booking.hotel_name || booking.hotelName || 'Unknown Hotel'}
                </h4>
                <p className="text-gray-600 mt-1">{booking.location || 'Location not specified'}</p>
                {booking.rating > 0 && (
                  <div className="flex items-center mt-2">
                    <FaStar className="text-yellow-400 mr-1" />
                    <span className="text-gray-600">{booking.rating}/5.0</span>
                  </div>
                )}
                {booking.amenities && (
                  <p className="text-sm text-gray-500 mt-2">
                    <span className="font-medium">Amenities:</span> {booking.amenities}
                  </p>
                )}
              </div>
            </div>

            {/* Booking Information */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-3">Booking Information</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-600">Booking ID</label>
                  <p className="font-mono text-sm text-gray-900">{booking.id || 'Not available'}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600">Booking Date</label>
                  <p className="text-gray-900">{formatDate(booking.booking_date || booking.bookingDate)}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600">Check-in</label>
                  <p className="text-gray-900">{formatDate(booking.check_in || booking.checkIn)}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600">Check-out</label>
                  <p className="text-gray-900">{formatDate(booking.check_out || booking.checkOut)}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600">Rooms</label>
                  <p className="text-gray-900">{booking.rooms || 1}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600">Guests</label>
                  <p className="text-gray-900">{booking.guests || 2}</p>
                </div>
              </div>
            </div>

            {/* Customer Information */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-3">Guest Information</h3>
              <div className="bg-gray-50 rounded-lg p-4">
                <p className="font-medium text-gray-900">{customerInfo.name}</p>
                <p className="text-gray-600">{customerInfo.email}</p>
                {customerInfo.phone !== 'Not provided' && (
                  <p className="text-gray-600">{customerInfo.phone}</p>
                )}
                {customerInfo.address && (
                  <p className="text-gray-600 mt-2">
                    {customerInfo.address}
                  </p>
                )}
              </div>
            </div>

            {/* Payment Information */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-3">Payment Information</h3>
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Total Amount:</span>
                  <span className="text-2xl font-bold text-primary-600">
                    {formatPrice(booking.total_price || booking.totalPrice, booking.currency)}
                  </span>
                </div>
                <div className="flex justify-between items-center mt-2">
                  <span className="text-gray-600">Payment Method:</span>
                  <span className="text-gray-900 capitalize">
                    {booking.payment_method || booking.paymentMethod || 'Not specified'}
                  </span>
                </div>
                <div className="flex justify-between items-center mt-2">
                  <span className="text-gray-600">Payment Status:</span>
                  <span className="text-green-600 font-medium">
                    {booking.payment_status || booking.paymentStatus || 'Completed'}
                  </span>
                </div>
              </div>
            </div>

            {/* Special Requests */}
            {booking.special_requests && (
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Special Requests</h3>
                <div className="bg-gray-50 rounded-lg p-4">
                  <p className="text-gray-700">{booking.special_requests}</p>
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="sticky bottom-0 bg-white border-t border-gray-200 px-6 py-4">
          <button
            onClick={onClose}
            className="w-full bg-primary-600 text-white py-3 rounded-lg hover:bg-primary-700 transition-colors"
          >
            Close
          </button>
        </div>
      </motion.div>
    </div>
  );
};

export default BookingsSection;
