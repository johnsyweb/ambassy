import { EventDetails } from "./EventDetails";

export interface EventTeam {
  eventShortName: string;
  eventAmbassador: string;
  eventDirectors: string[];
  associatedEvent?: EventDetails;
}
