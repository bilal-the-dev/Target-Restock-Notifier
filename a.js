// const map = [
//   "brand_ids[]",
//   "color_ids[]",
//   "price_from",
//   "price_to",
//   "material_ids[]",
//   "status_ids[]",
//   "size_ids[]",
//   "search_text",

//   "catalog[]",
//   "patterns_ids[]",
// ];
// const params = new URL(
//   "https://www.vinted.fr/catalog?time=1742994110&disabled_personalization=true&page=1&brand_ids[]=12&color_ids[]=1&price_from=5&currency=EUR&price_to=6&material_ids[]=122&order=newest_first&size_ids[]=1650&search_text=aa&catalog[]=257&patterns_ids[]=28&status_ids[]=2"
// ).searchParams;

// const a = new URLSearchParams({
//   page: "1",
//   per_page: "96",
//   time: Date.now(),
//   currency: "EUR",
//   order: "newest_first",
// });

// for (const key of map) {
//   console.log(key);

//   if (params.has(key))
//     a.set(
//       key === "catalog[]" ? "catalog_ids" : key.replace("[]", ""),
//       params.get(key)
//     );

//   //   if (key === "catalog[]")
//   //     extractedParams["catalog_ids"] = params.get("catalog[]");
// }

// console.log(a.toString());

const cookie = `eyJraWQiOiJFNTdZZHJ1SHBsQWp1MmNObzFEb3JIM2oyN0J1NS1zX09QNVB3UGlobjVNIiwiYWxnIjoiUFMyNTYifQ.eyJhcHBfaWQiOjQsImNsaWVudF9pZCI6IndlYiIsImF1ZCI6ImZyLmNvcmUuYXBpIiwiaXNzIjoidmludGVkLWlhbS1zZXJ2aWNlIiwiaWF0IjoxNzQyOTk0MDgwLCJzaWQiOiI4MzY5ZGYwZC0xNzQyOTgyMTk2Iiwic2NvcGUiOiJwdWJsaWMiLCJleHAiOjE3NDMwMDEyODAsInB1cnBvc2UiOiJhY2Nlc3MifQ.F2E1wMyugzHuGh4p1BnosWY35Ig9hJPxOst09KdVPJ-sSlBtol3OeN5L55BI3gM0SDo-g52m4RgObMoXcA582XGDsXLHDpXcGdhBcagSugYjnkNgNO_Ly7y9yd1yP5jQS5hLUAn_ATkUFzMzYx7HxV2MUJ45QviAUpD_jayqbWbb-yw3OMMjrx0nZDe95NRJlCf_D8w43NMpEjuB-4SsUWDXVBchPf56VuBtdDMcM1fsec4vmVAdCMia4Q-0O2Tyg2oq_tKAgtAqqhjQFIbab0Jv1dsR2m4Fp3oE_L_QwxxmpKSQYBzuxWzjUBF5lTkrN36fbazA--SRkAO5DKJ0IA`;
const VINTED_URL = `https://www.vinted.fr/api/v2`;
async function a(params) {
  const url = `${VINTED_URL}/catalog/items?page=1&per_page=96&time=1742998605&search_text=&catalog_ids=5&order=newest_first&catalog_from=0&size_ids=&brand_ids=88&status_ids=&color_ids=&patterns_ids=&material_ids=`;

  const res = await fetch(url, {
    headers: {
      cookie: `access_token_web=${cookie};`,
      origin: "https://vinted.fr",
      "sec-fetch-site": "same-origin",
      accept: "application/json, text/plain, */*",
    },
  });

  console.log(res);

  let data;
  if (res.headers.get("content-type")?.includes("text"))
    data = await res.text();
  else data = await res.json();

  console.log(data);
}

a();
