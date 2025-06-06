import {
  Monitor,
  MonitorCreateOptions,
  StockStatus,
} from "../utils/typings/types.js";
import db from "./index.js";

export const createMonitor = db.prepare<MonitorCreateOptions>(`
  INSERT INTO monitors (id, name, targetURL, channelId)
  VALUES (@id, @name, @targetURL, @channelId)
  ON CONFLICT(name) DO UPDATE SET
    targetURL = excluded.targetURL,
    channelId = excluded.channelId
`);

export const deleteMonitorByName = db.prepare<{ name: string }>(`
  DELETE FROM monitors WHERE name = @name
`);

export const getMonitorByName = db.prepare<{ name: string }, Monitor>(`
  SELECT * FROM monitors WHERE name = @name
`);

export const getAllMonitors = db.prepare<[], Monitor>(`
  SELECT * FROM monitors
`);

export const getAllMonitorNames = db.prepare<[], Monitor>(`
  SELECT * FROM monitors
`);

export const updateMonitorStatus = db.prepare<{
  name: string;
  stockStatus: StockStatus;
}>(`
  UPDATE monitors
  SET stockStatus = @stockStatus
  WHERE name = @name
`);
