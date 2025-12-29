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

// Guess the Richardson image filename when CSV is missing image_file
// Examples:
// "Combination Gunmetal/Chocolate Chip" -> 112_Combination-Gunmetal-ChocolateChip_FINAL.jpg
// "Solid Smoke Blue" -> 112_Solid-SmokeBlue_FINAL.jpg
function guessImageFile(style: string, colorName: string) {
  const s = (colorName || "").trim();
  if (!s) return "";

  const firstSpace = s.indexOf(" ");
  if (firstSpace === -1) {
    return `${style}_${s.replaceAll("/", "-").replaceAll(" ", "")}_FINAL.jpg`;
  }

  const prefix = s.slice(0, firstSpace);
  const rest = s.slice(firstSpace + 1).trim();

  const parts = rest
    .split("/")
    .map((p) => p.trim().replaceAll(" ", "")); // remove spaces inside each part

  const slug = [prefix, ...parts].join("-");
  return `${style}_${slug}_FINAL.jpg`;
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

      <style>{`
        .colorTileImgWrap {
          overflow: hidden;
          border-radius: 6px;
          background: #ffffff;
        }
        .colorTileImg {
          width: 100%;
          height: 150px;
          object-fit: contain;
          display: block;
          transition: transform 180ms ease;
          transform-origin: center;
        }
        .colorTile:hover .colorTileImg {
          transform: scale(1.25);
        }
      `}</style>

      <p style={{ color: "crimson" }}>DEPLOY CHECK: v8</p>
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
        {colors.map((c) => {
          const guessed =
            !c.image_file || !String(c.image_file).trim().length;

          const imageFile =
            (c.image_file && c.image_file.trim()) ||
            guessImageFile(style, c.color_name);

          const imageUrl = `https://images.beckfurd.com/${style}/${imageFile}`;

          return (
            <div
              key={c.color_slug}
              className="colorTile"
              style={{
                padding: 12,
                textAlign: "center",
                borderRadius: 10,
              }}
            >
              <div
                className="colorTileImgWrap"
                style={{ position: "relative" }}
              >
                <img
                  className="colorTileImg"
                  src={imageUrl}
                  alt={`${style} ${c.color_name}`}
                  onError={(e) => {
                    e.currentTarget.src = `https://images.beckfurd.com/${style}/${style}_Solid-Black_FINAL.jpg`;
                    e.currentTarget.onerror = null;
                  }}
                />

                {guessed && (
                  <div
                    style={{
                      position: "absolute",
                      top: 8,
                      right: 8,
                      fontSize: 12,
                      padding: "3px 6px",
                      borderRadius: 6,
                      background: "rgba(0,0,0,0.65)",
                      color: "#fff",
                      letterSpacing: 0.5,
                    }}
                  >
                    AUTO
                  </div>
                )}
              </div>

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
          );
        })}
      </div>
    </main>
  );
}
