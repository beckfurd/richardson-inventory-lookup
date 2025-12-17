import Link from "next/link";

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

  // Fetch the CSV from your own site at build/runtime
  const res = await fetch(
    `${process.env.NEXT_PUBLIC_SITE_URL ?? ""}/data/richardson_color_tiles.csv`,
    { cache: "no-store" }
  ).catch(() => null);

  let colors: ColorRow[] = [];
  let status = "Loaded";

  if (!res || !("ok" in res) || !res.ok) {
    status = "ERROR: could not load /data/richardson_color_tiles.csv";
  } else {
    const text = await res.text();
    const rows = parseCsvSimple(text);
    colors = rows.filter((r) => r.style === style);
  }

  return (
    <main style={{ padding: 24 }}>
      <Link href="/richardson">← Back to search</Link>
      <h1>Style {style}</h1>
      <p style={{ color: "crimson" }}>DEPLOY CHECK: v2</p>
      <p>
        <strong>Status:</strong> {status} • <strong>Colors:</strong>{" "}
        {colors.length}
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
