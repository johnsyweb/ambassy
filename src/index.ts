import { associateEventAmbassadorsWithEventTeams } from "./actions/associateEventAmbassadorsWithEventTeams";
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

  const eventDetails: EventDetails[] = await getEvents();
  if (
    eventTeams.length &&
    eventAmbassadors.length &&
    regionalAmbassadors.size
  ) {
    eventAmbassadors = associateEventAmbassadorsWithEventTeams(
      eventAmbassadors,
      eventTeams
    );
    console.log(
      "Associated Event Ambassadors with Event Teams:",
      eventAmbassadors
    );

    eventAmbassadors = associateEventAmbassadorsWithEventTeams(
      eventAmbassadors,
      eventTeams
    );
    console.log(
      "Associated Event Ambassadors with Event Teams:",
      eventAmbassadors
    );

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
        ...eventAmbassadors.map((a) => a.name),
      ]),
    ];
    initializeMap(eventDetails, names);
    populateEventTeamsTable(regionalAmbassadors);
  } else {
    const missingFiles = [];
    if (!eventTeams?.length) missingFiles.push("Event Teams CSV");
    if (regionalAmbassadors.size === 0){
      missingFiles.push("Regional Ambassadors CSV");
}    if (!eventAmbassadors?.length) missingFiles.push("Event Ambassadors CSV");
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

// Retrieve stored event ambassadors from session storage
let eventAmbassadors: EventAmbassador[] = [];
const storedEventAmbassadors = sessionStorage.getItem("eventAmbassadors");
if (storedEventAmbassadors) {
  eventAmbassadors = JSON.parse(storedEventAmbassadors);
  console.log(
    "Retrieved Event Ambassadors from session storage:",
    eventAmbassadors
  );
}

function getRegionalAmbassadorsFromSession(): RegionalAmbassadorMap {
  const storedRegionalAmbassadors = sessionStorage.getItem('Regional Ambassadors');
  if (storedRegionalAmbassadors) {
    const parsedData = JSON.parse(storedRegionalAmbassadors);
    return new Map<string, RegionalAmbassador>(parsedData);
  }
  return new Map<string, RegionalAmbassador>();
}
const regionalAmbassadors = getRegionalAmbassadorsFromSession();

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
