const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const asyncWapper = require('../middleware/asyncWapper');
const appError = require('../utils/appError');
const httpStatus = require('../utils/httpStatus');


const registerUser = asyncWapper(async (req, res, next) => {
  const { name, email, password, role } = req.body;

  if (!name || !email || !password) {
    const error = appError.create(
      "Please provide name, email, and password",
      400,
      httpStatus.FAIL
    );
    return next(error);
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    const error = appError.create("Please provide a valid email", 400, httpStatus.FAIL);
    return next(error);
  }

  if (password.length < 8) {
    const error = appError.create("Password must be at least 8 characters", 400, httpStatus.FAIL);
    return next(error);
  }

  const existingUser = await User.findOne({ where: { email } });
  if (existingUser) {
    const error = appError.create("User already exists", 400, httpStatus.FAIL);
    return next(error);
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  const newUser = await User.create({
    name,
    email,
    password: hashedPassword,
    role: role || "user",
  });

  if (!newUser) {
    const error = appError.create("Something went wrong while creating the user", 500, httpStatus.ERROR);
    return next(error);
  }

  res.status(201).json({ status: httpStatus.SUCCESS, data: { user: newUser } });
});



const loginUser = asyncWapper(async (req, res, next) => {
  const { email, password } = req.body;

  if (!email || !password) {
    const error = appError.create(
      "Please provide email and password",
      400,
      httpStatus.FAIL
    );
    return next(error);
  }

  const user = await User.findOne({ where: { email } });
  if (!user) {
    const error = appError.create("Invalid email or password", 400, httpStatus.FAIL);
    return next(error);
  }

  const isPasswordValid = await bcrypt.compare(password, user.password);
  if (!isPasswordValid) {
    const error = appError.create("Invalid email or password", 400, httpStatus.FAIL);
    return next(error);
  }

  const token = jwt.sign(
    { id: user.id, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: "7d" }
  );

  res.status(200).json({
    status: httpStatus.SUCCESS,
    data: {
      token,
      user: { id: user.id, name: user.name, email: user.email, role: user.role },
    }
  });
});

module.exports = { registerUser, loginUser };