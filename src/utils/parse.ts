export function convertToQueryString(vintedURL: string): string {
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
  const params = new URL(vintedURL).searchParams;

  const customQueryParams = new URLSearchParams(
    `page=1&per_page=96&currency=EUR&order=newest_first`
  );

  for (const key of map) {
    customQueryParams.set(
      key === "catalog[]" ? "catalog_ids" : key.replace("[]", ""),
      params.get(key) ?? ""
    );
  }

  // console.log(customQueryParams.toString());

  return customQueryParams.toString();
}
