import axios from 'axios';
import { EventDetails } from '../models/EventDetails';
import { EventDetailsMap } from '../models/EventDetailsMap';

const CACHE_KEY = 'parkrun events';
const CACHE_DURATION = 24 * 60 * 60 * 1000; // 24 hours in milliseconds
const PARKRUN_EVENTS_URL = 'https://images.parkrun.com/events.json';

async function fetchEvents(): Promise<void> {
  try {
    const response = await axios.get(PARKRUN_EVENTS_URL);
    const events = response.data.events.features as EventDetails[];

    const eventDetailsMap: EventDetailsMap = new Map<string, EventDetails>();
    events.forEach(event => {
      eventDetailsMap.set(event.properties.EventShortName, event);
    });

    // Save the events to localStorage
    localStorage.setItem(CACHE_KEY, JSON.stringify({
       timestamp: Date.now(), 
       eventDetailsMap: Array.from(eventDetailsMap.entries()) 
      }));
    console.log('Events fetched and cached successfully.');
  } catch (error) {
    console.error('Error fetching events:', error);
  }
}

function getCachedEvents(): EventDetailsMap | null {
  const cache = localStorage.getItem(CACHE_KEY);
  if (cache) {
    const parsedCache = JSON.parse(cache);
    const age = Date.now() - parsedCache.timestamp;

    if (age < CACHE_DURATION) {
      return new Map<string, EventDetails>(parsedCache.eventDetailsMap);
    }
  }
  return null;
}

export async function getEvents(): Promise<EventDetailsMap> {
  const cachedEvents = getCachedEvents();

  if (cachedEvents) {
    console.log('Returning cached events.');
    return cachedEvents;
  } else {
    await fetchEvents();
    return getCachedEvents() || new Map<string, EventDetails>();
  }
}
