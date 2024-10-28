import { EventAmbassador } from '../models/EventAmbassador';
import { EventTeam } from '../models/EventTeam';

export function associateEventAmbassadorsWithEventTeams(eventAmbassadors: EventAmbassador[], eventTeams: EventTeam[]): EventAmbassador[] {
  return eventAmbassadors.map(ambassador => ({
    ...ambassador,
    supportedEventTeams: eventTeams.filter(team => ambassador.events.includes(team.eventShortName))
  }));
}