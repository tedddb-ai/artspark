import Stripe from "stripe";

const STRIPE_SECRET = process.env.STRIPE_SECRET_KEY || "";

export const stripe = STRIPE_SECRET
  ? new Stripe(STRIPE_SECRET, { apiVersion: "2025-03-31.basil" as Stripe.LatestApiVersion })
  : null;

export const PRICE_ID = process.env.STRIPE_PRICE_ID || "";
export const PREMIUM_URL = process.env.NEXT_PUBLIC_STRIPE_PAYMENT_LINK || "";
