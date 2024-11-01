import { EventTeam } from "./EventTeam";

export interface EventAmbassador {
  name: string;
  events: string[];
  supportedEventTeams?: EventTeam[];
}
