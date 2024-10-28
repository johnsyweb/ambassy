import { EventAmbassador } from '../models/EventAmbassador';
import { EventTeam } from '../models/EventTeam';

export function associateEventAmbassadorsWithEventTeams(eventAmbassadors: EventAmbassador[], eventTeams: EventTeam[]): EventAmbassador[] {
  // Create a map to store the association
  const eventTeamMap = new Map<string, EventTeam>();

  // Populate the map with event teams
  eventTeams.forEach(team => {
    eventTeamMap.set(team.eventShortName, team);
  });

  // Associate event ambassadors with event teams
  const updatedEventAmbassadors = eventAmbassadors.map(ambassador => {
    const supportedEventTeams = eventTeams.filter(team => ambassador.events.includes(team.eventShortName));
    supportedEventTeams.forEach(team => {
      team.associatedEA = ambassador;
    });
    return { ...ambassador, supportedEventTeams };
  });

  return updatedEventAmbassadors;
}