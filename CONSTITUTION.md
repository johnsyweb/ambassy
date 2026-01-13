# Ambassy Constitution

## Coordinate Handling

### Article 1: Internal Representation

All coordinates MUST be represented internally as a named pair with `latitude` and `longitude` members:

```typescript
interface Coordinate {
  latitude: number;   // Range: -90 to 90
  longitude: number;  // Range: -180 to 180
}
```

### Article 2: Display Format

All coordinates MUST be displayed in the format:

```
32.30642° N 122.61458° W
```

Where:
- Latitude is shown first, followed by longitude
- Degrees are shown with 5 decimal places
- Direction is indicated by N/S for latitude and E/W for longitude
- Positive values use N/E, negative values use S/W

### Article 3: Serialisation

All coordinates MUST be serialised as named members:

```json
{
  "latitude": -37.7939,
  "longitude": 144.9306
}
```

### Article 4: External API Compatibility

When calling external APIs, we MUST respect the API's coordinate format:

- **Leaflet.js**: Uses `[latitude, longitude]` array format
- **Parkrun API (GeoJSON)**: Uses `[longitude, latitude]` array format
- **Nominatim API**: Uses named `lat` and `lon` properties

Conversion functions MUST be used at API boundaries to maintain internal consistency.

### Article 5: Type Safety

All coordinate values MUST be validated:
- Latitude: -90 ≤ latitude ≤ 90
- Longitude: -180 ≤ longitude ≤ 180

TypeScript's type system MUST be used to enforce these constraints wherever possible.

### Article 6: Conversion Functions

The following conversion functions MUST be used at API boundaries:

- `toLeafletArray(coord: Coordinate): [number, number]` - Converts to Leaflet's [lat, lng] format
- `fromLeafletArray([lat, lng]: [number, number]): Coordinate` - Converts from Leaflet's format
- `toGeoJSONArray(coord: Coordinate): [number, number]` - Converts to GeoJSON's [lng, lat] format
- `fromGeoJSONArray([lng, lat]: [number, number]): Coordinate` - Converts from GeoJSON's format
- `formatCoordinate(coord: Coordinate): string` - Formats for display as "32.30642° N 122.61458° W"
- `parseCoordinateString(str: string): Coordinate | null` - Parses coordinate strings

### Article 7: Prohibition

The following are FORBIDDEN:
- Using array destructuring `[lat, lng]` or `[lng, lat]` for internal coordinate storage
- Storing coordinates as arrays without explicit conversion
- Hard-coding coordinate order assumptions
- Mixing coordinate formats within the same function

### Article 8: Enforcement

All code MUST:
1. Use the `Coordinate` type for internal representation
2. Use conversion functions at API boundaries
3. Display coordinates using `formatCoordinate()`
4. Validate coordinate ranges before use
5. Never assume coordinate order without explicit conversion
