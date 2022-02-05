const User = require('../models/user');

module.exports.getUsers = (req, res) => {
  User.find({})
    .then(users => res.send({ data: users }))
    .catch(() => error(res, 500, 'Произошла ошибка'));
};

module.exports.getUserById = (req, res) => {
  User.findById(req.params.id)
    .then(user => {
      if (user) {
        return res.send({ data: user })
      }
      return error(res, 404, 'Пользователь не найден');
    })
    .catch((err) => {
      if (err.name === 'CastError') {
        return error(res, 404, 'Пользователь не найден');
      }
      return error(res, 500, 'Произошла ошибка');
    });
};

module.exports.createUser = (req, res) => {
  const { name, about, avatar } = req.body;
  User.create({ name, about, avatar })
    .then(user => res.send({ data: user }))
    .catch((err) => {
      if (err.name === 'ValidationError') {
        return error(res, 400, err.message);
      }
      return error(res, 500, 'Произошла ошибка');
    });
};

module.exports.updateUser = (req, res) => {
  User.findByIdAndUpdate(req.user._id,
    {
      name: req.body.name,
      about: req.body.about
    },
    {
      runValidators: true
    })
    .then(user => res.send({ data: user }))
    .catch((err) => {
      if (err.name === 'ValidationError') {
        return error(res, 400, err.message);
      }
      return error(res, 500, 'Произошла ошибка');
    });
};

module.exports.updateAvatar = (req, res) => {
  User.findByIdAndUpdate(req.user._id, {
    avatar: req.body.avatar
  })
    .then(user => res.send({ data: user }))
    .catch(() => error(res, 500, 'Произошла ошибка'));
};

function error(res, errorCode, message) {
  return res.status(errorCode).send({ message: message });
};
