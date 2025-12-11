import { useState, useEffect } from "react";
import { CreditCard, Loader2, AlertCircle, Check, Wifi, WifiOff } from "lucide-react";
import { cn } from "@/lib/utils";
import { useI18n } from "@/contexts/I18nContext";
import {
  initializeStripeTerminal,
  discoverAndConnectReader,
  createPaymentIntent,
  collectPayment,
  confirmPaymentOnServer,
  cancelPayment,
  disconnectReader,
  getReaderStatus,
} from "@/services/stripe";

interface StripeTerminalPaymentProps {
  amount: number;
  onPaymentComplete: (paymentIntentId: string) => void;
  onCancel: () => void;
  onError: (error: string) => void;
}

type PaymentStatus =
  | "idle"
  | "initializing"
  | "connecting"
  | "connected"
  | "collecting"
  | "processing"
  | "success"
  | "error";

export default function StripeTerminalPayment({
  amount,
  onPaymentComplete,
  onCancel,
  onError,
}: StripeTerminalPaymentProps) {
  const { t } = useI18n();
  const [status, setStatus] = useState<PaymentStatus>("idle");
  const [readerConnected, setReaderConnected] = useState(false);
  const [paymentIntentId, setPaymentIntentId] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string>("");

  // Initialize Terminal on mount
  useEffect(() => {
    initializeTerminal();
    return () => {
      // Cleanup: disconnect reader on unmount
      disconnectReader();
    };
  }, []);

  const initializeTerminal = async () => {
    try {
      setStatus("initializing");
      setErrorMessage("");

      const initialized = await initializeStripeTerminal();
      if (!initialized) {
        throw new Error("Failed to initialize Stripe Terminal");
      }

      setStatus("connecting");
      await connectToReader();
    } catch (error: any) {
      console.error("Terminal initialization error:", error);
      setStatus("error");
      setErrorMessage(error.message || "Failed to initialize Terminal");
      onError(error.message || "Failed to initialize Terminal");
    }
  };

  const connectToReader = async () => {
    try {
      setStatus("connecting");
      setErrorMessage("");

      await discoverAndConnectReader();
      setReaderConnected(true);
      setStatus("connected");
    } catch (error: any) {
      console.error("Reader connection error:", error);
      setStatus("error");
      setErrorMessage(
        error.message || "Failed to connect to reader. Please ensure your reader is powered on and nearby."
      );
      onError(error.message || "Failed to connect to reader");
    }
  };

  const handleCollectPayment = async () => {
    try {
      setStatus("collecting");
      setErrorMessage("");

      // Create payment intent
      const { clientSecret, paymentIntentId: intentId } = await createPaymentIntent(amount, {
        source: "terminal",
        timestamp: new Date().toISOString(),
      });

      setPaymentIntentId(intentId);

      // Collect payment from reader
      const paymentIntent = await collectPayment(clientSecret, (status) => {
        if (status === "processing") {
          setStatus("processing");
        }
      });

      // Confirm payment on server
      const confirmation = await confirmPaymentOnServer(paymentIntent.id);

      if (confirmation.success) {
        setStatus("success");
        setTimeout(() => {
          onPaymentComplete(paymentIntent.id);
        }, 1500);
      } else {
        throw new Error("Payment confirmation failed");
      }
    } catch (error: any) {
      console.error("Payment collection error:", error);
      setStatus("error");
      setErrorMessage(error.message || "Payment failed");

      // Cancel payment intent if it was created
      if (paymentIntentId) {
        try {
          await cancelPayment(paymentIntentId);
        } catch (cancelError) {
          console.error("Error canceling payment:", cancelError);
        }
      }

      onError(error.message || "Payment failed");
    }
  };

  const handleCancel = async () => {
    if (paymentIntentId) {
      try {
        await cancelPayment(paymentIntentId);
      } catch (error) {
        console.error("Error canceling payment:", error);
      }
    }
    await disconnectReader();
    onCancel();
  };

  const handleRetry = () => {
    setStatus("idle");
    setErrorMessage("");
    setPaymentIntentId(null);
    initializeTerminal();
  };

  // Status display
  if (status === "success") {
    return (
      <div className="text-center py-8 space-y-3">
        <div className="flex justify-center">
          <div className="p-3 bg-green-900/40 rounded-full">
            <Check className="h-8 w-8 text-green-400" />
          </div>
        </div>
        <h3 className="font-semibold text-foreground">
          {t.paymentForm?.paymentSuccessful || "Payment Successful"}
        </h3>
        <p className="text-sm text-muted-foreground">
          {t.paymentForm?.thankYou || "Thank you for your purchase"}
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Reader Status */}
      <div className="bg-secondary rounded-lg p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            {readerConnected ? (
              <Wifi className="h-5 w-5 text-green-500" />
            ) : (
              <WifiOff className="h-5 w-5 text-muted-foreground" />
            )}
            <div>
              <p className="text-sm font-medium text-foreground">
                {readerConnected ? "Reader Connected" : "Reader Disconnected"}
              </p>
              <p className="text-xs text-muted-foreground">
                {readerConnected
                  ? "Ready to accept payment"
                  : "Connecting to reader..."}
              </p>
            </div>
          </div>
          {!readerConnected && status === "connected" && (
            <button
              onClick={connectToReader}
              className="text-xs px-3 py-1 bg-primary text-primary-foreground rounded hover:bg-primary/90"
            >
              Retry
            </button>
          )}
        </div>
      </div>

      {/* Status Messages */}
      {status === "initializing" && (
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Loader2 className="h-4 w-4 animate-spin" />
          <span>Initializing Terminal...</span>
        </div>
      )}

      {status === "connecting" && (
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Loader2 className="h-4 w-4 animate-spin" />
          <span>Connecting to reader...</span>
        </div>
      )}

      {status === "collecting" && (
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Loader2 className="h-4 w-4 animate-spin" />
          <span>Please insert, tap, or swipe your card...</span>
        </div>
      )}

      {status === "processing" && (
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Loader2 className="h-4 w-4 animate-spin" />
          <span>Processing payment...</span>
        </div>
      )}

      {/* Error Message */}
      {errorMessage && (
        <div className="flex gap-2 p-3 bg-destructive/20 rounded-lg border border-destructive/30">
          <AlertCircle className="h-5 w-5 text-destructive flex-shrink-0 mt-0.5" />
          <div className="flex-1">
            <p className="text-sm text-destructive">{errorMessage}</p>
            {status === "error" && (
              <button
                onClick={handleRetry}
                className="text-xs text-destructive underline mt-1"
              >
                Try again
              </button>
            )}
          </div>
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex gap-3 pt-4 border-t-2 border-foreground/20">
        <button
          type="button"
          onClick={handleCancel}
          disabled={status === "collecting" || status === "processing"}
          className="flex-1 px-4 py-2 bg-secondary text-foreground rounded-lg hover:bg-secondary/80 transition-colors disabled:opacity-50 font-medium"
        >
          {t.paymentForm?.cancel || "Cancel"}
        </button>
        <button
          type="button"
          onClick={handleCollectPayment}
          disabled={
            !readerConnected ||
            status === "collecting" ||
            status === "processing" ||
            status === "initializing" ||
            status === "connecting"
          }
          className={cn(
            "flex-1 px-4 py-2 rounded-lg transition-colors font-medium flex items-center justify-center gap-2",
            readerConnected && status === "connected"
              ? "bg-primary text-primary-foreground hover:bg-primary/90"
              : "bg-muted text-muted-foreground cursor-not-allowed"
          )}
        >
          {status === "collecting" || status === "processing" ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Processing...
            </>
          ) : (
            <>
              <CreditCard className="h-4 w-4" />
              {t.paymentForm?.pay || "Pay"} ${amount.toFixed(2)}
            </>
          )}
        </button>
      </div>

      {/* Instructions */}
      <div className="text-center">
        <p className="text-xs text-muted-foreground">
          {readerConnected
            ? "Insert, tap, or swipe your card when ready"
            : "Please connect a Stripe Terminal reader to process payments"}
        </p>
      </div>
    </div>
  );
}

