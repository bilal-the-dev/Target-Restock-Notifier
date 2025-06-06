import db from "./index.js";

db.exec(`
  CREATE TABLE IF NOT EXISTS monitors (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL UNIQUE,
    targetURL TEXT NOT NULL,
    stockStatus TEXT NOT NULL DEFAULT 'OUT_OF_STOCK' CHECK(stockStatus IN ('IN_STOCK', 'OUT_OF_STOCK')),
    channelId TEXT NOT NULL
  );
  `);
