import Link from "next/link";
import { headers } from "next/headers";

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

  // Build the current site origin dynamically (works on preview + prod)
  const h = await headers();
  const host = h.get("x-forwarded-host") ?? h.get("host");
  const proto = h.get("x-forwarded-proto") ?? "https";
  const origin = host ? `${proto}://${host}` : "";

  const res = await fetch(`${origin}/data/richardson_color_tiles.csv`, {
    cache: "no-store",
  });

  if (!res.ok) {
    return (
      <main style={{ padding: 24 }}>
        <Link href="/richardson">← Back to search</Link>
        <h1>Style {style}</h1>
        <p style={{ color: "crimson" }}>DEPLOY CHECK: v5</p>
        <p>
          <strong>Error:</strong> Could not load CSV. ({res.status}{" "}
          {res.statusText})
        </p>
        <p>
          Try opening <code>/data/richardson_color_tiles.csv</code> directly in
          the browser to confirm it exists.
        </p>
      </main>
    );
  }

  const text = await res.text();
  const rows = parseCsvSimple(text);
  const colors = rows.filter((r) => r.style === style);

  return (
    <main style={{ padding: 24 }}>
      <Link href="/richardson">← Back to search</Link>
      <h1>Style {style}</h1>

      <p style={{ color: "crimson" }}>DEPLOY CHECK: v5</p>
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
