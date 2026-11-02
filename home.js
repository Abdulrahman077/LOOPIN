// ==========================================================
// home.js — HOME PAGE: counts + the searchable neighborhood board.
// Needs script.js loaded first (readSavedData, safe, sample data).
//
// MAP:  1. Elements   2. Build the posts   3. Draw the cards
//       4. Search + quick buttons   5. Run when the page opens
// ==========================================================


// ---------- 1. ELEMENTS (Section 19 — DOM) ----------
const boardBox = document.getElementById("board-cards");
const boardSearch = document.getElementById("board-search");
const noResults = document.getElementById("no-results");
const quickButtons = document.querySelectorAll(".quick-filters__button");

// The number of feature cards = the number of "ways to help".
document.getElementById("ways-count").textContent = document.querySelectorAll(".feature-card").length;


// ---------- 2. BUILD THE POSTS ----------
// Turn items and reports into one simple "post" shape so one card design fits all.
function getAllPosts() {
  // The visitor's own items come first, then the examples (spread — Section 25).
  const borrowItems = [...readSavedData("loopin-items", []), ...getSampleBorrowItems()];
  const lostReports = readSavedData("loopin-lost-reports", getSampleLostReports());
  const foundReports = readSavedData("loopin-found-reports", getSampleFoundReports());

  // map() changes every item into a post (Section 26).
  const borrowPosts = borrowItems.map(item => ({
    type: "Borrow",
    typeClass: "borrow",
    category: item.category,
    title: item.name,
    description: item.description,
    place: item.location,
    when: item.availability,
    who: item.owner || "A neighbor",
    image: item.image || "",
    emoji: item.emoji || getItemEmoji(item.category),
    link: "borrow.html",
    linkText: "Browse items"
  }));

  const lostPosts = lostReports.map(report => ({
    type: "Lost",
    typeClass: "lost",
    category: report.category,
    title: report.name,
    description: report.description,
    place: report.location,
    when: report.date,
    who: "A neighbor",
    image: "",
    emoji: report.emoji || getReportEmoji(report.category),
    link: "lost.html",
    linkText: "See lost posts"
  }));

  const foundPosts = foundReports.map(report => ({
    type: "Found",
    typeClass: "found",
    category: report.category,
    title: report.name,
    description: report.description,
    place: report.location,
    when: report.date,
    who: "A neighbor",
    image: "",
    emoji: report.emoji || getReportEmoji(report.category),
    link: "found.html",
    linkText: "See found posts"
  }));

  return {
    borrowPosts: borrowPosts,
    lostPosts: lostPosts,
    foundPosts: foundPosts
  };
}


// ---------- 3. DRAW THE CARDS ----------
// Make the HTML text for one card (template literal — Section 25).
function makeBoardCard(post) {
  // Show a photo when there is one, otherwise a big emoji.
  const artContent = post.image !== ""
    ? `<img src="${safe(post.image)}" alt="${safe(post.title)}">`
    : `<span class="card__emoji">${post.emoji}</span>`;

  return `
    <article class="card">
      <div class="card__art card__art--${getArtClass(post.category)}">
        ${artContent}
        <span class="card__tag card__tag--${post.typeClass}">${post.type}</span>
      </div>
      <div class="card__body">
        <p class="card__meta">${safe(post.place)} · ${safe(post.when)}</p>
        <h3>${safe(post.title)}</h3>
        <p>${safe(post.description)}</p>
        <div class="card__owner">
          <span class="avatar">${safe(post.who[0].toUpperCase())}</span>
          ${safe(post.who)}
        </div>
        <a class="card__link" href="${post.link}">${post.linkText} →</a>
      </div>
    </article>
  `;
}

// Show the posts that match the search words.
function showBoard() {
  const searchWords = boardSearch.value.toUpperCase();
  const posts = getAllPosts();
  let postsToShow;

  if (searchWords === "") {
    // No search yet: show a small mix (2 items, 1 lost, 1 found).
    postsToShow = [
      ...posts.borrowPosts.slice(0, 2),
      ...posts.lostPosts.slice(0, 1),
      ...posts.foundPosts.slice(0, 1)
    ];
  } else {
    // Searching: look through EVERY post (filter + includes — Section 26).
    const everyPost = [...posts.borrowPosts, ...posts.lostPosts, ...posts.foundPosts];

    postsToShow = everyPost.filter(post => {
      const postWords = `${post.type} ${post.category} ${post.title} ${post.description} ${post.place}`.toUpperCase();
      return postWords.includes(searchWords);
    });
  }

  // map() makes a list of HTML texts, join("") glues them into one text.
  boardBox.innerHTML = postsToShow.map(makeBoardCard).join("");
  setHidden(noResults, postsToShow.length > 0);

  // The three numbers in the snapshot box.
  document.getElementById("borrow-count").textContent = posts.borrowPosts.length;
  document.getElementById("lost-count").textContent = posts.lostPosts.length;
  document.getElementById("found-count").textContent = posts.foundPosts.length;
}


// ---------- 4. SEARCH + QUICK BUTTONS (Section 20 — events) ----------
// Highlight the quick button that matches the search box.
function highlightQuickButton() {
  const searchWords = boardSearch.value.toUpperCase();

  quickButtons.forEach(button => {
    if (button.value.toUpperCase() === searchWords) {
      button.classList.add("quick-filters__button--selected");
    } else {
      button.classList.remove("quick-filters__button--selected");
    }
  });
}

// "input" runs every time the visitor types a letter.
boardSearch.addEventListener("input", () => {
  showBoard();
  highlightQuickButton();
});

// A quick button puts its word in the search box.
quickButtons.forEach(button => {
  button.addEventListener("click", () => {
    boardSearch.value = button.value;
    showBoard();
    highlightQuickButton();
  });
});


// ---------- 5. RUN WHEN THE PAGE OPENS ----------
showBoard();
