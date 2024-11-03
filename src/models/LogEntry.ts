export interface LogEntry {
  type: string;
  event: string;
  oldValue: string;
  newValue: string;
  timestamp: number;
}
