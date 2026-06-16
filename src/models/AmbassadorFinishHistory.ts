export type AmbassadorRole = "ea" | "rea";

export interface AmbassadorFinishHistory {
  parkrunnerId: string;
  finishesByEvent: Record<string, string>;
  lastImportedAt: number;
}

export type AmbassadorFinishHistoryMap = Record<
  string,
  AmbassadorFinishHistory
>;

export function ambassadorFinishHistoryKey(
  role: AmbassadorRole,
  name: string,
): string {
  return `${role}:${name}`;
}

export function parseAmbassadorFinishHistoryKey(
  key: string,
): { role: AmbassadorRole; name: string } | undefined {
  const separatorIndex = key.indexOf(":");
  if (separatorIndex <= 0) {
    return undefined;
  }

  const role = key.slice(0, separatorIndex);
  if (role !== "ea" && role !== "rea") {
    return undefined;
  }

  const name = key.slice(separatorIndex + 1);
  if (!name) {
    return undefined;
  }

  return { role, name };
}
