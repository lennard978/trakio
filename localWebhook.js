import 'dotenv/config'; // ✅ Loads .env variables
import { createServer } from 'http';
import { buffer } from 'micro';
import Stripe from 'stripe';
import { setPremiumRecord } from './api/utils/premiumStore.js';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET;

console.log("✅ Stripe initialized");

const server = createServer(async (req, res) => {
  if (req.method === 'POST' && req.url === '/api/stripe/webhook') {
    try {
      const rawBody = await buffer(req);
      const sig = req.headers['stripe-signature'];

      const event = stripe.webhooks.constructEvent(rawBody, sig, endpointSecret);

      console.log(`✅ Received event: ${event.type}`);

      if (event.type === 'checkout.session.completed') {
        const session = event.data.object;
        const email = session.customer_email ||
          session.customer_details?.email ||
          session.metadata?.email;

        if (!email) {
          console.warn('⚠️ No email found in session');
          return res.writeHead(200).end();
        }

        const subscriptionId = session.subscription;
        const sub = subscriptionId ? await stripe.subscriptions.retrieve(subscriptionId) : null;

        await setPremiumRecord(email, {
          isPremium: true,
          status: 'active',
          stripeCustomerId: sub?.customer || session.customer,
          subscriptionId,
          currentPeriodEnd: sub?.current_period_end || null,
          trialEnds: null,
        });

        console.log(`✨ Premium access recorded for: ${email}`);
      }

      res.writeHead(200).end('Webhook received');
    } catch (err) {
      console.error('❌ Error handling webhook:', err.message);
      res.writeHead(400).end(`Webhook Error: ${err.message}`);
    }
  } else {
    res.writeHead(404).end('Not Found');
  }
});

server.listen(3000, () => {
  console.log('🚀 Local webhook server running at http://localhost:3000');
});
