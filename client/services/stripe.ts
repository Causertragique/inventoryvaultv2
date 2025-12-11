/**
 * Stripe Terminal Service
 * Handles client-side interactions with Stripe Terminal for in-person payments
 */

let terminal: any = null;
let reader: any = null;

/**
 * Get authentication headers for API requests
 */
function getAuthHeaders(): HeadersInit {
  const authToken = localStorage.getItem("bartender-auth");
  const headers: HeadersInit = {
    "Content-Type": "application/json",
  };

  if (authToken) {
    try {
      const auth = JSON.parse(authToken);
      headers["Authorization"] = `Bearer ${authToken}`;
      if (auth.userId) headers["x-user-id"] = auth.userId;
      if (auth.username) headers["x-username"] = auth.username;
    } catch (error) {
      console.error("Error parsing auth token:", error);
    }
  }

  return headers;
}

/**
 * Initialize Stripe Terminal
 */
export async function initializeStripeTerminal(): Promise<boolean> {
  try {
    // Dynamically import Stripe Terminal
    const { Terminal } = await import("@stripe/terminal-js");
    
    // Get connection token from server
    const response = await fetch("/api/stripe/connection-token", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      throw new Error("Failed to get connection token");
    }

    const { secret } = await response.json();

    // Create Terminal instance
    // @ts-ignore - Terminal.create is available at runtime but types may be outdated
    terminal = Terminal.create({
      onFetchConnectionToken: async () => {
        const tokenResponse = await fetch("/api/stripe/connection-token", {
          method: "POST",
          headers: getAuthHeaders(),
        });
        
        if (!tokenResponse.ok) {
          const error = await tokenResponse.json().catch(() => ({ error: "Failed to get connection token" }));
          throw new Error(error.error || "Failed to get connection token");
        }
        
        const { secret: tokenSecret } = await tokenResponse.json();
        return tokenSecret;
      },
      onUnexpectedReaderDisconnect: () => {
        console.warn("Reader disconnected unexpectedly");
        reader = null;
      },
    });

    return true;
  } catch (error) {
    console.error("Error initializing Stripe Terminal:", error);
    return false;
  }
}

/**
 * Discover and connect to a Terminal reader
 */
export async function discoverAndConnectReader(): Promise<boolean> {
  try {
    if (!terminal) {
      await initializeStripeTerminal();
    }

    if (!terminal) {
      throw new Error("Terminal not initialized");
    }

    // Discover readers (Bluetooth, USB, Internet)
    // Use simulated: true for testing without a physical reader
    // In production, set to false to use real readers
    // You can also pass a locationId if you have one configured
    const discoverResult = await terminal.discoverReaders({
      simulated: true, // Set to false in production to use physical readers
      // locationId: process.env.STRIPE_TERMINAL_LOCATION_ID, // Optional: specify location
    });

    if (discoverResult.error) {
      throw new Error(discoverResult.error.message);
    }

    if (discoverResult.discoveredReaders.length === 0) {
      throw new Error("No readers found. Please ensure a reader is powered on and nearby.");
    }

    // Connect to the first available reader
    const discoveredReader = discoverResult.discoveredReaders[0];
    const connectResult = await terminal.connectReader(discoveredReader);

    if (connectResult.error) {
      throw new Error(connectResult.error.message);
    }

    reader = connectResult.reader;
    return true;
  } catch (error: any) {
    console.error("Error connecting to reader:", error);
    throw error;
  }
}

/**
 * Create a PaymentIntent for Terminal payment
 */
export async function createPaymentIntent(amount: number, metadata?: Record<string, string>) {
  try {
    const response = await fetch("/api/stripe/create-payment-intent", {
      method: "POST",
      headers: getAuthHeaders(),
      body: JSON.stringify({
        amount,
        currency: "cad",
        metadata: metadata || {},
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || "Failed to create payment intent");
    }

    return await response.json();
  } catch (error: any) {
    console.error("Error creating payment intent:", error);
    throw error;
  }
}

/**
 * Collect payment using Terminal reader
 */
export async function collectPayment(
  paymentIntentClientSecret: string,
  onStatusChange?: (status: string) => void
): Promise<any> {
  try {
    if (!terminal || !reader) {
      throw new Error("Terminal not initialized or reader not connected");
    }

    // Collect payment method
    const collectResult = await terminal.collectPaymentMethod(paymentIntentClientSecret, {
      onStatusChange: (status: any) => {
        if (onStatusChange) {
          onStatusChange(status.status);
        }
      },
    });

    if (collectResult.error) {
      throw new Error(collectResult.error.message);
    }

    // Process the payment
    const processResult = await terminal.processPayment(collectResult.paymentIntent);

    if (processResult.error) {
      throw new Error(processResult.error.message);
    }

    return processResult.paymentIntent;
  } catch (error: any) {
    console.error("Error collecting payment:", error);
    throw error;
  }
}

/**
 * Confirm payment on server
 */
export async function confirmPaymentOnServer(paymentIntentId: string) {
  try {
    const response = await fetch("/api/stripe/confirm-payment", {
      method: "POST",
      headers: getAuthHeaders(),
      body: JSON.stringify({ paymentIntentId }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || "Failed to confirm payment");
    }

    return await response.json();
  } catch (error: any) {
    console.error("Error confirming payment:", error);
    throw error;
  }
}

/**
 * Cancel a payment
 */
export async function cancelPayment(paymentIntentId: string) {
  try {
    const response = await fetch("/api/stripe/cancel-payment", {
      method: "POST",
      headers: getAuthHeaders(),
      body: JSON.stringify({ paymentIntentId }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || "Failed to cancel payment");
    }

    return await response.json();
  } catch (error: any) {
    console.error("Error canceling payment:", error);
    throw error;
  }
}

/**
 * Disconnect reader
 */
export async function disconnectReader() {
  try {
    if (terminal && reader) {
      await terminal.disconnectReader();
      reader = null;
    }
  } catch (error) {
    console.error("Error disconnecting reader:", error);
  }
}

/**
 * Check if Terminal is available
 */
export function isTerminalAvailable(): boolean {
  return typeof window !== "undefined" && terminal !== null && reader !== null;
}

/**
 * Get current reader status
 */
export function getReaderStatus(): { connected: boolean; reader: any } {
  return {
    connected: reader !== null,
    reader: reader,
  };
}

