import mysql from "mysql2";

export const db = mysql.createPool({
  host: "localhost",
  user: "root",
  password: process.env.SQL_PASSWORD,
  database: "BlogPosts", //alternate this name 
}).promise();
