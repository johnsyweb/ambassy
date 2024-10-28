import { EventTeam } from "./EventTeam";
import { RegionalAmbassador } from "./RegionalAmbassador";

export interface EventAmbassador {
  name: string;
  events: string[];
  supportedEventTeams?: EventTeam[];
  regionalAmbassador?: RegionalAmbassador;
}
