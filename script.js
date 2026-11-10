
const form = document.getElementById("bookForm");
const bookList = document.getElementById("bookList");

let books = JSON.parse(localStorage.getItem("bookNestBooks")) || [];

// Save books
function saveBooks() {
    localStorage.setItem("bookNestBooks", JSON.stringify(books));
}

// Show message
function showMessage(text, error = false) {
    const message = document.getElementById("message");
    message.textContent = text;
    message.style.color = error ? "red" : "green";
}

// Add or update book
form.addEventListener("submit", function(e) {
    e.preventDefault();

    const editId = document.getElementById("editId").value;
    const title = document.getElementById("title").value.trim();
    const author = document.getElementById("author").value.trim();
    const category = document.getElementById("category").value;
    const pages = Number(document.getElementById("pages").value);
    const status = document.getElementById("status").value;
    let progress = Number(document.getElementById("progress").value);

    if (!title || !author || pages < 1 ||
        !Number.isInteger(pages) ||
        !Number.isInteger(progress) ||
        progress < 0 || progress > pages) {
        showMessage("Please enter valid book details and reading progress.", true);
        return;
    }

    if (status === "Read") {
        progress = pages;
    }

    if (status === "Want to Read") {
        progress = 0;
    }

    const book = {
        id: editId || crypto.randomUUID(),
        title,
        author,
        category,
        pages,
        status,
        progress,
        favorite: editId
            ? books.find(b => b.id === editId).favorite
            : false,
        added: editId
            ? books.find(b => b.id === editId).added
            : Date.now()
    };

    if (editId) {
        books = books.map(b => b.id === editId ? book : b);
        showMessage("Book updated successfully!");
    } else {
        books.push(book);
        showMessage("Book added successfully!");
    }

    saveBooks();
    form.reset();
    resetForm();
    renderBooks();
});

// Reset form
function resetForm() {
    document.getElementById("editId").value = "";
    document.getElementById("formTitle").textContent = "Add a New Book";
    document.getElementById("submitBtn").textContent = "Add Book";
    document.getElementById("cancelBtn").hidden = true;
    document.getElementById("progress").value = 0;
}

// Edit book
function editBook(id) {
    const book = books.find(b => b.id === id);
    if (!book) return;

    document.getElementById("editId").value = book.id;
    document.getElementById("title").value = book.title;
    document.getElementById("author").value = book.author;
    document.getElementById("category").value = book.category;
    document.getElementById("pages").value = book.pages;
    document.getElementById("status").value = book.status;
    document.getElementById("progress").value = book.progress;

    document.getElementById("formTitle").textContent = "Edit Book";
    document.getElementById("submitBtn").textContent = "Update Book";
    document.getElementById("cancelBtn").hidden = false;

    document.querySelector(".form-section").scrollIntoView({
        behavior: "smooth"
    });
}

// Cancel editing
document.getElementById("cancelBtn").addEventListener("click", () => {
    form.reset();
    resetForm();
});

// Delete book
function deleteBook(id) {
    if (!confirm("Are you sure you want to delete this book?")) {
        return;
    }

    books = books.filter(b => b.id !== id);
    saveBooks();
    renderBooks();
    showMessage("Book deleted successfully!");
}

// Toggle favourite
function toggleFavorite(id) {
    books = books.map(b =>
        b.id === id ? { ...b, favorite: !b.favorite } : b
    );

    saveBooks();
    renderBooks();
}

// Update reading progress
function updateProgress(id) {
    const book = books.find(b => b.id === id);
    if (!book) return;

    const input = prompt(
        `Enter pages read (0-${book.pages}):`,
        book.progress
    );

    if (input === null || input.trim() === "") return;

    const progress = Number(input);

    if (!Number.isInteger(progress) ||
        progress < 0 || progress > book.pages) {
        alert("Enter a valid number of pages.");
        return;
    }

    book.progress = progress;

    if (progress === book.pages) {
        book.status = "Read";
    } else if (progress > 0) {
        book.status = "Currently Reading";
    } else {
        book.status = "Want to Read";
    }

    saveBooks();
    renderBooks();
}

// Create safe text element
function createElement(tag, className, text) {
    const element = document.createElement(tag);
    element.className = className;
    element.textContent = text;
    return element;
}

// Display books
function renderBooks() {
    bookList.replaceChildren();

    const search = document.getElementById("search")
        .value.toLowerCase();

    const filter = document.getElementById("filter").value;
    const sort = document.getElementById("sort").value;

    let filtered = books.filter(book => {
        const matchesSearch =
            book.title.toLowerCase().includes(search) ||
            book.author.toLowerCase().includes(search);

        const matchesFilter =
            filter === "All" || book.status === filter;

        return matchesSearch && matchesFilter;
    });

    if (sort === "title") {
        filtered.sort((a, b) => a.title.localeCompare(b.title));
    } else if (sort === "author") {
        filtered.sort((a, b) => a.author.localeCompare(b.author));
    } else {
        filtered.sort((a, b) => b.added - a.added);
    }

    document.getElementById("bookCount").textContent =
        filtered.length + " books";

    if (filtered.length === 0) {
        bookList.appendChild(
            createElement(
                "p",
                "empty",
                "No books found. Add your first book!"
            )
        );
    }

    filtered.forEach(book => {
        const card = document.createElement("div");
        card.className = "book-card";

        const top = document.createElement("div");
        top.className = "book-top";

        const details = document.createElement("div");

        details.appendChild(
            createElement("h3", "", "📖 " + book.title)
        );

        details.appendChild(
            createElement("p", "", "Author: " + book.author)
        );

        details.appendChild(
            createElement("p", "", "Status: " + book.status)
        );

        const favorite = document.createElement("button");
        favorite.className = "fav-btn";
        favorite.textContent = book.favorite ? "♥" : "♡";
        favorite.title = "Toggle favourite";
        favorite.setAttribute("aria-label", "Toggle favourite");
        favorite.addEventListener("click", () =>
            toggleFavorite(book.id)
        );

        top.append(details, favorite);

        const category = createElement(
            "span",
            "book-category",
            book.category
        );

        const progressText = createElement(
            "p",
            "",
            `Reading progress: ${book.progress}/${book.pages} pages`
        );

        const percentage = Math.round(
            (book.progress / book.pages) * 100
        );

        const progressContainer = document.createElement("div");
        progressContainer.className = "progress-container";

        const progressBar = document.createElement("div");
        progressBar.className = "progress-bar";
        progressBar.style.width = percentage + "%";

        progressContainer.appendChild(progressBar);

        const actions = document.createElement("div");
        actions.className = "book-actions";

        const progressBtn = document.createElement("button");
        progressBtn.textContent = "Update Progress";
        progressBtn.addEventListener("click", () =>
            updateProgress(book.id)
        );

        const editBtn = document.createElement("button");
        editBtn.textContent = "Edit";
        editBtn.addEventListener("click", () =>
            editBook(book.id)
        );

        const deleteBtn = document.createElement("button");
        deleteBtn.textContent = "Delete";
        deleteBtn.className = "delete-btn";
        deleteBtn.addEventListener("click", () =>
            deleteBook(book.id)
        );

        actions.append(progressBtn, editBtn, deleteBtn);

        card.append(
            top,
            category,
            progressText,
            progressContainer,
            actions
        );

        bookList.appendChild(card);
    });

    updateStats();
}

// Dashboard statistics
function updateStats() {
    document.getElementById("totalBooks").textContent =
        books.length;

    document.getElementById("readBooks").textContent =
        books.filter(b => b.status === "Read").length;

    document.getElementById("readingBooks").textContent =
        books.filter(b => b.status === "Currently Reading").length;

    document.getElementById("wantBooks").textContent =
        books.filter(b => b.status === "Want to Read").length;
}

// Search
document.getElementById("search")
    .addEventListener("input", renderBooks);

// Filter
document.getElementById("filter")
    .addEventListener("change", renderBooks);

// Sort
document.getElementById("sort")
    .addEventListener("change", renderBooks);

// Initial display
renderBooks();
