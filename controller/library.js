const fs = require("fs/promises");
const path = require("path");

const readData = async (file) => {
  const data = await fs.readFile(path.join(__dirname, `../data/${file}`), "utf-8");
  return JSON.parse(data);
};

const writeData = async (file, data) => {
  await fs.writeFile(
    path.join(__dirname, `../data/${file}`),
    JSON.stringify(data, null, 2)
  );
};

exports.getBooks = async (req, res) => {
  try {
    const books = await readData("books.json");
    res.json(books);
  } catch (err) {
    res.status(500).json({ message: "Error fetching books" });
  }
};

exports.borrowBook = async (req, res) => {
  try {
    let { userId } = req.params;
    let { books: selectedBooks } = req.body;

    userId = parseInt(userId);

    if (!selectedBooks || !Array.isArray(selectedBooks)) {
      return res.status(400).json({ message: "Books array required" });
    }

    const library = await readData("books.json");
    const borrowData = await readData("borrowedBooks.json");

    let borrowed = [];

    for (const category of library.categories) {
      for (const book of category.books) {

        if (selectedBooks.includes(book.id)) {

          const alreadyBorrowed = borrowData.records.find(
            (r) =>
              r.userId === userId &&
              r.bookId === book.id &&
              r.returnDate === null
          );

          if (alreadyBorrowed) continue;

          if (book.availableCopies <= 0) continue;

          book.availableCopies--;

          const record = {
            id: Date.now(),
            userId,
            bookId: book.id,
            borrowDate: new Date().toISOString().split("T")[0],
            returnDate: null,
          };

          borrowData.records.push(record);
          borrowed.push(book.id);
        }
      }
    }

    await writeData("books.json", library);
    await writeData("borrowedBooks.json", borrowData);

    res.json({
      message: "Books borrowed successfully",
      borrowedBooks: borrowed,
    });

  } catch (err) {
    res.status(500).json({ message: "Error borrowing books" });
  }
};

exports.userBooks = async (req, res) => {
  try {
    let { userId } = req.params;
    userId = parseInt(userId);

    const data = await readData("borrowedBooks.json");

    const userData = data.records.filter(
      (record) => record.userId === userId
    );

    res.json(userData);
  } catch (err) {
    res.status(500).json({ message: "Error fetching user books" });
  }
};

exports.bookUsers = async (req, res) => {
  try {
    let { bookId } = req.params;
    bookId = parseInt(bookId);

    const data = await readData("borrowedBooks.json");

    const bookData = data.records.filter(
      (record) => record.bookId === bookId
    );

    res.json(bookData);
  } catch (err) {
    res.status(500).json({ message: "Error fetching book users" });
  }
};


exports.userLogin = async (req, res) => {
  try {
    let user = req.body;

    if (!user.id || !user.name || !user.email) {
      return res.status(400).json({
        message: "All fields (id, name, email) are required",
      });
    }

    const usersData = await readData("users.json");

    const exists = usersData.users.find((u) => u.id === user.id);

    if (exists) {
      return res.status(400).json({ message: "User already exists" });
    }

    usersData.users.push({
      ...user,
      borrowedBooks: [],
    });

    await writeData("users.json", usersData);

    res.json({ message: "User registered successfully" });

  } catch (err) {
    res.status(500).json({ message: "Error in login" });
  }
};