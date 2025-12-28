import Link from "next/link";
import fs from "fs";
import path from "path";

type StyleRow = {
  style: string;
  style_total_qty: string;
  color_count: string;
  in_stock_color_count: string;
  earliest_eta: string;
  image_coverage?: string;
};

function parseCsvSimple(text: string) {
  const lines = text.replace(/\r/g, "").split("\n").filter(Boolean);
  const headers = lines[0].split(",");
  return lines.slice(1).map((line) => {
    const values = line.split(",");
    const obj: any = {};
    headers.forEach((h, i) => (obj[h] = values[i] ?? ""));
    return obj as StyleRow;
  });
}

export default async function RichardsonSearch({
  searchParams,
}: {
  searchParams?: Promise<{ q?: string; instock?: string }>;
}) {
  const sp = (await searchParams) ?? {};
  const q = (sp.q ?? "").toLowerCase();
  const inStockOnly = (sp.instock ?? "1") === "1"; // default caps-only UX: show in-stock styles

  const csvPath = path.join(
    process.cwd(),
    "public",
    "data",
    "richardson_style_search.csv"
  );
  const csvText = fs.readFileSync(csvPath, "utf8");
  const rows = parseCsvSimple(csvText).filter((r) => r.style);

  // caps-only: only show styles with any image coverage (these are the cap styles)
  const capRows = rows.filter((r) => {
    const cov = Number(r.image_coverage ?? "0");
    return cov > 0;
  });

  let filtered = rows;

  if (q) {
    filtered = filtered.filter((r) => r.style.toLowerCase().includes(q));
  }

  if (inStockOnly) {
    filtered = filtered.filter((r) => Number(r.style_total_qty || "0") > 0);
  }

  // Sort: in-stock first, then highest qty
  filtered.sort((a, b) => {
    const aq = Number(a.style_total_qty || "0");
    const bq = Number(b.style_total_qty || "0");
    if ((bq > 0) !== (aq > 0)) return bq > 0 ? 1 : -1;
    return bq - aq;
  });

  return (
    <main style={{ padding: 24 }}>
      <h1>Richardson Inventory Lookup</h1>
      <p style={{ color: "crimson" }}>DEPLOY CHECK: search-v1</p>

      <form
        action="/richardson"
        method="get"
        style={{ display: "flex", gap: 12, alignItems: "center", marginTop: 16 }}
      >
        <input
          name="q"
          defaultValue={sp.q ?? ""}
          placeholder="Search style (ex: 112)"
          style={{
            padding: 10,
            width: 320,
            fontSize: 16,
            border: "1px solid #ccc",
          }}
        />

        <label style={{ display: "flex", gap: 8, alignItems: "center" }}>
          <input
            type="checkbox"
            name="instock"
            value="1"
            defaultChecked={inStockOnly}
          />
          In stock only
        </label>

        <button
          type="submit"
          style={{
            padding: "10px 14px",
            border: "1px solid #ccc",
            background: "#fff",
            cursor: "pointer",
          }}
        >
          Search
        </button>

        <a href="/richardson" style={{ marginLeft: 8 }}>
          Reset
        </a>
      </form>

      <div style={{ marginTop: 18, marginBottom: 8 }}>
        <strong>Results:</strong> {filtered.length}
      </div>

      <table style={{ width: "100%", borderCollapse: "collapse" }}>
        <thead>
          <tr style={{ borderBottom: "1px solid #ddd" }}>
            <th align="left" style={{ padding: "10px 6px" }}>
              Style
            </th>
            <th align="left" style={{ padding: "10px 6px" }}>
              Total Qty
            </th>
            <th align="left" style={{ padding: "10px 6px" }}>
              Colors In Stock
            </th>
            <th align="left" style={{ padding: "10px 6px" }}>
              Earliest ETA
            </th>
          </tr>
        </thead>
        <tbody>
          {filtered.map((r) => (
            <tr key={r.style} style={{ borderBottom: "1px solid #f0f0f0" }}>
              <td style={{ padding: "10px 6px" }}>
                <Link href={`/richardson/style/${r.style}`}>{r.style}</Link>
              </td>
              <td style={{ padding: "10px 6px" }}>{r.style_total_qty}</td>
              <td style={{ padding: "10px 6px" }}>{r.in_stock_color_count}</td>
              <td style={{ padding: "10px 6px" }}>{r.earliest_eta || "—"}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </main>
  );
}
