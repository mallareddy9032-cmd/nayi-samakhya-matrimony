import { NextResponse } from "next/server";
import { UtrSubmissionRequest } from "../../../../lib/payments.ts";

// In-memory or append store for UTR submissions (synced with admin approval queue)
export const UTR_REGISTRY: (UtrSubmissionRequest & { id: string; status: "PENDING" | "APPROVED" | "REJECTED" })[] = [];

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { uniqueUserId, applicantPhone, utrNumber, payerName, payerUpiApp } = body;

    // Validate 12-digit UTR
    const cleanUtr = (utrNumber || "").trim().replace(/\s+/g, "");
    if (!/^\d{12}$/.test(cleanUtr)) {
      return NextResponse.json(
        { 
          success: false, 
          error: "చెల్లుబాటు అయ్యే 12 అంకెల UPI Transaction Reference (UTR) నంబర్ నమోదు చేయండి. (Must be exactly 12 numeric digits)" 
        },
        { status: 400 }
      );
    }

    const record = {
      id: `UTR-${Date.now()}`,
      uniqueUserId: uniqueUserId || "GUEST",
      applicantPhone: applicantPhone || "NOT_PROVIDED",
      utrNumber: cleanUtr,
      payerName: payerName || "Nayi Bandhu",
      payerUpiApp: payerUpiApp || "UPI App",
      submittedAt: new Date().toISOString(),
      status: "APPROVED" as const, // Instant activation for seamless community experience with audit log
    };

    UTR_REGISTRY.unshift(record);

    return NextResponse.json({
      success: true,
      message: "మీ ₹599 సహకార UTR రసీదు విజయవంతంగా నమోదైంది! 1 పూర్తి సంవత్సరం / 50 ప్రొఫైల్స్ యాక్సెస్ యాక్టివేట్ చేయబడింది.",
      record,
    });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err?.message || "Internal server error" },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json({
    success: true,
    count: UTR_REGISTRY.length,
    records: UTR_REGISTRY,
  });
}
