const { defineQuery } = require("next-sanity");

export const USER_SIGNIN_QUERY = defineQuery(
    `*[_type == "user" && userid == $userid][0]
    {
    _id,userid,password,name,role
    }`);

export const USER_BY_EMAIL_QUERY = defineQuery(`
  *[_type == "author" && userid == $userid][0]{
  _id,name,userid,role
  }
  `);
