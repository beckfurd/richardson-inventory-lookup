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

export default function StylePage({ params }: any) {
  const style = params.style;
  const [colors, setColors] = useState<ColorRow[]>([]);

  useEffect(() => {
    fetch("/data/richardson_color_tiles.csv")
      .then((res) => res.text())
      .then((text) => {
        const lines = text.split("\n");
        const headers = lines[0].split(",");
        const data = lines.slice(1).map((line) => {
          const values = line.split(",");
          return Object.fromEntries(
            headers.map((h, i) => [h, values[i]])
          ) as ColorRow;
        });

        setColors(data.filter((r) => r.style === style));
      });
  }, [style]);

  return (
    <main style={{ padding: 24 }}>
      <a href="/richardson">← Back to search</a>
      <h1>Style {style}</h1>

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
              padding: 10,
              textAlign: "center",
            }}
          >
            <div
              style={{
                height: 160,
                background: "#f4f4f4",
                marginBottom: 10,
              }}
            >
              {/* image goes here next */}
            </div>

            <strong>{c.color_name}</strong>
            <div>
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
