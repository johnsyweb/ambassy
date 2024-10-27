import { ParkRunEvent } from './parkrunEvent';

export interface EventTeam {
  eventShortName: string;
  eventDirector: string;
  coEventDirector?: string;
  associatedEvent?: ParkRunEvent;
}
