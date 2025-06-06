import { StockStatus } from "./typings/types.js";

export const STOCK_STATUS: Record<"inStock" | "outOfStock", StockStatus> = {
  inStock: "IN_STOCK",
  outOfStock: "OUT_OF_STOCK",
};
