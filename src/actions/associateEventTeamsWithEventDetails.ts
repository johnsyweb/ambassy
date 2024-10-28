import { EventTeam } from '../models/EventTeam';
import { EventDetails } from '../models/EventDetails';

export function associateEventTeamsWithEventDetails(eventTeams: EventTeam[], eventDetails: EventDetails[]): EventTeam[] {
  // Create a map to store the association
  const eventDetailsMap = new Map<string, EventDetails>();

  // Populate the map with event details
  eventDetails.forEach(event => {
    eventDetailsMap.set(event.properties.EventShortName, event);
  });

  // Associate event teams with event details
  const updatedEventTeams = eventTeams.map(team => {
    const associatedEvent = eventDetailsMap.get(team.eventShortName);
    if (associatedEvent) {
      team.associatedEvent = associatedEvent;
      associatedEvent.associatedTeam = team;
    }
    return team;
  });

  return updatedEventTeams;
}