// Placeholder DB until PostgreSQL is configured
let users = [];

export const db = {
  users,

  findUserByEmail(email) {
    return users.find((u) => u.email === email);
  },

  createUser(user) {
    users.push(user);
    return user;
  }
};
