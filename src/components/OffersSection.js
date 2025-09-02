import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaPercent, FaClock, FaMapMarkerAlt, FaStar, FaTimes, FaCalendarAlt, FaUsers, FaBed } from 'react-icons/fa';

const OffersSection = () => {
  const offers = [
    {
      id: 1,
      title: "Early Bird Special",
      description: "Book 30 days in advance and save up to 25%",
      discount: "25% OFF",
      validUntil: "2024-12-31",
      location: "Worldwide",
      image: "https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=400&h=250&fit=crop",
      rating: 4.8,
      originalPrice: 400,
      discountedPrice: 300
    },
    {
      id: 2,
      title: "Weekend Getaway",
      description: "Perfect weekend packages with breakfast included",
      discount: "30% OFF",
      validUntil: "2024-11-30",
      location: "Europe",
      image: "https://images.unsplash.com/photo-1566073771259-6a8506099945?w=400&h=250&fit=crop",
      rating: 4.6,
      originalPrice: 350,
      discountedPrice: 245
    },
    {
      id: 3,
      title: "Last Minute Deal",
      description: "Spontaneous trips at unbeatable prices",
      discount: "40% OFF",
      validUntil: "2024-10-15",
      location: "Asia",
      image: "https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=400&h=250&fit=crop",
      rating: 4.7,
      originalPrice: 280,
      discountedPrice: 168
    },
    {
      id: 4,
      title: "Family Package",
      description: "Special rates for families with kids under 12",
      discount: "20% OFF",
      validUntil: "2024-12-25",
      location: "North America",
      image: "https://images.unsplash.com/photo-1571003123894-1f0594d2b5d9?w=400&h=250&fit=crop",
      rating: 4.9,
      originalPrice: 500,
      discountedPrice: 400
    }
  ];

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.6
      }
    }
  };

  const [isOffersModalOpen, setIsOffersModalOpen] = useState(false);

  // Extended offers data for the comprehensive view
  const allOffers = [
    ...offers,
    {
      id: 5,
      title: "Student Discount",
      description: "Special rates for students with valid ID",
      discount: "15% OFF",
      validUntil: "2024-12-31",
      location: "Worldwide",
      image: "https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=400&h=250&fit=crop",
      rating: 4.3,
      originalPrice: 200,
      discountedPrice: 170
    },
    {
      id: 6,
      title: "Senior Citizen Special",
      description: "Comfortable stays for senior travelers",
      discount: "20% OFF",
      validUntil: "2024-11-30",
      location: "Asia Pacific",
      image: "https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?w=400&h=250&fit=crop",
      rating: 4.4,
      originalPrice: 300,
      discountedPrice: 240
    },
    {
      id: 7,
      title: "Corporate Travel Package",
      description: "Business travel with premium amenities",
      discount: "25% OFF",
      validUntil: "2024-10-31",
      location: "Major Cities",
      image: "https://images.unsplash.com/photo-1571003123894-1f0594d2b5d9?w=400&h=250&fit=crop",
      rating: 4.6,
      originalPrice: 400,
      discountedPrice: 300
    },
    {
      id: 8,
      title: "Honeymoon Special",
      description: "Romantic getaways for newlyweds",
      discount: "30% OFF",
      validUntil: "2024-12-25",
      location: "Romantic Destinations",
      image: "https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=400&h=250&fit=crop",
      rating: 4.8,
      originalPrice: 600,
      discountedPrice: 420
    }
  ];

  return (
    <section className="py-16 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Exclusive Offers & Deals
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Don't miss out on these limited-time offers. Book now and save big on your next stay!
          </p>
        </motion.div>

        {/* Offers Grid */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
        >
          {offers.map((offer) => (
            <motion.div
              key={offer.id}
              variants={itemVariants}
              whileHover={{ y: -10 }}
              className="bg-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden border border-gray-100"
            >
              {/* Offer Image */}
              <div className="relative h-48 overflow-hidden">
                <img
                  src={offer.image}
                  alt={offer.title}
                  className="w-full h-full object-cover transition-transform duration-300 hover:scale-110"
                />
                
                {/* Discount Badge */}
                <div className="absolute top-4 left-4 bg-red-500 text-white px-3 py-1 rounded-full text-sm font-bold flex items-center">
                  <FaPercent className="mr-1" />
                  {offer.discount}
                </div>

                {/* Rating */}
                <div className="absolute top-4 right-4 bg-white bg-opacity-90 text-gray-800 px-2 py-1 rounded-full text-sm font-semibold flex items-center">
                  <FaStar className="text-yellow-400 mr-1" />
                  {offer.rating}
                </div>
              </div>

              {/* Offer Content */}
              <div className="p-6">
                <h3 className="text-xl font-bold text-gray-900 mb-2">{offer.title}</h3>
                <p className="text-gray-600 text-sm mb-4">{offer.description}</p>

                {/* Location */}
                <div className="flex items-center text-gray-500 text-sm mb-3">
                  <FaMapMarkerAlt className="mr-2 text-primary-600" />
                  <span>{offer.location}</span>
                </div>

                {/* Valid Until */}
                <div className="flex items-center text-gray-500 text-sm mb-4">
                  <FaClock className="mr-2 text-primary-600" />
                  <span>Valid until {new Date(offer.validUntil).toLocaleDateString()}</span>
                </div>

                {/* Pricing */}
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-2">
                    <span className="text-2xl font-bold text-primary-600">
                      ${offer.discountedPrice}
                    </span>
                    <span className="text-gray-400 line-through">
                      ${offer.originalPrice}
                    </span>
                  </div>
                  <span className="text-green-600 font-semibold text-sm">
                    Save ${offer.originalPrice - offer.discountedPrice}
                  </span>
                </div>

                {/* Book Now Button */}
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="w-full bg-primary-600 text-white py-3 px-4 rounded-lg font-semibold hover:bg-primary-700 transition-colors duration-200"
                >
                  Book This Offer
                </motion.button>
              </div>
            </motion.div>
          ))}
        </motion.div>

        {/* View All Offers Button */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="text-center mt-12"
        >
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setIsOffersModalOpen(true)}
            className="bg-white border-2 border-primary-600 text-primary-600 px-8 py-3 rounded-lg font-semibold hover:bg-primary-600 hover:text-white transition-all duration-200"
          >
            View All Offers
          </motion.button>
        </motion.div>
      </div>

      {/* Comprehensive Offers Modal */}
      <AnimatePresence>
        {isOffersModalOpen && (
          <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              transition={{ duration: 0.3 }}
              className="bg-white rounded-2xl max-w-6xl w-full max-h-[90vh] overflow-y-auto"
            >
              {/* Header */}
              <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 rounded-t-2xl">
                <div className="flex justify-between items-center">
                  <div>
                    <h2 className="text-3xl font-bold text-gray-900">All Available Offers</h2>
                    <p className="text-gray-600 mt-1">Discover exclusive deals and discounts</p>
                  </div>
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => setIsOffersModalOpen(false)}
                    className="text-gray-400 hover:text-gray-600 transition-colors duration-200"
                  >
                    <FaTimes className="text-2xl" />
                  </motion.button>
                </div>
              </div>

              {/* Offers Grid */}
              <div className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {allOffers.map((offer) => (
                    <motion.div
                      key={offer.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      whileHover={{ y: -5 }}
                      className="bg-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden border border-gray-100"
                    >
                      {/* Offer Image */}
                      <div className="relative h-48 overflow-hidden">
                        <img
                          src={offer.image}
                          alt={offer.title}
                          className="w-full h-full object-cover transition-transform duration-300 hover:scale-110"
                        />
                        
                        {/* Discount Badge */}
                        <div className="absolute top-4 left-4 bg-red-500 text-white px-3 py-1 rounded-full text-sm font-bold flex items-center">
                          <FaPercent className="mr-1" />
                          {offer.discount}
                        </div>

                        {/* Rating */}
                        <div className="absolute top-4 right-4 bg-white bg-opacity-90 text-gray-800 px-2 py-1 rounded-full text-sm font-semibold flex items-center">
                          <FaStar className="text-yellow-400 mr-1" />
                          {offer.rating}
                        </div>
                      </div>

                      {/* Offer Content */}
                      <div className="p-6">
                        <h3 className="text-xl font-bold text-gray-900 mb-2">{offer.title}</h3>
                        <p className="text-gray-600 text-sm mb-4">{offer.description}</p>

                        {/* Location */}
                        <div className="flex items-center text-gray-500 text-sm mb-3">
                          <FaMapMarkerAlt className="mr-2 text-primary-600" />
                          <span>{offer.location}</span>
                        </div>

                        {/* Valid Until */}
                        <div className="flex items-center text-gray-500 text-sm mb-4">
                          <FaClock className="mr-2 text-primary-600" />
                          <span>Valid until {new Date(offer.validUntil).toLocaleDateString()}</span>
                        </div>

                        {/* Pricing */}
                        <div className="flex items-center justify-between mb-4">
                          <div className="flex items-center space-x-2">
                            <span className="text-2xl font-bold text-primary-600">
                              ${offer.discountedPrice}
                            </span>
                            <span className="text-gray-400 line-through">
                              ${offer.originalPrice}
                            </span>
                          </div>
                          <span className="text-green-600 font-semibold text-sm">
                            Save ${offer.originalPrice - offer.discountedPrice}
                          </span>
                        </div>

                        {/* Book Now Button */}
                        <motion.button
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          className="w-full bg-primary-600 text-white py-3 px-4 rounded-lg font-semibold hover:bg-primary-700 transition-colors duration-200"
                        >
                          Book This Offer
                        </motion.button>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </section>
  );
};

export default OffersSection;
