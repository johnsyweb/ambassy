import { EventTeam } from '../models/EventTeam';
import { EventTeamMap } from '../models/EventTeamMap';

export interface EventTeamRow {
  'Event': string;
  'Event Ambassador': string;
  'Event Director/s': string;
};

export function parseEventTeams(data: EventTeamRow[]): EventTeamMap {
  const eventTeamMap: EventTeamMap = new Map<string, EventTeam>();
  let currentEventTeam: EventTeam | null = null;

  data.forEach(row => {
    const eventShortName = row['Event'];
    const eventAmbassador = row['Event Ambassador'];
    const eventDirector = row['Event Director/s'];

    if (eventShortName) {
      if (currentEventTeam) {
        eventTeamMap.set(eventShortName, currentEventTeam);
      }
      currentEventTeam = {
        eventShortName,
        eventAmbassador,
        eventDirectors: eventDirector ? [eventDirector] : []
      };
    } else if (currentEventTeam && eventDirector) {
      currentEventTeam.eventDirectors.push(eventDirector);
    }
  });

  if (currentEventTeam) {
    eventTeamMap.set(currentEventTeam['eventShortName'], currentEventTeam);
  }

  return eventTeamMap;
}