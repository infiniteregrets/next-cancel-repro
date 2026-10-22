# fetch body cancel hangs in route handlers

```
pnpm install
pnpm build && pnpm start
```

Open http://localhost:3000, or:

```
curl localhost:3000/api/cancel-node
curl localhost:3000/api/cancel-edge
```

`/api/upstream` streams forever. The cancel routes fetch it, read one chunk, and time `reader.cancel()`.
