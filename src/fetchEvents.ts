import axios from 'axios';
import { ParkRunEvent } from './models/parkrunEvent';

const CACHE_KEY = 'parkrun_events_cache';
const CACHE_DURATION = 24 * 60 * 60 * 1000; // 24 hours in milliseconds
const PARKRUN_EVENTS_URL = 'https://images.parkrun.com/events.json';

async function fetchEvents(): Promise<void> {
  try {
    const response = await axios.get(PARKRUN_EVENTS_URL);
    const events = response.data.events.features as ParkRunEvent[];

    // Save the events to localStorage
    localStorage.setItem(CACHE_KEY, JSON.stringify({ timestamp: Date.now(), events }));
    console.log('Events fetched and cached successfully.');
  } catch (error) {
    console.error('Error fetching events:', error);
  }
}

function getCachedEvents(): ParkRunEvent[] | null {
  const cache = localStorage.getItem(CACHE_KEY);
  if (cache) {
    const parsedCache = JSON.parse(cache);
    const age = Date.now() - parsedCache.timestamp;

    if (age < CACHE_DURATION) {
      return parsedCache.events;
    }
  }
  return null;
}

export async function getEvents(): Promise<ParkRunEvent[]> {
  const cachedEvents = getCachedEvents();

  if (cachedEvents) {
    console.log('Returning cached events.');
    return cachedEvents;
  } else {
    await fetchEvents();
    return getCachedEvents() || [];
  }
}
