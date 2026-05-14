export default function Odyssey() {
  return (
    <div style={{ position: "fixed", inset: 0, zIndex: 9999, background: "#000" }}>
      <iframe
        src="/vlsi-odyssey.html"
        style={{ width: "100%", height: "100%", border: "none" }}
        title="VLSI Odyssey"
        allow="autoplay"
      />
    </div>
  );
}