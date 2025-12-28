export type SubscriptionPlan = "freemium" | "pro" | "premium";

const EMPLOYEE_LIMITS: Record<SubscriptionPlan, number | null> = {
  freemium: 1,
  pro: 5,
  premium: null, // null equals unlimited
};

export function getEmployeeLimit(plan: SubscriptionPlan): number | null {
  return EMPLOYEE_LIMITS[plan];
}

export const PLAN_DISPLAY_NAMES: Record<SubscriptionPlan, { fr: string; en: string }> = {
  freemium: { fr: "Freemium", en: "Freemium" },
  pro: { fr: "Pro", en: "Pro" },
  premium: { fr: "Premium", en: "Premium" },
};

export const PLAN_PRICES: Record<SubscriptionPlan, { monthly: string; annual: string }> = {
  freemium: { monthly: "0 $", annual: "0 $" },
  pro: { monthly: "9,99 $ / mois", annual: "99 $ / an" },
  premium: { monthly: "24,99 $ / mois", annual: "249 $ / an" },
};

