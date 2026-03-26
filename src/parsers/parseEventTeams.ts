import { EventTeam } from '@models/EventTeam';
import { csvStringCell } from '@utils/csvField';

export interface EventTeamRow {
  Event: string;
  'Event Ambassador': string;
  'Event Director/s': string;
}

export type EventTeamMap = Map<string, EventTeam>;

function pickEventTeamRow(raw: Record<string, unknown>): EventTeamRow {
  return {
    Event: csvStringCell(raw['Event']),
    'Event Ambassador': csvStringCell(raw['Event Ambassador']),
    'Event Director/s': csvStringCell(raw['Event Director/s']),
  };
}

export function parseEventTeams(
  data: ReadonlyArray<Record<string, unknown>>,
): EventTeamMap {
  const eventTeamsMap = new Map<string, EventTeam>();
  let currentEventTeam: EventTeam | null = null;

  data.forEach((raw) => {
    const row = pickEventTeamRow(raw);
    const eventShortName = row['Event'];
    const eventAmbassador = row['Event Ambassador'];
    const eventDirector = row['Event Director/s'];

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
      throw new Error('Invalid event team row' + row);
    }
  });

  if (currentEventTeam) {
    eventTeamsMap.set(currentEventTeam['eventShortName'], currentEventTeam);
  }

  return eventTeamsMap;
}

import { loadFromStorage } from '@utils/storage';

export function getEventTeamsFromSession(): EventTeamMap {
  const storedEventTeams = loadFromStorage<Array<[string, EventTeam]>>("eventTeams");
  if (storedEventTeams) {
    return new Map<string, EventTeam>(storedEventTeams);
  }
  return new Map<string, EventTeam>();
}
