import { NextResponse } from "next/server";
import { getOptionalSession } from "../../../../lib/session.ts";

// Sample candidate database for Master Admin export
const CANDIDATE_MASTER_DATA = [
  {
    uniqueId: "NS-M1042",
    fullName: "Sai Krishna N.",
    gender: "MALE",
    age: 28,
    gothra: "Kashyapa",
    state: "Andhra Pradesh",
    district: "Guntur",
    mandal: "Tenali",
    education: "B.Tech (CSE)",
    occupation: "Senior Software Engineer",
    phone: "9848012345",
    registeredAt: "2026-03-15",
    subscriptionStatus: "ACTIVE (₹599 Paid)",
    photoKey: "photos/NS-M1042/portrait.webp"
  },
  {
    uniqueId: "NS-F1043",
    fullName: "Lakshmi Prasanna P.",
    gender: "FEMALE",
    age: 25,
    gothra: "Bharadwaja",
    state: "Andhra Pradesh",
    district: "NTR (Vijayawada)",
    mandal: "Vijayawada Urban",
    education: "M.Sc (Biochemistry)",
    occupation: "Research Analyst",
    phone: "9848012346",
    registeredAt: "2026-03-18",
    subscriptionStatus: "ACTIVE (₹599 Paid)",
    photoKey: "photos/NS-F1043/portrait.webp"
  },
  {
    uniqueId: "NS-M1044",
    fullName: "Venkatesh Babu K.",
    gender: "MALE",
    age: 30,
    gothra: "Vashishta",
    state: "Andhra Pradesh",
    district: "Visakhapatnam",
    mandal: "Gajuwaka",
    education: "MBA (Finance)",
    occupation: "Bank Assistant Manager",
    phone: "9848012347",
    registeredAt: "2026-03-20",
    subscriptionStatus: "PENDING_UTR",
    photoKey: "photos/NS-M1044/portrait.webp"
  },
  {
    uniqueId: "NS-F1045",
    fullName: "Sravani Ananya T.",
    gender: "FEMALE",
    age: 24,
    gothra: "Kaushika",
    state: "Andhra Pradesh",
    district: "East Godavari",
    mandal: "Rajahmundry Urban",
    education: "B.Com, CA Inter",
    occupation: "Financial Auditor",
    phone: "9848012348",
    registeredAt: "2026-03-22",
    subscriptionStatus: "ACTIVE (₹599 Paid)",
    photoKey: "photos/NS-F1045/portrait.webp"
  },
  {
    uniqueId: "NS-M1046",
    fullName: "Nagaraju G.",
    gender: "MALE",
    age: 29,
    gothra: "Gautama",
    state: "Andhra Pradesh",
    district: "Kurnool",
    mandal: "Adoni Urban",
    education: "M.Tech",
    occupation: "Assistant Professor",
    phone: "9848012349",
    registeredAt: "2026-03-25",
    subscriptionStatus: "FREE_GUEST",
    photoKey: "photos/NS-M1046/portrait.webp"
  },
  {
    uniqueId: "NS-M1047",
    fullName: "T. Vamshi Krishna",
    gender: "MALE",
    age: 27,
    gothra: "Kaundinya",
    state: "Telangana",
    district: "Hyderabad",
    mandal: "Ameerpet",
    education: "M.Tech · Senior Data Scientist",
    occupation: "Senior Data Scientist",
    phone: "9848012350",
    registeredAt: "2026-03-28",
    subscriptionStatus: "ACTIVE (₹599 Paid)",
    photoKey: "photos/NS-M1047/portrait.webp"
  },
  {
    uniqueId: "NS-F1048",
    fullName: "K. Snehalatha",
    gender: "FEMALE",
    age: 24,
    gothra: "Bharadwaja",
    state: "Telangana",
    district: "Warangal",
    mandal: "Hanamkonda",
    education: "M.Sc, B.Ed",
    occupation: "Govt High School Teacher",
    phone: "9848012351",
    registeredAt: "2026-03-29",
    subscriptionStatus: "ACTIVE (₹599 Paid)",
    photoKey: "photos/NS-F1048/portrait.webp"
  },
  {
    uniqueId: "NS-M1049",
    fullName: "R. Kiran Kumar",
    gender: "MALE",
    age: 29,
    gothra: "Sandilya",
    state: "Other States / Diaspora",
    district: "Bengaluru Urban",
    mandal: "Indiranagar",
    education: "MS in Computer Science",
    occupation: "Staff Software Engineer",
    phone: "9848012352",
    registeredAt: "2026-04-01",
    subscriptionStatus: "ACTIVE (₹599 Paid)",
    photoKey: "photos/NS-M1049/portrait.webp"
  }
];

/**
 * Sanitizes cell values to prevent CSV formula injection attacks (=, +, -, @)
 */
function sanitizeCsvCell(value: string | number): string {
  const str = String(value ?? "");
  const trimmed = str.trim();
  if (/^[=+\-@\t\r]/.test(trimmed)) {
    return `"'${trimmed.replace(/"/g, '""')}"`;
  }
  return `"${str.replace(/"/g, '""')}"`;
}

export async function GET(req: Request) {
  // 1. Session RBAC check: Only authorized coordinators or officers may export
  const session = await getOptionalSession();
  const isAuthorized = session && (
    session.roles.includes("district_lineage_officer") ||
    session.roles.includes("mandal_coordinator") ||
    session.roles.includes("grievance_officer")
  );

  // In production / non-test mode, enforce RBAC
  if (!isAuthorized && process.env.NODE_ENV === "production") {
    return NextResponse.json(
      { error: "అనధికారిక ప్రవేశం. కేవలం అధీకృత సమన్వయకర్తలకు మాత్రమే అనుమతి ఉంది. (Unauthorized: Master Admin Role Required)" },
      { status: 403 }
    );
  }

  const { searchParams } = new URL(req.url);
  const format = searchParams.get("format");

  if (format === "csv") {
    const headers = [
      "Unique ID",
      "Full Name",
      "Gender",
      "Age",
      "Gothra",
      "State / Region",
      "District",
      "Mandal",
      "Education",
      "Occupation",
      "Mobile Number",
      "Registration Date",
      "Subscription Status",
      "Photo Storage Key"
    ];

    const rows = CANDIDATE_MASTER_DATA.map((c) => [
      sanitizeCsvCell(c.uniqueId),
      sanitizeCsvCell(c.fullName),
      sanitizeCsvCell(c.gender),
      sanitizeCsvCell(c.age),
      sanitizeCsvCell(c.gothra),
      sanitizeCsvCell(c.state),
      sanitizeCsvCell(c.district),
      sanitizeCsvCell(c.mandal),
      sanitizeCsvCell(c.education),
      sanitizeCsvCell(c.occupation),
      sanitizeCsvCell(`+91${c.phone}`), // Prepend +91 for Excel
      sanitizeCsvCell(c.registeredAt),
      sanitizeCsvCell(c.subscriptionStatus),
      sanitizeCsvCell(c.photoKey)
    ]);

    // UTF-8 BOM (\uFEFF) ensures Telugu characters and Excel open seamlessly without garbled text
    const csvContent = "\uFEFF" + [headers.map(sanitizeCsvCell).join(","), ...rows.map(r => r.join(","))].join("\r\n");

    return new NextResponse(csvContent, {
      status: 200,
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": `attachment; filename="NSM_Candidates_Master_Export_${new Date().toISOString().slice(0, 10)}.csv"`,
        "Cache-Control": "private, no-cache, no-store, must-revalidate",
      },
    });
  }

  return NextResponse.json({
    success: true,
    count: CANDIDATE_MASTER_DATA.length,
    candidates: CANDIDATE_MASTER_DATA,
  });
}
