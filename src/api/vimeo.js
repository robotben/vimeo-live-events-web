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
  if (!res.ok) {
    const base = data.developer_message || data.error || 'Request failed';
    const invalid = data.invalid_parameters?.map(p => `${p.field}: ${p.developer_message || p.error}`).join('; ');
    throw new Error(invalid ? `${base} — ${invalid} (HTTP ${res.status})` : `${base} (HTTP ${res.status})`);
  }
  return data;
}

export async function validateToken(token) {
  return vimeoFetch(token, '/me');
}

export async function getDestinations(token) {
  try {
    const data = await vimeoFetch(token, '/me/destinations');
    // Response is keyed by platform: { youtube: { is_connected, destinations: [...] }, ... }
    return Object.entries(data).flatMap(([service, { is_connected, destinations }]) =>
      is_connected && Array.isArray(destinations)
        ? destinations.map(d => ({ service_name: service, ...d }))
        : []
    );
  } catch {
    return [];
  }
}

export async function createLiveEvent(token, { title, description }) {
  return vimeoFetch(token, '/me/live_events', {
    method: 'POST',
    body: JSON.stringify({
      title,
      stream_title: title,
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

export async function getOttDestinations(token, userId) {
  try {
    const eventsData = await vimeoFetch(token, '/me/live_events?per_page=1');
    if (!eventsData.data?.length) return [];
    const eventId = eventsData.data[0].uri.split('/').pop();
    const data = await vimeoFetch(token, `/users/${userId}/live_events/${eventId}/ott_destinations`);
    return Array.isArray(data.data) ? data.data : [];
  } catch {
    return [];
  }
}

export async function addOttDestinationToEvent(token, userId, liveEventId, destination) {
  return vimeoFetch(token, `/users/${userId}/live_events/${liveEventId}/ott_destinations`, {
    method: 'POST',
    body: JSON.stringify({ id: Number(destination.uri.split('/').pop()) }),
  });
}
