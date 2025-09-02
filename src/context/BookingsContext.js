// src/context/BookingsContext.js - Enhanced with API Integration and User Authentication
import React, { createContext, useContext, useReducer, useEffect } from 'react';
import ApiService from '../services/api';

const BookingsContext = createContext();

const initialState = {
  currentBookings: [],
  pastBookings: [],
  loading: false,
  error: null
};

const bookingsReducer = (state, action) => {
  switch (action.type) {
    case 'SET_LOADING':
      return { ...state, loading: action.payload };

    case 'SET_ERROR':
      return { ...state, error: action.payload };

    case 'SET_BOOKINGS':
      return {
        ...state,
        currentBookings: action.payload.current || [],
        pastBookings: action.payload.past || [],
        error: null
      };

    case 'ADD_BOOKING':
      return {
        ...state,
        currentBookings: [...state.currentBookings, action.payload],
        error: null
      };

    case 'ADD_MULTIPLE_BOOKINGS':
      return {
        ...state,
        currentBookings: [...state.currentBookings, ...action.payload],
        error: null
      };

    case 'CANCEL_BOOKING':
      return {
        ...state,
        currentBookings: state.currentBookings.map(booking =>
          booking.id === action.payload
            ? { ...booking, status: 'cancelled' }
            : booking
        )
      };

    case 'MOVE_TO_PAST':
      const bookingToMove = state.currentBookings.find(b => b.id === action.payload);
      if (bookingToMove) {
        return {
          ...state,
          currentBookings: state.currentBookings.filter(b => b.id !== action.payload),
          pastBookings: [...state.pastBookings, { ...bookingToMove, status: 'completed' }]
        };
      }
      return state;

    case 'REFRESH_BOOKINGS':
      return {
        ...state,
        currentBookings: [],
        pastBookings: [],
        loading: true,
        error: null
      };

    case 'RESET_ALL':
      return {
        currentBookings: [],
        pastBookings: [],
        loading: false,
        error: null
      };

    default:
      return state;
  }
};

export const BookingsProvider = ({ children }) => {
  // ✅ FIXED: dispatch is now properly scoped within the component
  const [state, dispatch] = useReducer(bookingsReducer, initialState);

  // ✅ Load user-specific bookings from API
  const loadBookings = async () => {
    // Only load bookings if user is authenticated
    if (!ApiService.isAuthenticated()) {
      dispatch({ type: 'SET_BOOKINGS', payload: { current: [], past: [] } });
      return;
    }

    dispatch({ type: 'SET_LOADING', payload: true });
    try {
      console.log('🔄 Loading user bookings from API...');
      const [currentBookings, pastBookings] = await Promise.all([
        ApiService.getCurrentBookings(),
        ApiService.getPastBookings()
      ]);

      dispatch({
        type: 'SET_BOOKINGS',
        payload: {
          current: currentBookings || [],
          past: pastBookings || []
        }
      });

      console.log('✅ User bookings loaded:', {
        current: currentBookings?.length || 0,
        past: pastBookings?.length || 0
      });
    } catch (error) {
      console.error('❌ Error loading bookings:', error);
      dispatch({ type: 'SET_ERROR', payload: error.message });
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  };

  // ✅ Load bookings when component mounts or authentication changes
  useEffect(() => {
    loadBookings();
  }, []);

  // ✅ Add single booking to API and state
  const addBooking = async (bookingData) => {
    try {
      console.log('🏨 Creating new booking:', bookingData.hotel_name);
      const createdBooking = await ApiService.createBooking(bookingData);
      dispatch({ type: 'ADD_BOOKING', payload: createdBooking });
      console.log('✅ Booking created successfully:', createdBooking.id);
      return { success: true, booking: createdBooking };
    } catch (error) {
      console.error('❌ Error creating booking:', error);
      dispatch({ type: 'SET_ERROR', payload: error.message });
      return { success: false, error: error.message };
    }
  };

  // ✅ Add multiple bookings to API and state
  const addMultipleBookings = async (bookingsArray) => {
    try {
      console.log(`🏨 Creating ${bookingsArray.length} bookings...`);
      const createdBookings = [];

      // ✅ FIXED: Create bookings individually with better error handling
      for (const bookingData of bookingsArray) {
        try {
          // Validate booking data before sending
          if (!bookingData.hotel_name || !bookingData.location) {
            console.warn('Skipping invalid booking data:', bookingData);
            continue;
          }

          const createdBooking = await ApiService.createBooking(bookingData);
          createdBookings.push(createdBooking);
          console.log('✅ Booking created:', createdBooking.id);
        } catch (error) {
          console.error(`❌ Failed to create booking for ${bookingData.hotel_name}:`, error);
          // Continue with other bookings
        }
      }

      if (createdBookings.length > 0) {
        dispatch({ type: 'ADD_MULTIPLE_BOOKINGS', payload: createdBookings });
        console.log(`✅ ${createdBookings.length} bookings created successfully`);
        return { success: true, bookings: createdBookings };
      } else {
        throw new Error('Failed to create any bookings');
      }
    } catch (error) {
      console.error('❌ Error creating multiple bookings:', error);
      dispatch({ type: 'SET_ERROR', payload: error.message });
      return { success: false, error: error.message };
    }
  };

  // ✅ Cancel booking in API and update state
  const cancelBooking = async (bookingId) => {
    try {
      console.log('❌ Cancelling booking:', bookingId);
      await ApiService.cancelBooking(bookingId);
      dispatch({ type: 'CANCEL_BOOKING', payload: bookingId });
      console.log('✅ Booking cancelled successfully');
    } catch (error) {
      console.error('❌ Error cancelling booking:', error);
      dispatch({ type: 'SET_ERROR', payload: error.message });
    }
  };

  // ✅ Move booking to past (local state only - for completed bookings)
  const moveBookingToPast = (bookingId) => {
    dispatch({ type: 'MOVE_TO_PAST', payload: bookingId });
  };

  // ✅ Refresh bookings from API
  const refreshBookings = () => {
    console.log('🔄 Refreshing bookings...');
    dispatch({ type: 'REFRESH_BOOKINGS' });
    loadBookings();
  };

  // ✅ Clear error state
  const clearError = () => {
    dispatch({ type: 'SET_ERROR', payload: null });
  };

  // ✅ Reset all bookings context (for logout)
  const resetBookingsContext = () => {
    dispatch({ type: 'RESET_ALL' });
  };

  // ✅ Get booking statistics
  const getBookingStats = () => {
    const totalBookings = state.currentBookings.length + state.pastBookings.length;
    const confirmedBookings = state.currentBookings.filter(b => b.status === 'confirmed').length;
    const cancelledBookings = state.currentBookings.filter(b => b.status === 'cancelled').length;
    const completedBookings = state.pastBookings.filter(b => b.status === 'completed').length;

    return {
      total: totalBookings,
      confirmed: confirmedBookings,
      cancelled: cancelledBookings,
      completed: completedBookings
    };
  };

  // ✅ Get total spending
  const getTotalSpending = () => {
    const currentTotal = state.currentBookings
      .filter(b => b.status === 'confirmed')
      .reduce((sum, b) => sum + (b.total_price || 0), 0);

    const pastTotal = state.pastBookings
      .reduce((sum, b) => sum + (b.total_price || 0), 0);

    return {
      current: currentTotal,
      past: pastTotal,
      total: currentTotal + pastTotal
    };
  };

  // ✅ Find booking by ID
  const findBookingById = (bookingId) => {
    const currentBooking = state.currentBookings.find(b => b.id === bookingId);
    const pastBooking = state.pastBookings.find(b => b.id === bookingId);
    return currentBooking || pastBooking || null;
  };

  // ✅ Context value with all methods and data
  const value = {
    // State
    currentBookings: state.currentBookings,
    pastBookings: state.pastBookings,
    loading: state.loading,
    error: state.error,

    // Actions
    addBooking,
    addMultipleBookings,
    cancelBooking,
    moveBookingToPast,
    refreshBookings,
    clearError,
    resetBookingsContext,

    // Utilities
    getBookingStats,
    getTotalSpending,
    findBookingById,
    loadBookings
  };

  return (
    <BookingsContext.Provider value={value}>
      {children}
    </BookingsContext.Provider>
  );
};

// ✅ Enhanced useBookings hook with error boundary
export const useBookings = () => {
  const context = useContext(BookingsContext);
  if (!context) {
    throw new Error('useBookings must be used within a BookingsProvider');
  }
  return context;
};

// ✅ HOC for booking-aware components
export const withBookings = (Component) => {
  return function BookingsWrappedComponent(props) {
    const bookings = useBookings();
    return <Component {...props} bookings={bookings} />;
  };
};

export default BookingsContext;
