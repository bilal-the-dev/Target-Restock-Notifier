import { ChannelType, Webhook } from "discord.js";
import { extendedAPICommand } from "../utils/typings/types.js";
import { EmbedBuilder } from "@discordjs/builders";

import CurlImpersonate from "node-curl-impersonate";

const monitors: {
  [channelId: string]: {
    webhookUrl: Webhook;
    vintedUrl: string;
    queryStringForAPI: string;
    cachedProducts: any[];
  };
} = {};

const cookie = `eyJraWQiOiJFNTdZZHJ1SHBsQWp1MmNObzFEb3JIM2oyN0J1NS1zX09QNVB3UGlobjVNIiwiYWxnIjoiUFMyNTYifQ.eyJhcHBfaWQiOjQsImNsaWVudF9pZCI6IndlYiIsImF1ZCI6ImZyLmNvcmUuYXBpIiwiaXNzIjoidmludGVkLWlhbS1zZXJ2aWNlIiwiaWF0IjoxNzQzMzU2NjY5LCJzaWQiOiIwYTM2OTJjYS0xNzQzMDAxODI0Iiwic2NvcGUiOiJwdWJsaWMiLCJleHAiOjE3NDMzNjM4NjksInB1cnBvc2UiOiJhY2Nlc3MifQ.qiCdtaHHITuRxaXXlHHeaDjftMcUDtGREe7s-fc-ycSL5Cq3NwTj34o-T1Yfga8BZTSiyy6NAiEvatrwJ8eSyfB9L--FR-esfDpR6WXdqYP5AN26l0GpVE2XuVCfaNIa84QYYCSahFHBV_ZhOkjiF4nMnW8C8j4soEbFMitvUsGTMpyRAnuak7t6XIM7nR1kaK8iY1n7JEiqZN3Q_i-nwEEzJtQEvWsjUnDDP3S7z04EWogobRxzyBzY6mC8Tx6JMXrlYGg1JpcyicNCfNQRJpNvOcCHNqK4m9b8UMJoXds78EukMX8ij6uNgIFiFecXTIa8AG2KU3pR8IJ619B09w; refresh_token_web=eyJraWQiOiJFNTdZZHJ1SHBsQWp1MmNObzFEb3JIM2oyN0J1NS1zX09QNVB3UGlobjVNIiwiYWxnIjoiUFMyNTYifQ.eyJhcHBfaWQiOjQsImNsaWVudF9pZCI6IndlYiIsImF1ZCI6ImZyLmNvcmUuYXBpIiwiaXNzIjoidmludGVkLWlhbS1zZXJ2aWNlIiwiaWF0IjoxNzQzMzU2NjY5LCJzaWQiOiIwYTM2OTJjYS0xNzQzMDAxODI0Iiwic2NvcGUiOiJwdWJsaWMiLCJleHAiOjE3NDM5NjE0NjksInB1cnBvc2UiOiJyZWZyZXNoIn0.d8DfWksP7F7JJKk9BNdPorpMsdmYLK8ByYCRlKTPiAYKBlOrXVywU7zyKHOuJY9zzIxJhlV-ISi0ENwZEDimnh2bJywUDlPPKWqnLrgKK0aBcy13cZbtBzqK8M13cNo6-yko2smsZka9TEt2i8B8HBwNe_taXOfbTM3TQI1uSTL2xTWpBMl8NV1WQGJvPIVOg0Oow9ykHW5Ne2pZ26K2BAf8X3XLSzUOLQaveRf2UwuNW6Uf1hitme4Vw062a2CTj562vIH7_ZDdtKwx6u3OMNzC1yYS9XdbXtUO4U_4xXSKGljqZ0cgRLkVY7s_9gb9anK5t-NUHgW4QQvudbkBEQ`;
const VINTED_URL = `https://www.vinted.fr/api/v2`;

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
      const vintedUrl = options.getString("vinted_url", true);

      let webhookUrl;

      webhookUrl = (await channel.fetchWebhooks()).find(
        (wh) => wh.owner?.id === client.user.id
      );
      if (!webhookUrl) {
        webhookUrl = await channel.createWebhook({
          name: "Vinted Monitor",
          avatar: client.user.displayAvatarURL(),
        });
      }
      const map = [
        "brand_ids[]",
        "color_ids[]",
        "price_from",
        "price_to",
        "material_ids[]",
        "status_ids[]",
        "size_ids[]",
        "search_text",
        "catalog[]",
        // "catalog_from",
      ];
      const params = new URL(vintedUrl).searchParams;

      const customQueryParams = new URLSearchParams(
        `page=1&per_page=200&currency=EUR&order=newest_first`
      );

      for (const key of map) {
        console.log(key);

        // if (params.has(key))
        customQueryParams.set(
          key === "catalog[]" ? "catalog_ids" : key.replace("[]", ""),
          params.get(key) ?? ""
        );
      }

      console.log(customQueryParams.toString());

      monitors[channelId] = {
        webhookUrl,
        vintedUrl,
        queryStringForAPI: customQueryParams.toString(),
        cachedProducts: [],
      };

      await interaction.reply(`✅ Monitor set for: ${vintedUrl}`);
      setLoopForVintedScraping(channelId);
    }

    if (subcommand === "remove") {
      if (!monitors[channelId])
        throw new Error("⚠️ No monitor is set for this channel.");

      delete monitors[channelId];
      await interaction.reply(`🗑️ Monitor removed for this channel.`);
    }

    if (subcommand === "view") {
      if (Object.keys(monitors).length === 0)
        throw new Error("📭 No monitors set for any channels.");

      const embed = new EmbedBuilder()
        .setTitle("📋 Active Vinted Monitors")
        .setColor(0x0099ff);

      for (const [channelId, data] of Object.entries(monitors)) {
        const channelObj = guild.channels.cache.get(channelId);
        embed.addFields({
          name: channelObj ? `#${channelObj.name}` : `Channel ID: ${channelId}`,
          value: `🔗 **Vinted URL:** ${data.vintedUrl}`,
          inline: false,
        });
      }

      await interaction.reply({ embeds: [embed] });
    }
  },
} satisfies extendedAPICommand;

async function setLoopForVintedScraping(channelId: string) {
  while (true) {
    try {
      console.log(`Looping for ${channelId} but waiting!`);

      await new Promise((res) => {
        setTimeout(() => {
          res("s");
        }, 1000 * 60);
      });
      console.log(`Wait finished for ${channelId}!`);
      const monitor = monitors[channelId];
      if (!monitor) break;
      console.log(
        `Running loop for the channel ${channelId} with vinted monitor ${monitor.vintedUrl}`
      );
      const url = `${VINTED_URL}/catalog/items?${monitor.queryStringForAPI}`;

      const curlImpersonate = new CurlImpersonate(url, {
        method: "GET",
        impersonate: "chrome-116",
        headers: {
          cookie: `access_token_web=${cookie};`,
          origin: "https://vinted.fr",
          "sec-fetch-site": "same-origin",
          accept: "application/json, text/plain, */*",
        },
      });

      const { response, statusCode } = await curlImpersonate.makeRequest();

      const data = response as any;
      // const res = await fetch(url, {
      //   headers: {
      //     cookie: `access_token_web=${cookie};`,
      //     origin: "https://vinted.fr",
      //     "sec-fetch-site": "same-origin",
      //     accept: "application/json, text/plain, */*",
      //   },
      // });

      if (statusCode && ["4", "5"].includes(statusCode.toString()[0])) {
        console.error(data);
        continue;
      }

      // console.log(data);
      // let data;

      // if (res.headers.get("content-type")?.includes("text"))
      //   data = await res.text();
      // else data = await res.json();

      // if (!res.ok) {
      //   console.log(res);

      //   console.log(data);

      //   continue;
      // }

      console.log(`Fetched ${data.items.length} items!`);

      if (monitor.cachedProducts.length === 0) {
        console.log("First time pushing in cache!");

        monitor.cachedProducts.push(...data.items.map((i: any) => i.id));
        console.log(monitor.cachedProducts);

        continue;
      }

      const newItems = data.items.filter(
        (item: any) => !monitor.cachedProducts.includes(item.id)
      );

      console.log(`Fetched ${newItems.length} new items!`);

      console.log(newItems.map((i: any) => i.id));

      console.log(monitor.cachedProducts);

      if (newItems.length === 200) {
        console.log(
          "Seems like new sort of items that randomly appear ignoring!"
        );
        continue;
      }
      for (const p of newItems) {
        try {
          // send message to discord!!!
          let body: { embeds: any[] } = { embeds: [] };

          const fields = [
            {
              name: ":hourglass: Public",
              value: `<t:${Math.floor(Date.now() / 1000)}:R>`,
              inline: true,
            },
            { name: "🔖 Brand", value: p.brand_title, inline: true },
            {
              name: "💰 Price",
              value: `${p.price.amount} Euro | Totalle: ${p.total_item_price.amount} Euro`,
              inline: true,
            },
            { name: "💎 Status", value: p.status, inline: true },
            { name: "👀 Views", value: p.view_count, inline: true },
            { name: "💘 Favourites", value: p.favourite_count, inline: true },
            {
              name: "🐛 Extra Details",
              value: `${p.item_box.first_line} | ${p.item_box.second_line}`,
              inline: true,
            },
            ...(p.size_title && [
              { name: "📏 Size", value: p.size_title, inline: true },
            ]),
          ];

          body.embeds = [
            {
              color: parseInt("008000", 16),
              title: `:flag_fr: ${p.title}`,
              url: p.url,
              author: {
                name: p.user.login,
                url: p.user.profile_url,
                ...(p.user.photo?.url && { icon_url: p.user.photo.url }),
              },
              footer: { text: "©️ Vinted Scraper" },
              image: { url: p.photo.url },
              fields,
            },
          ];

          await sendWebhook(
            { id: monitor.webhookUrl.id, token: monitor.webhookUrl.token! },
            body
          );
          console.log("sent request");
        } catch (error) {
          console.log(error);
        }
      }
      monitor.cachedProducts = [
        ...monitor.cachedProducts,
        ...data.items.map((i: any) => i.id),
      ];
    } catch (error) {
      console.log(error);
    }
  }
}

async function sendWebhook(
  webhookData: { id: string; token: string },
  body: { embeds: any[] }
) {
  const url = `https://discord.com/api/v10/webhooks/${webhookData.id}/${webhookData.token}`;

  const res = await fetch(url, {
    method: "POST",
    headers: {
      "content-type": "application/json",
    },
    body: JSON.stringify(body),
  });

  if (res.status !== 204) {
    console.log(res);
    const d = await res.json();
    console.log(d);

    if (res.status === 429) return d.retry_after;
  }
}
