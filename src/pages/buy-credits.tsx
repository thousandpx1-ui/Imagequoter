export default function BuyCredits() {
  const buy = (plan: string) => {
    if (plan === "10") {
      window.open("https://imjo.in/YOUR10LINK", "_blank");
    }

    if (plan === "49") {
      window.open("https://imjo.in/YOUR49LINK", "_blank");
    }

    if (plan === "99") {
      window.open("https://imjo.in/YOUR99LINK", "_blank");
    }

    if (plan === "199") {
      window.open("https://imjo.in/YOUR199LINK", "_blank");
    }
  };

  return (
    <div style={{ padding: "20px" }}>
      <h2 style={{ marginBottom: "20px" }}>💰 Buy Credits</h2>

      <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
        <button onClick={() => buy("10")} style={btnStyle("#3b82f6")}>
          ₹10 → 30 Credits
        </button>

        <button onClick={() => buy("49")} style={btnStyle("#22c55e")}>
          ₹49 → 200 Credits
        </button>

        <button onClick={() => buy("99")} style={btnStyle("#a855f7")}>
          ⭐ ₹99 → 600 Credits (Best Value)
        </button>

        <button onClick={() => buy("199")} style={btnStyle("#f59e0b")}>
          ₹199 → Unlimited (30 days)
        </button>
      </div>
    </div>
  );
}

// Button style
const btnStyle = (color: string) => ({
  padding: "12px",
  borderRadius: "10px",
  border: "none",
  backgroundColor: color,
  color: "white",
  fontSize: "16px",
  cursor: "pointer",
});
