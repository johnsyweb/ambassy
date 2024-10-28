import { EventTeam } from '../models/EventTeam';
import { EventDetails } from '../models/EventDetails';

export function associateEventTeamsWithParkRunEvents(eventTeams: EventTeam[], parkRunEvents: EventDetails[]): EventTeam[] {
  return eventTeams.map(team => ({
    ...team,
    associatedEvent: parkRunEvents.find(event => event.properties.EventShortName === team.eventShortName)
  }));
}