const express = require("express");
const app = express();
const { resolve } = require("path");
const env = require("dotenv").config({ path: "./.env" });
const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY, {
  apiVersion: "2022-08-01",
});

app.use(express.json());
app.use(express.static(process.env.STATIC_DIR));

app.get("/", (req, res) => {
  const path = resolve(process.env.STATIC_DIR + "/index.html");
  res.sendFile(path);
});

app.get("/config", (req, res) => {
  res.send({
    publishableKey: process.env.STRIPE_PUBLISHABLE_KEY,
  });
});

// Endpoint to create Checkout Session
app.post("/create-checkout-session", async (req, res) => {
  const { currency, customerEmail } = req.body;

  try {
    // Create a product
    const product = await stripe.products.create({
      name: 'Custom Product',
      description: 'Multi-currency product',
    });

    // Create a recurring price for subscription
    const price = await stripe.prices.create({
      unit_amount: 1000, // Example amount (in smallest currency unit, e.g., cents)
      currency: currency || 'usd',
      product: product.id,
      recurring: { interval: 'month' } // Define as a recurring monthly subscription
    });

    // Create the Checkout Session in subscription mode
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price: price.id,
          quantity: 1,
        },
      ],
      mode: 'subscription', // Subscription mode for recurring payments
      customer_email: customerEmail,
      subscription_data: {
        metadata: { order_id: '12345' },
      },
      payment_method_collection: 'if_required',
      success_url: `${req.headers.origin}/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${req.headers.origin}/cancel.html`,
    });

    // Send the URL to the client
    res.send({ url: session.url });
  } catch (error) {
    console.error("Error creating Checkout Session:", error.message);
    res.status(400).send({
      error: { message: error.message, requestId: error.requestId },
    });
  }
});



app.listen(5252, () =>
  console.log(`Node server listening at http://localhost:5252`)
);
