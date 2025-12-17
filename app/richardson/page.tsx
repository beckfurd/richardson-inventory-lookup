"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

export default function RichardsonSearch() {
  const [status, setStatus] = useState("Loading…");
  const [rows, setRows] = useState<any[]>([]);
  const [query, setQuery] = useState("");

  useEffect(() => {
    fetch("/data/richardson_style_search.csv")
      .then(async (res) => {
        if (!res.ok) throw new Error(`Fetch failed: ${res.status} ${res.statusText}`);
        const text = await res.text();
        setStatus(`Loaded CSV (${text.length} chars)`);
        const lines = text.replace(/\r/g, "").split("\n").filter(Boolean);

        const headers = lines[0].split(",");
        const data = lines.slice(1).map((line) => {
          const values = line.split(",");
          const obj: any = {};
          headers.forEach((h, i) => (obj[h] = values[i]));
          return obj;
        });

        setRows(data.filter((r) => r.style));
      })
      .catch((e) => setStatus(`ERROR: ${String(e.message || e)}`));
  }, []);

  const filtered = rows.filter((r) =>
    String(r.style || "").toLowerCase().includes(query.toLowerCase())
  );

  return (
    <main style={{ padding: 24 }}>
      <h1>Richardson Inventory Lookup</h1>

      <p><strong>Status:</strong> {status}</p>
      <p><strong>Rows:</strong> {rows.length}</p>

      <input
        placeholder="Search style (ex: 112)"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        style={{ padding: 10, width: 320, marginBottom: 16, fontSize: 16 }}
      />

      <ul>
        {filtered.slice(0, 50).map((r) => (
          <li key={r.style}>
            <Link href={`/richardson/style/${r.style}`}>{r.style}</Link>
            {" — qty: "}{r.style_total_qty ?? "?"}
          </li>
        ))}
      </ul>
    </main>
  );
}
