module.exports = (err, req, res, next) => {
  const statusCode = err.statusCode || 500;
  const message = err.message || 'Ошибка на стороне сервера';
  res.status(statusCode).send({ message });
  next();
};
