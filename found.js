// ==========================================================
// found.js — FOUND PAGE: save found reports + suggest possible Lost matches.
// Needs script.js loaded first (readSavedData, saveSavedData, safe ...).
//
// MAP:  1. Elements   2. Match score   3. Show matches
//       4. Draw cards   5. Remove a report   6. Save a new report   7. Start
// ==========================================================


// ---------- 1. ELEMENTS + SAVED DATA ----------
const foundForm = document.getElementById("found-form");
const foundReportsBox = document.getElementById("found-reports");
let foundReports = readSavedData("loopin-found-reports", null);

// First visit: nothing is saved yet, so start with the example reports.
if (foundReports === null) {
  foundReports = getSampleFoundReports();
  saveSavedData("loopin-found-reports", foundReports);
}


// ---------- 2. MATCH SCORE (a simple word + category check, not AI) ----------

// Turn a sentence into a list of useful UPPERCASE words (so "Bottle" and "bottle" match).
//
// MENTOR NOTE: .match() with regex is EXTRA (the notes show .test()).
// - Section 22: pattern.test(text) answers true / false.
// - .match(pattern) is its sibling: it returns the matching words themselves.
// - /[A-Z0-9]+/g means: one or more letters or numbers (+), and g = find ALL
//   such words, so commas and spaces are skipped.
// - If nothing matches, .match() gives null. "|| []" then uses an empty array,
//   so forEach below does not crash.
function getUsefulWords(sentence) {
  // Regex /[A-Z0-9]+/g finds every word made of letters and numbers (Section 22).
  const words = sentence.toUpperCase().match(/[A-Z0-9]+/g) || [];

  // Words that say nothing useful about an item.
  const ignoredWords = ["THE", "AND", "FOR", "WITH", "FROM", "NEAR", "THIS", "THAT", "WAS", "HAS", "HAVE", "FOUND", "LOST", "ITEM", "SOMEONE", "SMALL"];
  const usefulWords = [];

  words.forEach(originalWord => {
    let word = originalWord;

    // Compare "bottles" as "bottle" (remove the last letter "s").
    if (word.length > 4 && word[word.length - 1] === "S") {
      word = word.slice(0, word.length - 1);
    }

    if (word.length > 2 && !ignoredWords.includes(word) && !usefulWords.includes(word)) {
      usefulWords.push(word);
    }
  });

  return usefulWords;
}

// Count how many words two lists have in common.
function countSharedWords(firstWords, secondWords) {
  const sharedWords = firstWords.filter(word => secondWords.includes(word));
  return sharedWords.length;
}

// Give a Lost + Found pair a score. A higher score = a better match.
function getMatchScore(lostReport, foundReport) {
  let score = 0;

  // Same item type = 2 points.
  if (lostReport.category === foundReport.category) {
    score = score + 2;
  }

  // Shared words in the NAME: 2 points each, at most 4.
  const namePoints = countSharedWords(getUsefulWords(lostReport.name), getUsefulWords(foundReport.name)) * 2;
  score = score + (namePoints > 4 ? 4 : namePoints);

  // Shared words in the DESCRIPTION: 1 point each, at most 2.
  const descriptionPoints = countSharedWords(getUsefulWords(lostReport.description), getUsefulWords(foundReport.description));
  score = score + (descriptionPoints > 2 ? 2 : descriptionPoints);

  // Shared words in the LOCATION: 1 point each, at most 2.
  const locationPoints = countSharedWords(getUsefulWords(lostReport.location), getUsefulWords(foundReport.location));
  score = score + (locationPoints > 2 ? 2 : locationPoints);

  return score;
}


// ---------- 3. SHOW POSSIBLE MATCHES ----------
function showPossibleMatches() {
  const matchBox = document.getElementById("match-suggestions");
  const lostReports = readSavedData("loopin-lost-reports", getSampleLostReports());
  let matchHtml = "";

  // Compare every Found report with every Lost report (loop inside a loop).
  foundReports.forEach(foundReport => {
    lostReports.forEach(lostReport => {
      // 3 points or more = worth showing.
      if (getMatchScore(lostReport, foundReport) >= 3) {
        matchHtml += `
          <article class="match-panel__card">
            <strong>Possible match: ${safe(lostReport.name)}</strong>
            <p>Someone lost this near ${safe(lostReport.location)}. A similar item was found near ${safe(foundReport.location)}.</p>
          </article>
        `;
      }
    });
  });

  if (matchHtml === "") {
    matchHtml = `<p class="match-panel__empty">No possible matches yet. Add clear item and location details to help LOOPIN compare reports.</p>`;
  }

  matchBox.innerHTML = matchHtml;
}


// ---------- 4. DRAW CARDS ----------
// Make the HTML text for one Found report card.
function makeFoundCard(report) {
  const isSample = report.id.includes("found-sample-");

  return `
    <article class="card report-card">
      <div class="card__art card__art--short card__art--${getArtClass(report.category)}">
        <span class="card__emoji">${report.emoji || getReportEmoji(report.category)}</span>
        <span class="card__tag card__tag--found">${isSample ? "Sample · Found item" : "Found item"}</span>
      </div>
      <div class="card__body">
        <h3>${safe(report.name)}</h3>
        <p>${safe(report.description)}</p>
        <p class="report-card__details">${safe(report.category)} · ${safe(report.location)} · ${safe(report.date)}</p>
        <button class="btn btn--outline report-card__button" type="button" onclick="markFoundItemAsReturned('${report.id}')">Returned to owner</button>
      </div>
    </article>
  `;
}

function showFoundReports() {
  foundReportsBox.innerHTML = foundReports.map(makeFoundCard).join("");

  const reportWord = foundReports.length === 1 ? " report" : " reports";
  document.getElementById("found-count").textContent = foundReports.length + reportWord;
  setHidden(document.getElementById("empty-found"), foundReports.length > 0);

  showPossibleMatches();
}


// ---------- 5. REMOVE A REPORT ----------
// The owner took the item back, so remove its Found report.
function markFoundItemAsReturned(reportId) {
  // filter() keeps every report EXCEPT the one with this id (same idea as lost.js).
  const remainingReports = foundReports.filter(report => report.id !== reportId);

  if (saveSavedData("loopin-found-reports", remainingReports)) {
    foundReports = remainingReports;
    showFoundReports();
    showMessage("Great! The Found report was removed.");
  }
}


// Empty the form by setting .value = "" (Section 20 to-do list idea).
function clearFoundForm() {
  document.getElementById("found-name").value = "";
  document.getElementById("found-category").value = "";
  document.getElementById("found-date").value = "Today";
  document.getElementById("found-location").value = "";
  document.getElementById("found-description").value = "";
}

// ---------- 6. SAVE A NEW REPORT (Section 20 — events) ----------
// The button is type="button" (not "submit"), so the page never reloads.
document.getElementById("found-submit").addEventListener("click", () => {
  if (hasEmptyText(foundForm)) {
    return;
  }

  const category = document.getElementById("found-category").value;

  const newReport = {
    id: makeNewId("found"),
    name: document.getElementById("found-name").value,
    category: category,
    emoji: getReportEmoji(category),
    location: document.getElementById("found-location").value,
    date: document.getElementById("found-date").value,
    description: document.getElementById("found-description").value
  };

  // New report first, then the old ones (spread).
  const updatedReports = [newReport, ...foundReports];

  if (saveSavedData("loopin-found-reports", updatedReports)) {
    foundReports = updatedReports;
    clearFoundForm();
    showFoundReports();
    showMessage("Your found-item report was saved in this browser.");
  }
});


// ---------- 7. START ----------
showFoundReports();