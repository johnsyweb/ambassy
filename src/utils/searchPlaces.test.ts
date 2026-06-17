import { searchPlaces } from "./geocoding";

describe("searchPlaces", () => {
  beforeEach(() => {
    global.fetch = jest.fn();
  });

  it("returns an empty list when the query is shorter than the minimum length", async () => {
    await expect(searchPlaces("ba")).resolves.toEqual([]);
    expect(global.fetch).not.toHaveBeenCalled();
  });

  it("returns place suggestions from Nominatim", async () => {
    (global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: async () => [
        {
          lat: "-37.5622",
          lon: "143.8503",
          display_name: "Ballarat, Victoria, Australia",
        },
      ],
    });

    await expect(searchPlaces("Ballarat")).resolves.toEqual([
      {
        label: "Ballarat, Victoria, Australia",
        latitude: -37.5622,
        longitude: 143.8503,
      },
    ]);

    expect(global.fetch).toHaveBeenCalledWith(
      expect.stringContaining(
        "q=Ballarat&format=json&limit=5&addressdetails=0",
      ),
    );
  });
});
