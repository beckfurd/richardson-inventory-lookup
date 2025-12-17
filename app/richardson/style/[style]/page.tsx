import Link from "next/link";
import fs from "fs";
import path from "path";

type ColorRow = {
  style: string;
  color_name: string;
  color_slug: string;
  total_qty: string;
  earliest_eta: string;
  image_file: string;
};

function parseCsvSimple(text: string) {
  const lines = text.replace(/\r/g, "").split("\n").filter(Boolean);
  const headers = lines[0].split(",");
  return lines.slice(1).map((line) => {
    const values = line.split(",");
    const obj: any = {};
    headers.forEach((h, i) => (obj[h] = values[i] ?? ""));
    return obj as ColorRow;
  });
}

export default async function StylePage({
  params,
}: {
  params: Promise<{ style: string }>;
}) {
  const { style } = await params;

  const csvPath = path.join(
    process.cwd(),
    "public",
    "data",
    "richardson_color_tiles.csv"
  );

  const csvText = fs.readFileSync(csvPath, "utf8");
  const rows = parseCsvSimple(csvText);
  const colors = rows.filter((r) => r.style === style);

  return (
    <main style={{ padding: 24 }}>
      <Link href="/richardson">← Back to search</Link>
      <h1>Style {style}</h1>
      <p style={{ color: "crimson" }}>DEPLOY CHECK: v6</p>
      <p>
        <strong>Colors:</strong> {colors.length}
      </p>

      <img
  src={`https://images.beckfurd.com/${style}/${c.image_file}`}
  alt={`${style} ${c.color_name}`}
  style={{
    width: "100%",
    height: 150,
    objectFit: "contain",
    background: "#f8f8f8",
    borderRadius: 6,
  }}
/>
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
            />
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
