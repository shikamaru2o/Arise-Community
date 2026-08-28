import React, { createContext, useContext, useEffect, useState } from "react";

const translations = {
  en: {
    brand: "Arise Association",
    nav: { home: "Home", about: "About", location: "Location", contact: "Contact", join: "Join the Team", register: "Register", give: "Give Now", language: "Language" },
    hero: { chip: "Arise Conference 2026", titleBefore: "Your time", titleEmphasis: "has come", description: "This Christmas, Arise Association invites you to a special celebration of hope, faith, and new beginnings. Every season has a purpose, and a new chapter can bring restoration and new possibilities into our lives. Come with your family and friends. Come with expectation.", venueLabel: "Venue", venue: "Don Bosco, Nerul", datesLabel: "Dates", dates: "December 11–13", register: "Register here" },
    join: { eyebrow: "Join us", title: "A night to remember", description: "Watch a quick look at what to expect this December — worship, teaching, and a room full of people believing for a new season together.", videoPlaceholder: "Promo video placeholder" },
    people: { speakersEyebrow: "Voices for the evening", speakersTitle: "Our speakers", artistsEyebrow: "Sound of the evening", artistsTitle: "Worship artists", viewDetails: "View details for {name}", descriptionSoon: "Description coming soon." },
    location: { eyebrow: "How to get there", name: "Don Bosco Nerul", sub: "Nerul, Navi Mumbai", description: "Use the map to easily locate the venue and plan your journey to Arise Conference 2026. We look forward to welcoming you.", directions: "Get directions", mapTitle: "Don Bosco Nerul location" },
    about: { eyebrow: "Who we are", title: "40+ years of ministry", description: "For more than 40 years, Arise Association has been a home for worship, prayer, and community across generations. What began as a small gathering has grown into a movement that keeps pointing people toward hope, purpose, and new beginnings — the same spirit we're carrying into Arise Conference 2026.", years: "Years of ministry" },
    footer: {
      description: "A warm and vibrant community offering worship, prayer, biblical teaching, ministries, events, and opportunities to give.",
      menu: "Menu", contact: "Contact", socials: "Socials",
      copyright: "© 2026 Arise Association. All rights reserved.",
      city: "Nerul, Navi Mumbai",
      instagram: "Instagram", youtube: "YouTube",
    },
    volunteer: {
      title: "Volunteer registration",
      subtitle: "Register to join and support the ministry team. Fields marked * are required.",
      firstName: "First name", lastName: "Last name", mobile: "Mobile number", email: "Email address",
      age: "Age group", gender: "Gender", preferNot: "Prefer not to say", church: "Church name",
      pastor: "Pastor's name", churchLocation: "Church location", optional: "(optional)",
      role: "Preferred volunteer role", select: "Select", selectRole: "Select a role",
      age15: "15-21", age21: "21-30", age30: "30 Above", male: "Male", female: "Female",
      roles: { Registration: "Registration", Ushers: "Ushers", Parking: "Parking", Security: "Security", Hospitality: "Hospitality", "Prayers & Counselling": "Prayers & Counselling", Production: "Production", Media: "Media", Stage: "Stage", Medical: "Medical", Logistics: "Logistics", Leadership: "Leadership" },
      submit: "Register to volunteer", submitting: "Submitting...",
      successTitle: "You're registered", successText: "Thanks for signing up to volunteer. We'll be in touch with next steps.",
      another: "Register another volunteer",
      serverError: "Could not reach the server. Check your connection and try again.",
      genericError: "Something went wrong. Please check the form.",
      required: "{field} is required.", invalidEmail: "Enter a valid email address.", invalidMobile: "Enter a valid mobile number.",
      selectAge: "Select an age group.", selectVolunteerRole: "Select a preferred volunteer role.",
    },
    event: {
      eyebrow: "Arise Conference 2026",
      title: "Event attendee registration",
      subtitle: "Register as an event attendee. Volunteer sign-up is a separate form. Fields marked * are required.",
      firstName: "First name", lastName: "Last name", mobile: "Mobile number", email: "Email address",
      area: "Area", city: "City",
      consent: "I confirm that I am registering voluntarily and have not been forced or coerced.",
      submit: "Register for the event", submitting: "Registering...",
      successTitle: "Registration Successful", successText: "Thank you for registering as an event attendee.",
      idLabel: "Your Event Registration ID",
      note: "Please save this ID. You may need it when checking in at the event.",
      another: "Register another person",
      required: "{field} is required.", invalidEmail: "Enter a valid email address.", invalidMobile: "Enter a valid mobile number.",
      consentError: "You must confirm that registration is voluntary.",
      serverError: "Could not reach the server. Check your connection and try again.",
      genericError: "Something went wrong. Please check the form.",
    },
    give: {
      eyebrow: "Arise Association",
      title: "Give Now",
      intro: "Every contribution helps support the work of Arise Association and the communities we serve.",
      methods: "Donation methods",
      online: "Online Donation", onlineText: "Choose an amount and continue securely through Razorpay.",
      custom: "Custom amount (INR)", payment: "Continue to payment", opening: "Opening checkout...",
      notConfigured: "Online donations are not configured yet.",
      amountError: "Enter an amount between INR 100 and INR 100,000.",
      checkoutError: "Payment checkout could not load. Please try again.",
      startError: "Could not start donation. Please try again.",
      checkoutDescription: "Donation to Arise Association",
      upi: "Donate via UPI", qrPlaceholder: "QR code to be added", qrText: "Scan the QR code using your preferred UPI app.",
      upiDetails: "UPI details to be added", qrAlt: "UPI donation QR code",
      physical: "Donate Physically", physicalText: "Physical donation details will be added soon.",
      physicalPlaceholder: "Bank transfer, cheque, cash, location, and contact details can be added here.",
      success: "Thank you for supporting Arise Association.", verified: "Your payment has been verified.",
      reference: "Payment reference: {id}",
    },
    common: { close: "Close details", toggleMenu: "Toggle menu", notFound: "Page not found", notFoundText: "The page you're looking for doesn't exist or has moved.", backHome: "Back to home" },
  },
  hi: {
    brand: "अराइज़ एसोसिएशन",
    nav: { home: "होम", about: "हमारे बारे में", location: "स्थान", contact: "संपर्क", join: "टीम से जुड़ें", register: "पंजीकरण", give: "दान करें", language: "भाषा" },
    hero: { chip: "अराइज़ कॉन्फ्रेंस 2026", titleBefore: "आपका समय", titleEmphasis: "आ गया है", description: "इस क्रिसमस, अराइज़ एसोसिएशन आपको आशा, विश्वास और नई शुरुआत के विशेष उत्सव में आमंत्रित करता है। हर मौसम का एक उद्देश्य होता है और नया अध्याय हमारे जीवन में नई संभावनाएँ ला सकता है। अपने परिवार और मित्रों के साथ अपेक्षा लेकर आइए।", venueLabel: "स्थान", venue: "डॉन बॉस्को, नेरुल", datesLabel: "तारीखें", dates: "11–13 दिसंबर", register: "पंजीकरण करें" },
    join: { eyebrow: "हमसे जुड़ें", title: "यादगार शाम", description: "इस दिसंबर की झलक देखें — आराधना, शिक्षा और नई शुरुआत में विश्वास रखने वाले लोगों से भरा एक सभागार।", videoPlaceholder: "प्रोमो वीडियो जल्द जोड़ा जाएगा" },
    people: { speakersEyebrow: "शाम की आवाज़ें", speakersTitle: "हमारे वक्ता", artistsEyebrow: "शाम का संगीत", artistsTitle: "आराधना कलाकार", viewDetails: "{name} का विवरण देखें", descriptionSoon: "विवरण जल्द आएगा।" },
    location: { eyebrow: "वहाँ कैसे पहुँचें", name: "डॉन बॉस्को नेरुल", sub: "नेरुल, नवी मुंबई", description: "स्थान खोजने और अराइज़ कॉन्फ्रेंस 2026 की यात्रा की योजना बनाने के लिए मानचित्र का उपयोग करें। हम आपका स्वागत करने के लिए उत्सुक हैं।", directions: "दिशा-निर्देश", mapTitle: "डॉन बॉस्को नेरुल का स्थान" },
    about: { eyebrow: "हम कौन हैं", title: "सेवा के 40+ वर्ष", description: "40 से अधिक वर्षों से अराइज़ एसोसिएशन पीढ़ियों के बीच आराधना, प्रार्थना और समुदाय का घर रहा है। एक छोटी सभा से शुरू होकर यह आशा, उद्देश्य और नई शुरुआत की ओर लोगों को ले जाने वाला आंदोलन बना है।", years: "सेवा के वर्ष" },
    footer: {
      description: "आराधना, प्रार्थना, बाइबल शिक्षा, सेवकाइयों, कार्यक्रमों और दान के अवसरों वाला एक गर्मजोशी भरा समुदाय।",
      menu: "मेनू", contact: "संपर्क", socials: "सोशल मीडिया",
      copyright: "© 2026 अराइज़ एसोसिएशन। सर्वाधिकार सुरक्षित।",
      city: "नेरुल, नवी मुंबई",
      instagram: "इंस्टाग्राम", youtube: "यूट्यूब",
    },
    volunteer: {
      title: "स्वयंसेवक पंजीकरण",
      subtitle: "सेवकाई टीम से जुड़ने और सहयोग करने के लिए पंजीकरण करें। * वाले क्षेत्र आवश्यक हैं।",
      firstName: "पहला नाम", lastName: "उपनाम", mobile: "मोबाइल नंबर", email: "ईमेल पता",
      age: "आयु वर्ग", gender: "लिंग", preferNot: "बताना पसंद नहीं", church: "चर्च का नाम",
      pastor: "पादरी का नाम", churchLocation: "चर्च का स्थान", optional: "(वैकल्पिक)",
      role: "पसंदीदा स्वयंसेवक भूमिका", select: "चुनें", selectRole: "भूमिका चुनें",
      age15: "15-21", age21: "21-30", age30: "30 से अधिक", male: "पुरुष", female: "महिला",
      roles: { Registration: "पंजीकरण", Ushers: "स्वागत", Parking: "पार्किंग", Security: "सुरक्षा", Hospitality: "आतिथ्य", "Prayers & Counselling": "प्रार्थना और परामर्श", Production: "प्रोडक्शन", Media: "मीडिया", Stage: "मंच", Medical: "चिकित्सा", Logistics: "लॉजिस्टिक्स", Leadership: "नेतृत्व" },
      submit: "स्वयंसेवक के रूप में पंजीकरण", submitting: "पंजीकरण हो रहा है...",
      successTitle: "आपका पंजीकरण हो गया", successText: "स्वयंसेवक बनने के लिए धन्यवाद। अगले चरणों के लिए हम आपसे संपर्क करेंगे।",
      another: "एक और स्वयंसेवक पंजीकृत करें",
      serverError: "सर्वर से संपर्क नहीं हो सका। अपना कनेक्शन जाँचें और फिर प्रयास करें।",
      genericError: "कुछ गलत हुआ। कृपया फॉर्म जाँचें।",
      required: "{field} आवश्यक है।", invalidEmail: "मान्य ईमेल पता दर्ज करें।", invalidMobile: "मान्य मोबाइल नंबर दर्ज करें।",
      selectAge: "आयु वर्ग चुनें।", selectVolunteerRole: "पसंदीदा स्वयंसेवक भूमिका चुनें।",
    },
    event: {
      eyebrow: "अराइज़ कॉन्फ्रेंस 2026",
      title: "कार्यक्रम प्रतिभागी पंजीकरण",
      subtitle: "कार्यक्रम में भाग लेने वाले के रूप में पंजीकरण करें। स्वयंसेवक पंजीकरण एक अलग फॉर्म है। * वाले क्षेत्र आवश्यक हैं।",
      firstName: "पहला नाम", lastName: "उपनाम", mobile: "मोबाइल नंबर", email: "ईमेल पता",
      area: "क्षेत्र", city: "शहर",
      consent: "मैं पुष्टि करता/करती हूँ कि मेरा पंजीकरण स्वेच्छा से है और मुझे मजबूर या दबाव में नहीं डाला गया है।",
      submit: "कार्यक्रम के लिए पंजीकरण", submitting: "पंजीकरण हो रहा है...",
      successTitle: "पंजीकरण सफल", successText: "कार्यक्रम प्रतिभागी के रूप में पंजीकरण करने के लिए धन्यवाद।",
      idLabel: "आपकी कार्यक्रम पंजीकरण आईडी",
      note: "कृपया इस आईडी को सुरक्षित रखें। कार्यक्रम में प्रवेश के समय इसकी आवश्यकता हो सकती है।",
      another: "किसी और का पंजीकरण करें",
      required: "{field} आवश्यक है।", invalidEmail: "मान्य ईमेल पता दर्ज करें।", invalidMobile: "मान्य मोबाइल नंबर दर्ज करें।",
      consentError: "आपको पुष्टि करनी होगी कि पंजीकरण स्वैच्छिक है।",
      serverError: "सर्वर से संपर्क नहीं हो सका। अपना कनेक्शन जाँचें और फिर प्रयास करें।",
      genericError: "कुछ गलत हुआ। कृपया फॉर्म जाँचें।",
    },
    give: {
      eyebrow: "अराइज़ एसोसिएशन",
      title: "दान करें",
      intro: "हर योगदान अराइज़ एसोसिएशन और हमारे समुदायों की सेवा में सहायता करता है।",
      methods: "दान के तरीके",
      online: "ऑनलाइन दान", onlineText: "राशि चुनें और Razorpay के माध्यम से सुरक्षित रूप से आगे बढ़ें।",
      custom: "कस्टम राशि (INR)", payment: "भुगतान के लिए आगे बढ़ें", opening: "चेकआउट खुल रहा है...",
      notConfigured: "ऑनलाइन दान अभी कॉन्फ़िगर नहीं किया गया है।",
      amountError: "INR 100 और INR 100,000 के बीच राशि दर्ज करें।",
      checkoutError: "भुगतान चेकआउट लोड नहीं हो सका। फिर प्रयास करें।",
      startError: "दान शुरू नहीं हो सका। फिर प्रयास करें।",
      checkoutDescription: "अराइज़ एसोसिएशन को दान",
      upi: "UPI से दान करें", qrPlaceholder: "QR कोड जोड़ा जाना है", qrText: "अपने पसंदीदा UPI ऐप से QR कोड स्कैन करें।",
      upiDetails: "UPI विवरण जोड़े जाने हैं", qrAlt: "UPI दान QR कोड",
      physical: "प्रत्यक्ष दान", physicalText: "प्रत्यक्ष दान का विवरण जल्द जोड़ा जाएगा।",
      physicalPlaceholder: "बैंक ट्रांसफर, चेक, नकद, स्थान और संपर्क विवरण यहाँ जोड़े जा सकते हैं।",
      success: "अराइज़ एसोसिएशन को सहयोग देने के लिए धन्यवाद।", verified: "आपका भुगतान सत्यापित हो गया है।",
      reference: "भुगतान संदर्भ: {id}",
    },
    common: { close: "विवरण बंद करें", toggleMenu: "मेनू खोलें या बंद करें", notFound: "पृष्ठ नहीं मिला", notFoundText: "आप जिस पृष्ठ को खोज रहे हैं वह मौजूद नहीं है या स्थानांतरित हो गया है।", backHome: "होम पर लौटें" },
  },
};

const I18nContext = createContext(null);

function getValue(source, key) {
  return key.split(".").reduce((value, part) => value && value[part], source);
}

export function I18nProvider({ children }) {
  const [language, setLanguageState] = useState(() => {
    try {
      return localStorage.getItem("arise-language") === "hi" ? "hi" : "en";
    } catch {
      return "en";
    }
  });
  const setLanguage = (lang) => setLanguageState(lang === "hi" ? "hi" : "en");

  useEffect(() => {
    const lang = language === "hi" ? "hi" : "en";
    document.documentElement.lang = lang;
    try {
      localStorage.setItem("arise-language", lang);
    } catch {
      /* ignore */
    }
  }, [language]);

  const t = (key, values = {}) => {
    const value = getValue(translations[language], key) || getValue(translations.en, key) || key;
    return Object.entries(values).reduce((text, [name, replacement]) => text.replace(`{${name}}`, replacement), value);
  };

  return <I18nContext.Provider value={{ language, setLanguage, t }}>{children}</I18nContext.Provider>;
}

export function useI18n() {
  return useContext(I18nContext);
}
