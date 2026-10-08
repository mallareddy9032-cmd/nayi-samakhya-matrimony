/**
 * Nayi Samakhya Matrimonial Portal - Kalyana Seva Contribution System
 * 
 * Plan: ₹599 Annual Seva / 50 Profiles / 365 Days Access
 * Strict Ethical Commitment: ₹599 strictly covers 50 profiles and web server operations.
 * NO false promises regarding personal coordinator mediation or guaranteed alliances.
 */

export interface SevaPlan {
  id: string;
  name: string;
  teluguName: string;
  amount: number;
  currency: string;
  profileLimit: number;
  durationDays: number;
  description: string;
  teluguDescription: string;
  upiVpa: string;
  merchantName: string;
}

export const KALYANA_SEVA_PLAN: SevaPlan = {
  id: "seva-599-annual",
  name: "Kalyana Seva 1-Year Contribution",
  teluguName: "కల్యాణ సేవ వార్షిక సహకారం",
  amount: 599,
  currency: "INR",
  profileLimit: 50,
  durationDays: 365,
  description: "Access 50 full profiles and horoscopes for 1 full year. Direct family contact details unlocked. Zero commercial middleman fees.",
  teluguDescription: "1 సంవత్సరం పాటు 50 మంది పూర్తి ప్రొఫైల్స్ మరియు జాతక వివరాల పరిశీలన. నేరుగా కుటుంబ సభ్యుల ఫోన్ నంబర్లు.",
  upiVpa: "nayisamakhya@upi",
  merchantName: "Nayi Samakhya Matrimony"
};

/**
 * Builds standard UPI Intent / Dynamic QR URI
 * Example: upi://pay?pa=nayisamakhya@upi&pn=Nayi+Samakhya+Matrimony&am=599&cu=INR&tn=NSM-NS-M1042
 */
export function generateUpiPaymentUri(uniqueUserId: string, amount: number = 599): string {
  const transactionNote = `NSM-${uniqueUserId}`;
  const encodedPn = encodeURIComponent(KALYANA_SEVA_PLAN.merchantName);
  const encodedTn = encodeURIComponent(transactionNote);
  return `upi://pay?pa=${KALYANA_SEVA_PLAN.upiVpa}&pn=${encodedPn}&am=${amount}&cu=INR&tn=${encodedTn}`;
}

export interface UtrSubmissionRequest {
  uniqueUserId: string;
  applicantPhone: string;
  utrNumber: string; // 12-digit UPI Transaction Reference
  payerName?: string;
  payerUpiApp?: string;
  submittedAt: string;
}

export interface UserSubscriptionStatus {
  isActive: boolean;
  profilesViewedCount: number;
  profileLimit: number;
  profilesRemaining: number;
  expiresAt: string | null;
  utrStatus: "NONE" | "PENDING_VERIFICATION" | "ACTIVE" | "EXPIRED";
}

/**
 * Default mock subscription state for demonstration & testing
 */
export function getSubscriptionStatus(userRole?: string): UserSubscriptionStatus {
  if (userRole === "admin") {
    return {
      isActive: true,
      profilesViewedCount: 14,
      profileLimit: 9999,
      profilesRemaining: 9985,
      expiresAt: new Date(Date.now() + 365 * 86400000).toISOString(),
      utrStatus: "ACTIVE",
    };
  }

  // Default guest/unpaid
  return {
    isActive: false,
    profilesViewedCount: 0,
    profileLimit: 50,
    profilesRemaining: 50,
    expiresAt: null,
    utrStatus: "NONE",
  };
}
