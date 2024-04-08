const usersRepository = require('./users-repository');
const { hashPassword, passwordMatched } = require('../../../utils/password');
const bcrypt = require('bcrypt');
const { errorResponder, errorTypes } = require('../../../core/errors');

/**
 * Get list of users
 * @returns {Array}
 */
async function getUsers() {
  const users = await usersRepository.getUsers();

  const results = [];
  for (let i = 0; i < users.length; i += 1) {
    const user = users[i];
    results.push({
      id: user.id,
      name: user.name,
      email: user.email,
    });
  }

  return results;
}

/**
 * Get user detail
 * @param {string} id - User ID
 * @returns {Object}
 */
async function getUser(id) {
  const user = await usersRepository.getUser(id);

  // User not found
  if (!user) {
    return null;
  }

  return {
    id: user.id,
    name: user.name,
    email: user.email,
  };
}

/**
 * Create new user
 * @param {string} name - Name
 * @param {string} email - Email
 * @param {string} password - Password
 * @returns {boolean}
 */
async function createUser(name, email, password) {
  // Hash password
  const hashedPassword = await hashPassword(password);

  try {
    await usersRepository.createUser(name, email, hashedPassword);
  } catch (err) {
    return null;
  }

  return true;
}

/**
 * Update existing user
 * @param {string} id - User ID
 * @param {string} name - Name
 * @param {string} email - Email
 * @returns {boolean}
 */
async function updateUser(id, name, email) {
  const user = await usersRepository.getUser(id);

  // User not found
  if (!user) {
    return null;
  }

  try {
    await usersRepository.updateUser(id, name, email);
  } catch (err) {
    return null;
  }

  return true;
}

/**
 * Delete user
 * @param {string} id - User ID
 * @returns {boolean}
 */
async function deleteUser(id) {
  const user = await usersRepository.getUser(id);

  // User not found
  if (!user) {
    return null;
  }

  try {
    await usersRepository.deleteUser(id);
  } catch (err) {
    return null;
  }

  return true;
}

/**
 * Duplicate Mail Checker
 * @param {string} email - Email
 * @returns {boolean}
 */
async function isDupli(email) {
  const findMail = await usersRepository.findMail(email);
  if (findMail) {
    return true;
  } else {
    return false;
  }
}

/**
 * Change User Password
 * @param {string} id - User ID
 * @param {string} oldPass - Old password
 * @param {string} newPass - New password
 * @returns {boolean}
 */
async function changePassword(id, oldPass, newPass) {
  const user = await usersRepository.getUser(id);

  // User not found
  if (!user) {
    return null;
  }

  const passwordChecked = await passwordMatched(oldPass, user.password);
  if (!passwordChecked) {
    throw errorResponder(
      errorTypes.INVALID_CREDENTIALS,
      'Password Lama Tidak Sesuai'
    );
  }

  const newPass_Hashed = await hashPassword(newPass);

  try {
    await usersRepository.changePassword(id, newPass_Hashed);
  } catch (err) {
    return null;
  }

  return true;
}

module.exports = {
  getUsers,
  getUser,
  createUser,
  updateUser,
  deleteUser,
  isDupli,
  changePassword,
};