// Demo x402 seller: one paid route. MODE=broken emits the defect;
// MODE=fixed emits the repaired challenge. Port 3402.
const express = require("express");

const MODE = process.env.MODE || "broken";
const BASE = "http://localhost:3402";
const USDC_BASE = "0x833589fCD6eDb6E08f4c7C32D54bdA02913"; // USDC on Base (demo only)

// THE DEFECT (broken mode): declares x402Version 2 but emits a v1-shaped
// envelope — no top-level `resource`, and `maxAmountRequired` instead of
// `amount`. The official v2 client's own schema rejects this.
function brokenChallenge() {
  return {
    x402Version: 2,
    accepts: [
      {
        scheme: "exact",
        network: "eip155:8453",
        maxAmountRequired: "10000",
        asset: USDC_BASE,
        payTo: "0x1111111111111111111111111111111111111111",
        maxTimeoutSeconds: 300,
        resource: `${BASE}/paid`,
        description: "demo paid route",
        mimeType: "application/json",
      },
    ],
  };
}

// THE FIX (fixed mode): canonical v2 envelope.
function fixedChallenge() {
  return {
    x402Version: 2,
    resource: {
      url: `${BASE}/paid`,
      description: "demo paid route",
      mimeType: "application/json",
    },
    accepts: [
      {
        scheme: "exact",
        network: "eip155:8453",
        amount: "10000",
        asset: USDC_BASE,
        payTo: "0x1111111111111111111111111111111111111111",
        maxTimeoutSeconds: 300,
      },
    ],
  };
}

const app = express();
app.get("/paid", (req, res) => {
  const challenge = MODE === "fixed" ? fixedChallenge() : brokenChallenge();
  const header = Buffer.from(JSON.stringify(challenge)).toString("base64");
  res.status(402).set("PAYMENT-REQUIRED", header).json({ error: "payment required", mode: MODE });
});

app.listen(3402, () => console.log(`demo seller up on :3402 (MODE=${MODE})`));
