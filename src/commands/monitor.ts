import { ChannelType } from "discord.js";
import { extendedAPICommand } from "../utils/typings/types.js";
import { EmbedBuilder } from "@discordjs/builders";

import {
  createMonitor,
  deleteMonitor,
  getAllMonitors,
} from "../database/queries.js";

export default {
  name: "monitor",
  description: "Manage Vinted monitor.",
  options: [
    {
      name: "set",
      description: "Set a Vinted monitor for this channel.",
      type: 1,
      options: [
        {
          name: "vinted_url",
          description: "The Vinted URL to monitor.",
          type: 3,
          required: true,
        },
      ],
    },
    {
      name: "remove",
      description: "Remove the Vinted monitor for this channel.",
      type: 1,
    },
    {
      name: "view",
      description: "View the Vinted monitor for channels.",
      type: 1,
    },
  ],

  async execute(interaction) {
    if (!interaction.inCachedGuild()) return;
    const { options, channel, client, guild } = interaction;

    const subcommand = options.getSubcommand();

    if (channel?.type !== ChannelType.GuildText)
      throw new Error("Must run within a text channel!");

    const channelId = channel.id;

    if (subcommand === "set") {
      const vintedURL = options.getString("vinted_url", true);

      let webhook;

      webhook = (await channel.fetchWebhooks()).find(
        (wh) => wh.owner?.id === client.user.id
      );

      if (!webhook) {
        webhook = await channel.createWebhook({
          name: "Vinted Monitor",
          avatar: client.user.displayAvatarURL(),
        });
      }

      createMonitor.run({
        channelId,
        vintedURL,
        webhookId: webhook.id,
        webhookToken: webhook.token!,
      });

      await interaction.reply(`✅ Monitor set for: ${vintedURL}`);
    }

    if (subcommand === "remove") {
      const result = deleteMonitor.run({ channelId });

      console.log(result);

      if (result.changes === 0)
        throw new Error("⚠️ No monitor is set for this channel.");

      await interaction.reply(`🗑️ Monitor removed for this channel.`);
    }

    if (subcommand === "view") {
      const monitors = getAllMonitors.all();

      if (monitors.length === 0)
        throw new Error("📭 No monitors set for any channels.");

      const embed = new EmbedBuilder()
        .setTitle("📋 Active Vinted Monitors")
        .setColor(0x0099ff);

      let desc = "";

      for (const [i, monitor] of monitors.entries()) {
        const channelObj = guild.channels.cache.get(monitor.channelId);

        desc += `${i + 1}. ${channelObj ?? channelId}: ${monitor.vintedURL}\n\n`;
      }

      embed.setDescription(desc);

      await interaction.reply({ embeds: [embed] });
    }
  },
} satisfies extendedAPICommand;
