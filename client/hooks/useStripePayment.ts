import { useState } from "react";

interface PaymentData {
  amount: number;
  cardToken?: string;
  paymentMethod: "card" | "applepay";
}

interface PaymentResponse {
  success: boolean;
  error?: string;
  transactionId?: string;
}

export function useStripePayment() {
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const processPayment = async (
    data: PaymentData,
  ): Promise<PaymentResponse> => {
    setIsProcessing(true);
    setError(null);

    try {
      const stripeKey = import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY;

      if (!stripeKey) {
        console.warn(
          "Stripe key not configured. Using mock payment. Add VITE_STRIPE_PUBLISHABLE_KEY to .env",
        );
        // Mock payment for development without keys
        await new Promise((resolve) => setTimeout(resolve, 1500));
        return {
          success: true,
          transactionId: `mock_${Date.now()}`,
        };
      }

      // This will be called with actual Stripe integration when keys are provided
      const response = await fetch("/api/process-payment", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          amount: Math.round(data.amount * 100),
          paymentMethod: data.paymentMethod,
          cardToken: data.cardToken,
        }),
      });

      if (!response.ok) {
        throw new Error("Payment processing failed");
      }

      const result = (await response.json()) as PaymentResponse;
      return result;
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Payment failed";
      setError(errorMessage);
      return {
        success: false,
        error: errorMessage,
      };
    } finally {
      setIsProcessing(false);
    }
  };

  return {
    processPayment,
    isProcessing,
    error,
  };
}
