import { getAllMonitors } from "../database/queries.js";
import { Monitor } from "./typings/types.js";
import { convertToQueryString } from "./parse.js";
import ItemCache from "../structures/ItemCache.js";
import { sendWebhook } from "./webhook.js";
import CurlImpersonate from "node-curl-impersonate";

let cookieData: { access_token: string; refresh_token: string } | undefined;

export async function scrapeVintedMonitors() {
  const monitors = getAllMonitors.all();

  console.log(`Scraping ${monitors.length} monitors!`);

  for (const monitor of monitors) {
    await processItemsForMonitor(monitor);
  }
}

async function processItemsForMonitor(monitor: Monitor) {
  try {
    console.log(
      `Scraping for the channel ${monitor.channelId} with vinted monitor ${monitor.vintedURL}`
    );

    const oldItems = ItemCache.getItems(monitor.channelId);
    const queryStringForAPI = convertToQueryString(monitor.vintedURL);

    const url = `${process.env.VINTED_API_BASE_URL}/catalog/items?${queryStringForAPI}`;

    const curlImpersonate = new CurlImpersonate(url, {
      method: "GET",
      impersonate: "chrome-116",
      headers: generateHeaders(
        monitor.vintedURL,
        `access_token_web=${cookieData!.access_token}; refresh_token_web=${cookieData!.refresh_token};`
      ),
    });

    const { response, statusCode } = await curlImpersonate.makeRequest();

    const data = response as any;

    // const res = await fetch(url, {
    //   headers: generateHeaders(
    //     monitor.vintedURL,
    //     `access_token_web=${cookieData!.access_token}; refresh_token_web=${cookieData!.refresh_token};`
    //   ),
    // });

    // const statusCode = res.status

    if (statusCode === 401) {
      // refreshing cookie because they expires but skipping this monitor
      return await fetchVintedAccessToken();
    }

    if (statusCode && ["4", "5"].includes(statusCode.toString()[0])) {
      console.error(data);
      return;
    }

    // console.log(data);
    // let data;

    // if (res.headers.get("content-type")?.includes("text"))
    //   data = await res.text();
    // else data = await res.json();

    // if (!res.ok) {
    //   console.log(res);

    //   console.log(data);

    //   return;
    // }

    console.log(`Fetched ${data.items.length} items!`);

    const fetchedItemIds = data.items.map((i: any) => i.id);
    if (oldItems.length === 0) {
      console.log("First time pushing in cache!");

      ItemCache.setItems(monitor.channelId, fetchedItemIds);

      return;
    }

    const newItems = data.items.filter(
      (item: any) => !oldItems.includes(item.id)
    );

    const newItemIds = newItems.map((i: any) => i.id);

    console.log(`Fetched ${newItems.length} new items!`);

    console.log(newItemIds);

    if (newItems.length === 96) {
      console.log(
        "Seems like new sort of items that randomly appear ignoring!"
      );
      return;
    }

    for (const p of newItems.slice(0, 3)) {
      // max send 3 messages
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
          { id: monitor.webhookId, token: monitor.webhookToken },
          body
        );
        console.log("sent request");
      } catch (error) {
        console.log(error);
      }
    }

    ItemCache.addItems(monitor.channelId, newItemIds);
  } catch (error) {
    console.log(error);
  }
}

export const fetchVintedAccessToken = async () => {
  const res = await fetch(
    `${process.env.VINTED_BASE_URL}/web/api/auth/refresh`,
    {
      method: "post",
      headers: generateHeaders(
        `${process.env.VINTED_BASE_URL}/session-refresh?ref_url=%2F`,
        `refresh_token_web=${cookieData?.refresh_token ?? process.env.VINTED_OLD_REFRESH_TOKEN};`
      ),
    }
  );

  console.log(res);

  cookieData = await res.json();
  console.log(cookieData);
};

const generateHeaders = (
  referer: string,
  cookie?: string
): Record<string, string> => {
  return {
    accept: "application/json, text/plain, */*",
    "accept-encoding": "gzip, deflate, br, zstd",
    "accept-language": "en-fr",
    "cache-control": "no-cache",
    ...(cookie && { cookie }),
    origin: process.env.VINTED_BASE_URL,
    pragma: "no-cache",
    priority: "u=1, i",
    referer,
    "sec-ch-ua": "Google Chrome;v=135, Not-A.Brand;v=8, Chromium;v=135",
    "sec-ch-ua-arch": "x86",
    "sec-ch-ua-bitness": "64",
    "sec-ch-ua-full-version": "135.0.7049.115",
    "sec-ch-ua-full-version-list":
      "Google Chrome;v=135.0.7049.115, Not-A.Brand;v=8.0.0.0, Chromium;v=135.0.7049.115",
    "sec-ch-ua-mobile": "?0",
    "sec-ch-ua-model": "",
    "sec-ch-ua-platform": "Windows",
    "sec-ch-ua-platform-version": "19.0.0",
    "sec-fetch-dest": "empty",
    "sec-fetch-mode": "cors",
    "sec-fetch-site": "same-origin",
    "user-agent":
      "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/135.0.0.0 Safari/537.36",
  };
};
