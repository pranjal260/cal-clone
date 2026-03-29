import axios from "axios";

// API base URL — production default, can override via env for local dev
const PRODUCTION_API = "https://cal-clone-h445.onrender.com/api";
const envUrl = process.env.NEXT_PUBLIC_API_URL;
// Use env var only for local development (localhost), otherwise use production
const rawUrl = envUrl && envUrl.includes("localhost") ? envUrl : PRODUCTION_API;
const API_BASE = rawUrl.endsWith("/api") ? rawUrl : `${rawUrl}/api`;

const api = axios.create({
  baseURL: API_BASE,
  headers: { "Content-Type": "application/json" },
  timeout: 15000,
});

// ─── Users ───────────────────────────────────────────────
export const getDefaultUser = () =>
  api.get("/users/default").then((r) => r.data);

export const getUser = (id) =>
  api.get(`/users/${id}`).then((r) => r.data);

export const updateUser = (id, data) =>
  api.patch(`/users/${id}`, data).then((r) => r.data);

// ─── Event Types ─────────────────────────────────────────
export const getEventTypes = (userId) =>
  api.get(`/events?userId=${userId}`).then((r) => r.data);

export const getEventBySlug = (slug) =>
  api.get(`/events/${slug}`).then((r) => r.data);

export const createEventType = (data) =>
  api.post("/events", data).then((r) => r.data);

export const updateEventType = (id, data) =>
  api.put(`/events/${id}`, data).then((r) => r.data);

export const deleteEventType = (id, userId) =>
  api.delete(`/events/${id}`, { data: { userId } }).then((r) => r.data);

// ─── Availability ────────────────────────────────────────
export const getAvailability = (userId) =>
  api.get(`/availability/${userId}`).then((r) => r.data);

export const setAvailability = (data) =>
  api.post("/availability", data).then((r) => r.data);

export const setBulkAvailability = (data) =>
  api.put("/availability/bulk", data).then((r) => r.data);

export const deleteAvailability = (userId, dayOfWeek) =>
  api.delete(`/availability/${userId}/${dayOfWeek}`).then((r) => r.data);

// ─── Slots ───────────────────────────────────────────────
export const getAvailableSlots = (eventTypeId, date) =>
  api.get(`/slots?eventTypeId=${eventTypeId}&date=${date}`).then((r) => r.data);

// ─── Bookings ────────────────────────────────────────────
export const createBooking = (data) =>
  api.post("/bookings", data).then((r) => r.data);

export const getBookingsByUser = (userId) =>
  api.get(`/bookings/user/${userId}`).then((r) => r.data);

export const cancelBooking = (id) =>
  api.patch(`/bookings/${id}/cancel`).then((r) => r.data);

export default api;
