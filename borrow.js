// ==========================================================
// borrow.js — BORROW PAGE: search, category filter, borrow requests.
// Needs script.js loaded first (readSavedData, saveSavedData, safe ...).
//
// MAP:  1. Elements   2. All items   3. Draw item cards
//       4. Make a request   5. Draw requests + cancel   6. Events   7. Start
// ==========================================================


// ---------- 1. ELEMENTS + SAVED DATA ----------
const borrowSearch = document.getElementById("borrow-search");
const categoryFilter = document.getElementById("category-filter");
const borrowItemsBox = document.getElementById("borrow-items");
const emptyBorrowMessage = document.getElementById("empty-borrow-items");
let borrowRequests = readSavedData("loopin-borrow-requests", []);


// ---------- 2. ALL ITEMS ----------
// The visitor's own items + the 8 example items in one list (spread).
function getAllBorrowItems() {
  return [...readSavedData("loopin-items", []), ...getSampleBorrowItems()];
}


// ---------- 3. DRAW ITEM CARDS ----------
// Make the HTML text for one item card.
function makeItemCard(item) {
  const isMyItem = item.owner === "You";
  const isSample = item.id.includes("sample-");
  const ownerName = item.owner || "A neighbor";

  // Has this visitor already asked for this item? (filter + length)
  const alreadyRequested = borrowRequests.filter(request => request.itemId === item.id).length > 0;

  // Ternary operator (Section 13): condition ? ifTrue : ifFalse
  const artContent = item.image
    ? `<img src="${safe(item.image)}" alt="${safe(item.name)}">`
    : `<span class="card__emoji">${item.emoji || getItemEmoji(item.category)}</span>`;

  let buttonText = "Request to borrow →";
  if (isMyItem) {
    buttonText = "Your item";
  } else if (alreadyRequested) {
    buttonText = "Requested ✓";
  }

  const buttonDisabled = isMyItem || alreadyRequested ? "disabled" : "";

  return `
    <article class="card item-card">
      <div class="card__art card__art--${getArtClass(item.category)}">
        ${artContent}
        <span class="card__tag">${safe(item.category)}</span>
        ${isSample ? '<span class="card__badge">SAMPLE</span>' : ""}
      </div>
      <div class="card__body">
        <p class="card__meta">${safe(item.condition || "Good")} · ${safe(item.availability || "Flexible")}</p>
        <h3>${safe(item.name)}</h3>
        <p>${safe(item.description)}</p>
        <p class="item-card__line">↺ Return plan: <strong>${safe(item.loanPeriod || "By agreement")}</strong></p>
        <p class="item-card__line">⌖ ${safe(item.location)}</p>
        <div class="card__owner">
          <span class="avatar">${safe(ownerName[0])}</span>
          Shared by ${safe(ownerName)}
        </div>
        <button class="btn btn--dark btn--full item-card__button" type="button" onclick="makeBorrowRequest('${item.id}')" ${buttonDisabled}>${buttonText}</button>
      </div>
    </article>
  `;
}

// Draw the items that match the search words and the chosen category.
function showBorrowItems() {
  const searchWords = borrowSearch.value.toUpperCase();
  const selectedCategory = categoryFilter.value;

  // filter() keeps only the items that pass BOTH tests (Section 26).
  const matchingItems = getAllBorrowItems().filter(item => {
    const itemWords = `${item.name} ${item.category} ${item.location} ${item.description}`.toUpperCase();
    const matchesSearch = itemWords.includes(searchWords);
    const matchesCategory = selectedCategory === "All" || item.category === selectedCategory;

    return matchesSearch && matchesCategory;
  });

  // map() turns every item into card HTML, join("") glues them together.
  borrowItemsBox.innerHTML = matchingItems.map(makeItemCard).join("");
  document.getElementById("item-results").textContent = `Showing ${matchingItems.length} item(s)`;
  setHidden(emptyBorrowMessage, matchingItems.length > 0);
}


// ---------- 4. MAKE A REQUEST ----------
function makeBorrowRequest(itemId) {
  const matchingItems = getAllBorrowItems().filter(item => item.id === itemId);

  if (matchingItems.length === 0) {
    showMessage("This item is no longer available.");
    showBorrowItems();
    return;
  }

  const selectedItem = matchingItems[0];

  const newRequest = {
    id: makeNewId("request"),
    itemId: selectedItem.id,
    itemName: selectedItem.name,
    owner: selectedItem.owner || "A neighbor"
  };

  const updatedRequests = [newRequest, ...borrowRequests];

  if (saveSavedData("loopin-borrow-requests", updatedRequests)) {
    borrowRequests = updatedRequests;
    showBorrowRequests();
    showBorrowItems();
    showMessage("Your borrow request was saved.");
  }
}


// ---------- 5. DRAW REQUESTS + CANCEL ----------
function makeRequestRow(request) {
  return `
    <div class="request-row">
      <span>🤝</span>
      <div class="request-row__info">
        <strong>${safe(request.itemName)}</strong>
        <p>Request sent · Shared by ${safe(request.owner)}</p>
      </div>
      <button class="btn btn--outline request-row__cancel" type="button" onclick="cancelBorrowRequest('${request.id}')">Cancel</button>
    </div>
  `;
}

function showBorrowRequests() {
  document.getElementById("borrow-requests").innerHTML = borrowRequests.map(makeRequestRow).join("");

  const requestWord = borrowRequests.length === 1 ? " request" : " requests";
  document.getElementById("request-count").textContent = borrowRequests.length + requestWord;
  setHidden(document.getElementById("empty-requests"), borrowRequests.length > 0);
}

function cancelBorrowRequest(requestId) {
  // Keep every request EXCEPT the cancelled one.
  const updatedRequests = borrowRequests.filter(request => request.id !== requestId);

  if (saveSavedData("loopin-borrow-requests", updatedRequests)) {
    borrowRequests = updatedRequests;
    showBorrowRequests();
    showBorrowItems();
    showMessage("Borrow request cancelled.");
  }
}


// ---------- 6. EVENTS ----------
// Search while the visitor types, and filter when the category changes.
borrowSearch.addEventListener("input", showBorrowItems);
categoryFilter.addEventListener("change", showBorrowItems);


// ---------- 7. START ----------
showBorrowItems();
showBorrowRequests();
