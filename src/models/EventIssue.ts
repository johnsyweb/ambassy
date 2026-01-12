export interface EventIssue {
  eventShortName: string;
  eventAmbassador: string;
  regionalAmbassador: string;
  issueType: "missing_coordinates" | "missing_details";
  status: "unresolved" | "resolved";
  resolutionMethod?: "found_in_events_json" | "geocoded_address";
  resolvedAt?: number;
}
