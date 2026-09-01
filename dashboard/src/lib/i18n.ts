import type { LanguageCode } from "./types";

// ============================================================================
// Lightweight i18n — section 8. Hindi & Marathi mandatory, English optional.
// Custom dictionary (only 3 languages), keyed by code, easier to debug than a
// full i18n framework. Keys are semantic so both web and future mobile reuse.
// ============================================================================

export type I18nKey =
  | "appName"
  | "tagline"
  | "language"
  | "next"
  | "back"
  | "home"
  | "newLot"
  | "priceBoard"
  | "myEarnings"
  | "safety"
  | "selectCategory"
  | "weightKg"
  | "estimatedValue"
  | "takePhoto"
  | "addLot"
  | "addAnother"
  | "availableNearby"
  | "distance"
  | "rateForKg"
  | "chooseRecycler"
  | "handoverConfirm"
  | "referenceNumber"
  | "handoverDone"
  | "cashOnHandover"
  | "paymentPending"
  | "paymentPaid"
  | "status"
  | "created"
  | "matched"
  | "inTransit"
  | "handedOver"
  | "confirmed"
  | "completed"
  | "liveData"
  | "cachedData"
  | "pendingSync"
  | "audioPlay"
  | "audioStop"
  | "safetyTitle"
  | "safetyIntro"
  | "noBurning"
  | "noAcid"
  | "batteryCare"
  | "crtCare"
  | "previousEarnings"
  | "earningsOverview"
  | "noTransactions"
  | "register"
  | "enterName"
  | "enterArea"
  | "yourArea"
  | "start"
  | "languagePrompt"
  | "todayRate"
  | "trend"
  | "rising"
  | "falling"
  | "stable"
  | "recyclerDashboard"
  | "login"
  | "email"
  | "password"
  | "incomingLots"
  | "accept"
  | "reject"
  | "confirmHandover"
  | "lotDetail"
  | "anomalyReview"
  | "normal"
  | "flagged"
  | "backToInbox"
  | "openInbox"
  | "collectorView"
  | "recyclerView"
  | "photos"
  | "condition"
  | "source"
  | "quote"
  | "finalPrice"
  | "finalPriceHint"
  | "markComplete"
  | "viewPrices"
  | "handoverLocation"
  | "collectionLocation"
  | "lotCreated"
  | "lotCreatedMsg"
  | "lblOpen"
  | "kg"
  | "mean"
  | "zScore"
  | "rejectNote"
  | "demoLoginNote"
  | "loginRequired"
  | "doThisInstead"
  | "glove"
  | "separateBattery"
  | "keepSealed"
  | "pickup"
  | "noPickup"
  | "heavilyDegraded"
  | "condIntact"
  | "condDamaged"
  | "photo"
  | "gallery";

const dictionary: Record<LanguageCode, Record<I18nKey, string>> = {
  hi: {
    appName: "कबाड़ीवाला कनेक्ट",
    tagline: "जुड़ें, सही कीमत पाएं, सुरक्षित बेचें",
    language: "भाषा",
    next: "आगे",
    back: "पीछे",
    home: "होम",
    newLot: "नया लॉट",
    priceBoard: "कीमत बोर्ड",
    myEarnings: "मेरी कमाई",
    safety: "सुरक्षा",
    selectCategory: "सामग्री चुनें",
    weightKg: "वज़न (किलो में)",
    estimatedValue: "अनुमानित कीमत",
    takePhoto: "फोटो लें",
    addLot: "लॉट बनाएं",
    addAnother: "और जोड़ें",
    availableNearby: "आस-पास के रीसायकलर",
    distance: "दूरी",
    rateForKg: "प्रति किलो दर",
    chooseRecycler: "इसे चुनें",
    handoverConfirm: "हैंडओवर",
    referenceNumber: "संदर्भ संख्या",
    handoverDone: "हैंडओवर पूरा हुआ",
    cashOnHandover: "नकद भुगतान",
    paymentPending: "भुगतान बकाया",
    paymentPaid: "भुगतान मिला",
    status: "स्थिति",
    created: "बनाया गया",
    matched: "मिलान किया",
    inTransit: "पहुंच रहा है",
    handedOver: "सौंपा गया",
    confirmed: "पुष्टि हुई",
    completed: "पूर्ण",
    liveData: "लाइव डेटा",
    cachedData: "सहेजा डेटा",
    pendingSync: "सिंक बाकी",
    audioPlay: "सुनें",
    audioStop: "रोकें",
    safetyTitle: "सुरक्षा गाइड",
    safetyIntro: "ये काम कभी न करें — खतरनाक हैं और मुनाफ़ा घटाते हैं",
    noBurning: "तार जलाने से बचें",
    noAcid: "एसिड का उपयोग न करें",
    batteryCare: "बैटरी सुरक्षा",
    crtCare: "CRT सावधानी",
    previousEarnings: "पिछली कमाई",
    earningsOverview: "कमाई का विवरण",
    noTransactions: "अभी कोई लेन-देन नहीं",
    register: "पंजीकरण",
    enterName: "अपना नाम (वैकल्पिक)",
    enterArea: "अपने इलाके का नाम",
    yourArea: "आपका इलाका",
    start: "शुरू करें",
    languagePrompt: "अपनी भाषा चुनें",
    todayRate: "आज की दर",
    trend: "रुझान",
    rising: "बढ़ रहा",
    falling: "घट रहा",
    stable: "स्थिर",
    recyclerDashboard: "रीसायकलर डैशबोर्ड",
    login: "लॉगिन",
    email: "ईमेल",
    password: "पासवर्ड",
    incomingLots: "आने वाले लॉट",
    accept: "स्वीकार करें",
    reject: "अस्वीकार करें",
    confirmHandover: "हैंडओवर की पुष्टि करें",
    lotDetail: "लॉट विवरण",
    anomalyReview: "समीक्षा आवश्यक",
    normal: "सामान्य",
    flagged: "चिह्नित",
    backToInbox: "इनबॉक्स पर लौटें",
    openInbox: "इनबॉक्स खोलें",
    collectorView: "कलेक्टर व्यू",
    recyclerView: "रीसायकलर व्यू",
    photos: "फोटो",
    condition: "स्थिति",
    source: "स्रोत",
    quote: "अनुमान",
    finalPrice: "अंतिम कीमत",
    finalPriceHint: "हैंडओवर पर तय अंतिम कीमत",
    markComplete: "पूर्ण करें",
    viewPrices: "कीमत देखें",
    handoverLocation: "हैंडओवर स्थान",
    collectionLocation: "कलेक्शन स्थान",
    lotCreated: "लॉट बन गया",
    lotCreatedMsg: "आपका लॉट रीसायकलर को भेज दिया गया है",
    lblOpen: "खुला",
    kg: "किग्रा",
    mean: "औसत",
    zScore: "z",
    rejectNote: "लॉट अस्वीकृत (डेमो — कलेक्टर को सूचित किया जाएगा)",
    demoLoginNote: "डेमो: कोई भी ईमेल और पासवर्ड काम करता है",
    loginRequired: "ईमेल और पासवर्ड डालें",
    doThisInstead: "इसके बजाय ये करें ✓",
    glove: "दस्ताने पहनें",
    separateBattery: "बैटरी अलग करें",
    keepSealed: "बंद रखें",
    pickup: "पिकअप ✓",
    noPickup: "कोई पिकअप नहीं",
    heavilyDegraded: "बहुत खराब",
    condIntact: "ठीक-ठाक",
    condDamaged: "खराब",
    photo: "फोटो",
    gallery: "गैलरी",
  },
  mr: {
    appName: "कबाडीवाला कनेक्ट",
    tagline: "जोडा, योग्य किंमत मिळवा, सुरक्षित विका",
    language: "भाषा",
    next: "पुढे",
    back: "मागे",
    home: "मुखपृष्ठ",
    newLot: "नवीन लॉट",
    priceBoard: "किंमत बोर्ड",
    myEarnings: "माझी कमाई",
    safety: "सुरक्षा",
    selectCategory: "सामग्री निवडा",
    weightKg: "वजन (किलो)",
    estimatedValue: "अंदाजित किंमत",
    takePhoto: "फोटो घ्या",
    addLot: "लॉट तयार करा",
    addAnother: "आणखी जोडा",
    availableNearby: "जवळचे रीसायकलर",
    distance: "अंतर",
    rateForKg: "दर प्रति किलो",
    chooseRecycler: "हे निवडा",
    handoverConfirm: "हँडओव्हर",
    referenceNumber: "संदर्भ क्रमांक",
    handoverDone: "हँडओव्हर पूर्ण",
    cashOnHandover: "रोख पैसे",
    paymentPending: "पैसे बाकी",
    paymentPaid: "पैसे मिळाले",
    status: "स्थिती",
    created: "तयार",
    matched: "जुळले",
    inTransit: "वाटेवर",
    handedOver: "सोपवले",
    confirmed: "पुष्टी",
    completed: "पूर्ण",
    liveData: "लाइव्ह डेटा",
    cachedData: "साठवलेला डेटा",
    pendingSync: "सिंक बाकी",
    audioPlay: "ऐका",
    audioStop: "थांबा",
    safetyTitle: "सुरक्षा मार्गदर्शक",
    safetyIntro: "ही कामे कधीही करू नका — धोकादायक आहेत",
    noBurning: "तार जाळणे टाळा",
    noAcid: "आम्ल वापरू नका",
    batteryCare: "बॅटरी काळजी",
    crtCare: "CRT काळजी",
    previousEarnings: "मागील कमाई",
    earningsOverview: "कमाईचा तपशील",
    noTransactions: "अद्याप व्यवहार नाही",
    register: "नोंदणी",
    enterName: "तुमचे नाव (ऐच्छिक)",
    enterArea: "तुमच्या भागाचे नाव",
    yourArea: "तुमचा भाग",
    start: "सुरू करा",
    languagePrompt: "तुमची भाषा निवडा",
    todayRate: "आजचा दर",
    trend: "कल",
    rising: "वाढत",
    falling: "घटत",
    stable: "स्थिर",
    recyclerDashboard: "रीसायकलर डॅशबोर्ड",
    login: "लॉगिन",
    email: "ईमेल",
    password: "पासवर्ड",
    incomingLots: "येणारे लॉट",
    accept: "स्वीकारा",
    reject: "नाकारा",
    confirmHandover: "हँडओव्हरची पुष्टी करा",
    lotDetail: "लॉट तपशील",
    anomalyReview: "पुनरावलोकन आवश्यक",
    normal: "सामान्य",
    flagged: "चिन्हांकित",
    backToInbox: "इनबॉक्सकडे परत",
    openInbox: "इनबॉक्स उघडा",
    collectorView: "कलेक्टर दृश्य",
    recyclerView: "रीसायकलर दृश्य",
    photos: "फोटो",
    condition: "स्थिती",
    source: "स्रोत",
    quote: "अंदाज",
    finalPrice: "अंतिम किंमत",
    finalPriceHint: "हँडओव्हरवर ठरलेली अंतिम किंमत",
    markComplete: "पूर्ण करा",
    viewPrices: "किंमत पहा",
    handoverLocation: "हँडओव्हर ठिकाण",
    collectionLocation: "कलेक्शन ठिकाण",
    lotCreated: "लॉट तयार",
    lotCreatedMsg: "तुमचा लॉट रीसायकलरला पाठवला",
    lblOpen: "खुले",
    kg: "किग्रॅ",
    mean: "सरासरी",
    zScore: "z",
    rejectNote: "लॉट नाकारला (डेमो — कलेक्टरला कळवले जाईल)",
    demoLoginNote: "डेमो: कोणताही ईमेल आणि पासवर्ड चालतो",
    loginRequired: "ईमेल आणि पासवर्ड टाका",
    doThisInstead: "याऐवजी हे करा ✓",
    glove: "हातमोजे घाला",
    separateBattery: "बॅटरी वेगळी करा",
    keepSealed: "बंद ठेवा",
    pickup: "पिकअप ✓",
    noPickup: "पिकअप नाही",
    heavilyDegraded: "खूप खराब",
    condIntact: "चांगल्या स्थितीत",
    condDamaged: "खराब",
    photo: "फोटो",
    gallery: "गॅलरी",
  },
  en: {
    appName: "Kabadiwala Connect",
    tagline: "Connect, get fair prices, sell safely",
    language: "Language",
    next: "Next",
    back: "Back",
    home: "Home",
    newLot: "New Lot",
    priceBoard: "Price Board",
    myEarnings: "My Earnings",
    safety: "Safety",
    selectCategory: "Select Material",
    weightKg: "Weight (kg)",
    estimatedValue: "Estimated Value",
    takePhoto: "Take Photo",
    addLot: "Create Lot",
    addAnother: "Add Another",
    availableNearby: "Nearby Recyclers",
    distance: "Distance",
    rateForKg: "Rate per kg",
    chooseRecycler: "Choose",
    handoverConfirm: "Handover",
    referenceNumber: "Reference",
    handoverDone: "Handover Complete",
    cashOnHandover: "Cash Payment",
    paymentPending: "Payment Pending",
    paymentPaid: "Paid",
    status: "Status",
    created: "Created",
    matched: "Matched",
    inTransit: "In Transit",
    handedOver: "Handed Over",
    confirmed: "Confirmed",
    completed: "Completed",
    liveData: "Live Data",
    cachedData: "Cached Data",
    pendingSync: "Pending Sync",
    audioPlay: "Listen",
    audioStop: "Stop",
    safetyTitle: "Safety Guide",
    safetyIntro: "Never do these — they are dangerous and reduce your profit",
    noBurning: "Avoid burning wires",
    noAcid: "Never use acid",
    batteryCare: "Battery Safety",
    crtCare: "CRT Caution",
    previousEarnings: "Previous Earnings",
    earningsOverview: "Earnings Overview",
    noTransactions: "No transactions yet",
    register: "Register",
    enterName: "Your name (optional)",
    enterArea: "Your area name",
    yourArea: "Your Area",
    start: "Start",
    languagePrompt: "Choose your language",
    todayRate: "Today's Rate",
    trend: "Trend",
    rising: "Rising",
    falling: "Falling",
    stable: "Stable",
    recyclerDashboard: "Recycler Dashboard",
    login: "Login",
    email: "Email",
    password: "Password",
    incomingLots: "Incoming Lots",
    accept: "Accept",
    reject: "Reject",
    confirmHandover: "Confirm Handover",
    lotDetail: "Lot Detail",
    anomalyReview: "Review Needed",
    normal: "Normal",
    flagged: "Flagged",
    backToInbox: "Back to Inbox",
    openInbox: "Open Inbox",
    collectorView: "Collector View",
    recyclerView: "Recycler View",
    photos: "Photos",
    condition: "Condition",
    source: "Source",
    quote: "Quote",
    finalPrice: "Final Price",
    finalPriceHint: "Final price agreed at handover",
    markComplete: "Mark Complete",
    viewPrices: "View Prices",
    handoverLocation: "Handover Location",
    collectionLocation: "Collection Location",
    lotCreated: "Lot Created",
    lotCreatedMsg: "Your lot has been sent to the recycler",
    lblOpen: "open",
    kg: "kg",
    mean: "mean",
    zScore: "z",
    rejectNote: "Lot rejected (demo — will notify collector)",
    demoLoginNote: "Demo: any email + password works",
    loginRequired: "Enter email and password",
    doThisInstead: "Do this instead ✓",
    glove: "Wear gloves",
    separateBattery: "Separate batteries",
    keepSealed: "Keep sealed",
    pickup: "Pickup ✓",
    noPickup: "No pickup",
    heavilyDegraded: "Heavily degraded",
    condIntact: "Intact",
    condDamaged: "Damaged",
    photo: "Photo",
    gallery: "Gallery",
  },
};

export function translate(lang: LanguageCode, key: I18nKey): string {
  return dictionary[lang][key] ?? dictionary.en[key] ?? key;
}
