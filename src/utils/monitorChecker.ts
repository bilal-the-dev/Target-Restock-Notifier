import { Page } from "puppeteer";
// import puppeteer from "puppeteer";
import untypedPupeteer from "puppeteer-extra";
// add stealth plugin and use defaults (all evasion techniques)
import StealthPlugin from "puppeteer-extra-plugin-stealth";

const puppeteer = untypedPupeteer as unknown as any;
puppeteer.use(StealthPlugin());

import { Client } from "discord.js";
import { getAllMonitors, updateMonitorStatus } from "../database/queries.js";
import { STOCK_STATUS } from "./constants.js";
import { StockStatus } from "./typings/types.js";

const DEBUG = process.env.DEBUG === "true";
const isProd = process.env.NODE_ENV === "production";
const ssPath = "./screenshots/";

async function isInStock(
  page: Page,
  monitorName: string
): Promise<StockStatus> {
  const isOutOfStock = await page.$('div[data-test="NonbuyableSection"]');

  return isOutOfStock ? STOCK_STATUS.outOfStock : STOCK_STATUS.inStock;
  //   const addCartBtn = await page.$('button[data-test="shippingButton"]');

  //   if (DEBUG) await page.screenshot({ path: `${ssPath}${monitorName}_1.webp` });

  //   if (!addCartBtn) return false;

  //   await addCartBtn.click();

  //   if (DEBUG) await page.screenshot({ path: `${ssPath}${monitorName}_2.webp` });

  //   // Wait for modal/dialog to appear
  //   await page.waitForSelector('div[role="dialog"]');

  //   if (DEBUG) await page.screenshot({ path: `${ssPath}${monitorName}_3.webp` });

  //   const errorExists = await page.$('div[data-test="errorContent"]');

  //   console.log(`Error div:`, errorExists);

  //   return !errorExists; // If error content exists, it's out of stock
}

export default async function monitorLoop(client: Client<true>) {
  while (true) {
    console.log("Checking monitors!");

    const monitors = getAllMonitors.all();

    const browser = await puppeteer.launch({
      headless: isProd,
      devtools: isProd,
      ...(process.platform === "linux" && {
        executablePath: "/usr/bin/chromium-browser",
      }),
    });

    for (const monitor of monitors) {
      try {
        console.log(`🔍 Checking: ${monitor.name}`);

        const page = await browser.newPage();

        await page.goto(monitor.targetURL, {
          waitUntil: "networkidle2",
        });

        if (DEBUG)
          await page.screenshot({
            path: `${ssPath}${monitor.name}_0.webp`,
            fullPage: true,
          });

        const status = await isInStock(page, monitor.name);

        console.log(monitor.stockStatus, status);
        if (status === monitor.stockStatus) continue;

        console.log(`New ${monitor.name} stock status`);

        const channel = client.channels.cache.get(monitor.channelId);

        if (!channel || !channel.isSendable()) continue;

        await channel.send({
          content: `🎯 [${monitor.name}](${monitor.targetURL}) is now ${status}!`,
        });

        updateMonitorStatus.run({
          name: monitor.name,
          stockStatus: status,
        });

        await page.close();
      } catch (err) {
        console.error(err);
      }
    }

    await browser.close();

    await new Promise((r) => setTimeout(r, 10000)); // 10s loop interval
  }
}
