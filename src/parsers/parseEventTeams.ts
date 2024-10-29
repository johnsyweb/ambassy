import { EventTeam } from '../models/EventTeam';

interface EventTeamRow {
  'Event': string;
  'Event Ambassador': string;
  'Event Director/s': string;
};

export function parseEventTeams(data: EventTeamRow[]): EventTeam[] {
  const eventTeams: EventTeam[] = [];
  let currentEventTeam: EventTeam | null = null;

  data.forEach(row => {
    const eventShortName = row['Event'];
    const eventAmbassador = row['Event Ambassador'];
    const eventDirector = row['Event Director/s'];

    if (eventShortName) {
      if (currentEventTeam) {
        eventTeams.push(currentEventTeam);
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
    eventTeams.push(currentEventTeam);
  }

  return eventTeams;
}