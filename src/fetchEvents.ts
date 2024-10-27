import axios from 'axios';
import fs from 'fs';
import path from 'path';

const CACHE_FILE = path.resolve(__dirname, '../cache/events.json');
const CACHE_DURATION = 24 * 60 * 60 * 1000; // 24 hours in milliseconds
const PARKRUN_EVENTS_URL = 'https://images.parkrun.com/events.json'; 

async function fetchEvents(): Promise<void> {
  try {
    const response = await axios.get(PARKRUN_EVENTS_URL);
    const events = response.data;

    // Save the events to the cache file
    fs.writeFileSync(CACHE_FILE, JSON.stringify({ timestamp: Date.now(), events }));
    console.log('Events fetched and cached successfully.');
  } catch (error) {
    console.error('Error fetching events:', error);
  }
}

function getCachedEvents(): any | null {
  if (fs.existsSync(CACHE_FILE)) {
    const cache = JSON.parse(fs.readFileSync(CACHE_FILE, 'utf-8'));
    const age = Date.now() - cache.timestamp;

    if (age < CACHE_DURATION) {
      return cache.events;
    }
  }
  return null;
}

export async function getEvents(): Promise<any> {
  const cachedEvents = getCachedEvents();

  if (cachedEvents) {
    console.log('Returning cached events.');
    return cachedEvents;
  } else {
    await fetchEvents();
    return getCachedEvents();
  }
}
