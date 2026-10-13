// Acceptance test: can the OFFICIAL x402 v2 client (@x402/fetch, pinned)
// turn this seller's 402 challenge into a valid v2 PaymentRequired?
// Uses the client's own decode path + the official PaymentRequiredV2Schema.
//
// Run: MODE=broken node test.js   -> must FAIL (documents the defect)
//      MODE=fixed  node test.js   -> must PASS
//
// Honest scope: this proves CHALLENGE COMPATIBILITY with the official
// client. It does not prove settlement (no facilitator, no broadcast).
const { x402HTTPClient } = require("@x402/fetch");
const { PaymentRequiredV2Schema } = require("@x402/core/schemas");

async function main() {
  const res = await fetch("http://localhost:3402/paid");
  if (res.status !== 402) {
    console.log(`UNEXPECTED: status ${res.status}, expected 402`);
    process.exit(2);
  }
  const client = new x402HTTPClient();
  const getHeader = (name) => res.headers.get(name);
  let decoded;
  try {
    decoded = client.getPaymentRequiredResponse(getHeader);
  } catch (e) {
    console.log("FAIL: client could not decode PAYMENT-REQUIRED:", e.message);
    process.exit(1);
  }
  const parsed = PaymentRequiredV2Schema.safeParse(decoded);
  if (!parsed.success) {
    console.log("FAIL: official v2 schema rejects this challenge.");
    for (const issue of parsed.error.issues) {
      console.log(`  - ${issue.path.join(".")}: ${issue.message}`);
    }
    process.exit(1);
  }
  console.log("PASS: official v2 client accepts the challenge.");
  console.log(`  resource.url=${parsed.data.resource.url}`);
  console.log(`  accepts[0].amount=${parsed.data.accepts[0].amount} asset=${parsed.data.accepts[0].asset}`);
  process.exit(0);
}

main().catch((e) => {
  console.log("FAIL (exception):", e.message);
  process.exit(1);
});
