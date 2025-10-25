import { projectId, publicAnonKey } from './supabase/info';
import { supabase } from './supabase/client';

const API_BASE = `https://${projectId}.supabase.co/functions/v1/make-server-fde7e51a`;

// Helper to get auth header
async function getAuthHeader() {
  const { data: { session } } = await supabase.auth.getSession();
  return session?.access_token ? `Bearer ${session.access_token}` : `Bearer ${publicAnonKey}`;
}

// Generic fetch helper
async function apiFetch(endpoint: string, options: RequestInit = {}) {
  const authHeader = await getAuthHeader();
  
  const response = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      'Authorization': authHeader,
      ...options.headers,
    },
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: 'Request failed' }));
    throw new Error(error.error || 'Request failed');
  }

  return response.json();
}

// Auth API
export const authApi = {
  async signup(data: { email: string; password: string; name: string; role: string; phone?: string; location?: string }) {
    return apiFetch('/auth/signup', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },
  
  async login(email: string, password: string) {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    
    if (error) throw error;
    return data;
  },
  
  async logout() {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
  },
  
  async getSession() {
    const { data, error } = await supabase.auth.getSession();
    if (error) throw error;
    return data.session;
  },
};

// Listings API
export const listingsApi = {
  async getAll(filters?: { crop?: string; mandi?: string; grade?: string; status?: string }) {
    const params = new URLSearchParams();
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value) params.append(key, value);
      });
    }
    
    return apiFetch(`/listings?${params.toString()}`);
  },
  
  async getById(id: string) {
    return apiFetch(`/listings/${id}`);
  },
  
  async create(listing: any) {
    return apiFetch('/listings', {
      method: 'POST',
      body: JSON.stringify(listing),
    });
  },
  
  async update(id: string, data: any) {
    return apiFetch(`/listings/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },
  
  async delete(id: string) {
    return apiFetch(`/listings/${id}`, {
      method: 'DELETE',
    });
  },
  
  async getSupplierListings(supplierId: string) {
    return apiFetch(`/suppliers/${supplierId}/listings`);
  },
};

// Orders API
export const ordersApi = {
  async getAll() {
    return apiFetch('/orders');
  },
  
  async create(order: { listingId: string; quantity: number; message?: string }) {
    return apiFetch('/orders', {
      method: 'POST',
      body: JSON.stringify(order),
    });
  },
  
  async updateStatus(id: string, status: string) {
    return apiFetch(`/orders/${id}`, {
      method: 'PATCH',
      body: JSON.stringify({ status }),
    });
  },
};

// Mandi Rates API
export const mandiRatesApi = {
  async getAll(filters?: { crop?: string; mandi?: string; date?: string }) {
    const params = new URLSearchParams();
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value) params.append(key, value);
      });
    }
    
    return apiFetch(`/mandi-rates?${params.toString()}`);
  },
  
  async seedRates() {
    return apiFetch('/admin/seed-mandi-rates', {
      method: 'POST',
    });
  },
};

// Users API
export const usersApi = {
  async getMe() {
    return apiFetch('/users/me');
  },
  
  async updateMe(data: any) {
    return apiFetch('/users/me', {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },
  
  async getById(id: string) {
    return apiFetch(`/users/${id}`);
  },
};

// Messages/Chat API
export const messagesApi = {
  async getAll(conversationId?: string) {
    const params = conversationId ? `?conversationId=${conversationId}` : '';
    return apiFetch(`/messages${params}`);
  },
  
  async send(data: { receiverId: string; content: string; conversationId?: string; orderId?: string; offerPrice?: number }) {
    return apiFetch('/messages', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },
  
  async markRead(id: string) {
    return apiFetch(`/messages/${id}/read`, {
      method: 'PATCH',
    });
  },
};

// Reviews API
export const reviewsApi = {
  async getForUser(userId: string) {
    return apiFetch(`/reviews/${userId}`);
  },
  
  async create(data: { orderId: string; revieweeId: string; rating: number; comment?: string }) {
    return apiFetch('/reviews', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },
};

// Watchlist API
export const watchlistApi = {
  async getAll() {
    return apiFetch('/watchlist');
  },
  
  async add(data: { type: string; itemId?: string; crop?: string; mandi?: string; targetPrice?: number }) {
    return apiFetch('/watchlist', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },
  
  async remove(id: string) {
    return apiFetch(`/watchlist/${id}`, {
      method: 'DELETE',
    });
  },
};

// Notifications API
export const notificationsApi = {
  async getAll() {
    return apiFetch('/notifications');
  },
  
  async markRead(id: string) {
    return apiFetch(`/notifications/${id}/read`, {
      method: 'PATCH',
    });
  },
};

// Admin API
export const adminApi = {
  async getUsers() {
    return apiFetch('/admin/users');
  },
  
  async updateUser(id: string, data: any) {
    return apiFetch(`/admin/users/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  },
  
  async getAllListings() {
    return apiFetch('/admin/listings');
  },
  
  async getAnalytics() {
    return apiFetch('/admin/analytics');
  },
};

// Disputes API
export const disputesApi = {
  async getAll() {
    return apiFetch('/disputes');
  },
  
  async create(data: { orderId: string; reason: string; description?: string }) {
    return apiFetch('/disputes', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },
  
  async update(id: string, data: any) {
    return apiFetch(`/disputes/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  },
};