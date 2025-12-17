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

      <p style={{ color: "crimson" }}>DEPLOY CHECK: v7</p>
      <p>
        <strong>Colors:</strong> {colors.length}
      </p>

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
              borderRadius: 10,
            }}
          >
            <img
              src={`https://images.beckfurd.com/${style}/${c.image_file}`}
              alt={`${style} ${c.color_name}`}
              style={{
                width: "100%",
                height: 150,
                objectFit: "contain",
                background: "#ffffff",
                borderRadius: 6,
                marginBottom: 10,
              }}
            />

            <strong>{c.color_name}</strong>

            <div style={{ marginTop: 6 }}>
  {Number(c.total_qty) > 0 ? (
    `${c.total_qty} available`
  ) : c.earliest_eta ? (
    <span style={{ color: "#c62828", fontWeight: 600 }}>
      Next: {c.earliest_eta}
    </span>
  ) : (
    <span style={{ color: "#c62828", fontWeight: 600 }}>
      Out of stock
    </span>
  )}
</div>

          </div>
        ))}
      </div>
    </main>
  );
}
