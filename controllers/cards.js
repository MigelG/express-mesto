const Card = require('../models/card');
const NotFoundError = require('../errors/NotFoundError');
const CastError = require('../errors/CastError');
const ValidationError = require('../errors/ValidationError');
const ForbiddenError = require('../errors/ForbiddenError');

function checkResponse(res, card) {
  if (card) {
    return res.send({ data: card });
  }
  throw new NotFoundError('Карточка не найдена');
}

function handleCatch(res, err, next) {
  if (err.name === 'CastError') {
    next(new CastError('Передан невалидный id'));
  }
  next(err);
}

module.exports.getCards = (req, res, next) => {
  Card.find({})
    .then((cards) => res.send({ data: cards }))
    .catch(next);
};

module.exports.createCard = (req, res, next) => {
  const { name, link } = req.body;
  Card.create({ name, link, owner: req.user._id })
    .then((card) => res.send({ data: card }))
    .catch((err) => {
      if (err.name === 'ValidationError') {
        next(new ValidationError(err.message));
      }
      next(err);
    });
};

module.exports.deleteCard = (req, res, next) => {
  Card.findById(req.params.id)
    .then((card) => {
      if (!card) {
        throw new NotFoundError('Карточка не найдена');
      }
      if (JSON.stringify(card.owner).slice(1, -1) !== req.user._id) {
        throw new ForbiddenError('Нет доступа');
      }
      return card.remove();
    })
    .then((result) => {
      checkResponse(res, result);
    })
    .catch((err) => handleCatch(res, err, next));
};

module.exports.likeCard = (req, res, next) => {
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
    .catch((err) => handleCatch(res, err, next));
};

module.exports.dislikeCard = (req, res, next) => {
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
    .catch((err) => handleCatch(res, err, next));
};
