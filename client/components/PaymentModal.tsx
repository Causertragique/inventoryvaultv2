import { useState } from "react";
import { X, Loader2 } from "lucide-react";
import PaymentForm from "./PaymentForm";
import { useI18n } from "@/contexts/I18nContext";

interface PaymentModalProps {
  isOpen: boolean;
  amount: number;
  subtotal?: number;
  tax?: number;
  taxBreakdown?: { TPS?: number; TVQ?: number; PST?: number; HST?: number; TVD?: number };
  taxLabels?: { primary: string; secondary: string };
  tip?: number;
  onClose: () => void;
  onPaymentComplete: () => void;
}

export default function PaymentModal({
  isOpen,
  amount,
  subtotal,
  tax,
  taxBreakdown,
  taxLabels,
  tip,
  onClose,
  onPaymentComplete,
}: PaymentModalProps) {
  const { t } = useI18n();
  const [isProcessing, setIsProcessing] = useState(false);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-2 sm:p-4">
      <div className="bg-card border-2 border-foreground/20 rounded-lg max-w-sm w-full shadow-xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-3 sm:p-4 border-b-2 border-foreground/20 sticky top-0 bg-card">
          <h2 className="text-lg sm:text-xl font-bold text-foreground">
            {t.paymentModal.completePayment}
          </h2>
          <button
            onClick={onClose}
            disabled={isProcessing}
            className="p-1 hover:bg-secondary rounded transition-colors disabled:opacity-50 flex-shrink-0"
            aria-label="Close payment modal"
          >
            <X className="h-4 w-4 sm:h-5 sm:w-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-3 sm:p-4 space-y-3 sm:space-y-4">
          {/* Receipt Summary */}
          {subtotal !== undefined && (
            <div className="bg-secondary/50 rounded-lg p-2.5 sm:p-3 space-y-1.5 text-xs sm:text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Sous-total</span>
                <span className="text-sm">${subtotal.toFixed(2)}</span>
              </div>
              {taxBreakdown && taxLabels && (
                <>
                  {taxBreakdown.TPS !== undefined && taxBreakdown.TPS > 0 && (
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">{taxLabels.primary}</span>
                      <span className="text-sm">${taxBreakdown.TPS.toFixed(2)}</span>
                    </div>
                  )}
                  {taxBreakdown.TVQ !== undefined && taxBreakdown.TVQ > 0 && (
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">{taxLabels.secondary}</span>
                      <span className="text-sm">${taxBreakdown.TVQ.toFixed(2)}</span>
                    </div>
                  )}
                  {taxBreakdown.PST !== undefined && taxBreakdown.PST > 0 && (
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">{taxLabels.secondary}</span>
                      <span className="text-sm">${taxBreakdown.PST.toFixed(2)}</span>
                    </div>
                  )}
                  {taxBreakdown.TVD !== undefined && taxBreakdown.TVD > 0 && (
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">{taxLabels.secondary}</span>
                      <span className="text-sm">${taxBreakdown.TVD.toFixed(2)}</span>
                    </div>
                  )}
                  {taxBreakdown.HST !== undefined && taxBreakdown.HST > 0 && (
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">{taxLabels.primary}</span>
                      <span className="text-sm">${taxBreakdown.HST.toFixed(2)}</span>
                    </div>
                  )}
                </>
              )}
              {tax !== undefined && tax > 0 && (!taxLabels || !taxBreakdown?.TPS) && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Taxes</span>
                  <span className="text-sm">${tax.toFixed(2)}</span>
                </div>
              )}
              {tip !== undefined && tip > 0 && (
                <div className="flex justify-between border-t border-foreground/10 pt-1.5">
                  <span className="text-muted-foreground font-medium">Pourboire</span>
                  <span className="font-medium text-sm">${tip.toFixed(2)}</span>
                </div>
              )}
            </div>
          )}

          {/* Amount Display */}
          <div className="bg-primary/10 rounded-lg p-2.5 sm:p-3 text-center border-2 border-primary">
            <p className="text-xs text-muted-foreground uppercase font-medium mb-1">
              {t.paymentModal.totalAmount}
            </p>
            <p className="text-2xl sm:text-3xl font-bold text-foreground">
              ${amount.toFixed(2)}
            </p>
          </div>

          {/* Payment Form */}
          {!isProcessing ? (
            <PaymentForm
              amount={amount}
              isProcessing={isProcessing}
              setIsProcessing={setIsProcessing}
              onPaymentComplete={onPaymentComplete}
              onCancel={onClose}
            />
          ) : (
            <div className="flex flex-col items-center justify-center py-4 sm:py-6 space-y-2 sm:space-y-3">
              <Loader2 className="h-6 w-6 sm:h-8 sm:w-8 text-primary animate-spin" />
              <p className="text-xs sm:text-sm text-muted-foreground">
                {t.paymentModal.processingPayment}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
