const BASE = 'https://api.vimeo.com';

function headers(token) {
  return {
    Authorization: `Bearer ${token}`,
    'Content-Type': 'application/json',
    Accept: 'application/vnd.vimeo.*+json;version=3.4',
  };
}

async function vimeoFetch(token, path, options = {}) {
  const res = await fetch(`${BASE}${path}`, { headers: headers(token), ...options });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(`${data.developer_message || data.error || 'Request failed'} (HTTP ${res.status})`);
  return data;
}

export async function validateToken(token) {
  return vimeoFetch(token, '/me');
}

export async function getDestinations(token) {
  try {
    const data = await vimeoFetch(token, '/me/destinations');
    return Array.isArray(data.data) ? data.data : [];
  } catch {
    return [];
  }
}

export async function createLiveEvent(token, { title, description }) {
  return vimeoFetch(token, '/me/live_events', {
    method: 'POST',
    body: JSON.stringify({
      title,
      description: description || '',
      type: 'recurring',
      privacy: { view: 'anybody', embed: 'public' },
    }),
  });
}

export async function addDestinationToEvent(token, liveEventId, destination) {
  return vimeoFetch(token, `/live_events/${liveEventId}/destinations`, {
    method: 'POST',
    body: JSON.stringify({
      service_name: destination.service_name,
      display_name: destination.display_name,
      is_enabled: true,
      ...(destination.stream_url && { stream_url: destination.stream_url }),
      ...(destination.stream_key && { stream_key: destination.stream_key }),
    }),
  });
}
