# Data Model: Event History Links

**Feature**: Event History Links  
**Date**: 2026-01-14

## Overview

This feature uses existing data models without modification. It reads from EventDetailsMap and CountryMap to construct URLs.

## Entities

### EventDetails (Existing)

**Source**: `src/models/EventDetails.ts`

**Properties Used**:
- `properties.EventShortName: string` - Used as the path segment in the URL
- `properties.countrycode: number` - Used to lookup country domain

**Relationships**:
- Stored in `EventDetailsMap` (Map<string, EventDetails>) keyed by EventShortName
- Loaded from events.json API and cached in localStorage

### Country (Existing)

**Source**: `src/models/country.ts`

**Properties Used**:
- `url: string | null` - The country domain (e.g., "www.parkrun.com.au")
  - Used as the base domain in the URL
  - May be null for some countries (requires graceful handling)

**Relationships**:
- Stored in `CountryMap` (object with country code strings as keys)
- Loaded from events.json API and cached in localStorage
- Country code in EventDetails.properties.countrycode maps to CountryMap key

### EventHistoryUrl (Derived, Not Stored)

**Computed Value**: Constructed on-demand from EventDetails and Country data

**Format**: `https://${country.url}/${eventShortName}/results/eventhistory/`

**Validation Rules**:
- country.url must not be null
- country.url must be a valid domain string
- eventShortName must be a non-empty string
- Returns null if any required data is missing

## Data Flow

1. **Event Ambassador Allocation** → Contains array of event short names (`ambassador.events: string[]`)
2. **EventDetailsMap Lookup** → For each event short name, get EventDetails to access countrycode
3. **CountryMap Lookup** → Use countrycode (as string key) to get Country object with url
4. **URL Construction** → Combine country.url + eventShortName + "/results/eventhistory/"
5. **Link Creation** → Create HTML anchor element with constructed URL

## Edge Cases

- **Missing EventDetails**: If event short name not in EventDetailsMap, cannot construct URL → disable link
- **Missing Country**: If countrycode not in CountryMap, cannot construct URL → disable link  
- **Null Country URL**: If country.url is null, cannot construct URL → disable link
- **Invalid Event Short Name**: If eventShortName is empty or contains invalid characters → disable link

## State Transitions

N/A - This feature does not modify data, only reads and displays it.
