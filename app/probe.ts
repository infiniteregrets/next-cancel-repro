export async function probe(url: string, init?: RequestInit) {
  const res = await fetch(url, init);
  const reader = res.body!.getReader();
  await reader.read();

  const start = Date.now();
  const result = await Promise.race([
    reader.cancel().then(() => "resolved"),
    new Promise((r) => setTimeout(() => r("still pending after 10s"), 10_000)),
  ]);
  return { result, ms: Date.now() - start };
}

export async function handler(req: Request) {
  const upstream = new URL("/api/upstream", req.url).href;
  return Response.json({
    "fetch(url)": await probe(upstream),
    "fetch(url, { signal })": await probe(upstream, { signal: new AbortController().signal }),
  });
}
