import axios from 'axios';

const apiBase = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api',
});

// Interceptor for Token
apiBase.interceptors.request.use(config => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Helper to handle response
const handleResponse = (res) => res.data;
const handleError = (err) => {
  console.error("API Call Failed:", err);
  // Extract error message from response if available
  if (err.response?.data?.message) {
    err.message = err.response.data.message;
  } else if (err.response?.data) {
    err.message = typeof err.response.data === 'string' ? err.response.data : JSON.stringify(err.response.data);
  }
  throw err;
};

export const api = {
  async login(email, password) {
    try {
      const res = await apiBase.post(`/auth/login`, { email, password });
      console.log('Login response:', res.data);
      
      // Check if 2FA is required
      if (res.data.token === "2FA_REQUIRED") {
        return {
          success: true,
          data: {
            user: res.data.user,
            token: "2FA_REQUIRED"
          }
        };
      }
      
      // Normal login success
      return {
        success: true,
        data: {
          user: res.data.user,
          accessToken: res.data.token,
          refreshToken: res.data.token
        }
      };
    } catch (error) {
      console.error("Login error:", error);
      const errorMessage = error.response?.data?.message || error.message || "Login failed";
      return {
        success: false,
        message: errorMessage
      };
    }
  },

  async register(payload) {
    // My backend: POST /api/auth/register
    const res = await apiBase.post(`/auth/register`, {
      ...payload,
      role: 'Member'
    });
    return { success: true, data: res.data };
  },

  async getProfile() {
    // My backend: GET /api/users/me
    const res = await apiBase.get('/users/me');
    return { success: true, data: res.data };
  },

  async events() {
    try {
      const res = await apiBase.get(`/events?size=100`);
      const events = res.data.content || res.data || [];
      return { data: events };
    } catch (error) {
      return { data: [] };
    }
  },

  async createEvent(token, payload) {
    try {
      const res = await apiBase.post(`/events`, {
        eventName: payload.title,
        eventDate: payload.date,
        location: payload.location,
        description: payload.description,
        coverImage: payload.image || payload.coverImage,
        time: payload.time
      });
      return { success: true, data: res.data };
    } catch (error) {
      console.error("Create event error:", error);
      const errorMessage = error.response?.data?.message || error.message || "Failed to create event";
      throw new Error(errorMessage);
    }
  },

  async updateEvent(token, eventId, payload) {
    try {
      const res = await apiBase.put(`/events/${eventId}`, {
        eventName: payload.title,
        eventDate: payload.date,
        location: payload.location,
        description: payload.description,
        coverImage: payload.image || payload.coverImage,
        time: payload.time
      });
      return { success: true, data: res.data };
    } catch (error) {
      console.error("Update event error:", error);
      const errorMessage = error.response?.data?.message || error.message || "Failed to update event";
      throw new Error(errorMessage);
    }
  },

  async deleteEvent(token, eventId) {
    try {
      await apiBase.delete(`/events/${eventId}`);
      return { success: true };
    } catch (error) {
      console.error("Delete event error:", error);
      const errorMessage = error.response?.data?.message || error.message || "Failed to delete event";
      throw new Error(errorMessage);
    }
  },

  async updateUser(token, userId, data) {
    try {
      const res = await apiBase.put(`/users/${userId}`, data);
      return { success: true, data: res.data };
    } catch (error) {
      console.error("Update user error:", error);
      throw error;
    }
  },

  async approveUser(token, id) {
    try {
      await apiBase.patch(`/users/${id}/approve`);
      return { success: true };
    } catch (error) {
      console.error("Approve user error:", error);
      throw error;
    }
  },

  async rejectUser(token, id) {
    try {
      await apiBase.patch(`/users/${id}/reject`);
      return { success: true };
    } catch (error) {
      console.error("Reject user error:", error);
      throw error;
    }
  },

  async pendingUsers(token) {
    try {
      const res = await apiBase.get('/users?approved=false&size=100');
      const users = res.data.content || res.data || [];
      return { success: true, data: users };
    } catch (error) {
      return { success: false, data: [] };
    }
  },

  async approvedUsers(token) {
    try {
      const res = await apiBase.get('/users?approved=true&size=100');
      const users = res.data.content || res.data || [];
      return { success: true, data: users };
    } catch (error) {
      return { success: false, data: [] };
    }
  },

  async getAllUsers(token) {
    try {
      const res = await apiBase.get('/users?size=100');
      return { success: true, data: res.data.content || res.data || [] };
    } catch (error) {
      console.error("Get all users error:", error);
      return { success: false, data: [] };
    }
  },

  async rsvp(token, payload) {
    try {
      const res = await apiBase.post('/attendance/rsvp', payload);
      return { success: true, data: res.data };
    } catch (error) {
      throw new Error(error.response?.data?.message || error.message || "RSVP failed");
    }
  },

  async markAttendance(token, payload) {
    try {
      const res = await apiBase.post('/attendance/mark', payload);
      return { success: true, data: res.data };
    } catch (error) {
      console.error("Mark attendance error:", error);
      throw new Error(error.response?.data?.message || error.message || "Failed to mark attendance");
    }
  },

  async saveAttendance(token, payload) {
    try {
      const res = await apiBase.post('/attendance/save', payload);
      return { success: true, data: res.data };
    } catch (error) {
      console.error("Save attendance error:", error);
      throw new Error(error.response?.data?.message || error.message || "Failed to save attendance");
    }
  },

  async markPresent(token, id) {
    try {
      const res = await apiBase.patch(`/attendance/${id}/present`);
      return { success: true, data: res.data };
    } catch (error) {
      console.error("Mark present error:", error);
      throw new Error(error.response?.data?.message || error.message || "Failed to mark present");
    }
  },

  async markAbsent(token, id) {
    try {
      const res = await apiBase.patch(`/attendance/${id}/absent`);
      return { success: true, data: res.data };
    } catch (error) {
      console.error("Mark absent error:", error);
      throw new Error(error.response?.data?.message || error.message || "Failed to mark absent");
    }
  },

  async attendanceByUser(token, userId) {
    try {
      const res = await apiBase.get(`/attendance/user/${userId}`);
      return { data: res.data || [] };
    } catch (error) {
      return { data: [] };
    }
  },

  async achievements() {
    try {
      const res = await apiBase.get('/achievements');
      return { data: res.data || [] };
    } catch (e) { return { data: [] }; }
  },

  async createAchievement(payload) {
    const res = await apiBase.post('/achievements', payload);
    return { data: res.data };
  },

  async updateAchievement(id, payload) {
    const res = await apiBase.put(`/achievements/${id}`, payload);
    return { data: res.data };
  },

  async deleteAchievement(id) {
    return await apiBase.delete(`/achievements/${id}`);
  },

  async news() {
    try {
      const res = await apiBase.get('/news');
      return { data: res.data || [] };
    } catch (e) { return { data: [] }; }
  },

  async createNews(payload) {
    const res = await apiBase.post('/news', payload);
    return { data: res.data };
  },

  async updateNews(id, payload) {
    const res = await apiBase.put(`/news/${id}`, payload);
    return { data: res.data };
  },

  async deleteNews(id) {
    return await apiBase.delete(`/news/${id}`);
  },

  async resources() {
    try {
      const res = await apiBase.get('/resources');
      return { data: res.data || [] };
    } catch (e) { return { data: [] }; }
  },

  async createResource(payload) {
    const res = await apiBase.post('/resources', payload);
    return { data: res.data };
  },

  async updateResource(id, payload) {
    const res = await apiBase.put(`/resources/${id}`, payload);
    return { data: res.data };
  },

  async deleteResource(id) {
    return await apiBase.delete(`/resources/${id}`);
  },

  async allAttendance(token) {
    try {
      const res = await apiBase.get(`/attendance/all`);
      return { data: res.data || [] };
    } catch (error) {
      return { data: [] };
    }
  },

  async uploadFile(token, file) {
    // IMPROVE MOCK: return a random unsplash image instead of placeholder
    const mockImages = [
      "/hero-inkotanyi.png",
      "/logo-fpr-inkotanyi.png",
      "/hero-inkotanyi.png"
    ];
    const randomImg = mockImages[Math.floor(Math.random() * mockImages.length)];
    return { success: true, data: { url: randomImg } };
  },

  async forgotPassword(email) {
    try {
      await apiBase.post('/auth/forgot-password', { email });
      return { success: true };
    } catch (error) {
      console.error("Forgot password error:", error);
      throw new Error(error.response?.data?.message || error.message || "Failed to send reset email");
    }
  },

  async resetPassword(token, newPassword) {
    try {
      await apiBase.post('/auth/reset-password', { token, newPassword });
      return { success: true };
    } catch (error) {
      console.error("Reset password error:", error);
      throw new Error(error.response?.data?.message || error.message || "Failed to reset password");
    }
  },

  async verify2FA(email, code) {
    try {
      const res = await apiBase.post('/auth/verify-2fa', { email, code });
      return {
        success: true,
        data: {
          user: res.data.user,
          accessToken: res.data.token
        }
      };
    } catch (error) {
      console.error("2FA verification error:", error);
      throw new Error(error.response?.data?.message || error.message || "Invalid verification code");
    }
  },

  async resend2FA(email) {
    try {
      await apiBase.post('/auth/resend-2fa', { email });
      return { success: true };
    } catch (error) {
      console.error("Resend 2FA error:", error);
      throw new Error(error.response?.data?.message || error.message || "Failed to resend code");
    }
  }
};
