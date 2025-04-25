import { Client } from "discord.js";
import { CronJob } from "cron";

import registerAndAttachCommandsOnClient from "../../utils/registrars/registerCommands.js";
import {
  fetchVintedAccessToken,
  scrapeVintedMonitors,
} from "../../utils/vintedScraper.js";

export default async (client: Client<true>) => {
  console.log(`${client.user.username} (${client.user.id}) is ready 🐬`);
  await registerAndAttachCommandsOnClient(client);

  await fetchVintedAccessToken();
  CronJob.from({
    cronTime: "*/30 * * * * *",
    onTick: scrapeVintedMonitors,
    start: true,
  });
};
