import { ParkRunEvent } from "./parkrunEvent";

export interface EventTeam {
  eventShortName: string;
  eventAmbassador: string;
  eventDirectors: string[];
  associatedEvent?: ParkRunEvent;
}
