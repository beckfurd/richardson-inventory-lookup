export default async function StylePage({
  params,
}: {
  params: Promise<{ style: string }>;
}) {
  const { style } = await params;

  return (
    <main style={{ padding: 24 }}>
      <a href="/richardson">← Back to search</a>
      <h1>Style {style}</h1>
      <p>Color grid coming next.</p>
    </main>
  );
}
