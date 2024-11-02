import { EventTeam } from '@models/EventTeam';

export interface EventTeamRow {
  'Event': string;
  'Event Ambassador': string;
  'Event Director/s': string;
}

export type EventTeamMap = Map<string, EventTeam>;

export function parseEventTeams(data: EventTeamRow[]): EventTeamMap {
  const eventTeamsMap = new Map<string, EventTeam>();
  let currentEventTeam: EventTeam | null = null;

  data.forEach(row => {
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
