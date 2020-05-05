let dragSrcEl = null;
let withinEnter;
document.addEventListener("DOMContentLoaded", () => {
  getSite();
});
document
  .querySelector(".close-sidebar")
  .addEventListener("click", closeSideBar);

document
  .getElementById("bookmark-form")
  .addEventListener("submit", function (event) {
    event.preventDefault();
    let urlName = document.querySelector("#get-url").value;
    let domainName = document.querySelector("#get-name").value;

    if (urlName && domainName) {
      saveSite(urlName, domainName);
      appendBookmark(urlName, domainName);
    } else {
      errorMessage("emptyFields");
    }
    clearValues();
  });

function getSite() {
  savedSites = JSON.parse(localStorage.getItem("savedSites"));

  if (savedSites.length !== 0) {
    savedSites.map((site) => {
      let url = site.url;
      let domain = site.domain;
      appendBookmark(url, domain);
    });
  }
}
function clearValues() {
  document.querySelector("#get-url").value = "";
  document.querySelector("#get-name").value = "";
}

function openSideBar() {
  document.querySelector(".sidebar").classList.add("sidebar-visible");
  document
    .querySelector(".close-sidebar")
    .addEventListener("click", closeSideBar);
}

function closeSideBar() {
  document.querySelector(".sidebar").classList.remove("sidebar-visible");
}

function saveSite(urlName, domainName) {
  let bookmarkObject = {
    url: urlName,
    domain: domainName,
  };
  if (localStorage.getItem("savedSites") === null) {
    let savedSites = [];
    savedSites.push(bookmarkObject);
    localStorage.setItem("savedSites", JSON.stringify(savedSites));
  }
  savedSites = JSON.parse(localStorage.getItem("savedSites"));
  if (
    savedSites.find((site) => site.url === bookmarkObject.url) === undefined
  ) {
    savedSites.push(bookmarkObject);
    localStorage.setItem("savedSites", JSON.stringify(savedSites));
  }
}

let i = 0;
function appendBookmark(urlName, domainName) {
  if (
    Array.from(document.querySelectorAll("li")).find(
      (li) => li.getElementsByTagName("a")[0].innerText === domainName
    ) === undefined
  ) {
    const li = document.createElement("li");
    li.className = `listed-bookmarks list${i}`;

    li.setAttribute("draggable", "true");
    li.setAttribute("id", `${i}`);
    i++;
    const anchor = document.createElement("a");
    anchor.setAttribute("href", `http://${urlName}`);
    anchor.innerHTML = domainName;

    const delBtn = document.createElement("button");
    delBtn.textContent = "x";
    delBtn.className = "delete-bookmark";
    delBtn.addEventListener("click", deleteSite);
    const element = document.querySelector(".sidebar-list");
    element.appendChild(li);

    li.appendChild(delBtn);
    li.appendChild(anchor);

    Array.from(document.querySelectorAll("li")).forEach(function (item) {
      item.addEventListener("dragstart", handleDragStart, false);
      item.addEventListener("dragenter", handleDragEnter, false);
      item.addEventListener("dragover", handleDragOver, false);
      item.addEventListener("dragleave", handleDragLeave, false);
      item.addEventListener("drop", handleDrop, false);
      item.addEventListener("dragend", handleDragEnd, false);
    });

    openSideBar();
  } else {
    errorMessage("alreadyExists");
  }
}

function handleDragStart(e) {
  this.style.opacity = "0.8";
  dragSrcEl = this;
  e.dataTransfer.effectAllowed = "move";
  e.dataTransfer.setData("text/html", this.innerHTML);
}
function handleDragOver(e) {
  if (e.preventDefault) {
    e.preventDefault();
  }
  e.dataTransfer.dropEffect = "move";
  return false;
}
function handleDragEnter(e) {
  e.preventDefault();

  withinEnter = true;
  setTimeout(function () {
    withinEnter = false;
  }, 0);
  this.classList.add("over");
}
function handleDragLeave(e) {
  if (!withinEnter) {
    this.classList.remove("over");
  }
  withinEnter = false;
}
function handleDrop(e) {
  if (e.stopPropagation) {
    e.stopPropagation();
  }
  if (dragSrcEl.id !== this.id) {
    let dragged = {
      draggedElement: dragSrcEl.innerHTML,
    };
    Object.freeze(dragged);
    dragSrcEl.innerHTML = this.innerHTML;
    this.innerHTML = e.dataTransfer.getData("text/html");
    e.dataTransfer.clearData("text/html");
    if (this.innerHTML === dragSrcEl.innerHTML) {
      dragSrcEl.innerHTML = dragged.draggedElement;
      e.dataTransfer.clearData("text/html");
    }
    Array.from(document.querySelectorAll("li")).forEach(function (item) {
      item
        .getElementsByTagName("button")[0]
        .addEventListener("click", deleteSite);
    });

    from = +this.id;
    to = +dragSrcEl.id;
    function moveItem(from, to) {
      let f = savedSites.splice(from, 1)[0];
      savedSites.splice(to, 0, f);
    }

    moveItem(from, to);

    localStorage.setItem("savedSites", JSON.stringify(savedSites));
  }
  return false;
}

function handleDragEnd() {
  Array.from(document.querySelectorAll("li")).forEach(function (item) {
    item.classList.remove("over");
    item.style.opacity = "1";
  });
}

function deleteSite() {
  const parent = this.parentElement;
  const anchor = parent.lastChild.innerHTML;

  let savedSites = JSON.parse(localStorage.getItem("savedSites"));
  const index = savedSites.findIndex((site) => site.domain === anchor);
  savedSites.splice(index, 1);
  localStorage.setItem("savedSites", JSON.stringify(savedSites));
  parent.remove();
}

function errorMessage(err) {
  errorObject = {
    emptyFields: "Both fileds must be filled!",
    alreadyExists: "Bookmark already exists!",
  };
  const errorParagraph = document.createElement("p");
  errorParagraph.classList.add("form-error-title");
  const formError = document.querySelector(".form-error");
  err === "emptyFields"
    ? (errorParagraph.textContent = errorObject.emptyFields)
    : (errorParagraph.textContent = errorObject.alreadyExists);
  formError.appendChild(errorParagraph);
  formError.classList.add("form-error-visible");

  setTimeout(() => {
    document
      .querySelector(".form-error")
      .classList.remove("form-error-visible");
    errorParagraph.remove();
  }, 2000);
}
