const { celebrate, Joi } = require('celebrate');
const router = require('express').Router();
const {
  getUsers, getUserById, getUser, updateUser, updateAvatar,
} = require('../controllers/users');

router.get('/', getUsers);

router.get('/me', getUser);

router.get('/:id', celebrate({
  params: Joi.object().keys({
    id: Joi.string().required().hex().length(24),
  }),
}), getUserById);

router.patch('/me', celebrate({
  body: Joi.object().keys({
    name: Joi.string().min(2).max(30).required(),
    about: Joi.string().min(2).max(30).required(),
  }),
}), updateUser);

router.patch('/me/avatar', celebrate({
  body: Joi.object().keys({
    avatar: Joi.string().required().pattern(/^https?:\/\/[\w\-.~:/?#@!$&'()*+,;=]+\.[\w\-.~:/?#@!$&'()*+,;=]+$/),
  }),
}), updateAvatar);

module.exports = router;
