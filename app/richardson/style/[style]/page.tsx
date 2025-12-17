"use client";

import { useEffect, useState } from "react";

type ColorRow = {
  style: string;
  color_name: string;
  color_slug: string;
  total_qty: string;
  earliest_eta: string;
  image_file: string;
};

export default function StylePage({ params }: { params: { style: string } }) {
  const style = params.style;
  const [colors, setColors] = useState<ColorRow[]>([]);
  const [status, setStatus] = useState("Loading…");

  useEffect(() => {
    fetch("/data/richardson_color_tiles.csv")
      .then(async (res) => {
        if (!res.ok) throw new Error("CSV not found");
        const text = await res.text();
        const lines = text.replace(/\r/g, "").split("\n").filter(Boolean);
        const headers = lines[0].split(",");

        const data = lines.slice(1).map((line) => {
          const values = line.split(",");
          const obj: any = {};
          headers.forEach((h, i) => (obj[h] = values[i]));
          return obj;
        });

        setColors(data.filter((r) => r.style === style));
        setStatus("Loaded");
      })
      .catch((e) => setStatus(`ERROR: ${e.message}`));
  }, [style]);

  return (
    <main style={{ padding: 24 }}>
      <a href="/richardson">← Back to search</a>
      <h1>Style {style}</h1>

      <p><strong>Status:</strong> {status}</p>
      <p><strong>Colors:</strong> {colors.length}</p>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))",
          gap: 20,
          marginTop: 20,
        }}
      >
        {colors.map((c) => (
          <div
            key={c.color_slug}
            style={{
              border: "1px solid #ddd",
              padding: 12,
              textAlign: "center",
            }}
          >
            <div
              style={{
                height: 150,
                background: "#f2f2f2",
                marginBottom: 10,
              }}
            >
              {/* image goes here next */}
            </div>

            <strong>{c.color_name}</strong>
            <div style={{ marginTop: 6 }}>
              {Number(c.total_qty) > 0
                ? `${c.total_qty} available`
                : c.earliest_eta
                ? `Next: ${c.earliest_eta}`
                : "Out of stock"}
            </div>
          </div>
        ))}
      </div>
    </main>
  );
}
