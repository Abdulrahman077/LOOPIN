// ==========================================================
// script.js — SHARED helper functions.
// Loaded on EVERY page BEFORE that page's own JavaScript file.
//
// MAP:  1. Example data   2. Saving data   3. Small helpers   4. Toast message
// ==========================================================


// ---------- 1. EXAMPLE DATA (objects inside arrays — Section 18) ----------

// These example items appear on the Borrow page and the Home board.
function getSampleBorrowItems() {
  return [
    {
      id: "sample-book",
      name: "The little book of calm",
      category: "Books",
      emoji: "📚",
      image: "images/borrow-items/borrow-book.jpg",
      condition: "Like new",
      location: "Indiranagar",
      availability: "This week",
      loanPeriod: "1 week",
      description: "A lovely little book for slow evenings.",
      owner: "Ananya"
    },
    {
      id: "sample-tools",
      name: "Weekend tool kit",
      category: "Tools",
      emoji: "🛠️",
      image: "images/borrow-items/borrow-tools.jpg",
      condition: "Good",
      location: "Domlur",
      availability: "Weekends",
      loanPeriod: "3 days",
      description: "The basics for small repairs at home.",
      owner: "Rohan"
    },
    {
      id: "sample-sports",
      name: "Badminton set",
      category: "Sports",
      emoji: "🏸",
      image: "images/borrow-items/borrow-badminton.jpg",
      condition: "Great",
      location: "HAL 2nd Stage",
      availability: "Today",
      loanPeriod: "1 day",
      description: "Two rackets and a few shuttlecocks.",
      owner: "Meera"
    },
    {
      id: "sample-tent",
      name: "Two-person camping tent",
      category: "Outdoors",
      emoji: "⛺",
      image: "images/borrow-items/borrow-tent.jpg",
      condition: "Good",
      location: "Ulsoor",
      availability: "Next week",
      loanPeriod: "3 days",
      description: "A compact tent with carry bag and pegs.",
      owner: "Arjun"
    },
    {
      id: "sample-game",
      name: "Board game: Catan",
      category: "Games",
      emoji: "🎲",
      image: "images/borrow-items/borrow-board-game.jpg",
      condition: "Like new",
      location: "Jeevan Bima Nagar",
      availability: "Evenings",
      loanPeriod: "1 week",
      description: "All game pieces are included.",
      owner: "Nisha"
    },
    {
      id: "sample-drill",
      name: "Cordless hand drill",
      category: "Tools",
      emoji: "🔩",
      image: "images/borrow-items/borrow-drill.jpg",
      condition: "Good",
      location: "Cambridge Layout",
      availability: "This week",
      loanPeriod: "1 day",
      description: "Includes a charger and one battery.",
      owner: "Kiran"
    },
    {
      id: "sample-mat",
      name: "Yoga mat",
      category: "Sports",
      emoji: "🧘",
      image: "images/borrow-items/borrow-yoga-mat.jpg",
      condition: "Great",
      location: "Old Airport Road",
      availability: "Today",
      loanPeriod: "3 days",
      description: "A clean, comfortable yoga mat.",
      owner: "Pooja"
    },
    {
      id: "sample-can",
      name: "Watering can",
      category: "Home",
      emoji: "🪴",
      image: "images/borrow-items/borrow-watering-can.jpg",
      condition: "Good",
      location: "Indiranagar",
      availability: "Weekends",
      loanPeriod: "By agreement",
      description: "A small watering can for your plants.",
      owner: "Dev"
    }
  ];
}

// These example reports appear on the Lost page and the Home board.
function getSampleLostReports() {
  return [
    {
      id: "lost-sample-bottle",
      name: "Blue insulated bottle",
      category: "Bottle",
      emoji: "🧴",
      location: "Cedar Park",
      date: "Today",
      description: "A blue bottle with a small white sticker on the side."
    },
    {
      id: "lost-sample-keys",
      name: "Set of house keys",
      category: "Keys",
      emoji: "🔑",
      location: "Domlur bus stop",
      date: "Yesterday",
      description: "Three keys on a round wooden keychain."
    }
  ];
}

// These example reports appear on the Found page and the Home board.
function getSampleFoundReports() {
  return [
    {
      id: "found-sample-bottle",
      name: "Blue water bottle",
      category: "Bottle",
      emoji: "🧴",
      location: "Cedar Park entrance",
      date: "Today",
      description: "Found a blue bottle near the park gate. It has a small sticker."
    },
    {
      id: "found-sample-umbrella",
      name: "Black umbrella",
      category: "Other",
      emoji: "☂️",
      location: "Indiranagar Metro",
      date: "Yesterday",
      description: "A folded black umbrella was left outside the metro station."
    }
  ];
}


// ---------- 2. SAVING DATA IN THE BROWSER (localStorage + JSON) ----------
// MENTOR NOTE: this part is EXTRA (not in the course notes). Short answers:
//
// Q1. Why localStorage?
//     This project has only HTML, CSS and JS (no server, no database).
//     Without localStorage, every item or report would disappear on refresh.
//
// Q2. Why JSON.stringify and JSON.parse?
//     localStorage can keep ONLY text. Our data is an array of objects
//     (Section 17 arrays + Section 18 objects), so we turn it into text to save
//     it (JSON.stringify) and back into an array to use it (JSON.parse).
//
// Q3. Why try / catch?
//     Saving can fail (storage full or blocked) and JSON.parse can fail on bad
//     text. try / catch lets the page show a message instead of crashing.
//
// Q4. What is the limit?
//     Data stays only in THIS browser. Other devices or browsers cannot see it.
//
// How the pages use it (same 2 helpers everywhere):
//     read:  readSavedData("loopin-items", [])      -> returns an array
//     save:  saveSavedData("loopin-items", newArray) -> returns true / false

// Read a saved list. If nothing is saved yet, return the fallback list.
function readSavedData(key, fallbackList) {
  // getItem gives the saved TEXT, or null when nothing was saved yet.
  const savedText = localStorage.getItem(key);

  if (savedText === null) {
    return fallbackList;
  }

  try {
    return JSON.parse(savedText);
  } catch (error) {
    return fallbackList;
  }
}

// Save a list. Returns true when it worked, false when it failed.
function saveSavedData(key, list) {
  try {
    // setItem(name, text): list (array) -> text -> saved in the browser.
    localStorage.setItem(key, JSON.stringify(list));
    return true;
  } catch (error) {
    showMessage("This browser could not save the change.");
    return false;
  }
}


// ---------- 3. SMALL HELPERS ----------

// Make a simple id for each new item or report, e.g. "item-48213".
function makeNewId(prefix) {
  return `${prefix}-${Math.floor(Math.random() * 1000000)}`;
}

// Make user text safe before it is placed inside innerHTML.
//
// MENTOR NOTE: .replace() with regex is EXTRA (the notes only show .test()).
// Q1. Why safe()?
//     Our cards are built as HTML text and put in innerHTML (Section 19).
//     If a visitor types <b>hi</b> or a <script> tag, innerHTML would treat it
//     as real HTML. safe() changes < > & " into harmless codes (&lt; &gt; ...)
//     so the browser shows them as plain text.
// Q2. Why a regex like /</g and not "<"?
//     .replace("<", ...) changes only the FIRST "<". The regex flag g (global)
//     changes EVERY one. A regex is written between slashes (Section 22).
// Q3. Why is & replaced first?
//     So the & inside the new codes (like &lt;) is not changed again.
// Q4. Why not textContent (Section 19)?
//     textContent is already safe, but a card is a whole block of HTML, so we
//     need innerHTML and therefore need safe() for the visitor's words.
function safe(text) {
  // A template literal turns any value into text (Section 25).
  const textValue = `${text}`;
  return textValue
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

// Pick an emoji for an item category (object lookup — Section 18).
function getItemEmoji(category) {
  const emojis = {
    Books: "📚",
    Tools: "🛠️",
    Sports: "🏸",
    Outdoors: "⛺",
    Games: "🎲",
    Home: "🪴",
    Tech: "🎧",
    Other: "📦"
  };

  return emojis[category] || "📦";
}

// Category name -> CSS modifier name (object lookup, Section 18).
// Example: "Books" -> "books", used in the class card__art--books.
function getArtClass(category) {
  const classes = {
    Books: "books",
    Tools: "tools",
    Sports: "sports",
    Outdoors: "outdoors",
    Games: "games",
    Home: "home",
    Tech: "tech",
    Other: "other",
    Bottle: "bottle",
    Keys: "keys",
    Bag: "bag",
    Clothing: "clothing",
    Electronics: "electronics"
  };

  return classes[category] || "other";
}

// Pick an emoji for a Lost / Found report category.
function getReportEmoji(category) {
  const emojis = {
    Bottle: "🧴",
    Keys: "🔑",
    Bag: "👜",
    Books: "📚",
    Clothing: "🧥",
    Electronics: "🎧",
    Other: "📦"
  };

  return emojis[category] || "📦";
}

// Hide or show an element by adding / removing a CSS class (Section 19: classList).
// The class empty-message--hidden is defined in style.css section 8.
function setHidden(element, shouldHide) {
  if (shouldHide) {
    element.classList.add("empty-message--hidden");
  } else {
    element.classList.remove("empty-message--hidden");
  }
}

// Check text boxes, text areas and drop-downs so none is empty.
// Returns true when a box is empty (and tells the visitor).
function hasEmptyText(form) {
  const textFields = form.querySelectorAll("input[type='text'], textarea, select");

  for (let i = 0; i < textFields.length; i++) {
    // Regex /^\s*$/ = "nothing, or only spaces". .test() gives true / false (Section 22).
    if (/^\s*$/.test(textFields[i].value)) {
      showMessage("Please fill in every field.");
      return true;
    }
  }

  return false;
}


// ---------- 4. TOAST MESSAGE (small popup at the bottom) ----------
// No timers needed: a CSS animation (Section 09) shows the toast, keeps it
// for a moment and hides it. Two identical animations (a and b) are used in
// turns, so the animation restarts every time showMessage() runs.
let toastTurn = 0;

function showMessage(message) {
  const messageBox = document.getElementById("message-toast");
  const classToAdd = toastTurn === 0 ? "toast--show-a" : "toast--show-b";
  const classToRemove = toastTurn === 0 ? "toast--show-b" : "toast--show-a";

  messageBox.textContent = message;
  messageBox.classList.remove(classToRemove);
  messageBox.classList.add(classToAdd);

  // Ternary (Section 06): next time use the other animation.
  toastTurn = toastTurn === 0 ? 1 : 0;
}
