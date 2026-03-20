import axios from "axios";

// Create Axios instance
export const api = axios.create({
	baseURL: import.meta.env.VITE_API_URL || "http://localhost:5000/",
});

// Request interceptor to append the access token
api.interceptors.request.use(
	(config) => {
		const token = localStorage.getItem("token");
		if (token) {
			config.headers.Authorization = `Bearer ${token}`;
		}
		return config;
	},
	(error) => Promise.reject(error)
);

// Response interceptor to handle 401s and token refresh
api.interceptors.response.use(
	(response) => response,
	async (error) => {
		const originalRequest = error.config;
		const isAuthEndpoint = originalRequest.url?.includes('/auth/login') || originalRequest.url?.includes('/auth/register');

		if (error.response?.status === 401 && !originalRequest._retry && !isAuthEndpoint) {
			originalRequest._retry = true;

			try {
				const refreshToken = localStorage.getItem("refreshToken");
				if (!refreshToken) {
					throw new Error("No refresh token available");
				}

				const { data } = await axios.post('/api/auth/refresh', {
					refreshToken,
				}, { baseURL: api.defaults.baseURL });

				localStorage.setItem("token", data.token);
				localStorage.setItem("refreshToken", data.refreshToken);
				originalRequest.headers.Authorization = `Bearer ${data.token}`;

				return api(originalRequest);
			} catch (refreshError) {
				// Refresh failed - log out
				localStorage.removeItem("token");
				localStorage.removeItem("refreshToken");
				localStorage.removeItem("user");
				window.location.href = "/";
				return Promise.reject(refreshError);
			}
		}

		return Promise.reject(error);
	}
);
