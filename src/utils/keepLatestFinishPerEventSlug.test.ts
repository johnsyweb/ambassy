import { keepLatestFinishPerEventSlug } from "./keepLatestFinishPerEventSlug";

describe("keepLatestFinishPerEventSlug", () => {
  it("keeps only the most recent finish for each event slug", () => {
    const deduped = keepLatestFinishPerEventSlug([
      {
        eventSlug: "greenheartrobinaparklands",
        eventName: "Greenheart Robina Parklands",
        date: "2024-01-01",
        domain: "www.parkrun.com.au",
      },
      {
        eventSlug: "greenheartrobinaparklands",
        eventName: "Greenheart Robina Parklands",
        date: "2026-06-13",
        domain: "www.parkrun.com.au",
      },
      {
        eventSlug: "southbank",
        eventName: "South Bank",
        date: "2025-03-01",
        domain: "www.parkrun.com.au",
      },
    ]);

    expect(deduped).toHaveLength(2);
    expect(deduped).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          eventSlug: "greenheartrobinaparklands",
          date: "2026-06-13",
        }),
        expect.objectContaining({
          eventSlug: "southbank",
          date: "2025-03-01",
        }),
      ]),
    );
  });
});
