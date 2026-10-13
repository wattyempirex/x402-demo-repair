# Demonstration repair — v1-shaped envelope declared as v2

**Defect (one sentence):** the seller's 402 declares `x402Version: 2` but emits a v1-shaped `PAYMENT-REQUIRED` envelope — no top-level `resource`, and `accepts[].maxAmountRequired` instead of `accepts[].amount` — so the official v2 client cannot build a payment.

## Failing test (before)

`MODE=broken node server.js` + `node test.js` → exit 1:

```
FAIL: official v2 schema rejects this challenge.
  - resource: Required
  - accepts.0.amount: Required
```

The test uses the official client's own decode path (`x402HTTPClient.getPaymentRequiredResponse` from `@x402/fetch@2.28.0`) and the official `PaymentRequiredV2Schema` (from `@x402/core/schemas`). This is the exact validation the v2 payment path applies.

## The patch

In `server.js`, replace `brokenChallenge()` with `fixedChallenge()` — i.e.:

```diff
   return {
     x402Version: 2,
+    resource: {
+      url: `${BASE}/paid`,
+      description: "demo paid route",
+      mimeType: "application/json",
+    },
     accepts: [
       {
         scheme: "exact",
         network: "eip155:8453",
-        maxAmountRequired: "10000",
+        amount: "10000",
         asset: USDC_BASE,
         payTo: "0x1111111111111111111111111111111111111111",
         maxTimeoutSeconds: 300,
-        resource: `${BASE}/paid`,
-        description: "demo paid route",
-        mimeType: "application/json",
       },
     ],
   };
```

## Passing test (after)

`MODE=fixed node server.js` + `node test.js` → exit 0:

```
PASS: official v2 client accepts the challenge.
  resource.url=http://localhost:3402/paid
  accepts[0].amount=10000 asset=0x833589fCD6eDb6E08f4c7C32D54bdA02913
```

## How to run

```bash
cd demo-repair
npm install   # pinned: @x402/fetch@2.28.0, express@4.21.2
MODE=broken node server.js &   # terminal 1
node test.js                   # terminal 2 -> FAIL (exit 1)
MODE=fixed node server.js &    # terminal 1
node test.js                   # terminal 2 -> PASS (exit 0)
```

## Honest scope

- This demonstrates **challenge compatibility** with the official v2 client: the client can now parse the challenge and has everything needed to build a payment payload.
- It does **not** demonstrate settlement: no facilitator, no signature, no broadcast, no mainnet. A customer repair's acceptance evidence would add testnet settlement through the customer's configured facilitator where applicable.
- **This is a demonstration, not customer traction.** It exists to show repair method before any customer pays.
