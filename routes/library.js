const express = require("express");
const router = express.Router();

const { getBooks, borrowBook, userBooks, bookUsers, userLogin} = require("../controller/library");

router.get("/books", getBooks);

router.post("/users/:userId/books", borrowBook);

router.get("/users/:userId/books", userBooks);

router.get("/books/:bookId/users", bookUsers);

router.post("/login", userLogin);

router.post

module.exports = router;