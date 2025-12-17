export default function StylePage({ params }: { params: { style: string } }) {
  return (
    <main style={{ padding: 24 }}>
      <a href="/richardson">← Back to search</a>
      <h1>Style {params.style}</h1>
      <p>Color grid coming next.</p>
    </main>
  );
}
