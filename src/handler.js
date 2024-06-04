const { nanoid } = require('nanoid');
const books = require('./books');

const addBookHandler = (request, h) => {
  const {
    name, year, author, summary, publisher, pageCount, readPage, reading,
  } = request.payload;

  const id = nanoid(16);
  const insertedAt = new Date().toISOString();
  const updatedAt = insertedAt;

  const finished = pageCount === readPage;

  if (!name) {
    const response = h.response({
      status: 'fail',
      message: 'Gagal menambahkan buku. Mohon isi nama buku',
    });

    response.code(400);
    return response;
  }

  if (readPage > pageCount) {
    const response = h.response({
      status: 'fail',
      message: 'Gagal menambahkan buku. readPage tidak boleh lebih besar dari pageCount',
    });

    response.code(400);
    return response;
  }

  const newBook = {
    id,
    name,
    year,
    author,
    summary,
    publisher,
    pageCount,
    readPage,
    finished,
    reading,
    insertedAt,
    updatedAt,
  };

  books.push(newBook);

  const isSuccess = books.filter((book) => book.id === id).length > 0;

  if (isSuccess) {
    const response = h.response({
      status: 'success',
      message: 'Buku berhasil ditambahkan',
      data: {
        bookId: id,
      },
    });

    response.code(201);
    return response;
  }

  const response = h.response({
    status: 'fail',
    message: 'Buku gagal ditambahkan',
  });
  response.code('500');
  return response;
};

const getAllBooksHandler = (request, h) => {
  const { name, reading, finished } = request.query;

  const filterBooks = (filterFn) => books
    .filter(filterFn)
    .map((book) => ({
      id: book.id,
      name: book.name,
      publisher: book.publisher,
    }));

  let filteredBooks = books.map((book) => ({
    id: book.id,
    name: book.name,
    publisher: book.publisher,
  }));

  if (reading !== undefined) {
    filteredBooks = filterBooks(
      (book) => Number(book.reading) === Number(reading),
    );
  }

  if (finished !== undefined) {
    filteredBooks = filterBooks(
      (book) => Number(book.finished) === Number(finished),
    );
  }

  if (name !== undefined) {
    const bookName = books.filter((book) => book.name.toLowerCase().includes(name.toLowerCase()));
    return {
      status: 'success',
      data: {
        books: bookName.map((book) => ({
          id: book.id,
          name: book.name,
          publisher: book.publisher,
        })),
      },
    };
  }

  const response = h.response({
    status: 'success',
    data: {
      books: filteredBooks,
    },
  });
  response.code(200);
  return response;
};

const getBookId = (req, h) => {
  const { bookId } = req.params;
  const book = books.find((b) => b.id === bookId);

  if (book) {
    return h.response({
      status: 'success',
      data: {
        book: {
          id: book.id,
          name: book.name,
          year: book.year,
          author: book.author,
          summary: book.summary,
          publisher: book.publisher,
          pageCount: book.pageCount,
          readPage: book.readPage,
          finished: book.finished,
          reading: book.reading,
          insertedAt: book.insertedAt,
          updatedAt: book.updatedAt,
        },
      },
    }).code(200);
  }

  return h.response({
    status: 'fail',
    message: 'Buku tidak ditemukan',
  }).code(404);
};

const editBook = (req, h) => {
  const { bookId } = req.params;
  const {
    name, year, author, summary, publisher, pageCount, readPage, reading,
  } = req.payload;

  if (!name) {
    return h.response({
      status: 'fail',
      message: 'Gagal memperbarui buku. Mohon isi nama buku',
    }).code(400);
  }

  if (readPage > pageCount) {
    return h.response({
      status: 'fail',
      message: 'Gagal memperbarui buku. readPage tidak boleh lebih besar dari pageCount',
    }).code(400);
  }

  const index = books.findIndex((book) => book.id === bookId);

  if (index === -1) {
    return h.response({
      status: 'fail',
      message: 'Gagal memperbarui buku. Id tidak ditemukan',
    }).code(404);
  }

  const updatedAt = new Date().toISOString();

  books[index] = {
    ...books[index],
    name,
    year,
    author,
    summary,
    publisher,
    pageCount,
    readPage,
    reading,
    updatedAt,
  };

  return h.response({
    status: 'success',
    message: 'Buku berhasil diperbarui',
  }).code(200);
};

const deleteBook = (req, h) => {
  const { bookId } = req.params;
  const index = books.findIndex((book) => book.id === bookId);

  if (index === -1) {
    return h.response({
      status: 'fail',
      message: 'Buku gagal dihapus. Id tidak ditemukan',
    }).code(404);
  }

  books.splice(index, 1);
  return h.response({
    status: 'success',
    message: 'Buku berhasil dihapus',
  }).code(200);
};

module.exports = {
  addBookHandler, getAllBooksHandler, getBookId, editBook, deleteBook,
};
