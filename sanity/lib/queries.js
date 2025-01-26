const { defineQuery } = require("next-sanity");

export const USER_SIGNIN_QUERY = defineQuery(
    `*[_type == "user" && userid == $userid][0]
    {
    _id,userid,password,name,role
    }`);

export const USER_BY_USERID_QUERY = defineQuery(`
  *[_type == "author" && userid == $userid][0]{
  _id,userid
  }
  `);

export const ALL_USERS_QUERY = defineQuery(`
  *[_type == "user"]{
    _id,userid,name,role
  }`);

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

export const ALL_ORDER_ITEMS_QUERY = defineQuery(`
  *[_type == "order_item"]{
    _id,
    name,
  }`);