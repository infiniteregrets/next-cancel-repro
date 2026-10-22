# fetch body cancel hangs in route handlers

In a route handler, calling `reader.cancel()` on a streaming `fetch` response doesn't cancel it right away. It resolves only after garbage collection, which can take seconds to minutes; in `next dev` on the Edge runtime it never resolves. Until then the upstream connection stays open.

This breaks route handlers that proxy a stream and close their response once they stop reading upstream (e.g. SSE / AI chat streams): the client keeps waiting after the last chunk.

Passing a signal (`fetch(url, { signal })`, the documented memoization opt-out) makes `cancel()` resolve immediately. The docs say memoization doesn't apply in Route Handlers.

## Run

```
pnpm install
pnpm build && pnpm start
```

Open http://localhost:3000, or:

```
curl localhost:3000/api/cancel-node
curl localhost:3000/api/cancel-edge
```

## What it does

- `app/api/upstream/route.ts` streams forever and logs when its connection is closed.
- `app/api/cancel-node` and `app/api/cancel-edge` run `app/probe.ts`: fetch the upstream, read one chunk, then time `reader.cancel()`, with and without a signal. Each probe gives up after 10s.

## Expected

```
{"fetch(url)":{"result":"resolved","ms":1},"fetch(url, { signal })":{"result":"resolved","ms":0}}
```

## Actual (16.5.0-canary.21, `next start`)

```
node: {"fetch(url)":{"result":"still pending after 10s","ms":10000},"fetch(url, { signal })":{"result":"resolved","ms":2}}
edge: {"fetch(url)":{"result":"resolved","ms":5886},"fetch(url, { signal })":{"result":"resolved","ms":0}}
```

The no-signal result varies between runs (from under a second to still pending after 10s), since it depends on when GC runs. The server log shows no `upstream closed` line for the pending ones.
