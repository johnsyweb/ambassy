import { associateEventTeamsWithEventDetails } from "./actions/associateEventTeamsWithEventDetails";
import { getEvents } from "./actions/fetchEvents";
import { handleFileUpload } from "./actions/uploadCSV";
import { populateEventTeamsTable } from "./actions/populateEventTeamsTable";
import { initializeMap } from "./mapView";

import { EventAmbassador } from "./models/EventAmbassador";
import { EventDetails } from "./models/EventDetails";
import { EventTeam } from "./models/EventTeam";
import { RegionalAmbassadorMap } from "./models/RegionalAmbassadorMap";
import { RegionalAmbassador } from "./models/RegionalAmbassador";
import { EventAmbassadorMap } from "./models/EventAmbassadorMap";

async function ambassy() {
  const h1Element = document.querySelector("h1");
  const uploadPrompt = document.getElementById("uploadPrompt");
  const csvFileInput = document.getElementById("csvFileInput");
  const uploadButton = document.getElementById("uploadButton");
  const mapContainer = document.getElementById("mapContainer");
  const eventTeamsTableContainer = document.getElementById(
    "eventTeamsTableContainer"
  );

  if (
    !h1Element ||
    !uploadPrompt ||
    !csvFileInput ||
    !uploadButton ||
    !mapContainer ||
    !eventTeamsTableContainer
  ) {
    console.error("Required elements not found");
    return;
  }

  const regionalAmbassadors = getRegionalAmbassadorsFromSession();
  const eventAmbassadors = getEventAmbassadorsFromSession();

  const eventDetails: EventDetails[] = await getEvents();
  if (
    eventTeams.length &&
    eventAmbassadors.size &&
    regionalAmbassadors.size
  ) {
    
    const eaIsSupportedBy = buildRALookup(regionalAmbassadors);
    const teamIsSupportedBy = buildEALookup(eventAmbassadors);

    eventTeams = associateEventTeamsWithEventDetails(eventTeams, eventDetails);
    console.log("Associated Event Teams with Event Details:", eventTeams);

    
    // Update the UI
    h1Element.textContent = "Ambassy";
    uploadPrompt.style.display = "none";
    csvFileInput.style.display = "none";
    uploadButton.style.display = "none";
    mapContainer.style.display = "block";
    eventTeamsTableContainer.style.display = "block";

    const names = [
      ...new Set([
        ...regionalAmbassadors.keys(),
        ...eventAmbassadors.keys(),
      ]),
    ];
    initializeMap(regionalAmbassadors, eventDetails, names);
    populateEventTeamsTable(regionalAmbassadors, eventAmbassadors);
  } else {
    const missingFiles = [];
    if (!eventTeams?.length) missingFiles.push("Event Teams CSV");
    if (regionalAmbassadors.size === 0){
      missingFiles.push("Regional Ambassadors CSV");
}    if (eventAmbassadors.size === 0) missingFiles.push("Event Ambassadors CSV");
    const missingFilesMessage = `Please upload the following missing files: ${missingFiles.join(
      ", "
    )}`;
    uploadPrompt.textContent = missingFilesMessage;
  }
}

// Retrieve stored event teams from session storage
let eventTeams: EventTeam[] = [];
const storedEventTeams = sessionStorage.getItem("eventTeams");
if (storedEventTeams) {
  eventTeams = JSON.parse(storedEventTeams);
  console.log("Retrieved Event Teams from session storage:", eventTeams);
}

function getEventAmbassadorsFromSession(): EventAmbassadorMap {
  const storedEventAmbassadors = sessionStorage.getItem('Event Ambassadors');
  if (storedEventAmbassadors) {
    const parsedData = JSON.parse(storedEventAmbassadors);
    return new Map<string, EventAmbassador>(parsedData);
  }
  return new Map<string, EventAmbassador>();
}

function getRegionalAmbassadorsFromSession(): RegionalAmbassadorMap {
  const storedRegionalAmbassadors = sessionStorage.getItem('Regional Ambassadors');
  if (storedRegionalAmbassadors) {
    const parsedData = JSON.parse(storedRegionalAmbassadors);
    return new Map<string, RegionalAmbassador>(parsedData);
  }
  return new Map<string, RegionalAmbassador>();
}

type NameLookup = Map<string, string>;

function buildRALookup(regionalAmbassadors: RegionalAmbassadorMap): NameLookup {
  const reverseLookupMap = new Map<string, string>();

  regionalAmbassadors.forEach((ra, raName) => {
    ra.supportsEAs.forEach(eaName => {
      reverseLookupMap.set(eaName, raName);
    });
  });

  return reverseLookupMap;
}

function buildEALookup(eventAmbassadors: EventAmbassadorMap): Map<string, string[]> {
  const reverseLookupMap = new Map<string, string[]>();

  eventAmbassadors.forEach((ea, eaName) => {
    ea.events.forEach(eventName => {
      if (!reverseLookupMap.has(eventName)) {
        reverseLookupMap.set(eventName, []);
      }
      const supportedEAs = reverseLookupMap.get(eventName);
      if (supportedEAs) {
        supportedEAs.push(eaName);
      }
    });
  });

  return reverseLookupMap;
}

document.getElementById("uploadButton")?.addEventListener("click", () => {
  const input = document.getElementById("csvFileInput") as HTMLInputElement;
  if (input.files && input.files.length > 0) {
    const file = input.files[0];
    handleFileUpload(file, (type) => {
      console.log(`Uploaded ${type} CSV file.`);
      ambassy();
    });
  } else {
    alert("Please select a CSV file to upload.");
  }
});

ambassy();
