import { EventTeam } from '../models/EventTeam';
import { ParkRunEvent } from '../models/parkrunEvent';

export function associateEventTeamsWithParkRunEvents(eventTeams: EventTeam[], parkRunEvents: ParkRunEvent[]): EventTeam[] {
  return eventTeams.map(team => ({
    ...team,
    associatedEvent: parkRunEvents.find(event => event.properties.EventShortName === team.eventShortName)
  }));
}