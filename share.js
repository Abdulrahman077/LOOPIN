// ==========================================================
// share.js — SHARE PAGE: live preview, readiness bar, save + remove items.
// Needs script.js loaded first (readSavedData, saveSavedData, safe ...).
//
// MAP:  1. Elements   2. Read the form   3. Live preview + readiness
//       4. Draw saved items   5. Save + remove   6. Events   7. Start
// ==========================================================


// ---------- 1. ELEMENTS + SAVED DATA ----------
const shareForm = document.getElementById("share-form");
const myItemsBox = document.getElementById("my-items");
let mySharedItems = readSavedData("loopin-items", []);


// ---------- 2. READ THE FORM ----------
// Get the value of the chosen radio button, e.g. getChoice("category").
// ":checked" selects the radio the visitor ticked (Section 22).
function getChoice(choiceName) {
  const chosen = shareForm.querySelector(`input[name="${choiceName}"]:checked`);

  if (chosen === null) {
    return "";
  }

  return chosen.value;
}


// ---------- 3. LIVE PREVIEW + READINESS ----------
// Turn one readiness row "done" or "not done".
function setCheck(checkId, isDone) {
  const row = document.getElementById(checkId);

  if (isDone) {
    row.classList.add("readiness__item--done");
  } else {
    row.classList.remove("readiness__item--done");
  }
}

// Runs every time the visitor types or picks something.
function updatePreview() {
  const name = document.getElementById("item-name").value;
  const description = document.getElementById("item-description").value;
  const location = document.getElementById("item-location").value;
  const category = getChoice("category");
  const condition = getChoice("condition");
  const availability = getChoice("availability");
  const returnTime = getChoice("loanPeriod");

  // Fill the preview card. "a || b" means: use a, but if it is empty use b.
  document.getElementById("preview-emoji").textContent = getItemEmoji(category);
  document.getElementById("preview-category").textContent = category || "Choose category";
  document.getElementById("preview-condition").textContent = condition || "Choose condition";
  document.getElementById("preview-title").textContent = name || "Something useful";
  document.getElementById("preview-description").textContent = description || "Add a short, honest note so a neighbor knows what to expect.";
  document.getElementById("preview-location").textContent = location || "Pickup area";
  document.getElementById("preview-availability").textContent = availability || "Available soon";
  document.getElementById("preview-return").textContent = returnTime || "Return window";

  // The picture color follows the category (class card__art--books, card__art--tools ...).
  const previewArt = document.getElementById("preview-art");
  previewArt.setAttribute("class", `card__art card__art--${getArtClass(category)}`);

  // Four checks, each one is true or false.
  const detailsDone = name !== "" && category !== "";
  const conditionDone = condition !== "";
  const descriptionDone = description.length >= 12;
  const handoffDone = location !== "" && returnTime !== "";

  setCheck("check-details", detailsDone);
  setCheck("check-condition", conditionDone);
  setCheck("check-description", descriptionDone);
  setCheck("check-handoff", handoffDone);

  // Each done check is worth 25 percent.
  const doneChecks = [detailsDone, conditionDone, descriptionDone, handoffDone].filter(done => done);
  const percent = doneChecks.length * 25;

  document.getElementById("readiness-percent").textContent = `${percent}%`;
  document.getElementById("readiness-fill").style.width = `${percent}%`;
}


// ---------- 4. DRAW THE SAVED ITEMS ----------
// Make the HTML text for one saved item card.
function makeSharedCard(item) {
  return `
    <article class="card shared-card">
      <div class="card__art card__art--${getArtClass(item.category)}">
        <span class="card__emoji">${item.emoji}</span>
        <span class="card__tag">${safe(item.category)} · ${safe(item.condition)}</span>
      </div>
      <div class="card__body">
        <p class="card__meta">● Listed in your loop</p>
        <h3>${safe(item.name)}</h3>
        <p>${safe(item.description)}</p>
        <div class="shared-card__facts">
          <span>⌖ ${safe(item.location)}</span>
          <span>◷ ${safe(item.availability)}</span>
          <span>↺ ${safe(item.loanPeriod)}</span>
        </div>
        <div class="shared-card__footer">
          <span class="shared-card__owner"><span class="avatar">Y</span>Shared by You</span>
          <button class="btn btn--outline shared-card__remove" type="button" onclick="removeItem('${item.id}')">Remove</button>
        </div>
      </div>
    </article>
  `;
}

function showMyItems() {
  myItemsBox.innerHTML = mySharedItems.map(makeSharedCard).join("");

  const itemWord = mySharedItems.length === 1 ? " item" : " items";
  document.getElementById("my-item-count").textContent = mySharedItems.length + itemWord;
  setHidden(document.getElementById("empty-items"), mySharedItems.length > 0);
}

// "8 example items + the visitor's items".
function updateActiveCount() {
  const total = getSampleBorrowItems().length + mySharedItems.length;
  document.getElementById("active-count").textContent = total;
}


// ---------- 5. SAVE + REMOVE ----------
function clearForm() {
  document.getElementById("item-name").value = "";
  document.getElementById("item-description").value = "";
  document.getElementById("item-location").value = "";

  // .checked = false un-ticks every radio button (Section 22).
  const radios = shareForm.querySelectorAll("input[type='radio']");
  radios.forEach(radio => {
    radio.checked = false;
  });
}

function removeItem(itemId) {
  // filter() keeps every item EXCEPT the one with this id.
  const updatedItems = mySharedItems.filter(item => item.id !== itemId);

  if (saveSavedData("loopin-items", updatedItems)) {
    mySharedItems = updatedItems;
    showMyItems();
    updateActiveCount();
    showMessage("Your item was removed.");
  }
}


// ---------- 6. EVENTS (Section 20) ----------
// Save the form values as a new item when the form is submitted.
// The button is type="button" (not "submit"), so the page never reloads.
document.getElementById("share-submit").addEventListener("click", () => {
  // Radio groups are checked here with if (Section 22 form validation).
  if (getChoice("category") === "" || getChoice("condition") === "" || getChoice("loanPeriod") === "") {
    showMessage("Please choose a category, condition and expected return.");
    return;
  }

  if (hasEmptyText(shareForm)) {
    return;
  }

  const category = getChoice("category");

  const newItem = {
    id: makeNewId("item"),
    name: document.getElementById("item-name").value,
    category: category,
    emoji: getItemEmoji(category),
    condition: getChoice("condition"),
    location: document.getElementById("item-location").value,
    availability: getChoice("availability") || "Flexible",
    loanPeriod: getChoice("loanPeriod"),
    description: document.getElementById("item-description").value,
    owner: "You"
  };

  // New item first, then the old ones (spread).
  const updatedItems = [newItem, ...mySharedItems];

  if (saveSavedData("loopin-items", updatedItems)) {
    mySharedItems = updatedItems;
    clearForm();
    updatePreview();
    showMyItems();
    updateActiveCount();
    showMessage("Your item was saved in this browser.");
  }
});

// "input" = typing, "change" = choosing a radio button.
shareForm.addEventListener("input", updatePreview);
shareForm.addEventListener("change", updatePreview);


// ---------- 7. START ----------
updatePreview();
showMyItems();
updateActiveCount();
