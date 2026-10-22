"use client";

import { useEffect, useState } from "react";

export default function Home() {
  const [results, setResults] = useState<Record<string, string>>({});

  useEffect(() => {
    for (const runtime of ["node", "edge"]) {
      fetch(`/api/cancel-${runtime}`)
        .then((res) => res.text())
        .then((text) => setResults((r) => ({ ...r, [runtime]: text })));
    }
  }, []);

  return (
    <pre>
      {["node", "edge"].map((runtime) => `${runtime}: ${results[runtime] ?? "running..."}\n`)}
    </pre>
  );
}
