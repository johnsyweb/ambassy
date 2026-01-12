import { EventIssue } from "./EventIssue";

export interface IssuesState {
  issues: EventIssue[];
  selectedIssue: string | null;
}

export function createIssuesState(): IssuesState {
  return {
    issues: [],
    selectedIssue: null,
  };
}

export function clearSelectedIssue(state: IssuesState): void {
  state.selectedIssue = null;
}

export function setSelectedIssue(state: IssuesState, eventShortName: string): void {
  state.selectedIssue = eventShortName;
}
