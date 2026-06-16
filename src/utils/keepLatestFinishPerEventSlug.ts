export function keepLatestFinishPerEventSlug<
  T extends { eventSlug: string; date: string },
>(finishes: T[]): T[] {
  const latestBySlug = new Map<string, T>();

  for (const finish of finishes) {
    const existing = latestBySlug.get(finish.eventSlug);
    if (!existing || finish.date > existing.date) {
      latestBySlug.set(finish.eventSlug, finish);
    }
  }

  return Array.from(latestBySlug.values());
}
