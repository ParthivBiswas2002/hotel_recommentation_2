// src/context/CartContext.js - Enhanced with API Integration and User Authentication
import React, { createContext, useContext, useReducer, useEffect } from 'react';
import ApiService from '../services/api';

const CartContext = createContext();

// Initial state
const initialState = {
  items: [],
  loading: false,
  error: null
};

// Enhanced reducer with API-first approach
const cartReducer = (state, action) => {
  switch (action.type) {
    case 'SET_LOADING':
      return { ...state, loading: action.payload };
    case 'SET_ERROR':
      return { ...state, error: action.payload };
    case 'SET_ITEMS':
      return {
        ...state,
        items: action.payload || [],
        error: null
      };
    case 'ADD_ITEM':
      return {
        ...state,
        items: [...state.items, action.payload],
        error: null
      };
    case 'UPDATE_ITEM':
      return {
        ...state,
        items: state.items.map(item =>
          item.id === action.payload.id ? action.payload : item
        ),
        error: null
      };
    case 'REMOVE_ITEM':
      return {
        ...state,
        items: state.items.filter(item => item.id !== action.payload)
      };
    case 'CLEAR_ITEMS':
      return {
        ...state,
        items: []
      };
    case 'RESET_ALL':
      return {
        items: [],
        loading: false,
        error: null
      };
    default:
      return state;
  }
};

export const CartProvider = ({ children }) => {
  const [state, dispatch] = useReducer(cartReducer, initialState);

  // Enhanced load cart items with authentication awareness
  const loadCartItems = async () => {
    dispatch({ type: 'SET_LOADING', payload: true });

    try {
      if (!ApiService.isAuthenticated()) {
        console.log('🔒 User not authenticated, clearing cart');
        dispatch({ type: 'SET_ITEMS', payload: [] });
        return;
      }

      console.log('🛒 Loading cart items for authenticated user...');
      const items = await ApiService.getCartItems();
      dispatch({ type: 'SET_ITEMS', payload: items });
      console.log('✅ Cart items loaded:', items.length);
    } catch (error) {
      console.error('❌ Error loading cart items:', error);

      // If authentication error, clear cart
      if (error.message.includes('Authentication') || error.message.includes('401')) {
        dispatch({ type: 'SET_ITEMS', payload: [] });
      } else {
        dispatch({ type: 'SET_ERROR', payload: error.message });
      }
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  };

  // Listen for authentication changes
  useEffect(() => {
    const handleAuthChange = () => {
      console.log('🔄 Authentication state changed, reloading cart...');
      loadCartItems();
    };

    // Load cart on mount
    loadCartItems();

    // Listen for storage changes (login/logout in other tabs)
    window.addEventListener('storage', handleAuthChange);

    return () => {
      window.removeEventListener('storage', handleAuthChange);
    };
  }, []); // Only run on mount

  useEffect(() => {
    loadCartItems();
  }, []);

  // Enhanced add to cart with authentication check
  const addToCart = async (item) => {
    try {
      if (!ApiService.isAuthenticated()) {
        dispatch({
          type: 'SET_ERROR',
          payload: 'Please log in to add items to your cart'
        });
        return { success: false, message: 'Please log in to add items to your cart' };
      }

      if (!item || !item.name || typeof item.price !== 'number') {
        throw new Error('Invalid item data: missing required fields');
      }

      if (item.price <= 0) {
        throw new Error('Invalid item price: must be greater than 0');
      }

      console.log('🛒 Adding to cart:', item.name);

      const cartItemData = {
        hotel_name: item.name,
        location: item.location || 'Unknown',
        price: item.price,
        quantity: item.quantity || 1,
        details: {
          checkIn: item.checkIn || item.details?.checkIn,
          checkOut: item.checkOut || item.details?.checkOut,
          guests: item.guests || item.details?.guests || 2,
          amenities: item.amenities || item.details?.amenities,
          specialRequests: item.specialRequests || item.details?.specialRequests
        }
      };

      const createdItem = await ApiService.addCartItem(cartItemData);
      dispatch({ type: 'ADD_ITEM', payload: createdItem });

      console.log('✅ Item added to cart successfully');
      return { success: true, message: `${item.name} added to cart` };
    } catch (error) {
      console.error('❌ Error adding to cart:', error);
      dispatch({ type: 'SET_ERROR', payload: error.message });
      return { success: false, message: error.message };
    }
  };

  // Remove item from cart via API
  const removeFromCart = async (itemId) => {
    try {
      if (!itemId) throw new Error('Invalid item ID');

      const item = state.items.find(i => i.id === itemId);
      if (!item) throw new Error('Item not found in cart');

      console.log('🗑️ Removing from cart:', item.hotel_name);
      await ApiService.removeCartItem(itemId);
      dispatch({ type: 'REMOVE_ITEM', payload: itemId });

      return { success: true, message: `${item.hotel_name} removed from cart` };
    } catch (error) {
      console.error('❌ Error removing from cart:', error);
      dispatch({ type: 'SET_ERROR', payload: error.message });
      return { success: false, message: error.message };
    }
  };

  // Update item quantity via API
  const updateQuantity = async (itemId, quantity) => {
    try {
      if (!itemId || typeof quantity !== 'number') {
        throw new Error('Invalid parameters for quantity update');
      }

      const item = state.items.find(i => i.id === itemId);
      if (!item) throw new Error('Item not found in cart');

      if (quantity <= 0) return await removeFromCart(itemId);

      console.log(`📝 Updating quantity for ${item.hotel_name}: ${item.quantity} → ${quantity}`);
      const updatedItem = await ApiService.updateCartItem(itemId, quantity);
      dispatch({ type: 'UPDATE_ITEM', payload: updatedItem });

      return { success: true, message: 'Quantity updated' };
    } catch (error) {
      console.error('❌ Error updating quantity:', error);
      dispatch({ type: 'SET_ERROR', payload: error.message });
      return { success: false, message: error.message };
    }
  };

  // Clear cart via API
  const clearCart = async () => {
    try {
      const itemCount = state.items.length;
      console.log(`🧹 Clearing cart: ${itemCount} items`);

      await ApiService.clearCart();
      dispatch({ type: 'CLEAR_ITEMS' });

      console.log('✅ Cart cleared successfully');
      return { success: true, message: `Cart cleared (${itemCount} items removed)` };
    } catch (error) {
      console.error('❌ Error clearing cart:', error);
      dispatch({ type: 'SET_ERROR', payload: error.message });
      return { success: false, message: error.message };
    }
  };

  // Utility functions
  const getCartTotal = () => {
    try {
      return state.items.reduce((total, item) => {
        const itemTotal = (item.price || 0) * (item.quantity || 0);
        return total + itemTotal;
      }, 0);
    } catch (error) {
      console.error('❌ Error calculating cart total:', error);
      return 0;
    }
  };

  const getCartCount = () => {
    try {
      return state.items.reduce((count, item) => count + (item.quantity || 0), 0);
    } catch (error) {
      console.error('❌ Error calculating cart count:', error);
      return 0;
    }
  };

  const getItemCount = () => state.items.length;

  const findCartItem = (itemId) => state.items.find(item => item.id === itemId);

  const isInCart = (itemId) => state.items.some(item => item.id === itemId);

  const getCartSummary = () => {
    const total = getCartTotal();
    const itemCount = getItemCount();
    const totalQuantity = getCartCount();

    return {
      total,
      itemCount,
      totalQuantity,
      isEmpty: itemCount === 0,
      formattedTotal: `₹${total.toLocaleString()}`,
      summary: `${itemCount} item${itemCount !== 1 ? 's' : ''} (${totalQuantity} total)`
    };
  };

  // Checkout cart (convert to bookings)
  const checkoutCart = async (customerInfo, paymentMethod = 'upi') => {
    try {
      console.log('💳 Starting cart checkout...');

      if (state.items.length === 0) {
        throw new Error('Cart is empty');
      }

      const result = await ApiService.checkoutCart(customerInfo, paymentMethod);

      if (result.success) {
        dispatch({ type: 'CLEAR_ITEMS' });
        console.log('✅ Cart checkout completed successfully');
      }

      return result;
    } catch (error) {
      console.error('❌ Cart checkout failed:', error);
      dispatch({ type: 'SET_ERROR', payload: error.message });
      return {
        success: false,
        error: error.message,
        message: 'Checkout failed. Please try again.'
      };
    }
  };

  // Reset cart context (for logout)
  const resetCartContext = () => {
    dispatch({ type: 'RESET_ALL' });
  };

  // Force reload cart (useful after login)
  const reloadCart = async () => {
    console.log('🔄 Force reloading cart data');
    await loadCartItems();
  };

  const clearError = () => {
    dispatch({ type: 'SET_ERROR', payload: null });
  };

  const refreshCart = () => {
    console.log('🔄 Refreshing cart...');
    loadCartItems();
  };

  const value = {
    // State
    items: state.items,
    loading: state.loading,
    error: state.error,

    // Basic CRUD operations
    addToCart,
    removeFromCart,
    updateQuantity,
    clearCart,

    // Utility functions
    getCartTotal,
    getCartCount,
    getItemCount,
    findCartItem,
    isInCart,
    getCartSummary,

    // Advanced operations
    checkoutCart,
    refreshCart: loadCartItems, // Use loadCartItems for refresh
    loadCartItems,
    clearError,
    resetCartContext,
    reloadCart // New method for force reload
  };

  return (
    <CartContext.Provider value={value}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};

export const withCart = (Component) => {
  return function CartWrapper(props) {
    const cart = useCart();
    return <Component {...props} cart={cart} />;
  };
};

export default CartContext;
