export async function sendWebhook(
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
