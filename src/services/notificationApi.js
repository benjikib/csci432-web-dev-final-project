import { API_BASE_URL } from '../config/api.js';

function getAuthHeaders() {
  const token = localStorage.getItem('token');
  return {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {})
  };
}

export async function getNotifications(page = 1, limit = 20) {
  const res = await fetch(`${API_BASE_URL}/notifications?page=${page}&limit=${limit}`, {
    method: 'GET',
    headers: getAuthHeaders()
  });
  if (!res.ok) throw new Error('Failed to fetch notifications');
  return res.json();
}

export async function createNotification(payload) {
  const res = await fetch(`${API_BASE_URL}/notifications`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify(payload)
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.message || 'Failed to create notification');
  }
  return res.json();
}

export async function getNotificationsForTarget(targetType, targetId) {
  const res = await fetch(`${API_BASE_URL}/notifications/target?targetType=${encodeURIComponent(targetType)}&targetId=${encodeURIComponent(targetId)}`, {
    method: 'GET',
    headers: getAuthHeaders()
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.message || 'Failed to fetch target notifications');
  }
  return res.json();
}

export async function handleNotification(notificationId, action) {
  const res = await fetch(`${API_BASE_URL}/notifications/${encodeURIComponent(notificationId)}`, {
    method: 'PUT',
    headers: getAuthHeaders(),
    body: JSON.stringify({ action })
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err?.message || 'Failed to handle notification');
  }
  return res.json();
}

export default {
  getNotifications,
  handleNotification
};
