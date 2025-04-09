const { validate } = require("uuid");

function isValidUUID(id) {
  return validate(id);
}

function isValidDate(datString) {
  return (datString && new Date(datString).toString() !== "Invalid Date") || false;
}

function findPaginated(page, limit) {
  page = Math.abs(parseInt(page)) || 1;
  limit = Math.abs(parseInt(limit)) || 10;

  limit = limit > 50 ? 50 : limit;
  page = page >= 1 ? page - 1 : 0;

  const offset = page * limit;

  return { limit, offset, page };
}

module.exports = {
  isValidUUID,
  isValidDate,
  findPaginated
};
