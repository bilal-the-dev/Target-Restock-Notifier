import { Monitor } from "../utils/typings/types.js";
import db from "./index.js";

export const createMonitor = db.prepare<Monitor>(`
  INSERT INTO monitors (channelId, vintedURL, webhookId, webhookToken )
  VALUES (@channelId, @vintedURL, @webhookId, @webhookToken)
  ON CONFLICT (channelId) DO UPDATE SET
  vintedURL = @vintedURL,
  webhookId = @webhookId,
  webhookToken = @webhookToken
`);

export const deleteMonitor = db.prepare<{ channelId: string }>(`
  DELETE FROM monitors
  WHERE channelId = @channelId
`);

export const getMonitor = db.prepare<{ channelId: string }, Monitor>(`
  SELECT * FROM monitors
  WHERE channelId = @channelId
`);

export const getAllMonitors = db.prepare<[], Monitor>(`
  SELECT * FROM monitors
`);
