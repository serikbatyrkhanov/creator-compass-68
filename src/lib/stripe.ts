import { loadStripe } from "@stripe/stripe-js";

// Initialize Stripe with your publishable key
export const stripePromise = loadStripe(
  "pk_test_51SEvlrRzLvTDNnZmg1u3xmDEGlDrDsKDgOIh4i9Wv0jl9SkFBKNHwKWq5K6ZXkgOG4XyXGHc9mGy7vY8YL5mGy7v00KNHwKWq5"
);
