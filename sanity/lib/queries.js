const { defineQuery } = require("next-sanity");

export const USER_SIGNIN_QUERY = defineQuery(
    `*[_type == "user" && email == $email][0]
    {
    _id,email,password,name,role
    }`);

export const USER_BY_EMAIL_QUERY = defineQuery(`
  *[_type == "author" && email == $email][0]{
  _id,name,email,role
  }
  `);
