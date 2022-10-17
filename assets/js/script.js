let openModal = document.querySelector(".modal-open");
openModal.addEventListener("click", function (e) {
  e.preventDefault();
  let modal = document.querySelector(".modal");
  modal.style.display = "block";
});
let closeModal = document.querySelector(".close-modal");
closeModal.addEventListener("click", function (e) {
  e.preventDefault();
  let modal = document.querySelector(".modal");
  modal.style.display = "none";
});

const menuHambuger = document.querySelector("#hamburger-menu");
const sidebar = document.querySelector(".sidebar");
const navbar = document.querySelector(".navbar-wrap");
const mainContent = document.querySelector(".main-content");
const searchBar = document.querySelector('.search');
menuHambuger.addEventListener("click", () => {
  navbar.classList.toggle("navbar-active");
  sidebar.classList.toggle("active");
  mainContent.classList.toggle("main-active");
  searchBar.classList.toggle('search-active');
});

const searchBtn = document.querySelector(".search-btn");
searchBtn.addEventListener("click", () => {
  let searchBox = document.querySelector(".search");
  searchBox.style.display = "block";
});
const closeSearch = document.querySelector(".close-search");
closeSearch.addEventListener("click", () => {
  let searchBox = document.querySelector(".search");
  searchBox.style.display = "none";
});

document.addEventListener("DOMContentLoaded", function () {
  if (isStorageExist()) {
    loadDataFromStorage();
  }
});

const tambahBuku = document.querySelector("#inputData");
tambahBuku.addEventListener("submit", function (e) {
  e.preventDefault();
  let close = document.querySelector(".modal");
  close.style.display = "none";
  addBook();
});

const books = [];
const RENDER_EVENT = "render-buku";

function addBook() {
  const titleBook = document.querySelector("#title").value;
  const authors = document.querySelector("#authors").value;
  const years = document.querySelector("#years").value;
  const isComplete = document.querySelector("#IsComplete").checked;
  console.log(isComplete)
  const id = buatId();
  const dataBuku = buatDataBuku(id, titleBook, authors, years, isComplete);
  books.push(dataBuku);
  document.dispatchEvent(new Event(RENDER_EVENT));
  saveData();
}


function buatId() {
  return +new Date();
}

function buatDataBuku(id, title, author, year, isComplete) {
  return {
    id,
    title,
    author,
    year,
    isComplete,
  };
}

document.addEventListener(RENDER_EVENT, function () {
  const unreadTable = document.querySelector("#unread");
  unreadTable.innerHTML = "";

  const doneTable = document.querySelector("#already");
  doneTable.innerHTML = "";

  const viewAll = document.querySelector("#books");
  viewAll.innerHTML = "";

  const totalBuku = document.querySelector('#totalBuku');
  const alreadyTotal = document.querySelector('#alreadyTotal');
  const unreadTotal = document.querySelector('#unreadTotal');
  totalBuku.innerText = books.length;

  books.forEach((itemBuku) => {
    const elemenBuku = buatArticle(itemBuku);

    if (itemBuku.isComplete == true || !itemBuku.isComplete) {
      viewAll.append(elemenBuku);
    }
  });

  books.forEach((itemBuku) => {
    const elemenBuku = buatArticle(itemBuku);
    if (itemBuku.isComplete == true) {
      doneTable.append(elemenBuku);
    } else if (itemBuku.isComplete == false) {
      unreadTable.append(elemenBuku);
    }
  });
});

function buatArticle(dataBuku) {
  const tr = document.createElement("tr");
  tr.setAttribute("class", "books-item");

  const numberId = document.createElement("td");
  numberId.innerText = dataBuku.id;

  const textTitle = document.createElement("td");
  textTitle.setAttribute("id", "title-book");
  textTitle.innerText = dataBuku.title;

  const textAuthor = document.createElement("td");
  textAuthor.innerText = dataBuku.author;

  const textYear = document.createElement("td");
  textYear.innerText = dataBuku.year;

  tr.append(textTitle, textYear, textAuthor);

  if (dataBuku.isComplete) {
    
    const status = document.createElement("td");
    status.innerHTML = `<span class="success-status">already</span>`;

    const editBtn = document.createElement("td");
    editBtn.innerHTML = '<i class="uil uil-pen table-icon icon-edit"></i>';

    const checkBtn = document.createElement("i");
    checkBtn.classList.add("uil", "uil-times", "table-icon", "icon-uncheck");

    const deleteBtn = document.createElement("i");
    deleteBtn.classList.add(
      "uil",
      "uil-trash-alt",
      "table-icon",
      "icon-delete"
    );

    deleteBtn.addEventListener("click", function (e) {
      if(confirm('are yousure?') == true){
        deleteBook(dataBuku.id);
      }else{
        return
      }
    });

    checkBtn.addEventListener("click", function () {
      undoRead(dataBuku.id);
    });

    editBtn.append(checkBtn, deleteBtn);
    tr.append(status, editBtn);
  } else {
    const status2 = document.createElement("td");
    status2.innerHTML = `<span class="danger-status">unread</span>`;

    const delUnread = document.createElement("i");
    delUnread.classList.add(
      "uil",
      "uil-trash-alt",
      "table-icon",
      "icon-delete"
    );

    delUnread.addEventListener("click", function (e) {
      if(confirm('are yousure?') == true){
        deleteBook(dataBuku.id);
      }else{
        e.preventDefault();
        console.log('test')
      }
    });

    const uncheckBtn = document.createElement("td");
    uncheckBtn.innerHTML =
      '<i class="uil uil-check table-icon icon-check"></i>';
    uncheckBtn.append(delUnread);

    uncheckBtn.addEventListener("click", function () {
      already(dataBuku.id);
    });

    tr.append(status2, uncheckBtn);
  }

  return tr;
}

function already(bookId) {
  const targetBuku = cariBuku(bookId);

  if (targetBuku == null) return;

  targetBuku.isComplete = true;
  document.dispatchEvent(new Event(RENDER_EVENT));
  saveData();
}

function cariBuku(bookId) {
  for (const bookItem of books) {
    if (bookItem.id === bookId) {
      return bookItem;
    }
  }
  return null;
}
function deleteBook(bookId) {

  const targetBooks = findBookIndex(bookId);

  if (targetBooks == -1) return;
  books.splice(targetBooks, 1);
  document.dispatchEvent(new Event(RENDER_EVENT));
  saveData();
}

function undoRead(bookId) {
  const targetBuku = cariBuku(bookId);

  if (targetBuku == null) return;
  targetBuku.isComplete = false;
  document.dispatchEvent(new Event(RENDER_EVENT));
  saveData();
}

function findBookIndex(bookId) {
  for (const index in books) {
    if (books[index].id === bookId) {
      return index;
    }
  }
  return -1;
}

const SAVED_EVENT = "saved-buku";
const STORAGE_KEY = "BOOK_APPS";

function saveData() {
  if (isStorageExist()) {
    const parsed = JSON.stringify(books);
    localStorage.setItem(STORAGE_KEY, parsed);
    document.dispatchEvent(new Event(SAVED_EVENT));
  }
}

function isStorageExist() {
  if (typeof Storage === undefined) {
    alert("Browser kamu tidak mendukung local storage");
    return false;
  }
  return true;
}

document.addEventListener(SAVED_EVENT, function () {
  console.log(localStorage.getItem(STORAGE_KEY));
});

function loadDataFromStorage() {
  const serializedData = localStorage.getItem(STORAGE_KEY);
  let data = JSON.parse(serializedData);

  if (data !== null) {
    for (const buku of data) {
      books.push(buku);
    }
  }

  document.dispatchEvent(new Event(RENDER_EVENT));
}

const searchInput = document.querySelector("#search-input");

searchInput.addEventListener("input", () => {
  const filter = searchInput.value.toLowerCase();
  const itemBuku = document.querySelectorAll(".books-item");

  itemBuku.forEach((item) => {
    let data = item.textContent;
    if (data.toLowerCase().includes(filter.toLowerCase())) {
      item.style.display = "";
    } else {
      item.style.display = "none";
    }
  });
});
