export interface MandalItem {
  district: string;
  slug: string;
  nameEn: string;
  nameTe?: string;
}

export interface DistrictItem {
  slug: string;
  code: string;
  nameEn: string;
  nameTe: string;
}

export const ALL_TELANGANA_DISTRICTS: DistrictItem[] = [
  { slug: 'hyderabad', code: 'HYDB', nameEn: 'Hyderabad', nameTe: 'హైదరాబాద్' },
  { slug: 'warangal', code: 'WRGL', nameEn: 'Warangal', nameTe: 'వరంగల్' },
  { slug: 'hanumakonda', code: 'HNMK', nameEn: 'Hanumakonda', nameTe: 'హనుమకొండ' },
  { slug: 'karimnagar', code: 'KRMN', nameEn: 'Karimnagar', nameTe: 'కరీంనగర్' },
  { slug: 'nalgonda', code: 'NLGD', nameEn: 'Nalgonda', nameTe: 'నల్గొండ' },
  { slug: 'khammam', code: 'KMMM', nameEn: 'Khammam', nameTe: 'ఖమ్మం' },
  { slug: 'nizamabad', code: 'NZMB', nameEn: 'Nizamabad', nameTe: 'నిజామాబాద్' },
  { slug: 'rangareddy', code: 'RNGR', nameEn: 'Rangareddy', nameTe: 'రంగారెడ్డి' },
  { slug: 'medchal-malkajgiri', code: 'MDCL', nameEn: 'Medchal-Malkajgiri', nameTe: 'మేడ్చల్-మల్కాజ్‌గిరి' },
  { slug: 'suryapet', code: 'SRPT', nameEn: 'Suryapet', nameTe: 'సూర్యాపేట' },
  { slug: 'siddipet', code: 'SDPT', nameEn: 'Siddipet', nameTe: 'సిద్దిపేట' },
  { slug: 'mahabubnagar', code: 'MBNR', nameEn: 'Mahabubnagar', nameTe: 'మహబూబ్‌నగర్' },
  { slug: 'adilabad', code: 'ADLB', nameEn: 'Adilabad', nameTe: 'ఆదిలాబాద్' },
  { slug: 'bhadradri-kothagudem', code: 'BDKT', nameEn: 'Bhadradri Kothagudem', nameTe: 'భద్రాద్రి కొత్తగూడెం' },
  { slug: 'jagtial', code: 'JGTL', nameEn: 'Jagtial', nameTe: 'జగిత్యాల' },
  { slug: 'jangaon', code: 'JNGN', nameEn: 'Jangaon', nameTe: 'జనగామ' },
  { slug: 'jayashankar-bhupalpally', code: 'JSBP', nameEn: 'Jayashankar Bhupalpally', nameTe: 'జయశంకర్ భూపాలపల్లి' },
  { slug: 'jogulamba-gadwal', code: 'JLGD', nameEn: 'Jogulamba Gadwal', nameTe: 'జోగులాంబ గద్వాల' },
  { slug: 'kamareddy', code: 'KMRD', nameEn: 'Kamareddy', nameTe: 'కామారెడ్డి' },
  { slug: 'komaram-bheem-asifabad', code: 'KBAS', nameEn: 'Komaram Bheem Asifabad', nameTe: 'కొమరం భీమ్ ఆసిఫాబాద్' },
  { slug: 'mahabubabad', code: 'MBBD', nameEn: 'Mahabubabad', nameTe: 'మహబూబాబాద్' },
  { slug: 'mancherial', code: 'MNCL', nameEn: 'Mancherial', nameTe: 'మంచిర్యాల' },
  { slug: 'medak', code: 'MEDK', nameEn: 'Medak', nameTe: 'మెదక్' },
  { slug: 'mulugu', code: 'MLGU', nameEn: 'Mulugu', nameTe: 'ములుగు' },
  { slug: 'nagarkurnool', code: 'NGKL', nameEn: 'Nagarkurnool', nameTe: 'నాగర్‌కర్నూల్' },
  { slug: 'narayanpet', code: 'NRPT', nameEn: 'Narayanpet', nameTe: 'నారాయణపేట' },
  { slug: 'nirmal', code: 'NRML', nameEn: 'Nirmal', nameTe: 'నిర్మల్' },
  { slug: 'peddapalli', code: 'PDPL', nameEn: 'Peddapalli', nameTe: 'పెద్దపల్లి' },
  { slug: 'rajanna-sircilla', code: 'RJSC', nameEn: 'Rajanna Sircilla', nameTe: 'రాజన్న సిరిసిల్ల' },
  { slug: 'sangareddy', code: 'SNGR', nameEn: 'Sangareddy', nameTe: 'సంగారెడ్డి' },
  { slug: 'vikarabad', code: 'VKBD', nameEn: 'Vikarabad', nameTe: 'వికారాబాద్' },
  { slug: 'wanaparthy', code: 'WNPT', nameEn: 'Wanaparthy', nameTe: 'వనపర్తి' },
  { slug: 'yadadri-bhuvanagiri', code: 'YDBG', nameEn: 'Yadadri Bhuvanagiri', nameTe: 'యాదాద్రి భువనగిరి' },
];

export const TELANGANA_MANDALS_MAP: Record<string, { slug: string; nameEn: string; nameTe: string }[]> = {
  'hyderabad': [
    { slug: 'ameerpet', nameEn: 'Ameerpet', nameTe: 'అమీర్‌పేట్' },
    { slug: 'khairatabad', nameEn: 'Khairatabad', nameTe: 'ఖైరతాబాద్' },
    { slug: 'secunderabad', nameEn: 'Secunderabad', nameTe: 'సికింద్రాబాద్' },
    { slug: 'musheerabad', nameEn: 'Musheerabad', nameTe: 'ముషీరాబాద్' },
    { slug: 'amberpet', nameEn: 'Amberpet', nameTe: 'అంబర్‌పేట్' },
    { slug: 'nampally', nameEn: 'Nampally', nameTe: 'నాంపల్లి' },
    { slug: 'charminar', nameEn: 'Charminar', nameTe: 'చార్మినార్' },
    { slug: 'bahadurpura', nameEn: 'Bahadurpura', nameTe: 'బహదూర్‌పురా' },
    { slug: 'golconda', nameEn: 'Golconda', nameTe: 'గోల్కొండ' },
    { slug: 'jubilee-hills', nameEn: 'Jubilee Hills', nameTe: 'జూబ్లీహిల్స్' },
    { slug: 'marredpally', nameEn: 'Marredpally', nameTe: 'మారేడ్‌పల్లి' },
    { slug: 'asifnagar', nameEn: 'Asifnagar', nameTe: 'ఆసిఫ్‌నగర్' },
  ],
  'warangal': [
    { slug: 'warangal', nameEn: 'Warangal', nameTe: 'వరంగల్' },
    { slug: 'khila-warangal', nameEn: 'Khila Warangal', nameTe: 'ఖిలా వరంగల్' },
    { slug: 'wardhannapet', nameEn: 'Wardhannapet', nameTe: 'వర్ధన్నపేట' },
    { slug: 'geesugonda', nameEn: 'Geesugonda', nameTe: 'గీసుగొండ' },
    { slug: 'atmakur', nameEn: 'Atmakur', nameTe: 'ఆత్మకూర్' },
    { slug: 'parvathagiri', nameEn: 'Parvathagiri', nameTe: 'పర్వతగిరి' },
    { slug: 'rayaparthy', nameEn: 'Rayaparthy', nameTe: 'రాయపర్తి' },
    { slug: 'sangem', nameEn: 'Sangem', nameTe: 'సంగెం' },
    { slug: 'narsampet', nameEn: 'Narsampet', nameTe: 'నర్సంపేట' },
    { slug: 'chennaraopet', nameEn: 'Chennaraopet', nameTe: 'చెన్నారావుపేట' },
  ],
  'hanumakonda': [
    { slug: 'hanamkonda', nameEn: 'Hanamkonda', nameTe: 'హనుమకొండ' },
    { slug: 'kazipet', nameEn: 'Kazipet', nameTe: 'కాజీపేట' },
    { slug: 'hasanparthy', nameEn: 'Hasanparthy', nameTe: 'హసన్‌పర్తి' },
    { slug: 'kamalapur', nameEn: 'Kamalapur', nameTe: 'కమలాపూర్' },
    { slug: 'elkathurthy', nameEn: 'Elkathurthy', nameTe: 'ఎల్కతుర్తి' },
    { slug: 'bheemadevarpalle', nameEn: 'Bheemadevarpalle', nameTe: 'భీమదేవరపల్లి' },
    { slug: 'dharmasagar', nameEn: 'Dharmasagar', nameTe: 'ధర్మసాగర్' },
    { slug: 'velair', nameEn: 'Velair', nameTe: 'వేలేరు' },
  ],
  'karimnagar': [
    { slug: 'karimnagar-urban', nameEn: 'Karimnagar Urban', nameTe: 'కరీంనగర్ అర్బన్' },
    { slug: 'karimnagar-rural', nameEn: 'Karimnagar Rural', nameTe: 'కరీంనగర్ రూరల్' },
    { slug: 'manakondur', nameEn: 'Manakondur', nameTe: 'మానకొండూరు' },
    { slug: 'thimmapur', nameEn: 'Thimmapur', nameTe: 'తిమ్మాపూర్' },
    { slug: 'choppadandi', nameEn: 'Choppadandi', nameTe: 'చొప్పదండి' },
    { slug: 'gangadhara', nameEn: 'Gangadhara', nameTe: 'గంగాధర' },
    { slug: 'ramadugu', nameEn: 'Ramadugu', nameTe: 'రామడుగు' },
    { slug: 'huzurabad', nameEn: 'Huzurabad', nameTe: 'హుజూరాబాద్' },
    { slug: 'jammikunta', nameEn: 'Jammikunta', nameTe: 'జమ్మికుంట' },
    { slug: 'veenersavada', nameEn: 'Veenavanka', nameTe: 'వీణవంక' },
    { slug: 'shankarapatnam', nameEn: 'Shankarapatnam', nameTe: 'శంకరపట్నం' },
  ],
  'nalgonda': [
    { slug: 'nalgonda', nameEn: 'Nalgonda', nameTe: 'నల్గొండ' },
    { slug: 'miryalaguda', nameEn: 'Miryalaguda', nameTe: 'మిర్యాలగూడ' },
    { slug: 'devarakonda', nameEn: 'Devarakonda', nameTe: 'దేవరకొండ' },
    { slug: 'nakrekal', nameEn: 'Nakrekal', nameTe: 'నకిరేకల్' },
    { slug: 'kangal', nameEn: 'Kangal', nameTe: 'కంగల్' },
    { slug: 'tipparthy', nameEn: 'Tipparthy', nameTe: 'తిప్పర్తి' },
    { slug: 'narketpally', nameEn: 'Narketpally', nameTe: 'నార్కట్‌పల్లి' },
    { slug: 'munugode', nameEn: 'Munugode', nameTe: 'మునుగోడు' },
    { slug: 'chandur', nameEn: 'Chandur', nameTe: 'చండూరు' },
    { slug: 'chityal', nameEn: 'Chityal', nameTe: 'చిట్యాల' },
    { slug: 'damaracherla', nameEn: 'Damaracherla', nameTe: 'దామరచర్ల' },
  ],
  'suryapet': [
    { slug: 'suryapet', nameEn: 'Suryapet', nameTe: 'సూర్యాపేట' },
    { slug: 'kodad', nameEn: 'Kodad', nameTe: 'కోదాడ' },
    { slug: 'huzurnagar', nameEn: 'Huzurnagar', nameTe: 'హుజూర్‌నగర్' },
    { slug: 'thungathurthy', nameEn: 'Thungathurthy', nameTe: 'తుంగతుర్తి' },
    { slug: 'chivvemla', nameEn: 'Chivvemla', nameTe: 'చివ్వెంల' },
    { slug: 'mothey', nameEn: 'Mothey', nameTe: 'మోతే' },
    { slug: 'maddirala', nameEn: 'Maddirala', nameTe: 'మద్దిరాల' },
    { slug: 'neredcherla', nameEn: 'Neredcherla', nameTe: 'నేరేడుచర్ల' },
    { slug: 'mellachervu', nameEn: 'Mellachervu', nameTe: 'మేళ్లచెరువు' },
    { slug: 'munagala', nameEn: 'Munagala', nameTe: 'మునగాల' },
    { slug: 'nadigudem', nameEn: 'Nadigudem', nameTe: 'నడిగూడెం' },
  ],
  'khammam': [
    { slug: 'khammam-urban', nameEn: 'Khammam Urban', nameTe: 'ఖమ్మం అర్బన్' },
    { slug: 'khammam-rural', nameEn: 'Khammam Rural', nameTe: 'ఖమ్మం రూరల్' },
    { slug: 'madhira', nameEn: 'Madhira', nameTe: 'మధిర' },
    { slug: 'sathupally', nameEn: 'Sathupally', nameTe: 'సత్తుపల్లి' },
    { slug: 'wyra', nameEn: 'Wyra', nameTe: 'వైరా' },
    { slug: 'kallur', nameEn: 'Kallur', nameTe: 'కల్లూరు' },
    { slug: 'chinthakani', nameEn: 'Chinthakani', nameTe: 'చింతకాని' },
    { slug: 'bonakal', nameEn: 'Bonakal', nameTe: 'బోనకల్' },
    { slug: 'tirumalayapalem', nameEn: 'Tirumalayapalem', nameTe: 'తిరుమలాయపాలెం' },
    { slug: 'kamepally', nameEn: 'Kamepally', nameTe: 'కామేపల్లి' },
  ],
  'nizamabad': [
    { slug: 'nizamabad-north', nameEn: 'Nizamabad North', nameTe: 'నిజామాబాద్ నార్త్' },
    { slug: 'nizamabad-south', nameEn: 'Nizamabad South', nameTe: 'నిజామాబాద్ సౌత్' },
    { slug: 'nizamabad-rural', nameEn: 'Nizamabad Rural', nameTe: 'నిజామాబాద్ రూరల్' },
    { slug: 'bodhan', nameEn: 'Bodhan', nameTe: 'బోధన్' },
    { slug: 'armur', nameEn: 'Armoor', nameTe: 'ఆర్మూర్' },
    { slug: 'balkonda', nameEn: 'Balkonda', nameTe: 'బాల్కొండ' },
    { slug: 'dichpally', nameEn: 'Dichpally', nameTe: 'డిచ్‌పల్లి' },
    { slug: 'jakranpally', nameEn: 'Jakranpally', nameTe: 'జాక్రాన్‌పల్లి' },
    { slug: 'makloor', nameEn: 'Makloor', nameTe: 'మాక్లూర్' },
    { slug: 'kammarpally', nameEn: 'Kammarpally', nameTe: 'కమ్మర్‌పల్లి' },
  ],
  'rangareddy': [
    { slug: 'shamshabad', nameEn: 'Shamshabad', nameTe: 'శంషాబాద్' },
    { slug: 'rajendranagar', nameEn: 'Rajendranagar', nameTe: 'రాజేంద్రనగర్' },
    { slug: 'serilingampally', nameEn: 'Serilingampally', nameTe: 'శేరిలింగంపల్లి' },
    { slug: 'ibrahimpatnam', nameEn: 'Ibrahimpatnam', nameTe: 'ఇబ్రహీంపట్నం' },
    { slug: 'hayathnagar', nameEn: 'Hayathnagar', nameTe: 'హయత్‌నగర్' },
    { slug: 'maheshwaram', nameEn: 'Maheshwaram', nameTe: 'మహేశ్వరం' },
    { slug: 'saroornagar', nameEn: 'Saroornagar', nameTe: 'సరూర్‌నగర్' },
    { slug: 'shadnagar', nameEn: 'Shadnagar (Farooqnagar)', nameTe: 'షాద్‌నగర్ (ఫరూఖ్‌నగర్)' },
    { slug: 'chevella', nameEn: 'Chevella', nameTe: 'చేవెళ్ల' },
    { slug: 'kothur', nameEn: 'Kothur', nameTe: 'కొత్తూరు' },
  ],
  'medchal-malkajgiri': [
    { slug: 'medchal', nameEn: 'Medchal', nameTe: 'మేడ్చల్' },
    { slug: 'malkajgiri', nameEn: 'Malkajgiri', nameTe: 'మల్కాజ్‌గిరి' },
    { slug: 'quthbullapur', nameEn: 'Quthbullapur', nameTe: 'కుత్బుల్లాపూర్' },
    { slug: 'alwal', nameEn: 'Alwal', nameTe: 'అల్వాల్' },
    { slug: 'kukatpally', nameEn: 'Kukatpally', nameTe: 'కూకట్‌పల్లి' },
    { slug: 'kapra', nameEn: 'Kapra', nameTe: 'కాప్రా' },
    { slug: 'uppal', nameEn: 'Uppal', nameTe: 'ఉప్పల్' },
    { slug: 'ghatkesar', nameEn: 'Ghatkesar', nameTe: 'ఘట్‌కేసర్' },
    { slug: 'keesara', nameEn: 'Keesara', nameTe: 'కీసర' },
    { slug: 'dundigal', nameEn: 'Dundigal Gandimaisamma', nameTe: 'దుండిగల్ గండిమైసమ్మ' },
  ],
  'siddipet': [
    { slug: 'siddipet-urban', nameEn: 'Siddipet Urban', nameTe: 'సిద్దిపేట అర్బన్' },
    { slug: 'siddipet-rural', nameEn: 'Siddipet Rural', nameTe: 'సిద్దిపేట రూరల్' },
    { slug: 'gajwel', nameEn: 'Gajwel', nameTe: 'గజ్వేల్' },
    { slug: 'dubbak', nameEn: 'Dubbak', nameTe: 'దుబ్బాక' },
    { slug: 'husnabad', nameEn: 'Husnabad', nameTe: 'హుస్నాబాద్' },
    { slug: 'cheriyal', nameEn: 'Cheriyal', nameTe: 'చేర్యాల' },
    { slug: 'kondapak', nameEn: 'Kondapak', nameTe: 'కొండపాక' },
    { slug: 'thoguta', nameEn: 'Thoguta', nameTe: 'తొగుట' },
  ],
  'mahabubnagar': [
    { slug: 'mahabubnagar-urban', nameEn: 'Mahabubnagar Urban', nameTe: 'మహబూబ్‌నగర్ అర్బన్' },
    { slug: 'mahabubnagar-rural', nameEn: 'Mahabubnagar Rural', nameTe: 'మహబూబ్‌నగర్ రూరల్' },
    { slug: 'jadcherla', nameEn: 'Jadcherla', nameTe: 'జడ్చర్ల' },
    { slug: 'bhutpur', nameEn: 'Bhutpur', nameTe: 'భూత్పూర్' },
    { slug: 'devarkadra', nameEn: 'Devarkadra', nameTe: 'దేవరకద్ర' },
    { slug: 'nawabpet', nameEn: 'Nawabpet', nameTe: 'నవాబ్‌పేట' },
    { slug: 'koilkonda', nameEn: 'Koilkonda', nameTe: 'కోయిల్కొండ' },
  ],
};

// Fallback helper for remaining districts
export function getMandalsForDistrict(districtSlug: string): { slug: string; nameEn: string; nameTe: string }[] {
  if (TELANGANA_MANDALS_MAP[districtSlug]) {
    return TELANGANA_MANDALS_MAP[districtSlug];
  }
  // Generic mandals if not yet in explicit map
  const clean = districtSlug.replace(/-/g, ' ');
  const cap = clean.charAt(0).toUpperCase() + clean.slice(1);
  return [
    { slug: `${districtSlug}-headquarter`, nameEn: `${cap} Urban / HQ`, nameTe: `${cap} ప్రధాన కేంద్రం` },
    { slug: `${districtSlug}-rural`, nameEn: `${cap} Rural`, nameTe: `${cap} రూరల్` },
    { slug: `${districtSlug}-central`, nameEn: `${cap} Central`, nameTe: `${cap} సెంట్రల్` },
  ];
}
