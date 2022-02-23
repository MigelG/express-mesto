const express = require('express');
const { celebrate, Joi, errors } = require('celebrate');
const mongoose = require('mongoose');
const {
  login, createUser,
} = require('./controllers/users');
const auth = require('./middlewares/auth');
const handleErrors = require('./middlewares/errors');
const NotFoundError = require('./errors/NotFoundError');

const { PORT = 3000 } = process.env;

const app = express();

app.use(express.json());

mongoose.connect('mongodb://localhost:27017/mestodb', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
  .then(() => {
    console.log('MongoDB connected!');
  })
  .catch((err) => {
    console.log(`ERROR: ${err}`);
  });

app.post('/signin', celebrate({
  body: Joi.object().keys({
    email: Joi.string().required().email(),
    password: Joi.string().required(),
  }),
}), login);

app.post('/signup', celebrate({
  body: Joi.object().keys({
    name: Joi.string().min(2).max(30),
    about: Joi.string().min(2).max(30),
    avatar: Joi.string().pattern(/^https?:\/\/[\w\-.~:/?#@!$&'()*+,;=]+\.[\w\-.~:/?#@!$&'()*+,;=]+$/),
    email: Joi.string().required().email(),
    password: Joi.string().required(),
  }),
}), createUser);

app.use(auth);

app.use('/users', require('./routes/users'));
app.use('/cards', require('./routes/cards'));

app.use((req, res, next) => {
  next(new NotFoundError('Маршрут не найден'));
});

app.use(errors());

app.use((err, req, res, next) => {
  handleErrors(err, req, res, next);
});

app.listen(PORT, () => {
  console.log(`App listening on port ${PORT}`);
});
