// src/components/Cart.js - Enhanced Hotel Booking Cart Component with Complete Booking Flow
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FaTimes, 
  FaShoppingCart, 
  FaTrash, 
  FaMinus, 
  FaPlus, 
  FaHotel,
  FaCalendarAlt,
  FaUsers,
  FaBed,
  FaCreditCard,
  FaCheckCircle,
  FaExclamationTriangle
} from 'react-icons/fa';
import { useCart } from '../context/CartContext';
import { useBookings } from '../context/BookingsContext';

const Cart = ({ isOpen, onClose, onBookingComplete }) => {
  const { 
    items, 
    removeFromCart, 
    updateQuantity, 
    getCartTotal, 
    clearCart, 
    getCartSummary,
    checkoutCart,
    loading,
    error,
    clearError 
  } = useCart();
  
  const { addMultipleBookings } = useBookings();
  
  const [showCheckout, setShowCheckout] = useState(false);
  const [notification, setNotification] = useState(null);

  // ✅ Enhanced quantity change handler with validation
  const handleQuantityChange = async (itemId, newQuantity) => {
    if (newQuantity >= 1 && newQuantity <= 10) {
      try {
        const result = await updateQuantity(itemId, newQuantity);
        if (result.success) {
          showNotification('success', result.message);
        } else {
          showNotification('error', result.message);
        }
      } catch (error) {
        showNotification('error', 'Failed to update quantity');
      }
    }
  };

  // ✅ Enhanced remove handler with confirmation
  const handleRemove = async (item) => {
    if (window.confirm(`Remove ${item.hotel_name || item.name} from cart?`)) {
      try {
        const result = await removeFromCart(item.id);
        if (result.success) {
          showNotification('success', result.message);
        } else {
          showNotification('error', result.message);
        }
      } catch (error) {
        showNotification('error', 'Failed to remove item');
      }
    }
  };

  // ✅ Enhanced clear cart with confirmation
  const handleClearCart = async () => {
    if (window.confirm(`Remove all ${items.length} items from cart?`)) {
      try {
        const result = await clearCart();
        if (result.success) {
          showNotification('success', result.message);
        } else {
          showNotification('error', result.message);
        }
      } catch (error) {
        showNotification('error', 'Failed to clear cart');
      }
    }
  };

  // ✅ Notification system
  const showNotification = (type, message) => {
    setNotification({ type, message });
    setTimeout(() => setNotification(null), 3000);
  };

  const handleCheckout = () => {
    if (items.length === 0) {
      showNotification('error', 'Your cart is empty');
      return;
    }
    setShowCheckout(true);
  };

  const handleBackToCart = () => {
    setShowCheckout(false);
  };

  // ✅ FIXED: Handle successful booking completion
  const handleBookingSuccess = (bookingResult) => {
    console.log('📋 Booking completed:', bookingResult);
    
    // Close cart modal
    onClose();
    setShowCheckout(false);
    
    // Show success notification
    showNotification('success', `${bookingResult.bookings?.length || 1} booking(s) confirmed successfully!`);
    
    // Call the onBookingComplete callback to redirect to bookings
    if (onBookingComplete) {
      onBookingComplete();
    }
  };

  // ✅ Calculate nights for hotel bookings
  const calculateNights = (checkIn, checkOut) => {
    if (!checkIn || !checkOut) return 1;
    const nights = Math.ceil((new Date(checkOut) - new Date(checkIn)) / (1000 * 60 * 60 * 24));
    return Math.max(1, nights);
  };

  if (!isOpen) return null;

  const cartSummary = getCartSummary();

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.8 }}
        className="bg-white rounded-2xl max-w-4xl w-full max-h-[95vh] overflow-hidden flex flex-col"
      >
        {/* ✅ Enhanced Header */}
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 rounded-t-2xl">
          <div className="flex justify-between items-center">
            <div className="flex items-center">
              <FaShoppingCart className="text-2xl text-primary-600 mr-3" />
              <div>
                <h2 className="text-2xl font-bold text-gray-900">
                  {showCheckout ? 'Checkout' : 'Your Hotel Bookings'}
                </h2>
                {!showCheckout && (
                  <p className="text-sm text-gray-600">
                    {cartSummary.summary} • {cartSummary.formattedTotal}
                  </p>
                )}
              </div>
            </div>
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors duration-200 p-2"
            >
              <FaTimes className="text-xl" />
            </motion.button>
          </div>
        </div>

        {/* ✅ Notification Bar */}
        <AnimatePresence>
          {notification && (
            <motion.div
              initial={{ opacity: 0, y: -50 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -50 }}
              className={`px-6 py-3 text-sm font-medium ${
                notification.type === 'success' 
                  ? 'bg-green-100 text-green-800 border-b border-green-200' 
                  : 'bg-red-100 text-red-800 border-b border-red-200'
              }`}
            >
              <div className="flex items-center">
                {notification.type === 'success' ? (
                  <FaCheckCircle className="mr-2" />
                ) : (
                  <FaExclamationTriangle className="mr-2" />
                )}
                {notification.message}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ✅ Error Display */}
        {error && (
          <div className="px-6 py-3 bg-red-50 border-b border-red-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center text-red-800">
                <FaExclamationTriangle className="mr-2" />
                <span className="text-sm font-medium">{error}</span>
              </div>
              <button
                onClick={clearError}
                className="text-red-600 hover:text-red-800 text-sm"
              >
                Dismiss
              </button>
            </div>
          </div>
        )}

        {/* ✅ Content Area */}
        <div className="flex-1 overflow-y-auto">
          {!showCheckout ? (
            // ✅ Enhanced Cart Items View
            <div className="p-6">
              {loading ? (
                <div className="text-center py-12">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
                  <p className="text-gray-600">Loading your cart...</p>
                </div>
              ) : items.length === 0 ? (
                <div className="text-center py-12">
                  <FaHotel className="mx-auto text-6xl text-gray-300 mb-4" />
                  <h3 className="text-xl font-medium text-gray-600 mb-2">Your cart is empty</h3>
                  <p className="text-gray-500 mb-6">Add some hotels to start planning your trip!</p>
                  <button
                    onClick={onClose}
                    className="bg-primary-600 text-white px-6 py-2 rounded-lg hover:bg-primary-700 transition-colors"
                  >
                    Continue Shopping
                  </button>
                </div>
              ) : (
                <div className="space-y-6">
                  {/* ✅ Cart Items */}
                  <div className="space-y-4">
                    {items.map((item) => (
                      <motion.div
                        key={item.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="bg-gray-50 rounded-xl p-6 border border-gray-200"
                      >
                        <div className="flex items-start space-x-4">
                          {/* Hotel Image */}
                          <div className="flex-shrink-0">
                            <img
                              src={item.image || "https://images.unsplash.com/photo-1566073771259-6a8506099945?w=120&h=120&fit=crop"}
                              alt={item.hotel_name || item.name}
                              className="w-24 h-24 rounded-lg object-cover"
                              onError={(e) => {
                                e.target.src = "https://images.unsplash.com/photo-1566073771259-6a8506099945?w=120&h=120&fit=crop";
                              }}
                            />
                          </div>

                          {/* Hotel Details */}
                          <div className="flex-1 min-w-0">
                            <h4 className="font-bold text-lg text-gray-900 mb-1">
                              {item.hotel_name || item.name}
                            </h4>
                            <p className="text-sm text-gray-600 mb-2 flex items-center">
                              <span className="mr-1">📍</span>
                              {item.location}
                            </p>

                            {/* ✅ Enhanced Booking Details */}
                            {item.details && (
                              <div className="grid grid-cols-2 gap-4 mb-4 text-sm">
                                <div className="space-y-1">
                                  <div className="flex items-center text-gray-600">
                                    <FaCalendarAlt className="mr-2 text-primary-600" />
                                    <span className="font-medium">Check-in:</span>
                                  </div>
                                  <p className="text-gray-900 font-medium ml-6">
                                    {item.details.checkIn}
                                  </p>
                                </div>
                                
                                <div className="space-y-1">
                                  <div className="flex items-center text-gray-600">
                                    <FaCalendarAlt className="mr-2 text-primary-600" />
                                    <span className="font-medium">Check-out:</span>
                                  </div>
                                  <p className="text-gray-900 font-medium ml-6">
                                    {item.details.checkOut}
                                  </p>
                                </div>

                                <div className="space-y-1">
                                  <div className="flex items-center text-gray-600">
                                    <FaBed className="mr-2 text-primary-600" />
                                    <span className="font-medium">Duration:</span>
                                  </div>
                                  <p className="text-gray-900 font-medium ml-6">
                                    {calculateNights(item.details.checkIn, item.details.checkOut)} night(s)
                                  </p>
                                </div>

                                <div className="space-y-1">
                                  <div className="flex items-center text-gray-600">
                                    <FaUsers className="mr-2 text-primary-600" />
                                    <span className="font-medium">Guests:</span>
                                  </div>
                                  <p className="text-gray-900 font-medium ml-6">
                                    {item.details.guests || 2} guest{(item.details.guests || 2) > 1 ? 's' : ''}
                                  </p>
                                </div>
                              </div>
                            )}

                            {/* ✅ Enhanced Pricing */}
                            <div className="bg-white rounded-lg p-3 mb-4">
                              <div className="flex justify-between font-bold text-primary-600">
                                <span>Price per room:</span>
                                <span>₹{item.price.toLocaleString()}</span>
                              </div>
                            </div>
                          </div>

                          {/* ✅ Enhanced Controls */}
                          <div className="flex flex-col items-end space-y-3">
                            {/* Quantity Control */}
                            <div className="flex items-center space-x-2 bg-white rounded-lg border border-gray-300">
                              <button
                                onClick={() => handleQuantityChange(item.id, item.quantity - 1)}
                                disabled={item.quantity <= 1}
                                className={`p-2 rounded-l-lg transition-colors ${
                                  item.quantity <= 1 
                                    ? 'text-gray-300 cursor-not-allowed' 
                                    : 'text-gray-600 hover:bg-gray-100'
                                }`}
                              >
                                <FaMinus className="text-xs" />
                              </button>
                              
                              <div className="px-3 py-2 text-center min-w-[60px]">
                                <div className="font-bold text-gray-900">{item.quantity}</div>
                                <div className="text-xs text-gray-500">
                                  room{item.quantity > 1 ? 's' : ''}
                                </div>
                              </div>
                              
                              <button
                                onClick={() => handleQuantityChange(item.id, item.quantity + 1)}
                                disabled={item.quantity >= 10}
                                className={`p-2 rounded-r-lg transition-colors ${
                                  item.quantity >= 10 
                                    ? 'text-gray-300 cursor-not-allowed' 
                                    : 'text-gray-600 hover:bg-gray-100'
                                }`}
                              >
                                <FaPlus className="text-xs" />
                              </button>
                            </div>

                            {/* Subtotal */}
                            <div className="text-right">
                              <div className="text-lg font-bold text-primary-600">
                                ₹{(item.price * item.quantity).toLocaleString()}
                              </div>
                              <div className="text-xs text-gray-500">
                                {item.quantity > 1 && `${item.quantity} × ₹${item.price.toLocaleString()}`}
                              </div>
                            </div>

                            {/* Remove Button */}
                            <button
                              onClick={() => handleRemove(item)}
                              className="text-red-500 hover:text-red-700 hover:bg-red-50 p-2 rounded-lg transition-colors"
                              title="Remove from cart"
                            >
                              <FaTrash />
                            </button>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>

                  {/* ✅ Enhanced Cart Summary */}
                  <div className="border-t border-gray-200 pt-6">
                    <div className="bg-gray-50 rounded-xl p-6">
                      <h3 className="text-lg font-bold text-gray-900 mb-4">Booking Summary</h3>
                      
                      <div className="space-y-3 mb-6">
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-600">Total Items:</span>
                          <span className="font-medium">{cartSummary.itemCount}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-600">Total Rooms:</span>
                          <span className="font-medium">{cartSummary.totalQuantity}</span>
                        </div>
                        <div className="border-t pt-3">
                          <div className="flex justify-between text-xl font-bold">
                            <span className="text-gray-900">Grand Total:</span>
                            <span className="text-primary-600">{cartSummary.formattedTotal}</span>
                          </div>
                        </div>
                      </div>

                      {/* ✅ Enhanced Action Buttons */}
                      <div className="flex space-x-3">
                        <button
                          onClick={handleClearCart}
                          className="flex-1 px-4 py-3 border border-red-500 text-red-500 rounded-lg hover:bg-red-50 transition-colors duration-200 font-medium flex items-center justify-center"
                        >
                          <FaTrash className="mr-2" />
                          Clear Cart
                        </button>
                        <button
                          onClick={handleCheckout}
                          className="flex-2 bg-primary-600 text-white py-3 px-6 rounded-lg hover:bg-primary-700 transition-colors duration-200 font-medium flex items-center justify-center"
                        >
                          <FaCreditCard className="mr-2" />
                          Proceed to Checkout
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ) : (
            // ✅ Enhanced Checkout Form
            <CheckoutForm
              items={items}
              total={getCartTotal()}
              cartSummary={cartSummary}
              onBack={handleBackToCart}
              onSuccess={handleBookingSuccess}
              showNotification={showNotification}
              checkoutCart={checkoutCart}
            />
          )}
        </div>
      </motion.div>
    </div>
  );
};

// ✅ FIXED: Checkout Form Component with API Integration
const CheckoutForm = ({ 
  items, 
  total, 
  cartSummary, 
  onBack, 
  onSuccess, 
  showNotification,
  checkoutCart
}) => {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    state: '',
    pincode: '',
    paymentMethod: 'upi',
    specialRequests: ''
  });

  const [isProcessing, setIsProcessing] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const validateStep = (step) => {
    switch (step) {
      case 1:
        return formData.firstName && formData.lastName && formData.email && formData.phone;
      case 2:
        return formData.address && formData.city && formData.state && formData.pincode;
      case 3:
        return formData.paymentMethod;
      default:
        return true;
    }
  };

  const nextStep = () => {
    if (validateStep(currentStep)) {
      setCurrentStep(currentStep + 1);
    } else {
      showNotification('error', 'Please fill in all required fields');
    }
  };

  const prevStep = () => {
    setCurrentStep(currentStep - 1);
  };

  // ✅ FIXED: Complete booking submission with proper API integration
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateStep(3)) {
      showNotification('error', 'Please complete all required fields');
      return;
    }

    setIsProcessing(true);

    try {
      // ✅ Create customer info object
      const customerInfo = {
        name: `${formData.firstName} ${formData.lastName}`,
        email: formData.email,
        phone: formData.phone,
        address: `${formData.address}, ${formData.city}, ${formData.state} - ${formData.pincode}`
      };

      console.log('💳 Starting checkout with customer info:', customerInfo);

      // ✅ Use the checkoutCart function from CartContext
      const result = await checkoutCart(customerInfo, formData.paymentMethod);
      
      if (result.success) {
        console.log('✅ Checkout successful:', result);
        
        showNotification('success', result.message);
        
        // ✅ Call onSuccess after a short delay
        setTimeout(() => {
          onSuccess(result);
        }, 1500);
        
      } else {
        throw new Error(result.error || 'Checkout failed');
      }
      
    } catch (error) {
      console.error('❌ Payment/Booking error:', error);
      showNotification('error', error.message || 'Booking failed. Please try again.');
      setIsProcessing(false);
    }
  };

  return (
    <div className="p-6">
      {/* ✅ Step Progress Indicator */}
      <div className="mb-8">
        <div className="flex items-center justify-center space-x-4">
          {[1, 2, 3].map((step) => (
            <div key={step} className="flex items-center">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                currentStep >= step 
                  ? 'bg-primary-600 text-white' 
                  : 'bg-gray-200 text-gray-600'
              }`}>
                {step}
              </div>
              {step < 3 && (
                <div className={`w-12 h-1 mx-2 ${
                  currentStep > step ? 'bg-primary-600' : 'bg-gray-200'
                }`} />
              )}
            </div>
          ))}
        </div>
        <div className="text-center mt-2">
          <span className="text-sm text-gray-600">
            Step {currentStep} of 3: {
              currentStep === 1 ? 'Personal Information' :
              currentStep === 2 ? 'Address Details' :
              'Payment & Review'
            }
          </span>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="max-w-2xl mx-auto">
        {/* ✅ Step 1: Personal Information */}
        {currentStep === 1 && (
          <div className="space-y-6">
            <h3 className="text-xl font-bold text-gray-900 mb-4">Personal Information</h3>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  First Name *
                </label>
                <input
                  type="text"
                  name="firstName"
                  value={formData.firstName}
                  onChange={handleInputChange}
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-colors"
                  placeholder="Enter your first name"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Last Name *
                </label>
                <input
                  type="text"
                  name="lastName"
                  value={formData.lastName}
                  onChange={handleInputChange}
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-colors"
                  placeholder="Enter your last name"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email Address *
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                required
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-colors"
                placeholder="Enter your email address"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Phone Number *
              </label>
              <input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleInputChange}
                required
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-colors"
                placeholder="Enter your phone number"
              />
            </div>

            <div className="flex justify-between pt-4">
              <button
                type="button"
                onClick={onBack}
                className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
              >
                Back to Cart
              </button>
              <button
                type="button"
                onClick={nextStep}
                className="px-8 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors font-medium"
              >
                Continue
              </button>
            </div>
          </div>
        )}

        {/* ✅ Step 2: Address */}
        {currentStep === 2 && (
          <div className="space-y-6">
            <h3 className="text-xl font-bold text-gray-900 mb-4">Address Information</h3>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Street Address *
              </label>
              <input
                type="text"
                name="address"
                value={formData.address}
                onChange={handleInputChange}
                required
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-colors"
                placeholder="Enter your street address"
              />
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  City *
                </label>
                <input
                  type="text"
                  name="city"
                  value={formData.city}
                  onChange={handleInputChange}
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-colors"
                  placeholder="City"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  State *
                </label>
                <input
                  type="text"
                  name="state"
                  value={formData.state}
                  onChange={handleInputChange}
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-colors"
                  placeholder="State"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Pincode *
                </label>
                <input
                  type="text"
                  name="pincode"
                  value={formData.pincode}
                  onChange={handleInputChange}
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-colors"
                  placeholder="Pincode"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Special Requests (Optional)
              </label>
              <textarea
                name="specialRequests"
                value={formData.specialRequests}
                onChange={handleInputChange}
                rows={3}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-colors"
                placeholder="Any special requests or requirements..."
              />
            </div>

            <div className="flex justify-between pt-4">
              <button
                type="button"
                onClick={prevStep}
                className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
              >
                Previous
              </button>
              <button
                type="button"
                onClick={nextStep}
                className="px-8 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors font-medium"
              >
                Continue
              </button>
            </div>
          </div>
        )}

        {/* ✅ Step 3: Payment & Review */}
        {currentStep === 3 && (
          <div className="space-y-6">
            <h3 className="text-xl font-bold text-gray-900 mb-4">Payment & Review</h3>

            {/* Payment Method */}
            <div>
              <h4 className="text-lg font-semibold text-gray-900 mb-3">Select Payment Method</h4>
              <div className="space-y-3">
                {[
                  { value: 'upi', label: 'UPI Payment', icon: '📱' },
                  { value: 'card', label: 'Credit/Debit Card', icon: '💳' },
                  { value: 'netbanking', label: 'Net Banking', icon: '🏦' },
                  { value: 'wallet', label: 'Digital Wallet', icon: '📲' }
                ].map((method) => (
                  <label key={method.value} className="flex items-center space-x-3 p-4 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors">
                    <input
                      type="radio"
                      name="paymentMethod"
                      value={method.value}
                      checked={formData.paymentMethod === method.value}
                      onChange={handleInputChange}
                      className="text-primary-600 focus:ring-primary-500"
                    />
                    <span className="text-xl">{method.icon}</span>
                    <span className="text-gray-700 font-medium">{method.label}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* ✅ Enhanced Order Summary */}
            <div className="bg-gray-50 rounded-xl p-6">
              <h4 className="text-lg font-semibold text-gray-900 mb-4">Booking Summary</h4>
              
              <div className="space-y-4 mb-6">
                {items.map((item) => (
                  <div key={item.id} className="flex justify-between items-start py-3 border-b border-gray-200 last:border-b-0">
                    <div className="flex-1">
                      <h5 className="font-medium text-gray-900">{item.hotel_name || item.name}</h5>
                      <p className="text-sm text-gray-600">{item.location}</p>
                      {item.details && (
                        <div className="text-xs text-gray-500 mt-1">
                          {item.details.checkIn} to {item.details.checkOut} • {item.quantity} room(s)
                        </div>
                      )}
                    </div>
                    <div className="text-right ml-4">
                      <div className="font-bold text-gray-900">
                        ₹{(item.price * item.quantity).toLocaleString()}
                      </div>
                      {item.quantity > 1 && (
                        <div className="text-xs text-gray-500">
                          {item.quantity} × ₹{item.price.toLocaleString()}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              <div className="border-t border-gray-300 pt-4">
                <div className="flex justify-between items-center text-xl font-bold">
                  <span className="text-gray-900">Total Amount:</span>
                  <span className="text-primary-600">{cartSummary.formattedTotal}</span>
                </div>
                <p className="text-sm text-gray-600 mt-1">
                  {cartSummary.summary}
                </p>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex space-x-3 pt-4">
              <button
                type="button"
                onClick={prevStep}
                disabled={isProcessing}
                className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium disabled:opacity-50"
              >
                Previous
              </button>
              <button
                type="submit"
                disabled={isProcessing}
                className="flex-2 bg-primary-600 text-white py-3 px-8 rounded-lg hover:bg-primary-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
              >
                {isProcessing ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                    Processing Payment...
                  </>
                ) : (
                  <>
                    <FaCreditCard className="mr-2" />
                    Complete Booking
                  </>
                )}
              </button>
            </div>
          </div>
        )}
      </form>
    </div>
  );
};

export default Cart;
