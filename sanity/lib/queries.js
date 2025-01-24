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

export const CASH_SUMMARY_BY_PAGINATION_QUERY = defineQuery(`
    *[_type == "cash_summary"] | order(datetime desc, shiftNumber desc)[$indexOfFirstRecord .. $indexOfLastRecord]
    {
      _id,
      datetime,
      shiftNumber,
      ownedToRestaurantSafe,
      createdBy->{
        name,
        userid
      }
    }`);

export const TOTAL_NUMBER_OF_CASH_SUMMARY_QUERY = defineQuery(`
  count(*[_type == "cash_summary"])`);

