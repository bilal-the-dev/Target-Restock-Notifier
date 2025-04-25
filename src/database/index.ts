import dbConstructor from "better-sqlite3";

const db = dbConstructor("./database.db");

export default db;
