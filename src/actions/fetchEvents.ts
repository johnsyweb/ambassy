import axios from "axios";
import { EventDetails } from "@models/EventDetails";
import { EventDetailsMap } from "@models/EventDetailsMap";
import { CountryMap } from "@models/country";

const CACHE_KEY = "parkrun events";
const COUNTRIES_CACHE_KEY = "parkrun countries";
const CACHE_DURATION = 24 * 60 * 60 * 1000; // 24 hours in milliseconds
const PARKRUN_EVENTS_URL = "https://images.parkrun.com/events.json";

async function fetchEvents(): Promise<void> {
  try {
    const response = await axios.get(PARKRUN_EVENTS_URL);
    const events = response.data.events.features as EventDetails[];
    const countriesData = response.data.countries as CountryMap;

    const eventDetailsMap: EventDetailsMap = new Map<string, EventDetails>();
    events.forEach((event) => {
      eventDetailsMap.set(event.properties.EventShortName, event);
    });

    // Preserve manually resolved events from existing cache
    const existingCache = localStorage.getItem(CACHE_KEY);
    if (existingCache) {
      try {
        const parsedCache = JSON.parse(existingCache);
        if (parsedCache.eventDetailsMap) {
          const existingEvents = new Map<string, EventDetails>(
            parsedCache.eventDetailsMap,
          );
          // Add any manually resolved events that aren't in the fresh API data
          existingEvents.forEach((event, key) => {
            if (!eventDetailsMap.has(key)) {
              eventDetailsMap.set(key, event);
            }
          });
        }
      } catch {
        // Ignore parse errors, proceed with fresh data
      }
    }

    // Save the merged events to localStorage
    localStorage.setItem(
      CACHE_KEY,
      JSON.stringify({
        timestamp: Date.now(),
        eventDetailsMap: Array.from(eventDetailsMap.entries()),
      }),
    );

    // Save countries to localStorage
    if (countriesData) {
      localStorage.setItem(
        COUNTRIES_CACHE_KEY,
        JSON.stringify({
          timestamp: Date.now(),
          countries: countriesData,
        }),
      );
    }

    console.log("Events and countries fetched and cached successfully.");
  } catch (error) {
    console.error("Error fetching events:", error);
  }
}

export async function getEvents(): Promise<EventDetailsMap> {
  const cache = localStorage.getItem(CACHE_KEY);
  if (cache) {
    try {
      const parsedCache = JSON.parse(cache);
      const cacheAge = Date.now() - (parsedCache.timestamp || 0);
      if (cacheAge < CACHE_DURATION && parsedCache.eventDetailsMap) {
        console.log("Returning cached events.");
        return new Map<string, EventDetails>(parsedCache.eventDetailsMap);
      }
    } catch {
      // Cache is corrupted, refetch
    }
  }

  // Cache doesn't exist or is expired/corrupted
  await fetchEvents();
  const freshCache = localStorage.getItem(CACHE_KEY);
  if (freshCache) {
    try {
      const parsedCache = JSON.parse(freshCache);
      if (parsedCache.eventDetailsMap) {
        return new Map<string, EventDetails>(parsedCache.eventDetailsMap);
      }
    } catch {
      // Ignore
    }
  }
  return new Map<string, EventDetails>();
}

export async function getCountries(): Promise<CountryMap> {
  const cache = localStorage.getItem(COUNTRIES_CACHE_KEY);
  if (cache) {
    try {
      const parsedCache = JSON.parse(cache);
      const cacheAge = Date.now() - (parsedCache.timestamp || 0);
      if (cacheAge < CACHE_DURATION && parsedCache.countries) {
        console.log("Returning cached countries.");
        return parsedCache.countries as CountryMap;
      }
    } catch {
      // Cache is corrupted, refetch
    }
  }

  // Cache doesn't exist or is expired/corrupted - fetch events which also fetches countries
  await fetchEvents();
  const freshCache = localStorage.getItem(COUNTRIES_CACHE_KEY);
  if (freshCache) {
    try {
      const parsedCache = JSON.parse(freshCache);
      if (parsedCache.countries) {
        return parsedCache.countries as CountryMap;
      }
    } catch {
      // Ignore
    }
  }

  // Fallback to empty map if countries couldn't be loaded
  return {};
}
