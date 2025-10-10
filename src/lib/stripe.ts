import { loadStripe } from "@stripe/stripe-js";

// Initialize Stripe with your publishable key
export const stripePromise = loadStripe(
  "pk_live_51SDXQrRvCVnQCUeVtx0a6YTLwo9EHh5F1QVUludeCJNzP4FgL7gcuUv6j3M7HEP9gsnb3Ggp9f1VNMh8LduLL1zY00gpilF4AO"
);
