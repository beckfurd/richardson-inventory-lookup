"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

type StyleRow = {
  style: string;
  style_total_qty: string;
  color_count: string;
  in_stock_color_count: string;
  earliest_eta: string;
};

export default function RichardsonSearch() {
  const [rows, setRows] = useState<StyleRow[]>([]);
  const [query, setQuery] = useState("");

  useEffect(() => {
    fetch("/data/richardson_style_search.csv")
      .then((res) => res.text())
      .then((text) => {
        const lines = text.split("\n");
        const headers = lines[0].split(",");
        const data = lines.slice(1).map((line) => {
          const values = line.split(",");
          return Object.fromEntries(
            headers.map((h, i) => [h, values[i]])
          ) as StyleRow;
        });
        setRows(data.filter((r) => r.style));
      });
  }, []);

  const filtered = rows.filter((r) =>
    r.style.toLowerCase().includes(query.toLowerCase())
  );

  return (
    <main style={{ padding: 24 }}>
      <h1>Richardson Inventory Lookup</h1>

      <input
        placeholder="Search style (ex: 112)"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        style={{
          padding: 10,
          width: 300,
          marginBottom: 20,
          fontSize: 16,
        }}
      />

      <table style={{ width: "100%", borderCollapse: "collapse" }}>
        <thead>
          <tr>
            <th align="left">Style</th>
            <th align="left">Total Qty</th>
            <th align="left">Colors In Stock</th>
            <th align="left">Earliest ETA</th>
          </tr>
        </thead>
        <tbody>
          {filtered.map((r) => (
            <tr key={r.style}>
              <td>
                <Link href={`/richardson/style/${r.style}`}>
                  {r.style}
                </Link>
              </td>
              <td>{r.style_total_qty}</td>
              <td>{r.in_stock_color_count}</td>
              <td>{r.earliest_eta || "—"}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </main>
  );
}
