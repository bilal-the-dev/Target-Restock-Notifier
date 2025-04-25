import db from "./index.js";

db.exec(`CREATE TABLE IF NOT EXISTS monitors
(
  channelId TEXT NOT NULL UNIQUE,
  vintedURL TEXT NOT NULL,
  webhookId TEXT NOT NULL,
  webhookToken TEXT NOT NULL
)`);
