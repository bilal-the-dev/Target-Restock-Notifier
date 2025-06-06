import { ChannelType } from "discord.js";
import { EmbedBuilder } from "@discordjs/builders";
import { randomUUID } from "crypto";
import {
  createMonitor,
  deleteMonitorByName,
  getMonitorByName,
  getAllMonitorNames,
  getAllMonitors,
} from "../database/queries.js";
import { extendedAPICommand } from "../utils/typings/types.js";

export default {
  name: "monitor",
  description: "Manage Target product monitors",
  options: [
    {
      name: "add",
      description: "Create a monitor for a Target product",
      type: 1,
      options: [
        {
          name: "monitor_name",
          description: "Unique name for this monitor",
          type: 3,
          required: true,
        },
        {
          name: "target_url",
          description: "Target product URL to monitor",
          type: 3,
          required: true,
        },
      ],
    },
    {
      name: "remove",
      description: "Remove a monitor by name",
      type: 1,
      options: [
        {
          name: "monitor_name",
          description: "Name of the monitor to delete",
          type: 3,
          required: true,
          autocomplete: true,
        },
      ],
    },
    {
      name: "view",
      description: "View a monitor by name",
      type: 1,
      options: [
        {
          name: "monitor_name",
          description: "Name of the monitor to view",
          type: 3,
          required: true,
          autocomplete: true,
        },
      ],
    },
    {
      name: "view_all",
      description: "View all monitors in the system",
      type: 1,
    },
  ],

  autocomplete: async (interaction) => {
    const focused = interaction.options.getFocused(true);

    const all = getAllMonitorNames.all();

    const filtered = all
      .filter((m) =>
        m.name.toLowerCase().startsWith(focused.value.toLowerCase())
      )
      .slice(0, 25)
      .map((m) => ({ name: m.name, value: m.name }));

    return filtered;
  },

  async execute(interaction) {
    if (!interaction.inCachedGuild()) return;
    const { options, channel } = interaction;

    if (channel?.type !== ChannelType.GuildText) {
      throw new Error("This command must be run in a text channel.");
    }

    const subcommand = options.getSubcommand();
    const channelId = channel.id;

    if (subcommand === "add") {
      const name = options.getString("monitor_name", true);
      const targetURL = options.getString("target_url", true);

      createMonitor.run({
        id: randomUUID(),
        name,
        targetURL,
        channelId,
      });

      await interaction.reply(`✅ Monitor \`${name}\` set for: ${targetURL}`);
    }

    if (subcommand === "remove") {
      const name = options.getString("monitor_name", true);
      const result = deleteMonitorByName.run({ name });

      if (result.changes === 0) {
        throw new Error(`❌ No monitor found with name: ${name}`);
      }

      await interaction.reply(`🗑️ Monitor \`${name}\` removed.`);
    }

    if (subcommand === "view") {
      const name = options.getString("monitor_name", true);
      const monitor = getMonitorByName.get({ name });

      if (!monitor) {
        throw new Error(`❌ No monitor found with name: ${name}`);
      }

      const embed = new EmbedBuilder()
        .setTitle(`📦 Monitor: ${name}`)
        .setDescription(
          `**Target URL**: ${monitor.targetURL}\n\n` +
            `**Stock Status**: ${monitor.stockStatus}\n\n` +
            `**Channel**: <#${monitor.channelId}>`
        )
        .setColor(0x00bfff);

      await interaction.reply({ embeds: [embed] });
    }

    if (subcommand === "view_all") {
      const monitors = getAllMonitors.all();

      if (!monitors.length) {
        return await interaction.reply("📭 No monitors found.");
      }

      const embed = new EmbedBuilder()
        .setTitle("📋 All Active Target Monitors")
        .setColor(0x00bfff);

      const description = monitors
        .map(
          (m, i) =>
            `**${i + 1}.** [${m.name}](${m.targetURL}) <#${m.channelId}>\n`
        )
        .join("\n");

      embed.setDescription(description.slice(0, 4000));

      await interaction.reply({ embeds: [embed] });
    }
  },
} satisfies extendedAPICommand;
