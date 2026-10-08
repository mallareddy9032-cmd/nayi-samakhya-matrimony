import { NextResponse } from "next/server";

// Sample candidate database for Master Admin export
const CANDIDATE_MASTER_DATA = [
  {
    uniqueId: "NS-M1042",
    fullName: "Sai Krishna N.",
    gender: "MALE",
    age: 28,
    gothra: "Kashyapa",
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
    district: "Krishna",
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
    district: "East Godavari",
    mandal: "Rajahmundry",
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
    district: "Kurnool",
    mandal: "Nandyal",
    education: "M.Tech",
    occupation: "Assistant Professor",
    phone: "9848012349",
    registeredAt: "2026-03-25",
    subscriptionStatus: "FREE_GUEST",
    photoKey: "photos/NS-M1046/portrait.webp"
  }
];

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const format = searchParams.get("format");

  if (format === "csv") {
    // Generate CSV output with unmasked mobile numbers for authorized administration
    const headers = [
      "Unique ID",
      "Full Name",
      "Gender",
      "Age",
      "Gothra",
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
      c.uniqueId,
      `"${c.fullName}"`,
      c.gender,
      c.age,
      `"${c.gothra}"`,
      `"${c.district}"`,
      `"${c.mandal}"`,
      `"${c.education}"`,
      `"${c.occupation}"`,
      `"'+91${c.phone}"`, // prepended with +91 for Excel
      c.registeredAt,
      `"${c.subscriptionStatus}"`,
      `"${c.photoKey}"`
    ]);

    const csvContent = [headers.join(","), ...rows.map(r => r.join(","))].join("\r\n");

    return new NextResponse(csvContent, {
      status: 200,
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": `attachment; filename="NSM_Candidates_Master_Export_${new Date().toISOString().slice(0, 10)}.csv"`,
      },
    });
  }

  return NextResponse.json({
    success: true,
    count: CANDIDATE_MASTER_DATA.length,
    candidates: CANDIDATE_MASTER_DATA,
  });
}
