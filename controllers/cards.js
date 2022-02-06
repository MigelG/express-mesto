const Card = require('../models/card');

function error(res, errorCode, message) {
  return res.status(errorCode).send({ message });
}

function checkResponse(res, card) {
  if (card) {
    return res.send({ data: card });
  }
  return error(res, 404, 'Карточка не найдена');
}

function handleCatch(res, err) {
  if (err.name === 'CastError') {
    return error(res, 400, 'Передан невалидный id');
  }
  return error(res, 500, 'Произошла ошибка');
}

module.exports.getCards = (req, res) => {
  Card.find({})
    .then((cards) => res.send({ data: cards }))
    .catch(() => error(res, 500, 'Произошла ошибка'));
};

module.exports.createCard = (req, res) => {
  const { name, link } = req.body;
  Card.create({ name, link, owner: req.user._id })
    .then((card) => res.send({ data: card }))
    .catch((err) => {
      if (err.name === 'ValidationError') {
        return error(res, 400, err.message);
      }
      return error(res, 500, 'Произошла ошибка');
    });
};

module.exports.deleteCard = (req, res) => {
  Card.findByIdAndRemove(req.params.id)
    .then((card) => checkResponse(res, card))
    .catch((err) => handleCatch(res, err));
};

module.exports.likeCard = (req, res) => {
  Card.findByIdAndUpdate(
    req.params.cardId,
    {
      $addToSet: { likes: req.user._id },
    },
    {
      new: true,
    },
  )
    .then((card) => checkResponse(res, card))
    .catch((err) => handleCatch(res, err));
};

module.exports.dislikeCard = (req, res) => {
  Card.findByIdAndUpdate(
    req.params.cardId,
    {
      $pull: { likes: req.user._id },
    },
    {
      new: true,
    },
  )
    .then((card) => checkResponse(res, card))
    .catch((err) => handleCatch(res, err));
};
