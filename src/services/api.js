// src/services/api.js - Enhanced with JWT Token Management, User-Specific Data, and Cart Support

const API_BASE_URL = process.env.REACT_APP_API_URL || 'https://backend-service-907345455681.us-central1.run.app';

class ApiService {
  constructor() {
    // ✅ Initialize with token from localStorage
    this.token = localStorage.getItem('authToken');
    this.refreshToken = localStorage.getItem('refreshToken');
    this.refreshTokenPromise = null;
    this.isRefreshing = false;
  }

  // ✅ Enhanced request method with automatic token refresh
  async request(endpoint, options = {}) {
    const url = `${API_BASE_URL}${endpoint}`;
    const config = {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
        // ✅ Add auth token if available
        ...(this.token && { 'Authorization': `Bearer ${this.token}` }),
      },
      ...options,
    };

    try {
      let response = await fetch(url, config);

      // ✅ Handle token expiration
      if (response.status === 401 && this.token && !this.isRefreshing) {
        console.log('🔄 Token expired, attempting refresh...');

        try {
          await this.refreshAccessToken();

          // ✅ Retry original request with new token
          config.headers['Authorization'] = `Bearer ${this.token}`;
          response = await fetch(url, config);
        } catch (refreshError) {
          console.error('❌ Token refresh failed:', refreshError);
          this.clearAllTokens();
          // Redirect to login or reload page
          window.location.reload();
          throw new Error('Session expired. Please log in again.');
        }
      }

      const data = await response.json();

      if (!response.ok) {
        // ✅ Handle different error types
        if (response.status === 401) {
          this.clearAllTokens();
          throw new Error('Authentication required');
        }
        throw new Error(data.detail || data.message || 'API request failed');
      }

      return data;
    } catch (error) {
      console.error(`❌ API Error (${endpoint}):`, error);
      throw error;
    }
  }

  // ✅ Token Management Methods
  setToken(token) {
    this.token = token;
    if (token) {
      localStorage.setItem('authToken', token);
    } else {
      localStorage.removeItem('authToken');
    }
  }

  setRefreshToken(refreshToken) {
    this.refreshToken = refreshToken;
    if (refreshToken) {
      localStorage.setItem('refreshToken', refreshToken);
    } else {
      localStorage.removeItem('refreshToken');
    }
  }

  clearToken() {
    this.token = null;
    localStorage.removeItem('authToken');
  }

  clearRefreshToken() {
    this.refreshToken = null;
    localStorage.removeItem('refreshToken');
  }

  clearAllTokens() {
    this.clearToken();
    this.clearRefreshToken();
    this.isRefreshing = false;
    this.refreshTokenPromise = null;
  }

  getToken() {
    return this.token;
  }

  // ✅ Automatic Token Refresh
  async refreshAccessToken() {
    // ✅ Prevent multiple simultaneous refresh attempts
    if (this.refreshTokenPromise) {
      return this.refreshTokenPromise;
    }

    if (!this.refreshToken) {
      throw new Error('No refresh token available');
    }

    this.isRefreshing = true;
    this.refreshTokenPromise = new Promise(async (resolve, reject) => {
      try {
        console.log('🔄 Refreshing access token...');

        const response = await fetch(`${API_BASE_URL}/refresh-token/`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          credentials: 'include',
          body: JSON.stringify({
            refresh_token: this.refreshToken
          }),
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.detail || 'Failed to refresh token');
        }

        // ✅ Update tokens
        this.setToken(data.access_token);
        if (data.refresh_token) {
          this.setRefreshToken(data.refresh_token);
        }

        console.log('✅ Token refreshed successfully');
        resolve(data.access_token);
      } catch (error) {
        console.error('❌ Token refresh failed:', error);
        this.clearAllTokens();
        reject(error);
      } finally {
        this.isRefreshing = false;
        this.refreshTokenPromise = null;
      }
    });

    return this.refreshTokenPromise;
  }

  // ✅ Authentication Endpoints
  async register(userData) {
    try {
      console.log('📝 Registering user:', { email: userData.email, name: userData.name });

      const result = await this.request('/register/', {
        method: 'POST',
        body: JSON.stringify({
          username: userData.name,
          password: userData.password,
          email: userData.email,
          Age: userData.age
        }),
      });

      console.log('✅ Registration successful');
      return result;
    } catch (error) {
      console.error('❌ Registration failed:', error);
      throw error;
    }
  }

  async login(credentials) {
    try {
      console.log('🔐 Logging in user:', { username: credentials.username || credentials.email });

      // ✅ Use OAuth2 token endpoint with form data
      const formData = new FormData();
      formData.append('username', credentials.username || credentials.email);
      formData.append('password', credentials.password);

      const response = await fetch(`${API_BASE_URL}/token`, {
        method: 'POST',
        body: formData,
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.detail || 'Login failed');
      }

      // ✅ Store JWT tokens
      this.setToken(result.access_token);
      if (result.refresh_token) {
        this.setRefreshToken(result.refresh_token);
      }

      console.log('✅ Login successful, JWT token stored');
      return { msg: 'Login successful', access_token: result.access_token };
    } catch (error) {
      console.error('❌ Login failed:', error);
      throw error;
    }
  }

  // In api.js - Enhanced logout method
  async logout() {
    try {
      console.log('🚪 API logout initiated...');

      // ✅ Call backend logout endpoint
      if (this.isAuthenticated()) {
        try {
          await this.request('/logout/', {
            method: 'POST',
            body: JSON.stringify({
              refresh_token: this.refreshToken
            })
          });
        } catch (error) {
          console.warn('⚠️ Backend logout failed:', error);
          // Continue with local cleanup even if backend fails
        }
      }

    } finally {
      // ✅ Always clear tokens locally
      this.clearAllTokens();

      // ✅ Clear authorization headers
      delete this.defaultHeaders?.Authorization;

      console.log('✅ API service logout completed');
    }
  }

  // ✅ User Management Endpoints
  async getCurrentUser() {
    try {
      console.log('👤 Getting current user profile...');
      return await this.request('/users/me');
    } catch (error) {
      console.error('❌ Failed to get current user:', error);
      throw error;
    }
  }

  async getUserDashboard(username) {
    try {
      console.log('📊 Getting user dashboard for:', username);
      return await this.request(`/userdashboard/?username=${encodeURIComponent(username)}`);
    } catch (error) {
      console.error('❌ Failed to get user dashboard:', error);
      throw error;
    }
  }

  // Enhanced cart item retrieval with authentication check
  async getCartItems() {
    try {
      if (!this.isAuthenticated()) {
        console.log('🔒 User not authenticated, returning empty cart');
        return [];
      }

      console.log('🛒 Loading cart items from API for authenticated user...');
      const items = await this.request('/cart/');
      console.log(`✅ Loaded ${items.length} cart items from database`);
      return items;
    } catch (error) {
      console.error('❌ Failed to get cart items:', error);
      if (error.message.includes('Authentication required')) {
        // Clear local cart if auth failed
        return [];
      }
      throw error;
    }
  }

  // Enhanced add to cart with proper user association
  async addCartItem(itemData) {
    try {
      if (!this.isAuthenticated()) {
        throw new Error('Please log in to add items to your cart');
      }

      console.log('🛒 Adding cart item to API:', itemData.hotel_name);
      const result = await this.request('/cart/', {
        method: 'POST',
        body: JSON.stringify(itemData),
      });

      console.log('✅ Cart item added to database successfully');
      return result;
    } catch (error) {
      console.error('❌ Failed to add cart item:', error);
      throw error;
    }
  }

  async updateCartItem(itemId, quantity) {
    try {
      console.log('📝 Updating cart item quantity:', { itemId, quantity });
      return await this.request(`/cart/${itemId}?quantity=${quantity}`, {
        method: 'PUT',
      });
    } catch (error) {
      console.error('❌ Failed to update cart item:', error);
      throw error;
    }
  }

  async removeCartItem(itemId) {
    try {
      console.log('🗑️ Removing cart item:', itemId);
      return await this.request(`/cart/${itemId}`, {
        method: 'DELETE',
      });
    } catch (error) {
      console.error('❌ Failed to remove cart item:', error);
      throw error;
    }
  }

  async clearCart() {
    try {
      console.log('🧹 Clearing entire cart...');
      return await this.request('/cart/', {
        method: 'DELETE',
      });
    } catch (error) {
      console.error('❌ Failed to clear cart:', error);
      throw error;
    }
  }

  // ✅ Booking Management Endpoints
  async getUserBookings() {
    try {
      console.log('📋 Getting user bookings...');
      return await this.request('/bookings/');
    } catch (error) {
      console.error('❌ Failed to get user bookings:', error);
      throw error;
    }
  }

  async getCurrentBookings() {
    try {
      console.log('📋 Getting current bookings...');
      return await this.request('/bookings/current');
    } catch (error) {
      console.error('❌ Failed to get current bookings:', error);
      throw error;
    }
  }

  async getPastBookings() {
    try {
      console.log('📋 Getting past bookings...');
      return await this.request('/bookings/past');
    } catch (error) {
      console.error('❌ Failed to get past bookings:', error);
      throw error;
    }
  }

  // In api.js - Fix createBooking method
  async createBooking(bookingData) {
    try {
      console.log('🏨 Creating new booking:', bookingData.hotel_name);

      // ✅ FIXED: Ensure proper data format
      const validatedData = {
        hotel_name: String(bookingData.hotel_name || ''),
        location: String(bookingData.location || ''),
        check_in: bookingData.check_in || new Date().toISOString().split('T')[0],
        check_out: bookingData.check_out || new Date(Date.now() + 86400000).toISOString().split('T')[0],
        rooms: parseInt(bookingData.rooms) || 1,
        guests: parseInt(bookingData.guests) || 2,
        total_price: parseInt(bookingData.total_price) || 1000,
        currency: bookingData.currency || 'INR',
        customer_info: typeof bookingData.customer_info === 'object'
          ? bookingData.customer_info
          : {
            name: 'Default User',
            email: 'user@example.com',
            phone: '+91-0000000000'
          },
        payment_method: bookingData.payment_method || 'upi',
        special_requests: bookingData.special_requests || null
      };

      console.log('📝 Sending validated data:', validatedData);

      return await this.request('/bookings/', {
        method: 'POST',
        body: JSON.stringify(validatedData),
      });
    } catch (error) {
      console.error('❌ Failed to create booking:', error);
      throw error;
    }
  }



  async createBatchBookings(bookingsArray) {
    try {
      console.log(`🏨 Creating ${bookingsArray.length} bookings in batch...`);
      return await this.request('/bookings/batch', {
        method: 'POST',
        body: JSON.stringify(bookingsArray),
      });
    } catch (error) {
      console.error('❌ Failed to create batch bookings:', error);
      throw error;
    }
  }

  async cancelBooking(bookingId) {
    try {
      console.log('❌ Cancelling booking:', bookingId);
      return await this.request(`/bookings/${bookingId}/cancel`, {
        method: 'PUT',
      });
    } catch (error) {
      console.error('❌ Failed to cancel booking:', error);
      throw error;
    }
  }

  // ✅ Hotel Search and Recommendation Endpoints
  async getRecommendations(preferences) {
    try {
      console.log('🏨 Getting hotel recommendations:', preferences);

      return await this.request('/recommend/', {
        method: 'POST',
        body: JSON.stringify(preferences),
      });
    } catch (error) {
      console.error('❌ Failed to get recommendations:', error);
      throw error;
    }
  }

  async getHotelCategories(location) {
    try {
      console.log('🏨 Getting hotel categories for:', location);

      return await this.request(`/hotel-categories/${encodeURIComponent(location)}`);
    } catch (error) {
      console.error('❌ Failed to get hotel categories:', error);
      throw error;
    }
  }

  // ✅ Chatbot Endpoints
  async sendChatMessage(message) {
    try {
      console.log('💬 Sending chat message:', message);

      return await this.request('/chatbot/', {
        method: 'POST',
        body: JSON.stringify({ message }),
      });
    } catch (error) {
      console.error('❌ Failed to send chat message:', error);
      throw error;
    }
  }

  async getChatbotStatus() {
    try {
      return await this.request('/chatbot/status');
    } catch (error) {
      console.error('❌ Failed to get chatbot status:', error);
      throw error;
    }
  }

  async getChatbotCacheInfo() {
    try {
      return await this.request('/chatbot/cache-info');
    } catch (error) {
      console.error('❌ Failed to get chatbot cache info:', error);
      throw error;
    }
  }

  async clearChatbotCache() {
    try {
      return await this.request('/chatbot/clear-cache', {
        method: 'POST',
      });
    } catch (error) {
      console.error('❌ Failed to clear chatbot cache:', error);
      throw error;
    }
  }

  // ✅ Utility Methods
  isAuthenticated() {
    return !!this.token;
  }

  async checkAuthStatus() {
    if (!this.token) {
      return false;
    }

    try {
      // ✅ Try to get current user to verify token
      await this.getCurrentUser();
      return true;
    } catch (error) {
      console.warn('⚠️ Auth check failed:', error);
      return false;
    }
  }

  // ✅ NEW: Cart to Bookings Conversion
  // In api.js - Fix checkoutCart method
  async checkoutCart(customerInfo, paymentMethod = 'upi') {
    try {
      console.log('💳 Starting cart checkout process...');

      const cartItems = await this.getCartItems();
      if (!cartItems || cartItems.length === 0) {
        throw new Error('Cart is empty');
      }

      // ✅ FIXED: Convert cart items to proper booking format
      const bookingsData = cartItems.map(item => {
        const checkInDate = new Date(item.details?.checkIn || new Date());
        const checkOutDate = new Date(item.details?.checkOut || new Date(Date.now() + 86400000));

        return {
          hotel_name: item.hotel_name,
          location: item.location,
          check_in: checkInDate.toISOString().split('T')[0],
          check_out: checkOutDate.toISOString().split('T')[0],
          rooms: parseInt(item.quantity) || 1,
          guests: parseInt(item.details?.guests) || 2,
          total_price: parseInt(item.price * item.quantity) || 1000,
          currency: 'INR',
          customer_info: {
            name: customerInfo.name || 'Guest User',
            email: customerInfo.email || 'guest@example.com',
            phone: customerInfo.phone || '+91-0000000000'
          },
          payment_method: paymentMethod,
          special_requests: item.details?.specialRequests || null
        };
      });

      console.log('📝 Formatted bookings data:', bookingsData);

      // ✅ Use individual booking creation instead of batch
      const createdBookings = [];
      for (const bookingData of bookingsData) {
        try {
          const booking = await this.createBooking(bookingData);
          createdBookings.push(booking);
        } catch (error) {
          console.error('Failed to create booking:', error);
        }
      }

      if (createdBookings.length > 0) {
        await this.clearCart();
        return {
          success: true,
          bookings: createdBookings,
          message: `Successfully created ${createdBookings.length} bookings`
        };
      } else {
        throw new Error('No bookings were created successfully');
      }

    } catch (error) {
      console.error('❌ Cart checkout failed:', error);
      return {
        success: false,
        error: error.message,
        message: 'Checkout failed. Please try again.'
      };
    }
  }


  // ✅ Request Interceptors for Debugging
  enableDebugLogging() {
    const originalRequest = this.request.bind(this);

    this.request = async (endpoint, options = {}) => {
      const startTime = Date.now();
      console.log(`🌐 API Request: ${options.method || 'GET'} ${endpoint}`);

      try {
        const result = await originalRequest(endpoint, options);
        const duration = Date.now() - startTime;
        console.log(`✅ API Success: ${endpoint} (${duration}ms)`);
        return result;
      } catch (error) {
        const duration = Date.now() - startTime;
        console.error(`❌ API Error: ${endpoint} (${duration}ms)`, error);
        throw error;
      }
    };
  }

  // ✅ Network Status Detection
  async checkNetworkStatus() {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000);

      await fetch(`${API_BASE_URL}/`, {
        method: 'HEAD',
        signal: controller.signal
      });

      clearTimeout(timeoutId);
      return { online: true, api: true };
    } catch (error) {
      return {
        online: navigator.onLine,
        api: false,
        error: error.message
      };
    }
  }

  // ✅ NEW: Batch operations for better performance
  async batchRequest(requests) {
    try {
      console.log(`🔄 Processing ${requests.length} batch requests...`);

      const promises = requests.map(({ endpoint, options = {} }) =>
        this.request(endpoint, options)
      );

      const results = await Promise.allSettled(promises);

      const successful = results.filter(r => r.status === 'fulfilled').map(r => r.value);
      const failed = results.filter(r => r.status === 'rejected').map(r => r.reason);

      console.log(`✅ Batch completed: ${successful.length} success, ${failed.length} failed`);

      return { successful, failed };
    } catch (error) {
      console.error('❌ Batch request failed:', error);
      throw error;
    }
  }

  // ✅ NEW: Data validation helpers
  validateBookingData(bookingData) {
    const required = ['hotel_name', 'location', 'check_in', 'check_out', 'rooms', 'guests', 'total_price'];
    const missing = required.filter(field => !bookingData[field]);

    if (missing.length > 0) {
      throw new Error(`Missing required fields: ${missing.join(', ')}`);
    }

    // Validate dates
    const checkIn = new Date(bookingData.check_in);
    const checkOut = new Date(bookingData.check_out);

    if (checkOut <= checkIn) {
      throw new Error('Check-out date must be after check-in date');
    }

    // Validate numbers
    if (bookingData.rooms <= 0 || bookingData.guests <= 0 || bookingData.total_price <= 0) {
      throw new Error('Rooms, guests, and price must be positive numbers');
    }

    return true;
  }

  validateCartItem(itemData) {
    const required = ['hotel_name', 'location', 'price', 'quantity'];
    const missing = required.filter(field => !itemData[field]);

    if (missing.length > 0) {
      throw new Error(`Missing required fields: ${missing.join(', ')}`);
    }

    if (itemData.price <= 0 || itemData.quantity <= 0) {
      throw new Error('Price and quantity must be positive numbers');
    }

    return true;
  }
}

// ✅ Create and export singleton instance
const apiService = new ApiService();

// ✅ Enable debug logging in development
if (process.env.NODE_ENV === 'development') {
  apiService.enableDebugLogging();
}

export default apiService;
