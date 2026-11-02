// ==========================================================
// lost.js — LOST PAGE: save lost reports, draw cards, "Mark as found".
// Needs script.js loaded first (readSavedData, saveSavedData, safe ...).
//
// MAP:  1. Elements   2. Draw cards   3. Remove a report
//       4. Save a new report   5. Start
// ==========================================================


// ---------- 1. ELEMENTS + SAVED DATA ----------
const lostForm = document.getElementById("lost-form");
const lostReportsBox = document.getElementById("lost-reports");
let lostReports = readSavedData("loopin-lost-reports", null);

// First visit: nothing is saved yet, so start with the example reports.
if (lostReports === null) {
  lostReports = getSampleLostReports();
  saveSavedData("loopin-lost-reports", lostReports);
}


// ---------- 2. DRAW CARDS ----------
// Make the HTML text for one Lost report card.
function makeLostCard(report) {
  const isSample = report.id.includes("lost-sample-");

  return `
    <article class="card report-card">
      <div class="card__art card__art--short card__art--${getArtClass(report.category)}">
        <span class="card__emoji">${report.emoji || getReportEmoji(report.category)}</span>
        <span class="card__tag card__tag--lost">${isSample ? "Sample · Lost item" : "Lost item"}</span>
      </div>
      <div class="card__body">
        <h3>${safe(report.name)}</h3>
        <p>${safe(report.description)}</p>
        <p class="report-card__details">${safe(report.category)} · ${safe(report.location)} · ${safe(report.date)}</p>
        <button class="btn btn--outline report-card__button" type="button" onclick="markLostItemAsFound('${report.id}')">Mark as found</button>
      </div>
    </article>
  `;
}

function showLostReports() {
  lostReportsBox.innerHTML = lostReports.map(makeLostCard).join("");

  const reportWord = lostReports.length === 1 ? " report" : " reports";
  document.getElementById("lost-count").textContent = lostReports.length + reportWord;
  setHidden(document.getElementById("empty-lost"), lostReports.length > 0);
}


// ---------- 3. REMOVE A REPORT ----------
// The owner got the item back, so remove its Lost report.
function markLostItemAsFound(reportId) {
  // filter() keeps every report EXCEPT the one with this id.
  const remainingReports = lostReports.filter(report => report.id !== reportId);

  if (saveSavedData("loopin-lost-reports", remainingReports)) {
    lostReports = remainingReports;
    showLostReports();
    showMessage("Great! The Lost report was removed.");
  }
}


// Empty the form by setting .value = "" (Section 20 to-do list idea).
function clearLostForm() {
  document.getElementById("lost-name").value = "";
  document.getElementById("lost-category").value = "";
  document.getElementById("lost-date").value = "Today";
  document.getElementById("lost-location").value = "";
  document.getElementById("lost-description").value = "";
}

// ---------- 4. SAVE A NEW REPORT (Section 20 — events) ----------
// The button is type="button" (not "submit"), so the page never reloads.
document.getElementById("lost-submit").addEventListener("click", () => {
  if (hasEmptyText(lostForm)) {
    return;
  }

  const category = document.getElementById("lost-category").value;

  const newReport = {
    id: makeNewId("lost"),
    name: document.getElementById("lost-name").value,
    category: category,
    emoji: getReportEmoji(category),
    location: document.getElementById("lost-location").value,
    date: document.getElementById("lost-date").value,
    description: document.getElementById("lost-description").value
  };

  // New report first, then the old ones (spread).
  const updatedReports = [newReport, ...lostReports];

  if (saveSavedData("loopin-lost-reports", updatedReports)) {
    lostReports = updatedReports;
    clearLostForm();
    showLostReports();
    showMessage("Your lost-item report was saved in this browser.");
  }
});


// ---------- 5. START ----------
showLostReports();
