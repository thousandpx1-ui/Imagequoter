import { useEffect } from "react";
import { addCredits, activateUnlimited } from "../utils/credits";

export default function PaymentSuccess() {
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const plan = params.get("plan");

    if (plan === "10") addCredits(30);
    if (plan === "49") addCredits(200);
    if (plan === "99") addCredits(600);
    if (plan === "199") activateUnlimited();
  }, []);

  return (
    <div style={{ padding: "20px", textAlign: "center" }}>
      <h2>✅ Payment Successful</h2>
      <p>Credits added to your account</p>
    </div>
  );
}
