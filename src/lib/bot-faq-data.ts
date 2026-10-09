export interface BotFaqItem {
  id: number;
  category: "REGISTRATION" | "PRIVACY" | "PAYMENT" | "HOROSCOPE" | "ALLIANCE" | "SECURITY";
  categoryTe: string;
  questionTe: string;
  questionEn: string;
  answerTe: string;
  answerEn: string;
}

export const BOT_FAQS: BotFaqItem[] = [
  // 1-5: Registration & Onboarding
  {
    id: 1,
    category: "REGISTRATION",
    categoryTe: "నమోదు & ప్రొఫైల్",
    questionTe: "నాయీ సమాఖ్య వివాహ వేదికలో రిజిస్ట్రేషన్ ఎలా చేసుకోవాలి?",
    questionEn: "How do I register on Nayi Samakhya Matrimonial Portal?",
    answerTe: "హోమ్‌పేజీలోని '7-దశల ప్రొఫైల్ ప్రారంభించండి' బటన్‌ను నొక్కి, మీ మొబైల్ నంబర్ ఓటీపీ ధృవీకరణ ద్వారా 7 సులభమైన దశల్లో మీ వివరాలు, గోత్రం మరియు విద్యార్హతలు నమోదు చేసుకోవచ్చు.",
    answerEn: "Tap 'Start 7-Step Profile' on the homepage, verify your mobile number via OTP, and fill in your personal, gothra, and educational details across 7 simple steps."
  },
  {
    id: 2,
    category: "REGISTRATION",
    categoryTe: "నమోదు & ప్రొఫైల్",
    questionTe: "రిజిస్ట్రేషన్ కోసం పాస్‌వర్డ్ గుర్తుంచుకోవాలా?",
    questionEn: "Do I need to remember a password to sign in?",
    answerTe: "అవసరం లేదు! ఇది పూర్తి పాస్‌వర్డ్-రహిత వ్యవస్థ. మీ రిజిస్టర్డ్ మొబైల్ నంబర్ లేదా మీకు కేటాయించిన యూనిక్ ఐడీ (ఉదా: NS-M1042) నమోదు చేస్తే మీ ఫోన్‌కు వచ్చే 6 అంకెల SMS OTP ద్వారా సురక్షితంగా ప్రవేశించవచ్చు.",
    answerEn: "No! It is completely passwordless. Enter your registered mobile or Unique ID (e.g., NS-M1042) to sign in securely using a 6-digit SMS OTP."
  },
  {
    id: 3,
    category: "REGISTRATION",
    categoryTe: "నమోదు & ప్రొఫైల్",
    questionTe: "యూనిక్ ఐడీ (Unique ID) అంటే ఏమిటి? అది ఎక్కడ కనిపిస్తుంది?",
    questionEn: "What is a Unique ID and where can I find it?",
    answerTe: "ప్రతి అభ్యర్థికి కేటాయించబడే ప్రత్యేక గుర్తింపు సంఖ్య (ఉదా: NS-M1042 వరుడికి, NS-F1043 వధువుకు). ఇది మీ ప్రొఫైల్ కార్డుపై మరియు అభ్యర్థి పేరు పక్కన కనిపిస్తుంది.",
    answerEn: "A sovereign unique identifier assigned to each candidate (e.g., NS-M1042 for grooms, NS-F1043 for brides) displayed on your profile card."
  },
  {
    id: 4,
    category: "REGISTRATION",
    categoryTe: "నమోదు & ప్రొఫైల్",
    questionTe: "తల్లిదండ్రులు తమ పిల్లల తరపున ప్రొఫైల్ నమోదు చేయవచ్చా?",
    questionEn: "Can parents register a profile on behalf of their children?",
    answerTe: "తప్పకుండా! మొదటి దశలోనే 'ఎవరి కొరకు ప్రొఫైల్?' అనే ఎంపికలో 'కుమారుడు / కుమార్తె' అని ఎంచుకుని తల్లిదండ్రులు పూర్తి వివరాలు నమోదు చేయవచ్చు.",
    answerEn: "Yes! In Step 1 of onboarding, parents can select 'Son' or 'Daughter' and manage the alliance profile directly."
  },
  {
    id: 5,
    category: "REGISTRATION",
    categoryTe: "నమోదు & ప్రొఫైల్",
    questionTe: "ప్రొఫైల్ ఫోటో అప్‌లోడ్ చేయడం తప్పనిసరిగా ఉండాలా?",
    questionEn: "Is uploading a photo mandatory?",
    answerTe: "అవును, ప్రొఫైల్ ప్రామాణికత మరియు కుటుంబాల నమ్మకం కొరకు స్పష్టమైన పాస్‌పోర్ట్ సైజ్ లేదా పోర్ట్రెయిట్ ఫోటో అప్‌లోడ్ చేయడం అవసరం. ఇది క్లౌడ్‌ఫ్లేర్ R2 లో అత్యంత సురక్షితంగా భద్రపరచబడుతుంది.",
    answerEn: "Yes, a clear portrait photo is required to ensure genuine matrimonial intent. It is stored securely in Cloudflare R2 storage."
  },

  // 6-10: Privacy & Photo Masking
  {
    id: 6,
    category: "PRIVACY",
    categoryTe: "గోప్యత & రక్షణ",
    questionTe: "నా పూర్తి పేరు మరియు ఫోటో అందరికీ బహిరంగంగా కనిపిస్తాయా?",
    questionEn: "Will my full name and photo be shown publicly to everyone?",
    answerTe: "ఖచ్చితంగా కనిపించవు! గోప్యత రక్షణ కొరకు మొదటి పేరు మాత్రమే కనిపిస్తుంది (ఉదా: Sai K. · NS-M1042). ఫోటోలు అందరికీ బ్లర్ చేయబడి గోల్డెన్ లాక్ గుర్తుతో కనిపిస్తాయి. ధృవీకరించబడిన సభ్యులు మాత్రమే పూర్తి ఫోటో చూడగలరు.",
    answerEn: "No! Only first name initials are shown publicly (e.g., Sai K. · NS-M1042). Photos are Gaussian blurred with a golden lock badge until verified."
  },
  {
    id: 7,
    category: "PRIVACY",
    categoryTe: "గోప్యత & రక్షణ",
    questionTe: "నా మొబైల్ నంబర్ ఇతర సభ్యులకు నేరుగా కనిపిస్తుందా?",
    questionEn: "Will my mobile phone number be visible directly to anyone?",
    answerTe: "లేదు! DPDP చట్టం 2023 ప్రకారం మీ ఫోన్ నంబర్ పూర్తిగా మాస్క్ చేయబడి ఉంటుంది. ఇరు కుటుంబాలు పరస్పర ఆసక్తి (Mutual Consent) వ్యక్తం చేసి ఆమోదించిన తర్వాతే ఫోన్ నంబర్లు అన్‌లాక్ అవుతాయి.",
    answerEn: "No! Phone numbers are strictly masked under DPDP Act 2023. They are only revealed upon mutual bilateral family consent."
  },
  {
    id: 8,
    category: "PRIVACY",
    categoryTe: "గోప్యత & రక్షణ",
    questionTe: "నా ప్రొఫైల్ లేదా ఫోటోను ఎవరైనా దుర్వినియోగం చేయగలరా?",
    questionEn: "Can someone misuse my photos or profile data?",
    answerTe: "సాధ్యపడదు. అన్ని ఫోటోలపై డిజిటల్ వాటర్‌మార్క్ ఉంటుంది, అలాగే డేటా మొత్తం AES-256-GCM ఎన్‌క్రిప్షన్ ద్వారా బ్యాంకింగ్ స్థాయిలో భద్రపరచబడింది.",
    answerEn: "No. All images feature digital forensic watermarking, and candidate databases are encrypted with AES-256-GCM banking-grade security."
  },
  {
    id: 9,
    category: "PRIVACY",
    categoryTe: "గోప్యత & రక్షణ",
    questionTe: "నేను నా ప్రొఫైల్ డేటాను ఎప్పుడైనా తొలగించవచ్చా (Right to Erasure)?",
    questionEn: "Can I request deletion of my profile at any time?",
    answerTe: "అవును! DPDP చట్టం కింద 'రైట్ టు ఎరేజర్' సౌలభ్యం ఉంది. ప్రొఫైల్ సెట్టింగ్స్ లేదా గ్రీవెన్స్ అధికారికి ఒక అభ్యర్థన పంపడం ద్వారా మీ డేటాను శాశ్వతంగా డిలీట్ చేసుకోవచ్చు.",
    answerEn: "Yes! In full compliance with DPDP Act 2023, you can invoke your 'Right to Erasure' to purge your profile and media permanently."
  },
  {
    id: 10,
    category: "PRIVACY",
    categoryTe: "గోప్యత & రక్షణ",
    questionTe: "వెబ్‌సైట్ నుండి నా బయోడేటా పిడిఎఫ్ డౌన్‌లోడ్ చేసుకోవచ్చా?",
    questionEn: "Can I download an A4 printable biodata PDF of a candidate?",
    answerTe: "అవును, లాగిన్ అయిన సభ్యులు 'బయోడేటా పత్రిక (A4 PDF)' బటన్ క్లిక్ చేసి సంప్రదాయబద్ధమైన ప్రింటబుల్ ఫార్మాట్‌ను డౌన్‌లోడ్ చేసుకోవచ్చు.",
    answerEn: "Yes, verified members can download a traditional Telugu A4 Biodata Patrika PDF formatted with community emblems and verified details."
  },

  // 11-15: Kalyana Seva Contribution Plan (₹599)
  {
    id: 11,
    category: "PAYMENT",
    categoryTe: "సేవా సహకారం (₹599)",
    questionTe: "₹599 కల్యాణ సేవా ప్లాన్ యొక్క ప్రయోజనాలు ఏమిటి?",
    questionEn: "What are the benefits of the ₹599 Kalyana Seva Annual Plan?",
    answerTe: "1 పూర్తి సంవత్సరం (365 రోజులు) చెల్లుబాటుతో 50 మంది వధూవరుల పూర్తి ప్రొఫైల్స్, అన్‌బ్లర్డ్ ఫోటోలు, సంపూర్ణ జాతక చక్రాలు మరియు కుటుంబ సభ్యుల సంప్రదింపు వివరాలను అన్‌లాక్ చేసుకోవచ్చు.",
    answerEn: "Enjoy 1 full year (365 days) access to view 50 complete candidate profiles, unblurred HD portraits, full horoscopes, and direct family contact details."
  },
  {
    id: 12,
    category: "PAYMENT",
    categoryTe: "సేవా సహకారం (₹599)",
    questionTe: "ఈ ₹599 లో వ్యక్తిగత వివాహ మధ్యవర్తిత్వం (Personal Coordinator Mediation) ఉంటుందా?",
    questionEn: "Does ₹599 include personal mediator or coordinator matchmaking services?",
    answerTe: "స్పష్టమైన సమాధానం: ఉండదు! ఈ ₹599 కేవలం వెబ్‌సైట్ నిర్వహణ, క్లౌడ్ సర్వర్లు మరియు 50 ప్రొఫైల్స్ డిజిటల్ పరిశీలన కొరకు మాత్రమే. ఎటువంటి తప్పుడు వాగ్దానాలు లేదా మధ్యవర్తిత్వ హామీలు ఇవ్వబడవు.",
    answerEn: "Strictly NO. The ₹599 fee solely covers 50 profile digital access and web hosting operations. It does NOT include personal offline coordinator mediation."
  },
  {
    id: 13,
    category: "PAYMENT",
    categoryTe: "సేవా సహకారం (₹599)",
    questionTe: "₹599 ఎలా చెల్లించాలి? పేమెంట్ పద్ధతులు ఏమిటి?",
    questionEn: "How do I pay ₹599? What payment methods are supported?",
    answerTe: "PhonePe, Google Pay, Paytm లేదా ఏదైనా UPI యాప్ ద్వారా స్క్రీన్‌పై కనిపించే అధికారిక UPI QR కోడ్‌ను స్కాన్ చేసి నేరుగా nayisamakhya@upi కు చెల్లించవచ్చు.",
    answerEn: "Simply scan the in-app UPI QR Code using PhonePe, Google Pay, Paytm, or any UPI app to pay directly to nayisamakhya@upi."
  },
  {
    id: 14,
    category: "PAYMENT",
    categoryTe: "సేవా సహకారం (₹599)",
    questionTe: "చెల్లింపు పూర్తయిన తర్వాత 12 అంకెల UTR నంబర్ ఎక్కడ నమోదు చేయాలి?",
    questionEn: "Where do I submit the 12-digit UTR reference after paying?",
    answerTe: "పేమెంట్ మోడల్‌లోని '12 అంకెల UTR నంబర్' బాక్స్‌లో మీ UPI రసీదులోని ట్రాన్సాక్షన్ నంబర్‌ను ఎంటర్ చేసి 'ధృవీకరించండి' బటన్ నొక్కగానే తక్షణమే యాక్టివేట్ అవుతుంది.",
    answerEn: "Enter your 12-digit UPI transaction reference in the UTR input box on screen and submit for instant plan activation."
  },
  {
    id: 15,
    category: "PAYMENT",
    categoryTe: "సేవా సహకారం (₹599)",
    questionTe: "50 ప్రొఫైల్స్ పరిమితి ముగిసిన తర్వాత ఏమి చేయాలి?",
    questionEn: "What happens once my 50 profiles quota is exhausted?",
    answerTe: "50 ప్రొఫైల్స్ పూర్తయిన తర్వాత అవసరమైతే మరొక సేవా ప్యాక్‌ను రీఛార్జ్ చేసుకోవచ్చు, లేదా పాత పరిచయాలతో సంప్రదింపులను కొనసాగించవచ్చు.",
    answerEn: "You can renew with another quota pack or continue communicating with previously unlocked alliances."
  },

  // 16-20: Cultural Rules & Sagothra
  {
    id: 16,
    category: "ALLIANCE",
    categoryTe: "సంప్రదాయం & గోత్రం",
    questionTe: "సగోత్ర వివాహాల నియమం (Sagothra Rule) ఎలా అమలు చేయబడుతుంది?",
    questionEn: "How is the Sagothra (same lineage) mutual exclusion rule enforced?",
    answerTe: "వర మరియు వధువుల గోత్రం ఒకటే అయితే, మా వ్యవస్థ ఆటోమేటిక్‌గా 'సగోత్ర వర్జితం' హెచ్చరికను చూపిస్తుంది మరియు సాంప్రదాయ ధర్మం ప్రకారం ఆ సంబంధాన్ని జతచేయకుండా నిరోధిస్తుంది.",
    answerEn: "If the groom and bride share the same paternal gothra, the system automatically flags a strict Sagothra warning and excludes the match."
  },
  {
    id: 17,
    category: "ALLIANCE",
    categoryTe: "సంప్రదాయం & గోత్రం",
    questionTe: "మేనరికాలు మరియు తల్లి వంశ గోత్రం (Maternal Gothra) నమోదు చేయవచ్చా?",
    questionEn: "Can maternal lineage and consanguinity preferences be specified?",
    answerTe: "అవును, ఆన్‌బోర్డింగ్ స్టెప్ 3లో మేనమామ గోత్రం మరియు మేనరికం ప్రాధాన్యతలను స్పష్టంగా ఎంచుకునే సదుపాయం ఉంది.",
    answerEn: "Yes, Step 3 allows specifying maternal lineage (Menarikam / Maternal Gothra) to ensure thorough traditional astrological alignment."
  },
  {
    id: 18,
    category: "ALLIANCE",
    categoryTe: "సంప్రదాయం & గోత్రం",
    questionTe: "నాయీ బ్రాహ్మణ సంప్రదాయ వృత్తుల ప్రాధాన్యత ఏమిటి?",
    questionEn: "How are traditional Nayi Brahmin heritage vocations supported?",
    answerTe: "ఆయుర్వేద వైద్యం, సంప్రదాయ సంగీతం (మంగళ వాద్యం/నాదస్వరం), సెలూన్ ఎంటర్‌ప్రెన్యూర్‌షిప్, మరియు ఆధునిక ఐటీ/కార్పొరేట్ ఉద్యోగులందరికీ గౌరవప్రదమైన ప్రత్యేక కేటగిరీలు ఉన్నాయి.",
    answerEn: "We celebrate Ayurvedic wellness, sacred Mangala Vaidyam / Nadaswaram artistry, salon entrepreneurship, and modern IT professionals with equal dignity."
  },
  {
    id: 19,
    category: "ALLIANCE",
    categoryTe: "సంప్రదాయం & గోత్రం",
    questionTe: "బంధువులకు మరియు కుటుంబ సభ్యులకు వాట్సాప్‌లో వివరాలు పంపవచ్చా?",
    questionEn: "Can I share a profile directly with family members over WhatsApp?",
    answerTe: "అవును! ప్రతి ప్రొఫైల్ కార్డుపై 'వాట్సాప్ షేర్' బటన్ ఉంటుంది. దానిని క్లిక్ చేయగానే గౌరవప్రదమైన సాంప్రదాయ తెలుగు ఆహ్వాన సందేశం తయారై వాట్సాప్‌లో షేర్ అవుతుంది.",
    answerEn: "Yes! Tap the 'WhatsApp Share' button on any profile to share a beautifully formatted traditional Telugu alliance card with your family."
  },
  {
    id: 20,
    category: "ALLIANCE",
    categoryTe: "సంప్రదాయం & గోత్రం",
    questionTe: "ఒకవేళ సంబంధం కుదిరి వివాహం నిశ్చయమైతే ఏమి చేయాలి?",
    questionEn: "What should we do once an alliance is successfully finalized?",
    answerTe: "హృదయపూర్వక అభినందనలు! మీ ప్రొఫైల్ సెట్టింగ్స్‌లో 'వివాహం నిశ్చయమైంది (Alliance Settled)' అని మార్చడం ద్వారా మీ ప్రొఫైల్ గౌరవప్రదంగా ఆర్కైవ్ చేయబడుతుంది.",
    answerEn: "Hearty congratulations! Mark your profile status as 'Alliance Finalized' in settings to peacefully archive your listing."
  },

  // 21-25: Horoscope & Kundali Matching
  {
    id: 21,
    category: "HOROSCOPE",
    categoryTe: "జాతకం & నక్షత్రాలు",
    questionTe: "జాతక చక్రం మరియు నక్షత్ర వివరాలు ఎలా పరిశీలించాలి?",
    questionEn: "How do I inspect horoscopes and birth nakshatra details?",
    answerTe: "ప్రొఫైల్ పేజీలోని 'జాతక చక్రం' విభాగంలో జన్మ నక్షత్రం, పాదం, రాశి మరియు లగ్న వివరాలు స్పష్టంగా ప్రదర్శించబడతాయి.",
    answerEn: "The profile page displays the birth star (Nakshatra), Padam, Raasi, and planetary chart for Vedic compatibility."
  },
  {
    id: 22,
    category: "HOROSCOPE",
    categoryTe: "జాతకం & నక్షత్రాలు",
    questionTe: "కుజ దోషం (Kuja Dosha / Manglik) ఉన్న వివరాలు తెలుసుకోవచ్చా?",
    questionEn: "Can we check Kuja Dosham / Manglik alignment?",
    answerTe: "అవును, అభ్యర్థులు నమోదు చేసిన కుజ దోష స్థితి స్పష్టమైన చిహ్నాలతో ప్రొఫైల్‌పై చూపబడుతుంది.",
    answerEn: "Yes, candidates declare their Kuja Dosha status, clearly highlighted on the astrological compatibility card."
  },
  {
    id: 23,
    category: "HOROSCOPE",
    categoryTe: "జాతకం & నక్షత్రాలు",
    questionTe: "జాతక పత్రం ఫోటోను అప్‌లోడ్ చేయవచ్చా?",
    questionEn: "Can we upload a physical scanned horoscope chart?",
    answerTe: "అవును, ఆన్‌బోర్డింగ్ స్టెప్ 5లో మీ వద్ద ఉన్న చేతిరాత లేదా ప్రింటెడ్ జాతక పత్రాన్ని సురక్షితంగా అప్‌లోడ్ చేసుకోవచ్చు.",
    answerEn: "Yes, you can upload a high-resolution scanned horoscope copy during Step 5 of registration."
  },
  {
    id: 24,
    category: "HOROSCOPE",
    categoryTe: "జాతకం & నక్షత్రాలు",
    questionTe: "నక్షత్ర పోంతనలు స్వయంగా సరిచూసుకోవచ్చా?",
    questionEn: "Can we verify Vedic Guna Milan score automatically?",
    answerTe: "అవును, అష్టకూట గుణ మేళనం ద్వారా 36 పాయింట్లలో సరితూగే అనుకూలత స్కోరు గణించబడుతుంది.",
    answerEn: "Yes, the portal evaluates Ashta Kuta Guna Milan scores out of 36 points for astrological harmony."
  },
  {
    id: 25,
    category: "HOROSCOPE",
    categoryTe: "జాతకం & నక్షత్రాలు",
    questionTe: "జాతకం చూడటం రానివారు పుట్టిన తేదీ, సమయం ఇస్తే సరిపోతుందా?",
    questionEn: "Is date and time of birth sufficient if we don't have a horoscope chart?",
    answerTe: "ఖచ్చితంగా సరిపోతుంది! ఖచ్చితమైన పుట్టిన తేదీ, సమయం మరియు జన్మస్థలం నమోదు చేస్తే సరిపోతుంది.",
    answerEn: "Yes! Accurate Date of Birth, Time of Birth, and Birth Place are sufficient for astrological matching."
  },

  // 26-30: Security, Support & Offline Meets
  {
    id: 26,
    category: "SECURITY",
    categoryTe: "రక్షణ & సహాయం",
    questionTe: "ఆఫ్‌లైన్ వివాహ పరిచయ వేదికలకు సంబంధించిన ఫారాలు ఎక్కడ లభిస్తాయి?",
    questionEn: "Where can we find offline physical matrimony meet registration forms?",
    answerTe: "మా వెబ్‌సైట్‌లోని '/offline-meets' పేజీలో ప్రామాణిక A4 దరఖాస్తు పత్రాన్ని ఉచితంగా ప్రింట్ చేసుకునే సదుపాయం ఉంది.",
    answerEn: "Visit '/offline-meets' on our portal to download and print the standard bilateral A4 paper application form."
  },
  {
    id: 27,
    category: "SECURITY",
    categoryTe: "రక్షణ & సహాయం",
    questionTe: "సమన్వయకర్తలు బల్క్ దరఖాస్తులను ఎలా అప్‌లోడ్ చేయాలి?",
    questionEn: "How can coordinators ingest physical applications into the website?",
    answerTe: "అధికారిక సమన్వయకర్తలు '/offline-meets' లో తమ మొబైల్ ఓటీపీతో లాగిన్ అయి 60 సెకన్లలో బల్క్ ఎంట్రీ ఫారం ద్వారా వివరాలను డిజిటలైజ్ చేయవచ్చు.",
    answerEn: "Authorized coordinators log in via OTP at '/offline-meets' to batch ingest 10-50 physical paper applications in under 60 seconds."
  },
  {
    id: 28,
    category: "SECURITY",
    categoryTe: "రక్షణ & సహాయం",
    questionTe: "ఏదైనా తప్పుడు ప్రొఫైల్ లేదా అసభ్యకర ఫోటో కనిపిస్తే ఎవరికి ఫిర్యాదు చేయాలి?",
    questionEn: "How do I report a fake profile or inappropriate photo?",
    answerTe: "ప్రతి ప్రొఫైల్ కింద 'ఫిర్యాదు చేయండి (Report Profile)' బటన్ ఉంటుంది. ఇది నేరుగా డీపీడీపీ గ్రీవెన్స్ అధికారికి చేరుతుంది.",
    answerEn: "Click 'Report Profile' on any profile card to lodge an audited grievance with our DPDP Grievance Redressal Officer."
  },
  {
    id: 29,
    category: "SECURITY",
    categoryTe: "రక్షణ & సహాయం",
    questionTe: "అడ్మినిస్ట్రేటర్లు మాస్టర్ డేటా మరియు ఫోటోలను ఎలా డౌన్‌లోడ్ చేసుకోవచ్చు?",
    questionEn: "How can master administrators export database records and photos?",
    answerTe: "అధికారిక అడ్మిన్ ప్యానెల్ (/matrimony/nsm-admin) ద్వారా సింగిల్ క్లిక్‌తో ఎక్సెల్/CSV మరియు క్లౌడ్‌ఫ్లేర్ R2 ఫోటోల ఆర్కైవ్‌ను డౌన్‌లోడ్ చేసుకోవచ్చు.",
    answerEn: "Authorized master admins can export unmasked candidate records as Excel/CSV and sync R2 photo archives from /nsm-admin."
  },
  {
    id: 30,
    category: "SECURITY",
    categoryTe: "రక్షణ & సహాయం",
    questionTe: "సందేహాలు ఉంటే నాయీ సమాఖ్య ప్రతినిధులను ఎలా సంప్రదించాలి?",
    questionEn: "How can I contact Nayi Samakhya community representatives for help?",
    answerTe: "మా అధికారిక ఇమెయిల్ matrimony@nayisamakhya.org లేదా మీ జిల్లా/మండల నాయీ సమాఖ్య కార్యవర్గ ప్రతినిధులను నేరుగా సంప్రదించవచ్చు.",
    answerEn: "Reach out to matrimony@nayisamakhya.org or contact your local district/mandal Nayi Samakhya committee office."
  },
  {
    id: 31,
    category: "REGISTRATION",
    categoryTe: "నమోదు & ప్రాంతం",
    questionTe: "ఈ వేదిక తెలంగాణ వారికి మాత్రమేనా, లేక ఆంధ్రప్రదేశ్ మరియు ఇతర రాష్ట్రాల వారికి కూడానా?",
    questionEn: "Is this platform only for Telangana, or for Andhra Pradesh and other states as well?",
    answerTe: "ఇది ప్రపంచవ్యాప్తంగా ఉన్న సమస్త తెలుగు నాయీ బ్రాహ్మణుల ఉమ్మడి సార్వభౌమ వేదిక! తెలంగాణలోని 33 జిల్లాలు, ఆంధ్రప్రదేశ్‌లోని 26 పునర్వ్యవస్థీకృత జిల్లాలు (773 మండలాలు & పట్టణాలు), అలాగే బెంగళూరు, ముంబై, సూరత్, చెన్నై మరియు విదేశాల్లో స్థిరపడిన మన కుటుంబాలందరికీ సమాన ప్రాధాన్యతతో సేవలు అందిస్తున్నాము.",
    answerEn: "This is a unified sovereign platform for all Telugu Nayi Brahmins worldwide! It fully covers all 33 districts of Telangana, all 26 reorganized districts of Andhra Pradesh (773 mandals and towns), and families settled across Bengaluru, Mumbai, Chennai, Surat, and overseas."
  }
];
