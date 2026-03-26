import { EventTeam } from '@models/EventTeam';
import { loadFromStorage } from '@utils/storage';
import { csvStringCell } from '@utils/csvField';

/**
 * One row from the Event Teams CSV. Extra columns are ignored after pick.
 */
export interface EventTeamRow {
  Event: string;
  "Event Ambassador": string;
  "Event Director/s": string;
  [key: string]: string | undefined;
}

export type EventTeamMap = Map<string, EventTeam>;

function pickEventTeamRow(raw: EventTeamRow): EventTeamRow {
  return {
    Event: csvStringCell(raw["Event"]),
    "Event Ambassador": csvStringCell(raw["Event Ambassador"]),
    "Event Director/s": csvStringCell(raw["Event Director/s"]),
  };
}

export function parseEventTeams(
  data: ReadonlyArray<EventTeamRow>,
): EventTeamMap {
  const eventTeamsMap = new Map<string, EventTeam>();
  let currentEventTeam: EventTeam | null = null;

  data.forEach((raw) => {
    const row = pickEventTeamRow(raw);
    const eventShortName = row["Event"];
    const eventAmbassador = row["Event Ambassador"];
    const eventDirector = row["Event Director/s"];

    if (eventShortName) {
      if (currentEventTeam) {
        eventTeamsMap.set(currentEventTeam.eventShortName, currentEventTeam);
      }
      currentEventTeam = {
        eventShortName,
        eventAmbassador,
        eventDirectors: eventDirector ? [eventDirector] : []
      };
    } else if (currentEventTeam && eventDirector) {
      currentEventTeam.eventDirectors.push(eventDirector);
    } else {
      throw new Error("Invalid event team row" + row);
    }
  });

  if (currentEventTeam) {
    eventTeamsMap.set(currentEventTeam['eventShortName'], currentEventTeam);
  }

  return eventTeamsMap;
}

export function getEventTeamsFromSession(): EventTeamMap {
  const storedEventTeams = loadFromStorage<Array<[string, EventTeam]>>("eventTeams");
  if (storedEventTeams) {
    return new Map<string, EventTeam>(storedEventTeams);
  }
  return new Map<string, EventTeam>();
}
