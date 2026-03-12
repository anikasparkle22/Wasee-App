import { useState, useEffect, useRef } from "react";

// ─── Backend API integration ──────────────────────────────────────────────────
const API_BASE = (typeof import.meta !== "undefined" && import.meta.env?.VITE_API_URL) || "http://localhost:3000";

async function apiFetch(path, options = {}) {
  try {
    const res = await fetch(`${API_BASE}${path}`, {
      headers: { "Content-Type": "application/json", ...(options.headers || {}) },
      ...options,
      body: options.body ? JSON.stringify(options.body) : undefined,
    });
    const data = await res.json();
    return { ok: res.ok, status: res.status, data };
  } catch {
    return { ok: false, status: 0, data: null };
  }
}

const C = {
  bg:"#F2F0EB", surface:"#FFFFFF", surface2:"#EDEAE3",
  ink:"#1C1C1A", ink2:"#6B6860", ink3:"#ABABAB", border:"#E0DDD6",
  olive:"#8B7D5E", oliveDark:"#6B5F45", oliveBg:"rgba(139,125,94,0.10)",
  oliveBorder:"rgba(139,125,94,0.25)",
};

const TRANSLATIONS = {
  ar: {
    goodMorning:"صباح الخير", name:"زائر",
    yourLocation:"موقعك في", gps:"GPS",
    dropoffLabel:"الوجهة", dropoffPlaceholder:"وين بدك تروح؟",
    findRide:"دور على رحلة", enterDest:"ادخل الوجهة",
    savedPlaces:"الأماكن المحفوظة", popularInSyria:"مشهور في سوريا",
    expiresOn:"ينتهي", chooseCity:"اختار المدينة",
    scheduleTitle:"حجز رحلة مسبق", confirm:"تأكيد",
    navRide:"رحلة", navActivity:"نشاط", navWallet:"محفظة", navAccount:"حساب",
    activityTitle:"النشاط", recents:"الاخيرة", upcoming:"القادمة",
    done:"تمت", rebook:"احجز تاني", receipt:"الفاتورة",
    noUpcoming:"ما في رحلات قادمة",
    walletTitle:"المحفظة", rideCredits:"رصيد الرحلات", availBal:"الرصيد المتاح",
    
    promos:"العروض والخصومات", thisMonth:"هالشهر",
    totalSpent:"المصاريف", ridesTaken:"عدد الرحلات", avgFare:"متوسط الرحلة", co2:"وفّرت CO2",
    accountTitle:"الحساب", totalRides:"عدد الرحلات", since:"من سنة", cities:"مدن",
    memberPass:"Wasee Pass", goldMember:"عضو ذهبي", memberPerks:"خصم ٥٪ · أولوية في التوصيل",
    ridesToPlatinum:"رحلة للبلاتينيوم",
    prefSection:"التفضيلات", safetySection:"السلامة", supportSection:"الدعم",
    notifications:"الاشعارات", language:"اللغة", accessibility:"إمكانية الوصول",
    emergency:"جهات الطوارئ", shareTrip:"شارك رحلتي", privacy:"الخصوصية",
    helpCenter:"مركز المساعدة", reportIssue:"بلّغ عن مشكلة", rateWasee:"قيّم واصي",
    signOut:"تسجيل الخروج",
    chooseRide:"اختار نوع الرحلة", surgeLabel:"ضغط",
    paymentLabel:"طريقة الدفع", cash:"كاش", addPromo:"🏷️ حط كود الخصم",
    promoApplied:"✅ كود", promoApplied2:"اتفعّل", promoPlaceholder:"WASEE20 او SYRIA5",
    applyPromo:"تفعيل", confirmRideBtn:"اكد رحلة",
    selectRideType:"اختار نوع الرحلة",
    findingDriver:"عم نلاقيلك سائق", searchingIn:"بنبحث بالمنطقة في",
    arrived:"وصلت!", greatRide:"رحلة حلوة مع",
    totalFare:"المبلغ الكلي", chargedTo:"دُفع نقداً",
    rateDriver:"قيّم السائق", doneBtnLabel:"تمام",
    approaching:"السائق قادم", enRoute:"بالطريق", almostThere:"تقريبا وصل",
    minutes:"دقائق", call:"اتصل", chat:"رسالة", safety:"سلامة", share:"شارك",
    cancelRide:"الغاء الرحلة",
    settingsTitle:"الإعدادات", languageSettings:"اللغة",
    arabicOption:"العربية", englishOption:"الإنجليزية",
    driveWithWasee:"سوّق مع واصي", becomeDriver:"انضم كسائق",
    signIn:"تسجيل الدخول", createAccount:"إنشاء حساب",
    enterPhone:"أدخل رقم هاتفك", sendCode:"أرسل الرمز",
    enterOtp:"أدخل رمز التحقق", verifyCode:"تحقق",
    otpSent:"تم إرسال الرمز على", welcomeBack:"أهلاً وسهلاً",
    otpHint:"رمز تجريبي: 1234",
    rideRequest:"طلب رحلة جديد!", acceptRide:"قبول", declineRide:"رفض",
    navigateRider:"توجّه للراكب", startTrip:"ابدأ الرحلة", endTrip:"انهِ الرحلة",
    ratePassenger:"قيّم الراكب", subscribeDriver:"اشترك كسائق",
    subFirst:"أول شهر بـ",  subAfter:"ثم",  subMonth:"/شهر",
    subPerks:"وصول كامل لطلبات الرحلات · دعم أولوية · لوحة أرباح",
    subscribing:"جارٍ التسجيل...", subscribed:"✓ مشترك",
    tripDistance:"المسافة", tripEarned:"ربحت",
    cashNote:"الدفع نقداً للسائق",
  },
  en: {
    goodMorning:"GOOD MORNING", name:"Guest",
    yourLocation:"Your location in", gps:"GPS",
    dropoffLabel:"DROPOFF", dropoffPlaceholder:"Where to?",
    findRide:"Find a Ride", enterDest:"Enter Destination",
    savedPlaces:"SAVED PLACES", popularInSyria:"POPULAR IN SYRIA",
    expiresOn:"Exp", chooseCity:"Choose City",
    scheduleTitle:"Schedule a Ride", confirm:"Confirm",
    navRide:"RIDE", navActivity:"ACTIVITY", navWallet:"WALLET", navAccount:"ACCOUNT",
    activityTitle:"Activity", recents:"Recents", upcoming:"Upcoming",
    done:"Done", rebook:"Rebook", receipt:"Receipt",
    noUpcoming:"No upcoming rides",
    walletTitle:"Wallet", rideCredits:"Ride Credits", availBal:"Available balance",
    
    promos:"Promotions", thisMonth:"This Month",
    totalSpent:"Total Spent", ridesTaken:"Rides Taken", avgFare:"Avg Fare", co2:"CO2 Offset",
    accountTitle:"Account", totalRides:"Total Rides", since:"Since", cities:"Cities",
    memberPass:"Wasee Pass", goldMember:"Gold Member", memberPerks:"5% off · Priority delivery",
    ridesToPlatinum:"rides to Platinum",
    prefSection:"Preferences", safetySection:"Safety", supportSection:"Support",
    notifications:"Notifications", language:"Language", accessibility:"Accessibility",
    emergency:"Emergency Contacts", shareTrip:"Share My Trip", privacy:"Privacy",
    helpCenter:"Help Center", reportIssue:"Report Issue", rateWasee:"Rate Wasee",
    signOut:"Sign Out",
    chooseRide:"Choose a Ride", surgeLabel:"surge",
    paymentLabel:"Payment", cash:"Cash", addPromo:"🏷️ Add promo code",
    promoApplied:"✅", promoApplied2:"applied", promoPlaceholder:"WASEE20 or SYRIA5",
    applyPromo:"Apply", confirmRideBtn:"Confirm",
    selectRideType:"Select a ride type",
    findingDriver:"Finding your driver", searchingIn:"Searching in",
    arrived:"You've Arrived!", greatRide:"Great ride with",
    totalFare:"Total Fare", chargedTo:"Paid in cash",
    rateDriver:"Rate your driver", doneBtnLabel:"Done",
    approaching:"Driver approaching", enRoute:"En route", almostThere:"Almost there",
    minutes:"min", call:"Call", chat:"Chat", safety:"Safety", share:"Share",
    cancelRide:"Cancel Ride",
    settingsTitle:"Settings", languageSettings:"Language",
    arabicOption:"Arabic", englishOption:"English",
    driveWithWasee:"Drive with Wasee", becomeDriver:"Become a Driver",
    signIn:"Sign In", createAccount:"Create Account",
    enterPhone:"Enter your phone number", sendCode:"Send Code",
    enterOtp:"Enter verification code", verifyCode:"Verify",
    otpSent:"Code sent to", welcomeBack:"Welcome back",
    otpHint:"Demo code: 1234",
    rideRequest:"New Ride Request!", acceptRide:"Accept", declineRide:"Decline",
    navigateRider:"Navigate to Rider", startTrip:"Start Trip", endTrip:"End Trip",
    ratePassenger:"Rate Passenger", subscribeDriver:"Subscribe to Drive",
    subFirst:"First month",  subAfter:"then",  subMonth:"/mo",
    subPerks:"Full ride requests · Priority support · Earnings dashboard",
    subscribing:"Subscribing...", subscribed:"✓ Subscribed",
    tripDistance:"Distance", tripEarned:"Earned",
    cashNote:"Cash paid to driver",
  }
};

// ─── SYSTEM: Distance-based pricing ──────────────────────────────────────────
function haversineKm(a, b) {
  const R=6371, dLat=(b.lat-a.lat)*Math.PI/180, dLng=(b.lng-a.lng)*Math.PI/180;
  const s=Math.sin(dLat/2)**2+Math.cos(a.lat*Math.PI/180)*Math.cos(b.lat*Math.PI/180)*Math.sin(dLng/2)**2;
  return R*2*Math.atan2(Math.sqrt(s),Math.sqrt(1-s));
}
function calcFare(fromCoords, toCoords, surge=1.0) {
  const km = haversineKm(fromCoords, toCoords);
  const base=1.50, perKm=0.55, fare=Math.max(2.00, base + perKm*km) * surge;
  return { km: km.toFixed(1), fare: fare.toFixed(2), fareMin:(fare*0.9).toFixed(2), fareMax:(fare*1.1).toFixed(2) };
}
function findNearestDriver(fromCoords, city) {
  const pool = DRIVERS.map((d,i)=>{
    const jitter={lat:fromCoords.lat+(Math.random()-0.5)*0.03,lng:fromCoords.lng+(Math.random()-0.5)*0.03};
    return {...d,dist:haversineKm(fromCoords,jitter).toFixed(1),eta:Math.ceil(2+Math.random()*6)};
  });
  return pool.sort((a,b)=>a.dist-b.dist)[0];
}

// ─── SYSTEM: In-memory trip store ────────────────────────────────────────────
const TRIP_LOG = { trips: [] };
function storeTripData(trip) {
  TRIP_LOG.trips.unshift({ id:"T"+Date.now(), ts:new Date().toISOString(), ...trip });
}

const GEO_BG = "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='80' height='80'%3E%3Cdefs%3E%3Cpattern id='g' x='0' y='0' width='80' height='80' patternUnits='userSpaceOnUse'%3E%3Cg fill='none' stroke='%23C0BAB0' stroke-width='0.75' opacity='0.45'%3E%3Cpolygon points='40,5 57,16 68,32 68,48 57,64 40,75 23,64 12,48 12,32 23,16'/%3E%3Cpolygon points='40,14 54,22 62,35 62,45 54,58 40,66 26,58 18,45 18,35 26,22'/%3E%3Cline x1='40' y1='5' x2='40' y2='14'/%3E%3Cline x1='57' y1='16' x2='54' y2='22'/%3E%3Cline x1='68' y1='40' x2='62' y2='40'/%3E%3Cline x1='57' y1='64' x2='54' y2='58'/%3E%3Cline x1='40' y1='75' x2='40' y2='66'/%3E%3Cline x1='23' y1='64' x2='26' y2='58'/%3E%3Cline x1='12' y1='40' x2='18' y2='40'/%3E%3Cline x1='23' y1='16' x2='26' y2='22'/%3E%3C/g%3E%3C/pattern%3E%3C/defs%3E%3Crect width='80' height='80' fill='url(%23g)'/%3E%3C/svg%3E\") repeat";

const PageBg = ({ children, style={} }) => (
  <div style={{ minHeight:"100vh", background:C.bg, backgroundImage:GEO_BG, fontFamily:"'DM Sans',sans-serif", color:C.ink, ...style }}>
    {children}
  </div>
);
const BlackStripe = () => <div style={{ height:3.5, width:"100%", background:C.ink, flexShrink:0 }} />;
const WaseeBadge = () => (
  <div style={{ display:"inline-flex", alignItems:"center", gap:5, background:C.olive, borderRadius:8, padding:"4px 10px" }}>
    <span style={{ fontSize:12 }}>🇸🇾</span>
    <span style={{ fontSize:11, color:"#fff", fontFamily:"'DM Mono',monospace", fontWeight:700, letterSpacing:"0.05em" }}>WASEE · سوريا</span>
  </div>
);

const SYRIA_CITIES = [
  { name:"Damascus", ar:"دمشق", lat:33.5138, lng:36.2765, icon:"🏛️", zoom:12 },
  { name:"Aleppo",   ar:"حلب",  lat:36.2021, lng:37.1343, icon:"🕌", zoom:12 },
  { name:"Homs",     ar:"حمص",  lat:34.7324, lng:36.7137, icon:"🏙️", zoom:12 },
  { name:"Latakia",  ar:"اللاذقية", lat:35.5317, lng:35.7916, icon:"⚓", zoom:12 },
  { name:"Hama",     ar:"حماة", lat:35.1318, lng:36.7500, icon:"🌊", zoom:12 },
  { name:"Deir ez-Zor", ar:"دير الزور", lat:35.3360, lng:40.1410, icon:"🌴", zoom:11 },
  { name:"Daraa",    ar:"درعا", lat:32.6189, lng:36.1021, icon:"🏘️", zoom:12 },
  { name:"Tartus",   ar:"طرطوس", lat:34.8887, lng:35.8872, icon:"🚢", zoom:12 },
];
const SAVED = [
  { icon:"🏠", label:"Home", ar:"بيت",       sub:"Al-Mazzeh, Damascus",   lat:33.5031, lng:36.2362 },
  { icon:"💼", label:"Work", ar:"مكان العمل", sub:"Old City, Damascus",     lat:33.5102, lng:36.3073 },
  { icon:"🏋️", label:"Gym",  ar:"نادي رياضي", sub:"Abu Rummaneh, Damascus", lat:33.5178, lng:36.2832 },
  { icon:"☕", label:"Cafe", ar:"مقهى",       sub:"Kafr Sousa, Damascus",   lat:33.4936, lng:36.2660 },
];
const POPULAR = [
  { icon:"✈️", label:"Damascus Airport", ar:"مطار دمشق الدولي", sub:"Damascus International", lat:33.4114, lng:36.5156 },
  { icon:"🕌", label:"Umayyad Mosque",   ar:"الجامع الأموي",    sub:"Old Damascus",            lat:33.5115, lng:36.3066 },
  { icon:"🏺", label:"Al-Hamidiyah Souq",ar:"سوق الحميدية",     sub:"Old City",                lat:33.5107, lng:36.3040 },
  { icon:"🏔️", label:"Mount Qasioun",   ar:"جبل قاسيون",       sub:"Northwest Damascus",       lat:33.5440, lng:36.2670 },
];
const RIDES = [
  { id:"swift",   name:"Swift",   ar:"سريع",  descAr:"رحلات يومية بأسعار مناسبة", descEn:"Affordable everyday rides",  etaAr:"٣ دقائق", etaEn:"3 min", capacity:4, icon:"🚗", multiplier:1   },
  { id:"comfort", name:"Comfort", ar:"مريح",  descAr:"سيارات حديثة ومريحة",       descEn:"Newer cars, extra legroom",  etaAr:"٥ دقائق", etaEn:"5 min", capacity:4, icon:"🚙", multiplier:1.4 },
  { id:"xl",      name:"XL",      ar:"XL",    descAr:"سيارات كبيرة لمجموعات",     descEn:"SUVs for groups up to 6",    etaAr:"٧ دقائق", etaEn:"7 min", capacity:6, icon:"🚐", multiplier:1.8 },
  { id:"black",   name:"Black",   ar:"فاخر",  descAr:"سيارات فخمة مميزة",         descEn:"Premium luxury vehicles",    etaAr:"٨ دقائق", etaEn:"8 min", capacity:4, icon:"🖤", multiplier:2.5 },
  { id:"green",   name:"Green",   ar:"أخضر",  descAr:"سيارات كهربائية وهجينة",    descEn:"Electric & hybrid vehicles", etaAr:"٦ دقائق", etaEn:"6 min", capacity:4, icon:"🌿", multiplier:1.2 },
  { id:"moto",    name:"Moto",    ar:"دراجة", descAr:"رحلة سريعة على دراجة",      descEn:"Fast solo rides on a bike",  etaAr:"دقيقتان", etaEn:"2 min", capacity:1, icon:"🏍️", multiplier:0.6 },
];
const DRIVERS = [
  { name:"Ahmad K.",    rating:4.97, trips:2341, car:"Kia Sportage · White",     plate:"DAM 4839", avatar:"AK" },
  { name:"Nour S.",     rating:4.93, trips:1872, car:"Toyota Corolla · Silver",  plate:"DAM 7712", avatar:"NS" },
  { name:"Mazen R.",    rating:4.88, trips:903,  car:"Hyundai Accent · Black",   plate:"DAM 2210", avatar:"MR" },
  { name:"Abdullah B.", rating:4.99, trips:4102, car:"Mercedes C-Class · Black", plate:"DAM 9981", avatar:"AB" },
];
const ACTIVITY = [
  { dateAr:"اليوم",   dateEn:"TODAY",  fromAr:"البيت",     fromEn:"Home",             toAr:"العمل",          toEn:"Work",              typeAr:"سريع",  typeEn:"Swift",  fare:"$4.20",  driver:"Ahmad K."    },
  { dateAr:"٨ مارس", dateEn:"MAR 8",  fromAr:"مطار دمشق", fromEn:"Damascus Airport", toAr:"البيت",          toEn:"Home",              typeAr:"XL",    typeEn:"XL",     fare:"$18.90", driver:"Abdullah B." },
  { dateAr:"٧ مارس", dateEn:"MAR 7",  fromAr:"البيت",     fromEn:"Home",             toAr:"جبل قاسيون",     toEn:"Mount Qasioun",     typeAr:"أخضر",  typeEn:"Green",  fare:"$5.30",  driver:"Mazen R."    },
  { dateAr:"٥ مارس", dateEn:"MAR 5",  fromAr:"العمل",     fromEn:"Work",             toAr:"سوق الحميدية",   toEn:"Al-Hamidiyah Souq", typeAr:"فاخر",  typeEn:"Black",  fare:"$12.40", driver:"Nour S."     },
];
const PROMOS = [
  { code:"WASEE20", descAr:"خصم ٢٠٪ على رحلتك الجاية", descEn:"20% off your next ride", expires:"١٥ مارس / Mar 15" },
  { code:"SYRIA5",  descAr:"رصيد ٥$ اتضاف لحسابك",     descEn:"$5 credit added",         expires:"١٥ مارس / Mar 15" },
];

const card  = (x={}) => ({ background:C.surface, borderRadius:16, border:"1px solid "+C.border, boxShadow:"0 1px 8px rgba(0,0,0,0.05)", ...x });
const lbl   = (x={}) => ({ fontSize:10, fontWeight:700, letterSpacing:"0.1em", color:C.ink3, fontFamily:"'DM Mono',monospace", textTransform:"uppercase", ...x });
const pill  = (a,x={}) => ({ background:a?C.olive:C.surface, color:a?"#fff":C.ink2, border:"1px solid "+(a?C.olive:C.border), borderRadius:999, padding:"9px 22px", fontSize:14, fontWeight:600, cursor:"pointer", fontFamily:"'DM Sans',sans-serif", boxShadow:a?"0 2px 8px rgba(139,125,94,0.25)":"none", ...x });

function LeafletMap({ height=220, lat=33.5138, lng=36.2765, zoom=12, markerA=null, markerB=null, rounded=true, badge=true, driverMarkers=[] }) {
  const ref=useRef(null), mapRef=useRef(null), mksRef=useRef([]);
  useEffect(()=>{
    if(!document.getElementById("lf-css")){
      const l=document.createElement("link");l.id="lf-css";l.rel="stylesheet";
      l.href="https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/leaflet.min.css";document.head.appendChild(l);
    }
  },[]);
  useEffect(()=>{
    const init=()=>{
      if(!ref.current||mapRef.current)return;
      const L=window.L;
      const m=L.map(ref.current,{center:[lat,lng],zoom,zoomControl:false,attributionControl:false,scrollWheelZoom:false,dragging:true,touchZoom:true});
      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",{maxZoom:19}).addTo(m);
      mapRef.current=m;
    };
    if(window.L){init();}
    else{const s=document.createElement("script");s.src="https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/leaflet.min.js";s.onload=init;document.head.appendChild(s);}
    return()=>{if(mapRef.current){mapRef.current.remove();mapRef.current=null;}};
  },[]); // eslint-disable-line
  useEffect(()=>{if(mapRef.current)mapRef.current.setView([lat,lng],zoom);},[lat,lng,zoom]);
  useEffect(()=>{
    if(!mapRef.current||!window.L)return;
    const L=window.L;
    mksRef.current.forEach(m=>m.remove());mksRef.current=[];
    const ico=(color,label,shape="circle")=>L.divIcon({html:`<div style='width:30px;height:30px;border-radius:${shape==="circle"?"50%":"6px"};background:${color};border:3px solid #fff;box-shadow:0 2px 8px rgba(0,0,0,0.3);display:flex;align-items:center;justify-content:center;font-size:12px;font-weight:800;color:#fff'>${label}</div>`,className:"",iconSize:[30,30],iconAnchor:[15,15]});
    if(markerA)mksRef.current.push(L.marker([markerA.lat,markerA.lng],{icon:ico(C.olive,"A")}).addTo(mapRef.current));
    if(markerB)mksRef.current.push(L.marker([markerB.lat,markerB.lng],{icon:ico(C.oliveDark,"B","square")}).addTo(mapRef.current));
    if(markerA&&markerB){
      const ln=L.polyline([[markerA.lat,markerA.lng],[markerB.lat,markerB.lng]],{color:C.olive,weight:3,dashArray:"8,5",opacity:0.75}).addTo(mapRef.current);
      mksRef.current.push(ln);mapRef.current.fitBounds(ln.getBounds(),{padding:[40,40]});
    }
    // Driver location markers (pulsing)
    driverMarkers.forEach(d=>{
      const dIco=L.divIcon({html:`<div style='position:relative'><div style='width:20px;height:20px;border-radius:50%;background:#2d9e5f;border:3px solid #fff;box-shadow:0 2px 8px rgba(0,0,0,0.4)'></div><div style='position:absolute;top:-4px;left:-4px;width:28px;height:28px;border-radius:50%;background:rgba(45,158,95,0.3);animation:driverPulse 1.5s ease-out infinite'></div></div>`,className:"",iconSize:[20,20],iconAnchor:[10,10]});
      mksRef.current.push(L.marker([d.lat,d.lng],{icon:dIco}).bindPopup(`<b>${d.name}</b><br>${d.status}`).addTo(mapRef.current));
    });
  },[markerA,markerB,driverMarkers]);
  return (
    <div style={{position:"relative",height,borderRadius:rounded?16:0,overflow:"hidden",border:rounded?"1px solid "+C.border:"none",flexShrink:0}}>
      <style>{`@keyframes driverPulse{0%{transform:scale(0.5);opacity:0.8}100%{transform:scale(2.5);opacity:0}}`}</style>
      <div ref={ref} style={{width:"100%",height:"100%"}}/>
      {badge&&<div style={{position:"absolute",top:10,left:10,zIndex:1000,pointerEvents:"none"}}><WaseeBadge/></div>}
    </div>
  );
}

// ─── AUTH MODAL ────────────────────────────────────────────────────────────────
const COUNTRIES = [
  { flag:"🇸🇾", name:"Syria",         code:"+963", digits:9,  placeholder:"9X XXX XXXX" },
  { flag:"🇺🇸", name:"United States", code:"+1",   digits:10, placeholder:"(555) 000-0000" },
];

function AuthModal({ onClose, onSuccess, lang }) {
  const [step, setStep] = useState(0); // 0=phone, 1=otp, 2=success
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState("");
  const [error, setError] = useState("");
  const [countryIdx, setCountryIdx] = useState(0);
  const [showCountryPicker, setShowCountryPicker] = useState(false);
  const otpRef = useRef(null);
  const T = TRANSLATIONS[lang];
  const country = COUNTRIES[countryIdx];

  const [regName, setRegName] = useState("");
  const [regEmail, setRegEmail] = useState("");
  const [regBirthday, setRegBirthday] = useState("");
  const [regError, setRegError] = useState("");

  const handleSendCode = () => {
    if(phone.length < country.digits){ setError(lang==="ar"?"رقم غير صحيح":"Invalid number"); return; }
    setError(""); setStep(1);
  };
  const handleVerify = (val) => {
    const code = val ?? otp;
    if(code === "1234"){ setStep(2); }
    else { setError(lang==="ar"?"رمز خاطئ، جرب 1234":"Wrong code, try 1234"); }
  };
  const handleRegister = () => {
    if(!regName.trim()){ setRegError(lang==="ar"?"أدخل اسمك":"Please enter your name"); return; }
    if(!regEmail.includes("@")){ setRegError(lang==="ar"?"بريد إلكتروني غير صحيح":"Invalid email"); return; }
    if(!regBirthday){ setRegError(lang==="ar"?"أدخل تاريخ ميلادك":"Please enter your birthday"); return; }
    setRegError("");
    setStep(3);
    setTimeout(()=>{ onSuccess({ name: regName.trim(), phone: country.code+" "+phone, email: regEmail, birthday: regBirthday }); onClose(); }, 1600);
  };

  return (
    <div style={{position:"fixed",inset:0,zIndex:900,background:"rgba(0,0,0,0.5)",display:"flex",alignItems:"flex-end",justifyContent:"center"}} onClick={onClose}>
      <div style={{background:C.surface,width:"100%",maxWidth:480,borderRadius:"24px 24px 0 0",overflow:"hidden",boxShadow:"0 -8px 40px rgba(0,0,0,0.2)"}} onClick={e=>e.stopPropagation()}>
        <BlackStripe/>
        <div style={{padding:"24px 24px 36px"}}>
          {/* Handle bar */}
          <div style={{width:40,height:4,borderRadius:4,background:C.border,margin:"0 auto 20px"}}/>

          {/* Country picker dropdown */}
          {showCountryPicker && (
            <div style={{position:"absolute",left:24,right:24,background:C.surface,border:"1px solid "+C.border,borderRadius:14,boxShadow:"0 8px 32px rgba(0,0,0,0.15)",zIndex:10,overflow:"hidden",marginTop:-8}}>
              {COUNTRIES.map((c,i)=>(
                <div key={i} onClick={()=>{ setCountryIdx(i); setPhone(""); setShowCountryPicker(false); }}
                  style={{display:"flex",alignItems:"center",gap:12,padding:"14px 18px",cursor:"pointer",background:i===countryIdx?C.oliveBg:"transparent",borderBottom:i<COUNTRIES.length-1?"1px solid "+C.border:"none"}}>
                  <span style={{fontSize:22}}>{c.flag}</span>
                  <span style={{fontSize:14,fontWeight:600,color:C.ink,flex:1}}>{c.name}</span>
                  <span style={{fontSize:13,color:C.ink2,fontFamily:"'DM Mono',monospace"}}>{c.code}</span>
                  {i===countryIdx && <span style={{color:C.olive,fontSize:16}}>✓</span>}
                </div>
              ))}
            </div>
          )}

          {step===3 ? (
            <div style={{textAlign:"center",padding:"20px 0"}}>
              <div style={{fontSize:56,marginBottom:12}}>✅</div>
              <div style={{fontSize:22,fontFamily:"'Playfair Display',serif",fontWeight:800}}>{lang==="ar"?"أهلاً "+regName+"!":"Welcome, "+regName+"!"}</div>
              <div style={{fontSize:13,color:C.ink3,marginTop:6}}>{country.code} {phone}</div>
            </div>
          ) : step===2 ? (
            <div>
              {/* Progress dots */}
              <div style={{display:"flex",justifyContent:"center",gap:6,marginBottom:20}}>
                {[0,1,2].map(i=>(
                  <div key={i} style={{width:i===1?20:8,height:8,borderRadius:4,background:i===1?C.olive:C.oliveBorder,transition:"all 0.3s"}}/>
                ))}
              </div>
              <div style={{fontSize:24,fontFamily:"'Playfair Display',serif",fontWeight:800,marginBottom:4}}>
                {lang==="ar"?"أكمل ملفك الشخصي":"Complete your profile"}
              </div>
              <div style={{fontSize:13,color:C.ink2,marginBottom:22}}>
                {lang==="ar"?"خطوة أخيرة قبل البداية":"One last step before you ride"}
              </div>

              {/* Name */}
              <div style={{marginBottom:14}}>
                <div style={{fontSize:11,fontWeight:700,color:C.ink2,letterSpacing:"0.08em",textTransform:"uppercase",marginBottom:6,fontFamily:"'DM Mono',monospace"}}>
                  {lang==="ar"?"الاسم الكامل":"Full Name"}
                </div>
                <input
                  value={regName}
                  onChange={e=>{ setRegName(e.target.value); setRegError(""); }}
                  placeholder={lang==="ar"?"مثال: أحمد الخالد":"e.g. Ahmad Al-Khalid"}
                  autoFocus
                  style={{width:"100%",boxSizing:"border-box",background:C.surface2,border:"1px solid "+(regError&&!regName?C.olive:C.border),borderRadius:12,padding:"14px 16px",color:C.ink,fontSize:15,outline:"none",fontFamily:"'DM Sans',sans-serif"}}
                />
              </div>

              {/* Email */}
              <div style={{marginBottom:14}}>
                <div style={{fontSize:11,fontWeight:700,color:C.ink2,letterSpacing:"0.08em",textTransform:"uppercase",marginBottom:6,fontFamily:"'DM Mono',monospace"}}>
                  {lang==="ar"?"البريد الإلكتروني":"Email Address"}
                </div>
                <input
                  value={regEmail}
                  onChange={e=>{ setRegEmail(e.target.value); setRegError(""); }}
                  placeholder={lang==="ar"?"example@email.com":"example@email.com"}
                  type="email"
                  style={{width:"100%",boxSizing:"border-box",background:C.surface2,border:"1px solid "+(regError&&!regEmail.includes("@")?C.olive:C.border),borderRadius:12,padding:"14px 16px",color:C.ink,fontSize:15,outline:"none",fontFamily:"'DM Sans',sans-serif"}}
                />
              </div>

              {/* Birthday */}
              <div style={{marginBottom:20}}>
                <div style={{fontSize:11,fontWeight:700,color:C.ink2,letterSpacing:"0.08em",textTransform:"uppercase",marginBottom:6,fontFamily:"'DM Mono',monospace"}}>
                  {lang==="ar"?"تاريخ الميلاد":"Birthday"}
                </div>
                <input
                  value={regBirthday}
                  onChange={e=>{ setRegBirthday(e.target.value); setRegError(""); }}
                  type="date"
                  max={new Date(Date.now()-18*365.25*24*3600*1000).toISOString().split("T")[0]}
                  style={{width:"100%",boxSizing:"border-box",background:C.surface2,border:"1px solid "+(regError&&!regBirthday?C.olive:C.border),borderRadius:12,padding:"14px 16px",color:regBirthday?C.ink:C.ink3,fontSize:15,outline:"none",fontFamily:"'DM Sans',sans-serif"}}
                />
              </div>

              {regError&&<div style={{fontSize:12,color:C.olive,marginBottom:10,textAlign:"center"}}>{regError}</div>}

              <button onClick={handleRegister}
                style={{width:"100%",background:C.olive,border:"none",borderRadius:12,padding:"15px",fontSize:15,fontWeight:700,cursor:"pointer",color:"#fff",marginBottom:10}}>
                {lang==="ar"?"ابدأ الرحلة 🚗":"Let's ride 🚗"}
              </button>
              <button onClick={()=>{setStep(1);setOtp("");}}
                style={{width:"100%",background:"none",border:"none",cursor:"pointer",fontSize:13,color:C.ink3,padding:"8px"}}>
                {lang==="ar"?"رجوع":"Back"}
              </button>
            </div>
          ) : (
            <>
              <div style={{fontSize:24,fontFamily:"'Playfair Display',serif",fontWeight:800,marginBottom:4}}>
                {step===0 ? T.createAccount : T.enterOtp}
              </div>
              <div style={{fontSize:13,color:C.ink2,marginBottom:24}}>
                {step===0 ? T.enterPhone : `${T.otpSent} ${country.code} ${phone}`}
              </div>

              {step===0 ? (
                <div>
                  <div style={{display:"flex",gap:8,marginBottom:6}}>
                    {/* Country selector button */}
                    <button onClick={()=>setShowCountryPicker(p=>!p)}
                      style={{background:C.surface2,border:"1px solid "+(showCountryPicker?C.olive:C.border),borderRadius:12,padding:"14px 12px",fontSize:14,color:C.ink,flexShrink:0,fontWeight:600,cursor:"pointer",display:"flex",alignItems:"center",gap:6,whiteSpace:"nowrap"}}>
                      <span style={{fontSize:18}}>{country.flag}</span>
                      <span style={{fontFamily:"'DM Mono',monospace",fontSize:13}}>{country.code}</span>
                      <span style={{fontSize:10,color:C.ink3,marginLeft:2}}>{showCountryPicker?"▲":"▼"}</span>
                    </button>
                    <input
                      value={phone}
                      onChange={e=>setPhone(e.target.value.replace(/\D/g,""))}
                      placeholder={country.placeholder}
                      maxLength={country.digits}
                      type="tel"
                      autoFocus
                      style={{flex:1,background:C.surface2,border:"1px solid "+(error?C.olive:C.border),borderRadius:12,padding:"14px 16px",color:C.ink,fontSize:16,outline:"none",letterSpacing:"0.05em",fontFamily:"'DM Mono',monospace"}}
                    />
                  </div>
                  {error&&<div style={{fontSize:12,color:C.olive,marginBottom:8}}>{error}</div>}
                  <button onClick={handleSendCode} disabled={phone.length<country.digits}
                    style={{width:"100%",marginTop:12,background:phone.length>=country.digits?C.olive:C.surface2,border:"none",borderRadius:12,padding:"15px",fontSize:15,fontWeight:700,cursor:phone.length>=country.digits?"pointer":"default",color:phone.length>=country.digits?"#fff":C.ink3}}>
                    {T.sendCode} →
                  </button>
                </div>
              ) : (
                <div>
                  <div style={{display:"flex",gap:8,justifyContent:"center",marginBottom:6}}>
                    {[0,1,2,3].map(i=>(
                      <div key={i} style={{width:56,height:64,borderRadius:12,background:C.surface2,border:"1.5px solid "+(otp.length>i?C.olive:C.border),display:"flex",alignItems:"center",justifyContent:"center",fontSize:28,fontFamily:"'DM Mono',monospace",fontWeight:700,color:C.ink,transition:"border-color 0.15s"}}>
                        {otp[i]||""}
                      </div>
                    ))}
                  </div>
                  <input
                    ref={otpRef}
                    value={otp}
                    onChange={e=>{ const v=e.target.value.replace(/\D/g,"").slice(0,4); setOtp(v); setError(""); if(v.length===4) setTimeout(()=>handleVerify(v),50); }}
                    maxLength={4}
                    type="tel"
                    autoFocus
                    style={{position:"absolute",opacity:0,width:1,height:1}}
                  />
                  {error&&<div style={{fontSize:12,color:C.olive,textAlign:"center",marginBottom:8}}>{error}</div>}
                  <div style={{fontSize:11,color:C.ink3,textAlign:"center",marginBottom:16}}>{T.otpHint}</div>
                  {/* Tap area to focus OTP input */}
                  <button onClick={()=>otpRef.current?.focus()}
                    style={{width:"100%",background:C.surface2,border:"1px solid "+C.border,borderRadius:12,padding:"12px",fontSize:13,color:C.ink2,cursor:"pointer",marginBottom:12}}>
                    {lang==="ar"?"انقر هنا للكتابة":"Tap here to enter code"}
                  </button>
                  <button onClick={handleVerify} disabled={otp.length<4}
                    style={{width:"100%",background:otp.length===4?C.olive:C.surface2,border:"none",borderRadius:12,padding:"15px",fontSize:15,fontWeight:700,cursor:otp.length===4?"pointer":"default",color:otp.length===4?"#fff":C.ink3}}>
                    {T.verifyCode} ✓
                  </button>
                  <button onClick={()=>{setStep(0);setOtp("");setError("");}}
                    style={{width:"100%",marginTop:10,background:"none",border:"none",cursor:"pointer",fontSize:13,color:C.ink3,padding:"8px"}}>
                    {lang==="ar"?"تغيير الرقم":"Change number"}
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── DRIVER PORTAL ─────────────────────────────────────────────────────────────
function DriverPortal({ onBack, lang, pendingRideId }) {
  const [step, setStep] = useState(0); // 0=intro/sub, 1=form, 2=docs, 3=dashboard
  const [subscribed, setSubscribed] = useState(false);
  const [subscribing, setSubscribing] = useState(false);
  const [driverForm, setDriverForm] = useState({
    name:"", phone:"", city:"Damascus", carMake:"", carModel:"", carYear:"", carColor:"", plate:"",
  });
  const [driverStatus, setDriverStatus] = useState("offline");
  const [driverLat, setDriverLat] = useState(33.5138);
  const [driverLng, setDriverLng] = useState(36.2765);
  const [locationTracking, setLocationTracking] = useState(false);

  // Stable driver ID (generated once per portal session)
  const driverIdRef = useRef("driver-" + Math.random().toString(36).slice(2, 10));

  // Ride request state
  const [incomingRequest, setIncomingRequest] = useState(null);
  const [tripPhase, setTripPhase] = useState("idle"); // idle|navigating|in_trip|ended
  const [currentTrip, setCurrentTrip] = useState(null);
  const [tripTimer, setTripTimer] = useState(0);
  const [passengerRating, setPassengerRating] = useState(0);
  const [hoveredPassStar, setHoveredPassStar] = useState(0);

  // Earnings (live-updated per trip)
  const [earnings, setEarnings] = useState({ todayTotal:47.20, weekTotal:312.80, trips:8, rating:4.96, history:[] });

  const locationRef = useRef(null);
  const requestTimerRef = useRef(null);
  const tripTimerRef = useRef(null);
  // Keep driverForm in a ref so effects always read the latest values without re-subscribing
  const driverFormRef = useRef(driverForm);
  useEffect(()=>{ driverFormRef.current=driverForm; },[driverForm]);
  const T = TRANSLATIONS[lang];

  // Helper: build the payload sent to the driver-location endpoint
  const buildDriverPayload=(lng,lat)=>({longitude:lng,latitude:lat,name:driverFormRef.current.name||"Driver",vehicle:`${driverFormRef.current.carMake} ${driverFormRef.current.carModel}`.trim()||"Vehicle"});

  // Helper: resolve the active backend ride ID
  const getActiveRideId=()=>pendingRideId||currentTrip?.rideId;

  // Location drift while online – also syncs position to backend
  useEffect(()=>{
    if(locationTracking && driverStatus!=="offline"){
      locationRef.current=setInterval(()=>{
        setDriverLat(l=>{
          const newLat=l+(Math.random()-0.5)*0.001;
          setDriverLng(lng=>{
            const newLng=lng+(Math.random()-0.5)*0.001;
            apiFetch(`/drivers/${driverIdRef.current}/location`,{method:"POST",body:buildDriverPayload(newLng,newLat)});
            return newLng;
          });
          return newLat;
        });
      },3000);
      return ()=>clearInterval(locationRef.current);
    } else clearInterval(locationRef.current);
  },[locationTracking,driverStatus]); // eslint-disable-line

  // Simulate incoming ride request 8s after going online
  useEffect(()=>{
    if(driverStatus==="available" && tripPhase==="idle"){
      requestTimerRef.current=setTimeout(()=>{
        const riders=[
          {name:"ليلى حسن",nameEn:"Layla H.",from:"Al-Mazzeh, Damascus",to:"Old City, Damascus",fromCoords:{lat:33.5031,lng:36.2362},toCoords:{lat:33.5102,lng:36.3073},dist:"3.2",fare:"3.80",eta:4},
          {name:"سامر القدسي",nameEn:"Samer K.",from:"Kafr Sousa",to:"Damascus Airport",fromCoords:{lat:33.4936,lng:36.2660},toCoords:{lat:33.4114,lng:36.5156},dist:"18.6",fare:"11.70",eta:7},
          {name:"رنا طه",nameEn:"Rana T.",from:"Abu Rummaneh",to:"Mount Qasioun",fromCoords:{lat:33.5178,lng:36.2832},toCoords:{lat:33.5440,lng:36.2670},dist:"5.1",fare:"5.20",eta:5},
        ];
        setIncomingRequest(riders[Math.floor(Math.random()*riders.length)]);
      },8000);
      return ()=>clearTimeout(requestTimerRef.current);
    }
  },[driverStatus,tripPhase]);

  // Trip elapsed timer
  useEffect(()=>{
    if(tripPhase==="in_trip"){
      tripTimerRef.current=setInterval(()=>setTripTimer(t=>t+1),1000);
      return ()=>clearInterval(tripTimerRef.current);
    } else clearInterval(tripTimerRef.current);
  },[tripPhase]);

  const startTracking=()=>{
    if(navigator.geolocation){
      navigator.geolocation.getCurrentPosition(p=>{
        const lat=p.coords.latitude, lng=p.coords.longitude;
        setDriverLat(lat); setDriverLng(lng);
        apiFetch(`/drivers/${driverIdRef.current}/location`,{method:"POST",body:buildDriverPayload(lng,lat)});
      },()=>{
        apiFetch(`/drivers/${driverIdRef.current}/location`,{method:"POST",body:buildDriverPayload(driverLng,driverLat)});
      });
    } else {
      apiFetch(`/drivers/${driverIdRef.current}/location`,{method:"POST",body:buildDriverPayload(driverLng,driverLat)});
    }
    setLocationTracking(true); setDriverStatus("available");
  };
  const stopTracking=()=>{
    apiFetch(`/drivers/${driverIdRef.current}/location`,{method:"DELETE"});
    setLocationTracking(false); setDriverStatus("offline");
  };

  const handleAccept=()=>{
    const rideId=getActiveRideId()||pendingRideId;
    if(rideId){
      apiFetch(`/rides/${rideId}/accept`,{method:"PUT",body:{driverId:driverIdRef.current}});
    }
    setIncomingRequest(null); setDriverStatus("on_trip");
    setCurrentTrip(incomingRequest); setTripPhase("navigating");
  };
  const handleDecline=()=>{
    setIncomingRequest(null);
    // Simulate another request after delay
    setTimeout(()=>{
      if(driverStatus==="available") setIncomingRequest({name:"محمد أحمد",nameEn:"Mohammad A.",from:"Umayyad Mosque",to:"Homs Bus Station",fromCoords:{lat:33.5115,lng:36.3066},toCoords:{lat:33.5138,lng:36.2765},dist:"4.7",fare:"4.60",eta:6});
    },6000);
  };
  const handleStartTrip=()=>{
    const rideId=getActiveRideId();
    if(rideId) apiFetch(`/rides/${rideId}/status`,{method:"PUT",body:{status:"in_progress"}});
    setTripPhase("in_trip"); setTripTimer(0);
  };
  const handleEndTrip=()=>{
    const rideId=getActiveRideId();
    if(rideId) apiFetch(`/rides/${rideId}/status`,{method:"PUT",body:{status:"completed"}});
    setTripPhase("ended");
    clearInterval(tripTimerRef.current);
    const earned=parseFloat(currentTrip?.fare||"4.00");
    // Store trip data
    storeTripData({
      driver:driverFormRef.current.name||"Driver",
      from:currentTrip?.from, to:currentTrip?.to,
      passenger:currentTrip?.name, dist:currentTrip?.dist,
      fare:earned, cash:true, duration:tripTimer
    });
    setEarnings(e=>({ ...e,
      todayTotal:parseFloat((e.todayTotal+earned).toFixed(2)),
      weekTotal:parseFloat((e.weekTotal+earned).toFixed(2)),
      trips:e.trips+1,
      history:[{from:currentTrip?.from,to:currentTrip?.to,fare:earned,dist:currentTrip?.dist,ts:new Date().toLocaleTimeString()},...e.history.slice(0,4)]
    }));
  };
  const handleNewTrip=()=>{
    // Re-register driver as available
    apiFetch(`/drivers/${driverIdRef.current}/location`,{method:"POST",body:buildDriverPayload(driverLng,driverLat)});
    setTripPhase("idle"); setCurrentTrip(null); setPassengerRating(0); setDriverStatus("available");
  };

  const statusColors={offline:C.ink3,available:"#2d9e5f",on_trip:C.olive};
  const statusLabels={offline:lang==="ar"?"غير متصل":"Offline",available:lang==="ar"?"متاح":"Available",on_trip:lang==="ar"?"في رحلة":"On Trip"};
  const cities=SYRIA_CITIES.map(c=>({val:c.name,label:lang==="ar"?c.ar:c.name}));
  const fmtTime=s=>`${String(Math.floor(s/60)).padStart(2,"0")}:${String(s%60).padStart(2,"0")}`;

  // STEP 0: Intro + Subscription gate
  if(step===0) return (
    <PageBg style={{paddingBottom:20}}>
      <link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600;700&family=DM+Mono:wght@400;500;600&family=Playfair+Display:wght@700;800&display=swap" rel="stylesheet"/>
      <BlackStripe/>
      <div style={{padding:"20px 16px"}}>
        <button onClick={onBack} style={{background:"none",border:"none",cursor:"pointer",display:"flex",alignItems:"center",gap:6,color:C.ink2,fontSize:14,marginBottom:20,padding:0}}>
          <span style={{fontSize:18}}>←</span><span>{lang==="ar"?"رجوع":"Back"}</span>
        </button>
        <div style={{textAlign:"center",padding:"24px 0 20px"}}>
          <div style={{fontSize:60,marginBottom:14}}>🚘</div>
          <div style={{fontSize:28,fontFamily:"'Playfair Display',serif",fontWeight:800,marginBottom:8}}>{lang==="ar"?"سوّق مع واصي":"Drive with Wasee"}</div>
          <div style={{fontSize:13,color:C.ink2,maxWidth:280,margin:"0 auto",lineHeight:1.6}}>{lang==="ar"?"انضم لأكبر شبكة سائقين في سوريا":"Join Syria's largest driver network"}</div>
        </div>

        {/* Subscription card */}
        <div style={{...card({padding:22,marginBottom:16,border:"2px solid "+C.olive})}}>
          <div style={lbl({marginBottom:10,color:C.olive})}>{T.subscribeDriver}</div>
          <div style={{display:"flex",alignItems:"baseline",gap:6,marginBottom:4}}>
            <span style={{fontSize:36,fontFamily:"'Playfair Display',serif",fontWeight:800,color:C.ink}}>$1</span>
            <span style={{fontSize:13,color:C.ink3}}>{T.subFirst}{T.subMonth}</span>
          </div>
          <div style={{fontSize:12,color:C.ink3,marginBottom:14}}>{T.subAfter} <b style={{color:C.ink}}>$5{T.subMonth}</b></div>
          <div style={{background:C.oliveBg,border:"1px solid "+C.oliveBorder,borderRadius:10,padding:"10px 14px",marginBottom:16}}>
            <div style={{fontSize:12,color:C.ink2,lineHeight:1.7}}>{T.subPerks}</div>
          </div>
          <button
            disabled={subscribed||subscribing}
            onClick={()=>{
              setSubscribing(true);
              setTimeout(()=>{ setSubscribing(false); setSubscribed(true); },1800);
            }}
            style={{width:"100%",background:subscribed?"#2d9e5f":C.olive,border:"none",borderRadius:12,padding:"14px",fontSize:15,fontWeight:700,cursor:subscribed?"default":"pointer",color:"#fff",opacity:subscribing?0.7:1,transition:"all 0.3s"}}>
            {subscribing?T.subscribing:subscribed?T.subscribed:T.subscribeDriver+" →"}
          </button>
        </div>

        <div style={{...card({padding:18,marginBottom:16})}}>
          <div style={lbl({marginBottom:10})}>{lang==="ar"?"متطلبات التسجيل":"Requirements"}</div>
          {[{icon:"🪪",ar:"رخصة قيادة سارية",en:"Valid driver's license"},{icon:"🚗",ar:"سيارة موديل 2010 أو أحدث",en:"Vehicle model 2010 or newer"},{icon:"📄",ar:"وثائق السيارة كاملة",en:"Complete vehicle documents"},{icon:"📱",ar:"هاتف ذكي",en:"Smartphone"}].map(r=>(
            <div key={r.en} style={{display:"flex",alignItems:"center",gap:10,padding:"8px 0",borderBottom:"1px solid "+C.border}}>
              <span style={{fontSize:18}}>{r.icon}</span>
              <span style={{fontSize:13}}>{lang==="ar"?r.ar:r.en}</span>
              <span style={{marginLeft:"auto",color:"#2d9e5f"}}>✓</span>
            </div>
          ))}
        </div>
        <button onClick={()=>{ if(subscribed) setStep(1); }}
          style={{width:"100%",background:subscribed?C.olive:C.surface2,border:"1px solid "+(subscribed?C.olive:C.border),borderRadius:14,padding:"16px",fontSize:16,fontWeight:700,cursor:subscribed?"pointer":"default",color:subscribed?"#fff":C.ink3}}>
          {subscribed?(lang==="ar"?"ابدأ التسجيل →":"Start Registration →"):(lang==="ar"?"اشترك أولاً للمتابعة":"Subscribe first to continue")}
        </button>
      </div>
    </PageBg>
  );

  // STEP 1: Personal & Vehicle Info
  if(step===1) return (
    <PageBg style={{paddingBottom:30}}>
      <link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;600;700&family=DM+Mono:wght@400;600&family=Playfair+Display:wght@700;800&display=swap" rel="stylesheet"/>
      <BlackStripe/>
      <div style={{padding:"20px 16px"}}>
        <button onClick={()=>setStep(0)} style={{background:"none",border:"none",cursor:"pointer",display:"flex",alignItems:"center",gap:6,color:C.ink2,fontSize:14,marginBottom:20,padding:0}}>
          <span>←</span><span>{lang==="ar"?"رجوع":"Back"}</span>
        </button>
        <div style={{display:"flex",gap:6,marginBottom:24}}>
          {[1,2,3].map(i=><div key={i} style={{flex:1,height:3,borderRadius:3,background:i<=1?C.olive:C.border}}/>)}
        </div>
        <div style={{fontSize:22,fontFamily:"'Playfair Display',serif",fontWeight:800,marginBottom:4}}>{lang==="ar"?"معلوماتك الشخصية":"Personal Information"}</div>
        <div style={{fontSize:13,color:C.ink2,marginBottom:20}}>{lang==="ar"?"خطوة ١ من ٢ · بياناتك الأساسية":"Step 1 of 2 · Your basic details"}</div>
        <div style={{display:"flex",flexDirection:"column",gap:14}}>
          <div>
            <div style={lbl({marginBottom:6})}>{lang==="ar"?"الاسم الكامل":"Full Name"}</div>
            <input value={driverForm.name} onChange={e=>setDriverForm({...driverForm,name:e.target.value})} placeholder={lang==="ar"?"مثال: أحمد محمود":"e.g. Ahmad Mahmoud"} style={{width:"100%",background:C.surface2,border:"1px solid "+C.border,borderRadius:12,padding:"12px 14px",color:C.ink,fontSize:14,outline:"none",boxSizing:"border-box"}}/>
          </div>
          <div>
            <div style={lbl({marginBottom:6})}>{lang==="ar"?"رقم الهاتف":"Phone Number"}</div>
            <div style={{display:"flex",gap:8}}>
              <div style={{background:C.surface2,border:"1px solid "+C.border,borderRadius:12,padding:"12px 14px",fontSize:14,color:C.ink2,flexShrink:0}}>🇸🇾 +963</div>
              <input value={driverForm.phone} onChange={e=>setDriverForm({...driverForm,phone:e.target.value.replace(/\D/,"")})} placeholder="9X XXX XXXX" type="tel" style={{flex:1,background:C.surface2,border:"1px solid "+C.border,borderRadius:12,padding:"12px 14px",color:C.ink,fontSize:14,outline:"none"}}/>
            </div>
          </div>
          <div>
            <div style={lbl({marginBottom:6})}>{lang==="ar"?"المدينة":"City"}</div>
            <select value={driverForm.city} onChange={e=>setDriverForm({...driverForm,city:e.target.value})} style={{width:"100%",background:C.surface2,border:"1px solid "+C.border,borderRadius:12,padding:"12px 14px",color:C.ink,fontSize:14,outline:"none",boxSizing:"border-box"}}>
              {cities.map(c=><option key={c.val} value={c.val}>{c.label}</option>)}
            </select>
          </div>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10}}>
            {[{k:"carMake",ar:"ماركة السيارة",en:"Car Make",ph:"Toyota"},
              {k:"carModel",ar:"الموديل",en:"Model",ph:"Corolla"},
              {k:"carYear",ar:"السنة",en:"Year",ph:"2019"},
              {k:"carColor",ar:"اللون",en:"Color",ph:"White"}].map(f=>(
              <div key={f.k}>
                <div style={lbl({marginBottom:6})}>{lang==="ar"?f.ar:f.en}</div>
                <input value={driverForm[f.k]} onChange={e=>setDriverForm({...driverForm,[f.k]:e.target.value})} placeholder={f.ph} style={{width:"100%",background:C.surface2,border:"1px solid "+C.border,borderRadius:12,padding:"12px 14px",color:C.ink,fontSize:14,outline:"none",boxSizing:"border-box"}}/>
              </div>
            ))}
          </div>
          <div>
            <div style={lbl({marginBottom:6})}>{lang==="ar"?"لوحة السيارة":"License Plate"}</div>
            <input value={driverForm.plate} onChange={e=>setDriverForm({...driverForm,plate:e.target.value.toUpperCase()})} placeholder="DAM 0000" style={{width:"100%",background:C.surface2,border:"1px solid "+C.border,borderRadius:12,padding:"12px 14px",color:C.ink,fontSize:15,outline:"none",boxSizing:"border-box",fontFamily:"'DM Mono',monospace",letterSpacing:"0.1em"}}/>
          </div>
        </div>
        <button onClick={()=>{ if(driverForm.name&&driverForm.phone) setStep(2); }}
          style={{width:"100%",marginTop:22,background:driverForm.name&&driverForm.phone?C.olive:C.surface2,border:"none",borderRadius:14,padding:"16px",fontSize:15,fontWeight:700,cursor:driverForm.name&&driverForm.phone?"pointer":"default",color:driverForm.name&&driverForm.phone?"#fff":C.ink3}}>
          {lang==="ar"?"التالي →":"Next →"}
        </button>
      </div>
    </PageBg>
  );

  // STEP 2: Documents
  if(step===2) return (
    <PageBg style={{paddingBottom:30}}>
      <link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;600;700&family=DM+Mono:wght@400;600&family=Playfair+Display:wght@700;800&display=swap" rel="stylesheet"/>
      <BlackStripe/>
      <div style={{padding:"20px 16px"}}>
        <button onClick={()=>setStep(1)} style={{background:"none",border:"none",cursor:"pointer",display:"flex",alignItems:"center",gap:6,color:C.ink2,fontSize:14,marginBottom:20,padding:0}}>
          <span>←</span><span>{lang==="ar"?"رجوع":"Back"}</span>
        </button>
        <div style={{display:"flex",gap:6,marginBottom:24}}>
          {[1,2,3].map(i=><div key={i} style={{flex:1,height:3,borderRadius:3,background:i<=2?C.olive:C.border}}/>)}
        </div>
        <div style={{fontSize:22,fontFamily:"'Playfair Display',serif",fontWeight:800,marginBottom:4}}>{lang==="ar"?"الوثائق المطلوبة":"Required Documents"}</div>
        <div style={{fontSize:13,color:C.ink2,marginBottom:20}}>{lang==="ar"?"خطوة ٢ من ٢":"Step 2 of 2"}</div>
        <div style={{display:"flex",flexDirection:"column",gap:10,marginBottom:16}}>
          {[{icon:"🪪",ar:"رخصة القيادة",en:"Driver's License",req:true},{icon:"📄",ar:"استمارة السيارة",en:"Vehicle Registration",req:true},{icon:"🛡️",ar:"وثيقة التأمين",en:"Insurance",req:true},{icon:"📸",ar:"صورة شخصية",en:"Profile Photo",req:false}].map(doc=>(
            <div key={doc.en} style={{...card({padding:"14px 16px",display:"flex",alignItems:"center",gap:14})}}>
              <span style={{fontSize:24}}>{doc.icon}</span>
              <div style={{flex:1}}>
                <div style={{fontSize:14,fontWeight:600}}>{lang==="ar"?doc.ar:doc.en}</div>
                <div style={{fontSize:11,color:C.ink3,marginTop:2}}>{doc.req?(lang==="ar"?"مطلوب":"Required"):(lang==="ar"?"اختياري":"Optional")}</div>
              </div>
              <button style={{background:C.surface2,border:"1px solid "+C.border,borderRadius:10,padding:"8px 14px",cursor:"pointer",fontSize:12,color:C.ink2}}>{lang==="ar"?"رفع":"Upload"}</button>
            </div>
          ))}
        </div>
        <div style={{...card({padding:14,marginBottom:20,background:C.oliveBg,border:"1px solid "+C.oliveBorder})}}>
          <div style={{display:"flex",gap:10}}>
            <span>ℹ️</span>
            <div style={{fontSize:12,color:C.ink2,lineHeight:1.5}}>{lang==="ar"?"سيتم مراجعة وثائقك خلال ٢٤ ساعة":"Documents reviewed within 24 hours."}</div>
          </div>
        </div>
        <button onClick={()=>setStep(3)} style={{width:"100%",background:C.olive,border:"none",borderRadius:14,padding:"16px",fontSize:15,fontWeight:700,cursor:"pointer",color:"#fff"}}>
          {lang==="ar"?"إرسال الطلب ✓":"Submit Application ✓"}
        </button>
      </div>
    </PageBg>
  );

  // STEP 3: Driver Dashboard
  return (
    <PageBg style={{paddingBottom:20}}>
      <link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;600;700&family=DM+Mono:wght@400;600&family=Playfair+Display:wght@700;800&display=swap" rel="stylesheet"/>
      <BlackStripe/>
      <div style={{padding:"16px 16px 8px",display:"flex",justifyContent:"space-between",alignItems:"center"}}>
        <div>
          <div style={lbl({fontSize:9})}>{lang==="ar"?"لوحة السائق":"DRIVER DASHBOARD"}</div>
          <div style={{fontSize:22,fontFamily:"'Playfair Display',serif",fontWeight:800,marginTop:2}}>{driverForm.name||"Ahmad K."}</div>
        </div>
        <button onClick={onBack} style={{background:C.surface2,border:"1px solid "+C.border,borderRadius:10,padding:"8px 12px",cursor:"pointer",fontSize:12,color:C.ink2}}>{lang==="ar"?"← خروج":"← Exit"}</button>
      </div>

      {/* INCOMING RIDE REQUEST MODAL */}
      {incomingRequest&&tripPhase==="idle"&&(
        <div style={{position:"fixed",inset:0,zIndex:800,background:"rgba(0,0,0,0.55)",display:"flex",alignItems:"flex-end"}} onClick={e=>e.stopPropagation()}>
          <div style={{background:C.surface,width:"100%",borderRadius:"24px 24px 0 0",overflow:"hidden",boxShadow:"0 -8px 40px rgba(0,0,0,0.25)"}}>
            <div style={{height:5,background:"#2d9e5f",animation:"reqPulse 1s ease-in-out infinite alternate"}}/>
            <style>{"@keyframes reqPulse{from{opacity:0.6}to{opacity:1}}"}</style>
            <div style={{padding:"20px 20px 32px"}}>
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:4}}>
                <div style={{fontSize:18,fontFamily:"'Playfair Display',serif",fontWeight:800,color:"#2d9e5f"}}>🔔 {T.rideRequest}</div>
                <div style={{...lbl({background:C.oliveBg,border:"1px solid "+C.oliveBorder,borderRadius:6,padding:"3px 8px",color:C.olive})}}>{lang==="ar"?"نقداً":"CASH"}</div>
              </div>
              <div style={{fontSize:13,color:C.ink3,marginBottom:16}}>{lang==="ar"?incomingRequest.name:incomingRequest.nameEn}</div>
              <div style={{...card({padding:14,marginBottom:14})}}>
                <div style={{display:"flex",alignItems:"center",gap:12}}>
                  <div style={{display:"flex",flexDirection:"column",alignItems:"center",gap:4}}>
                    <div style={{width:9,height:9,borderRadius:"50%",background:C.olive}}/>
                    <div style={{width:1.5,height:24,background:C.border}}/>
                    <div style={{width:9,height:9,borderRadius:2,background:C.oliveDark}}/>
                  </div>
                  <div style={{flex:1}}>
                    <div style={{fontSize:13,fontWeight:600,marginBottom:8}}>{incomingRequest.from}</div>
                    <div style={{fontSize:13,color:C.ink2}}>{incomingRequest.to}</div>
                  </div>
                  <div style={{textAlign:"right"}}>
                    <div style={{fontSize:22,fontWeight:800,fontFamily:"'Playfair Display',serif",color:C.ink}}>${incomingRequest.fare}</div>
                    <div style={{fontSize:11,color:C.ink3,fontFamily:"'DM Mono',monospace"}}>{incomingRequest.dist} km</div>
                    <div style={{fontSize:11,color:C.olive,fontFamily:"'DM Mono',monospace"}}>{incomingRequest.eta} min ETA</div>
                  </div>
                </div>
              </div>
              <div style={{display:"flex",gap:10}}>
                <button onClick={handleDecline} style={{flex:1,background:C.surface2,border:"1px solid "+C.border,borderRadius:12,padding:"14px",fontSize:15,fontWeight:700,cursor:"pointer",color:C.ink2}}>{T.declineRide}</button>
                <button onClick={handleAccept} style={{flex:2,background:"#2d9e5f",border:"none",borderRadius:12,padding:"14px",fontSize:15,fontWeight:700,cursor:"pointer",color:"#fff"}}>{T.acceptRide} ✓</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TRIP PHASE: Navigate to rider */}
      {tripPhase==="navigating"&&currentTrip&&(
        <div style={{...card({padding:18,margin:"0 16px 12px",border:"2px solid "+C.olive})}}>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:10}}>
            <div style={{fontSize:15,fontWeight:800,color:C.olive}}>🧭 {T.navigateRider}</div>
            <div style={{fontSize:11,fontFamily:"'DM Mono',monospace",color:"#2d9e5f",fontWeight:700}}>📍 LIVE</div>
          </div>
          <div style={{fontSize:13,color:C.ink2,marginBottom:4}}>{lang==="ar"?"الراكب:":""} <b>{lang==="ar"?currentTrip.name:currentTrip.nameEn}</b></div>
          <div style={{fontSize:13,color:C.ink,marginBottom:14}}>📍 {currentTrip.from}</div>
          <div style={{...card({padding:12,marginBottom:12,background:C.surface2})}}>
            <div style={{fontSize:11,color:C.ink3,marginBottom:4,fontFamily:"'DM Mono',monospace",textTransform:"uppercase"}}>{lang==="ar"?"الوجهة النهائية":"Destination"}</div>
            <div style={{fontSize:13,fontWeight:600}}>🏁 {currentTrip.to}</div>
            <div style={{display:"flex",gap:16,marginTop:8}}>
              <span style={{fontSize:12,color:C.ink3}}>{currentTrip.dist} km</span>
              <span style={{fontSize:12,color:C.olive,fontWeight:700}}>💵 ${currentTrip.fare} {lang==="ar"?"نقداً":"cash"}</span>
            </div>
          </div>
          <button onClick={handleStartTrip} style={{width:"100%",background:C.olive,border:"none",borderRadius:12,padding:"13px",fontSize:15,fontWeight:700,cursor:"pointer",color:"#fff"}}>{T.startTrip} →</button>
        </div>
      )}

      {/* TRIP PHASE: In trip */}
      {tripPhase==="in_trip"&&currentTrip&&(
        <div style={{...card({padding:18,margin:"0 16px 12px",border:"2px solid #2d9e5f"})}}>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:12}}>
            <div style={{fontSize:15,fontWeight:800,color:"#2d9e5f"}}>🚗 {lang==="ar"?"الرحلة جارية":"Trip in Progress"}</div>
            <div style={{fontSize:22,fontFamily:"'DM Mono',monospace",fontWeight:700,color:C.ink}}>{fmtTime(tripTimer)}</div>
          </div>
          <div style={{fontSize:13,color:C.ink2,marginBottom:4}}><b>{lang==="ar"?currentTrip.name:currentTrip.nameEn}</b></div>
          <div style={{display:"flex",gap:10,marginBottom:14}}>
            <div style={{flex:1,background:C.surface2,borderRadius:10,padding:"10px 12px",textAlign:"center"}}>
              <div style={{fontSize:11,color:C.ink3,fontFamily:"'DM Mono',monospace"}}>{T.tripDistance}</div>
              <div style={{fontSize:16,fontWeight:700,marginTop:2}}>{currentTrip.dist} km</div>
            </div>
            <div style={{flex:1,background:C.oliveBg,border:"1px solid "+C.oliveBorder,borderRadius:10,padding:"10px 12px",textAlign:"center"}}>
              <div style={{fontSize:11,color:C.olive,fontFamily:"'DM Mono',monospace"}}>{T.tripEarned}</div>
              <div style={{fontSize:16,fontWeight:700,color:C.olive,marginTop:2}}>💵 ${currentTrip.fare}</div>
            </div>
          </div>
          <div style={{fontSize:12,color:C.ink3,marginBottom:10}}>🏁 {currentTrip.to}</div>
          <button onClick={handleEndTrip} style={{width:"100%",background:C.oliveDark,border:"none",borderRadius:12,padding:"13px",fontSize:15,fontWeight:700,cursor:"pointer",color:"#fff"}}>{T.endTrip} ✓</button>
        </div>
      )}

      {/* TRIP PHASE: Rate passenger */}
      {tripPhase==="ended"&&(
        <div style={{...card({padding:20,margin:"0 16px 12px"})}}>
          <div style={{textAlign:"center",marginBottom:16}}>
            <div style={{fontSize:40,marginBottom:8}}>🎉</div>
            <div style={{fontSize:18,fontFamily:"'Playfair Display',serif",fontWeight:800}}>{lang==="ar"?"انتهت الرحلة!":"Trip Complete!"}</div>
            <div style={{fontSize:13,color:"#2d9e5f",marginTop:4}}>💵 ${currentTrip?.fare} {lang==="ar"?"نقداً":"cash"}</div>
          </div>
          <div style={{borderTop:"1px solid "+C.border,paddingTop:16,marginBottom:16}}>
            <div style={{fontSize:14,fontWeight:700,marginBottom:4}}>{T.ratePassenger}</div>
            <div style={{fontSize:12,color:C.ink3,marginBottom:12}}>{lang==="ar"?currentTrip?.name:currentTrip?.nameEn}</div>
            <div style={{display:"flex",justifyContent:"center",gap:6}}>
              {[1,2,3,4,5].map(s=>(
                <button key={s} onClick={()=>setPassengerRating(s)} onMouseEnter={()=>setHoveredPassStar(s)} onMouseLeave={()=>setHoveredPassStar(0)}
                  style={{background:"none",border:"none",cursor:"pointer",fontSize:36,filter:s<=(hoveredPassStar||passengerRating)?"none":"grayscale(1) opacity(0.2)",transform:s<=(hoveredPassStar||passengerRating)?"scale(1.1)":"scale(1)",transition:"all 0.12s"}}>⭐</button>
              ))}
            </div>
            {passengerRating>0&&<div style={{textAlign:"center",fontSize:12,color:C.olive,fontWeight:600,marginTop:8}}>{["","Poor","Fair","Good","Great","Excellent!"][passengerRating]}</div>}
          </div>
          <button onClick={handleNewTrip} style={{width:"100%",background:C.olive,border:"none",borderRadius:12,padding:"13px",fontSize:15,fontWeight:700,cursor:"pointer",color:"#fff"}}>{lang==="ar"?"رحلة جديدة →":"New Trip →"}</button>
        </div>
      )}

      {/* Live Map */}
      <div style={{position:"relative",margin:"0 0 0 0"}}>
        <LeafletMap height={200} lat={driverLat} lng={driverLng} zoom={14} rounded={false} badge={false}
          driverMarkers={driverStatus!=="offline"?[{lat:driverLat,lng:driverLng,name:driverForm.name||"You",status:statusLabels[driverStatus]}]:[]}
        />
        <div style={{position:"absolute",top:12,left:12,zIndex:500}}><WaseeBadge/></div>
        <div style={{position:"absolute",bottom:12,left:12,right:12,zIndex:500}}>
          <div style={{background:"rgba(242,240,235,0.95)",backdropFilter:"blur(12px)",borderRadius:12,padding:"10px 16px",border:"1px solid "+C.border,display:"flex",justifyContent:"space-between",alignItems:"center"}}>
            <div style={{display:"flex",alignItems:"center",gap:8}}>
              <div style={{width:10,height:10,borderRadius:"50%",background:statusColors[driverStatus],boxShadow:`0 0 0 3px ${statusColors[driverStatus]}30`}}/>
              <span style={{fontSize:13,fontWeight:700,color:statusColors[driverStatus]}}>{statusLabels[driverStatus]}</span>
            </div>
            {locationTracking&&<span style={{fontSize:10,color:C.olive,fontFamily:"'DM Mono',monospace",fontWeight:700}}>📍 LIVE</span>}
          </div>
        </div>
      </div>

      <div style={{padding:"14px 16px",display:"flex",flexDirection:"column",gap:12}}>
        {/* Go Online toggle */}
        {tripPhase==="idle"&&(
          <div style={{...card({padding:18})}}>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
              <div>
                <div style={{fontSize:15,fontWeight:700}}>{lang==="ar"?"وضع الاتصال":"Connection Mode"}</div>
                <div style={{fontSize:12,color:C.ink3,marginTop:2}}>{driverStatus==="offline"?(lang==="ar"?"اضغط لتبدأ الاستقبال":"Press to start receiving rides"):(lang==="ar"?"موقعك يُبث مباشرة":"Broadcasting live · ride request coming soon")}</div>
              </div>
              <button onClick={driverStatus==="offline"?startTracking:stopTracking}
                style={{background:driverStatus!=="offline"?C.olive:C.surface2,border:"1.5px solid "+(driverStatus!=="offline"?C.olive:C.border),borderRadius:28,padding:"10px 20px",cursor:"pointer",fontSize:13,fontWeight:700,color:driverStatus!=="offline"?"#fff":C.ink2,transition:"all 0.2s",minWidth:80}}>
                {driverStatus!=="offline"?(lang==="ar"?"إيقاف":"Go Offline"):(lang==="ar"?"تشغيل":"Go Online")}
              </button>
            </div>
          </div>
        )}

        {/* Earnings */}
        <div style={{...card({padding:18})}}>
          <div style={{fontSize:14,fontWeight:700,marginBottom:12}}>{lang==="ar"?"الأرباح":"Earnings"} <span style={{fontSize:11,color:C.ink3,fontWeight:400,fontFamily:"'DM Mono',monospace"}}>{lang==="ar"?"· نقد فقط":"· cash only"}</span></div>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10,marginBottom:12}}>
            {[
              {label:lang==="ar"?"اليوم":"Today",val:"$"+earnings.todayTotal.toFixed(2),icon:"💵"},
              {label:lang==="ar"?"هالأسبوع":"This Week",val:"$"+earnings.weekTotal.toFixed(2),icon:"📈"},
              {label:lang==="ar"?"الرحلات":"Trips",val:earnings.trips,icon:"🚗"},
              {label:lang==="ar"?"التقييم":"Rating",val:earnings.rating,icon:"⭐"},
            ].map(s=>(
              <div key={s.label} style={{background:C.surface2,border:"1px solid "+C.border,borderRadius:12,padding:12}}>
                <div style={{fontSize:18}}>{s.icon}</div>
                <div style={{fontSize:18,fontFamily:"'Playfair Display',serif",fontWeight:800,marginTop:4,color:C.ink}}>{s.val}</div>
                <div style={{fontSize:10,color:C.ink3,marginTop:2,fontFamily:"'DM Mono',monospace",textTransform:"uppercase"}}>{s.label}</div>
              </div>
            ))}
          </div>
          {/* Recent trip history */}
          {earnings.history.length>0&&(
            <div>
              <div style={lbl({marginBottom:8})}>{lang==="ar"?"آخر الرحلات":"Recent Trips"}</div>
              {earnings.history.map((h,i)=>(
                <div key={i} style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"8px 0",borderTop:"1px solid "+C.border}}>
                  <div>
                    <div style={{fontSize:12,fontWeight:600}}>{h.from} → {h.to}</div>
                    <div style={{fontSize:11,color:C.ink3}}>{h.dist} km · {h.ts}</div>
                  </div>
                  <div style={{fontSize:14,fontWeight:700,color:"#2d9e5f"}}>+${h.fare}</div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Vehicle summary */}
        <div style={{...card({padding:16,display:"flex",alignItems:"center",gap:14})}}>
          <div style={{width:48,height:48,borderRadius:12,background:C.oliveBg,border:"1px solid "+C.oliveBorder,display:"flex",alignItems:"center",justifyContent:"center",fontSize:24,flexShrink:0}}>🚗</div>
          <div style={{flex:1}}>
            <div style={{fontSize:14,fontWeight:700}}>{driverForm.carMake&&driverForm.carModel?`${driverForm.carMake} ${driverForm.carModel} ${driverForm.carYear}`:"Toyota Corolla 2019"}</div>
            <div style={{fontSize:12,color:C.ink3,marginTop:2,fontFamily:"'DM Mono',monospace"}}>{driverForm.plate||"DAM 0000"} · {driverForm.carColor||"White"}</div>
          </div>
          <div style={lbl({background:C.oliveBg,border:"1px solid "+C.oliveBorder,borderRadius:6,padding:"3px 8px",color:C.olive})}>{lang==="ar"?"نشط":"ACTIVE"}</div>
        </div>

        {/* City selector */}
        <div style={{...card({padding:16})}}>
          <div style={lbl({marginBottom:8})}>{lang==="ar"?"مدينة العمل":"Working City"}</div>
          <div style={{display:"flex",gap:6,overflowX:"auto",scrollbarWidth:"none"}}>
            {SYRIA_CITIES.slice(0,5).map(city=>(
              <button key={city.name} onClick={()=>{setDriverForm(f=>({...f,city:city.name}));setDriverLat(city.lat);setDriverLng(city.lng);}}
                style={{flexShrink:0,background:driverForm.city===city.name?C.olive:C.surface2,border:"1px solid "+(driverForm.city===city.name?C.olive:C.border),borderRadius:20,padding:"6px 14px",cursor:"pointer",fontSize:12,fontWeight:600,color:driverForm.city===city.name?"#fff":C.ink2,whiteSpace:"nowrap"}}>
                {city.icon} {lang==="ar"?city.ar:city.name}
              </button>
            ))}
          </div>
        </div>
      </div>
    </PageBg>
  );
}

// ─── MAIN APP ──────────────────────────────────────────────────────────────────
export default function App() {
  const [lang,setLang]=useState("ar");
  const T=TRANSLATIONS[lang];

  const [screen,setScreen]=useState("home");
  const [pickup,setPickup]=useState("");
  const [dropoff,setDropoff]=useState("");
  const [pickupCoords,setPickupCoords]=useState(SAVED[0]);
  const [dropoffCoords,setDropoffCoords]=useState(null);
  const [selectedRide,setSelectedRide]=useState(null);
  const [bookingStep,setBookingStep]=useState(0);
  const [driver,setDriver]=useState(null);
  const [rideProgress,setRideProgress]=useState(0);
  const [showPromo,setShowPromo]=useState(false);
  const [promoInput,setPromoInput]=useState("");
  const [appliedPromo,setAppliedPromo]=useState(null);
  const [rating,setRating]=useState(0);
  const [hoveredStar,setHoveredStar]=useState(0);
  const [surge]=useState(1.2);
  const [showSchedule,setShowSchedule]=useState(false);
  const [activeTab,setActiveTab]=useState("recent");
  const [dots,setDots]=useState(0);
  const [showCities,setShowCities]=useState(false);
  const [mapCity,setMapCity]=useState(SYRIA_CITIES[0]);
  const [showDriverPortal,setShowDriverPortal]=useState(false);
  const [showAuth,setShowAuth]=useState(false);
  const [authPhone,setAuthPhone]=useState("");
  const [authOtp,setAuthOtp]=useState("");
  const [authStep,setAuthStep]=useState(0); // 0=phone, 1=otp, 2=done
  const [currentUser,setCurrentUser]=useState(null); // {name,phone}
  const intervalRef=useRef(null);
  // Stable guest rider ID (generated once per session, replaced by real phone on sign-in)
  const guestRiderIdRef=useRef("guest-"+Math.random().toString(36).slice(2,10));

  // ── Backend simulation state ──────────────────────────────────
  // Trip store (persists during session)
  const [tripStore,setTripStore]=useState([]); // array of completed trips
  const [activeTripId,setActiveTripId]=useState(null);
  // Driver mode (toggled from driver dashboard)
  const [driverMode,setDriverMode]=useState(false);
  const [pendingRequest,setPendingRequest]=useState(null); // {id,pickup,dropoff,rider,price}
  const [driverTrip,setDriverTrip]=useState(null); // active trip from driver perspective
  const [driverTripPhase,setDriverTripPhase]=useState(null); // "navigating"|"in_trip"|null
  const [passengerRating,setPassengerRating]=useState(0);
  const [showPassengerRating,setShowPassengerRating]=useState(false);
  const [showSubscription,setShowSubscription]=useState(false);
  const [isSubscribed,setIsSubscribed]=useState(false);
  const [subscriptionMonth,setSubscriptionMonth]=useState(0); // 0=never,1=first,2+=ongoing

  // Match: when rider books, simulate a nearby driver sending a request notification
  const matchAndRequest=(tripData)=>{
    const id="TRIP-"+Date.now().toString(36).toUpperCase();
    const price=computePrice();
    const trip={id,pickup:tripData.pickup,dropoff:tripData.dropoff,
      pickupCoords:tripData.pickupCoords,dropoffCoords:tripData.dropoffCoords,
      price,timestamp:new Date().toISOString(),status:"pending"};
    setActiveTripId(id);
    // If driver mode is on in the same session, send them the request
    if(driverMode){
      setTimeout(()=>setPendingRequest({...trip,rider:currentUser?.name||(lang==="ar"?"راكب":"Rider")}),800);
    }
    return trip;
  };

  // Store completed trip
  const storeTrip=(tripId,extraData={})=>{
    setTripStore(prev=>[...prev,{id:tripId,completedAt:new Date().toISOString(),...extraData}]);
  };

  useEffect(()=>{
    if(bookingStep===2){
      const d=DRIVERS[Math.floor(Math.random()*DRIVERS.length)];setDriver(d);let p=0;
      intervalRef.current=setInterval(()=>{p+=2;setRideProgress(p);if(p>=100){clearInterval(intervalRef.current);setTimeout(()=>setBookingStep(3),500);}},150);
      return()=>clearInterval(intervalRef.current);
    }
  },[bookingStep]);
  useEffect(()=>{const t=setInterval(()=>setDots(d=>(d+1)%4),500);return()=>clearInterval(t);},[]);

  const startBooking=()=>{if(!pickup||!dropoff)return;setScreen("booking");setBookingStep(0);setAppliedPromo(null);};
  const confirmRide=async ()=>{
    const trip=matchAndRequest({pickup,dropoff,pickupCoords,dropoffCoords});
    setBookingStep(1);
    // Call the backend to create the ride; fall back gracefully if unavailable
    if(pickupCoords&&dropoffCoords){
      const { ok, data } = await apiFetch("/rides",{method:"POST",body:{
        riderId:currentUser?.phone||guestRiderIdRef.current,
        pickupLng:pickupCoords.lng, pickupLat:pickupCoords.lat,
        dropoffLng:dropoffCoords.lng, dropoffLat:dropoffCoords.lat,
      }});
      if(ok&&data?.ride?.id) setActiveTripId(data.ride.id);
    }
    setTimeout(()=>setBookingStep(2),1800);
  };
  // Distance-based pricing: 0.8$/km base + $3 Wasee service fee
  const calcDistKm=(a,b)=>{
    if(!a||!b)return 5; // default 5km
    const R=6371,dLat=(b.lat-a.lat)*Math.PI/180,dLng=(b.lng-a.lng)*Math.PI/180;
    const x=Math.sin(dLat/2)**2+Math.cos(a.lat*Math.PI/180)*Math.cos(b.lat*Math.PI/180)*Math.sin(dLng/2)**2;
    return R*2*Math.atan2(Math.sqrt(x),Math.sqrt(1-x));
  };
  const WASEE_FEE=3;
  const RATE_PER_KM=0.8;
  const computePrice=(opts={})=>{
    const km=calcDistKm(pickupCoords,dropoffCoords);
    const base=(km*RATE_PER_KM*surge).toFixed(2);
    const total=(parseFloat(base)+WASEE_FEE).toFixed(2);
    return {base:parseFloat(base),fee:WASEE_FEE,total:parseFloat(total),km:km.toFixed(1)};
  };
  const fmtPrice=(p)=>{const n=typeof p==="object"?p.total:p;return "$"+(typeof n==="number"?n.toFixed(2):n);};

  // Auth modal overlay
  const AuthOverlay = showAuth ? (
    <AuthModal lang={lang} onClose={()=>setShowAuth(false)} onSuccess={(user)=>{ setCurrentUser(user); setShowAuth(false); }}/>
  ) : null;

  // Driver portal overlay
  if(showDriverPortal) return (
    <DriverPortal onBack={()=>setShowDriverPortal(false)} lang={lang} pendingRideId={activeTripId}/>
  );

  const Nav=()=>(
    <div style={{position:"fixed",bottom:0,left:0,right:0,zIndex:500,background:"rgba(242,240,235,0.97)",backdropFilter:"blur(16px)"}}>
      <BlackStripe/>
      <div style={{display:"flex",padding:"10px 0 20px"}}>
        {[{id:"home",label:T.navRide,icon:"🚗"},{id:"activity",label:T.navActivity,icon:"📋"},{id:"wallet",label:T.navWallet,icon:"💵"},{id:"account",label:T.navAccount,icon:"👤"}].map(tab=>(
          <button key={tab.id} onClick={()=>{setScreen(tab.id);setBookingStep(0);}} style={{flex:1,background:"none",border:"none",cursor:"pointer",display:"flex",flexDirection:"column",alignItems:"center",gap:2}}>
            <span style={{fontSize:22,filter:screen===tab.id?"none":"grayscale(1) opacity(0.3)"}}>{tab.icon}</span>
            <span style={{fontSize:10,fontWeight:700,letterSpacing:"0.06em",fontFamily:"'DM Mono',monospace",color:screen===tab.id?C.olive:C.ink3}}>{tab.label}</span>
            {screen===tab.id&&<div style={{width:20,height:2.5,borderRadius:2,background:C.olive,marginTop:2}}/>}
          </button>
        ))}
      </div>
    </div>
  );

  // HOME
  if(screen==="home") return (
    <PageBg style={{paddingBottom:90}}>
      <link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600;700&family=DM+Mono:wght@400;500;600&family=Playfair+Display:wght@700;800&display=swap" rel="stylesheet"/>
      <div style={{background:C.bg,padding:"14px 16px 12px",display:"flex",justifyContent:"space-between",alignItems:"center"}}>
        <div>
          <div style={lbl({color:C.ink2,marginBottom:2,fontSize:9})}>{T.goodMorning}</div>
          <div style={{fontSize:28,fontFamily:"'Playfair Display',serif",fontWeight:800,color:C.ink,lineHeight:1.1}}>{T.name}</div>
        </div>
        <div style={{display:"flex",alignItems:"center",gap:8}}>
          <button onClick={()=>setShowCities(true)} style={{background:C.ink,border:"none",borderRadius:20,padding:"7px 13px",cursor:"pointer",display:"flex",alignItems:"center",gap:6}}>
            <span style={{fontSize:14}}>🗺</span>
            <span style={{fontSize:12,fontWeight:700,color:"#fff",fontFamily:"'DM Mono',monospace"}}>{mapCity.name}</span>
          </button>
          <div style={{width:42,height:42,borderRadius:"50%",background:C.olive,display:"flex",alignItems:"center",justifyContent:"center",fontSize:14,fontWeight:800,color:"#fff",border:"2.5px solid "+C.border,flexShrink:0}}>SA</div>
        </div>
      </div>

      <div style={{position:"relative"}}>
        <LeafletMap height={220} lat={mapCity.lat} lng={mapCity.lng} zoom={mapCity.zoom} rounded={false} badge={false}/>
        <div style={{position:"absolute",bottom:10,left:12,zIndex:410}}><WaseeBadge/></div>
        <div style={{position:"absolute",bottom:10,right:12,zIndex:410,background:"rgba(242,240,235,0.94)",backdropFilter:"blur(8px)",border:"1px solid "+C.border,borderRadius:8,padding:"5px 11px"}}>
          <span style={{fontSize:11,color:C.olive,fontFamily:"'DM Mono',monospace",fontWeight:700}}>⚡ {surge}x {T.surgeLabel}</span>
        </div>
      </div>

      {showCities&&(
        <div style={{position:"fixed",inset:0,zIndex:600,background:"rgba(0,0,0,0.4)"}} onClick={()=>setShowCities(false)}>
          <div style={{position:"absolute",top:200,left:16,right:16,...card(),padding:18,zIndex:610}} onClick={e=>e.stopPropagation()}>
            <div style={{fontSize:15,fontWeight:700,marginBottom:14}}>{T.chooseCity}</div>
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8}}>
              {SYRIA_CITIES.map(city=>(
                <button key={city.name} onClick={()=>{setMapCity(city);setShowCities(false);}}
                  style={{background:mapCity.name===city.name?C.olive:C.surface2,border:"1px solid "+(mapCity.name===city.name?C.olive:C.border),borderRadius:12,padding:"10px 12px",cursor:"pointer",textAlign:"left",display:"flex",alignItems:"center",gap:8}}>
                  <span style={{fontSize:18}}>{city.icon}</span>
                  <div>
                    <div style={{fontSize:13,fontWeight:700,color:mapCity.name===city.name?"#fff":C.ink}}>{lang==="ar"?city.ar:city.name}</div>
                    <div style={{fontSize:11,color:mapCity.name===city.name?"rgba(255,255,255,0.7)":C.ink3}}>{lang==="ar"?city.name:city.ar}</div>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      <div style={{padding:"0 14px",marginTop:12,position:"relative",zIndex:20}}>
        <div style={{...card(),padding:16,boxShadow:"0 6px 28px rgba(0,0,0,0.10)"}}>
          <div style={{display:"flex",alignItems:"center",gap:10,background:C.surface2,borderRadius:12,padding:"12px 14px",border:"1px solid "+C.border,marginBottom:10}}>
            <div style={{width:10,height:10,borderRadius:"50%",background:C.olive,flexShrink:0}}/>
            <input value={pickup} onChange={e=>setPickup(e.target.value)} placeholder={T.yourLocation+" "+mapCity.ar}
              style={{background:"none",border:"none",outline:"none",color:C.ink,fontSize:14,flex:1,fontFamily:"'DM Sans',sans-serif"}}/>
            <span style={{fontSize:11,color:C.olive,fontWeight:700,fontFamily:"'DM Mono',monospace",cursor:"pointer",flexShrink:0}} onClick={()=>setPickup(T.yourLocation+" "+mapCity.ar)}>{T.gps}</span>
          </div>
          <div style={lbl({marginBottom:6})}>{T.dropoffLabel}</div>
          <div style={{display:"flex",alignItems:"center",gap:10,background:C.surface2,borderRadius:12,padding:"12px 14px",border:"1px solid "+C.border,marginBottom:14}}>
            <div style={{width:10,height:10,borderRadius:2,background:C.olive,flexShrink:0}}/>
            <input value={dropoff} onChange={e=>setDropoff(e.target.value)} placeholder={T.dropoffPlaceholder}
              style={{background:"none",border:"none",outline:"none",color:C.ink,fontSize:14,flex:1,fontFamily:"'DM Sans',sans-serif"}}/>
            {dropoff&&<span onClick={()=>setDropoff("")} style={{fontSize:18,color:C.ink3,cursor:"pointer",lineHeight:1}}>×</span>}
          </div>
          <div style={{display:"flex",gap:8}}>
            <button onClick={startBooking}
              style={{flex:1,background:pickup&&dropoff?C.olive:C.surface2,border:"1px solid "+(pickup&&dropoff?C.olive:C.border),borderRadius:12,padding:"14px",cursor:pickup&&dropoff?"pointer":"default",fontSize:15,fontWeight:700,color:pickup&&dropoff?"#fff":C.ink3,transition:"all 0.2s"}}>
              {pickup&&dropoff?T.findRide:T.enterDest}
            </button>
            <button onClick={()=>setShowSchedule(true)} style={{background:C.surface2,border:"1px solid "+C.border,borderRadius:12,padding:"14px 16px",cursor:"pointer",fontSize:18}}>🕐</button>
          </div>
        </div>

        {showSchedule&&(
          <div style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.4)",zIndex:700,display:"flex",alignItems:"flex-end"}} onClick={()=>setShowSchedule(false)}>
            <div style={{background:C.surface,width:"100%",borderRadius:"24px 24px 0 0",padding:28,boxSizing:"border-box"}} onClick={e=>e.stopPropagation()}>
              <BlackStripe/>
              <div style={{fontSize:22,fontFamily:"'Playfair Display',serif",fontWeight:800,margin:"16px 0 6px"}}>{T.scheduleTitle}</div>
              <input type="datetime-local" onChange={()=>{}}
                style={{width:"100%",background:C.surface2,border:"1px solid "+C.border,borderRadius:12,padding:"12px 14px",color:C.ink,fontSize:15,boxSizing:"border-box",outline:"none"}}/>
              <button onClick={()=>setShowSchedule(false)}
                style={{width:"100%",marginTop:14,background:C.olive,border:"none",borderRadius:12,padding:14,color:"#fff",fontSize:15,fontWeight:700,cursor:"pointer"}}>{T.confirm}</button>
            </div>
          </div>
        )}

        <div style={{marginTop:20}}>
          <div style={lbl({marginBottom:10})}>{T.savedPlaces}</div>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8}}>
            {SAVED.map(p=>(
              <button key={p.label} onClick={()=>{setDropoff(p.sub);setDropoffCoords(p);}}
                style={{...card({padding:"13px 14px",cursor:"pointer",textAlign:"left",display:"flex",alignItems:"center",gap:10})}}>
                <span style={{fontSize:22}}>{p.icon}</span>
                <div>
                  <div style={{fontSize:14,fontWeight:700,color:C.ink}}>{lang==="ar"?p.ar:p.label}</div>
                  <div style={{fontSize:11,color:C.ink3,marginTop:1}}>{lang==="ar"?p.label:p.ar}</div>
                </div>
              </button>
            ))}
          </div>
        </div>

        <div style={{marginTop:20}}>
          <div style={lbl({marginBottom:10})}>{T.popularInSyria}</div>
          <div style={{display:"flex",gap:8,overflowX:"auto",paddingBottom:4,scrollbarWidth:"none"}}>
            {POPULAR.map(p=>(
              <button key={p.label} onClick={()=>{setDropoff(p.sub);setDropoffCoords(p);}}
                style={{flexShrink:0,...card({padding:"11px 13px",minWidth:148,cursor:"pointer",textAlign:"left",display:"flex",alignItems:"center",gap:9})}}>
                <span style={{fontSize:20}}>{p.icon}</span>
                <div>
                  <div style={{fontSize:13,fontWeight:700,color:C.ink}}>{lang==="ar"?p.ar:p.label}</div>
                  <div style={{fontSize:11,color:C.ink3,marginTop:2}}>{lang==="ar"?p.label:p.sub}</div>
                </div>
              </button>
            ))}
          </div>
        </div>

        {PROMOS.map(pr=>(
          <div key={pr.code} style={{marginTop:10,...card({padding:"13px 16px",display:"flex",justifyContent:"space-between",alignItems:"center"})}}>
            <div style={{display:"flex",alignItems:"center",gap:10}}>
              <div style={{background:C.olive,borderRadius:8,padding:"4px 9px",flexShrink:0}}>
                <span style={{fontSize:11,fontFamily:"'DM Mono',monospace",fontWeight:700,color:"#fff"}}>{pr.code}</span>
              </div>
              <div style={{fontSize:13,color:C.ink}}>{lang==="ar"?pr.descAr:pr.descEn}</div>
            </div>
            <span style={{fontSize:11,color:C.ink3,flexShrink:0,marginLeft:8}}>{T.expiresOn} {pr.expires}</span>
          </div>
        ))}
      </div>
      {AuthOverlay}
      <Nav/>
    </PageBg>
  );

  // BOOKING
  if(screen==="booking"){
    if(bookingStep===3) return (
      <PageBg style={{display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",padding:28,textAlign:"center"}}>
        <link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;600;700&family=Playfair+Display:wght@700;800&display=swap" rel="stylesheet"/>
        <div style={{fontSize:72,marginBottom:16}}>🎉</div>
        <div style={{fontSize:30,fontFamily:"'Playfair Display',serif",fontWeight:800,marginBottom:4}}>{T.arrived}</div>
        <div style={{fontSize:14,color:C.ink2,marginBottom:28}}>{T.greatRide} {driver&&driver.name}</div>
        <div style={{...card({padding:24,width:"100%",maxWidth:340,marginBottom:24,boxSizing:"border-box"})}}>
          <BlackStripe/>
          <div style={{marginTop:16}}>
            <div style={lbl({marginBottom:4})}>{T.totalFare}</div>
            <div style={{fontSize:44,fontFamily:"'Playfair Display',serif",fontWeight:800,color:C.ink}}>
              {fmtPrice(computePrice().total)}
            </div>
            <div style={{fontSize:12,color:C.ink3,marginTop:4}}>{lang==="ar"?"دُفع نقداً للسائق":"Paid in cash to driver"}</div>
          </div>
          <div style={{borderTop:"1px solid "+C.border,marginTop:18,paddingTop:18}}>
            <div style={{fontSize:14,fontWeight:700,marginBottom:4}}>{T.rateDriver}</div>
            <div style={{fontSize:12,color:C.ink3,marginBottom:14}}>{driver&&driver.name}</div>
            <div style={{display:"flex",justifyContent:"center",gap:4}}>
              {[1,2,3,4,5].map(s=>(
                <button key={s} onClick={()=>setRating(s)} onMouseEnter={()=>setHoveredStar(s)} onMouseLeave={()=>setHoveredStar(0)}
                  style={{background:"none",border:"none",cursor:"pointer",fontSize:40,filter:s<=(hoveredStar||rating)?"none":"grayscale(1) opacity(0.18)",transition:"transform 0.1s, filter 0.15s",transform:s<=(hoveredStar||rating)?"scale(1.15)":"scale(1)"}}>⭐</button>
              ))}
            </div>
            {rating>0&&<div style={{textAlign:"center",marginTop:10,fontSize:13,color:C.olive,fontWeight:600}}>
              {lang==="ar"
                ? ["","ضعيف","مقبول","كويس","زاكي","ممتاز!"][rating]
                : ["","Poor","Fair","Good","Great","Excellent!"][rating]}
            </div>}
          </div>
        </div>
        <div style={{display:"flex",gap:10,width:"100%",maxWidth:340}}>
          <button onClick={()=>{
              storeTrip(activeTripId,{fare:computePrice().total,pickup,dropoff,driver:driver?.name,rating});
              setScreen("home");setBookingStep(0);setPickup("");setDropoff("");setRating(0);setRideProgress(0);
            }}
            style={{flex:1,background:C.olive,border:"none",borderRadius:12,padding:15,fontSize:15,fontWeight:700,cursor:"pointer",color:"#fff"}}>{T.doneBtnLabel}</button>
          <button style={{flex:1,background:C.surface2,border:"1px solid "+C.border,borderRadius:12,padding:15,fontSize:14,cursor:"pointer",color:C.ink2}}>{T.receipt}</button>
        </div>
      </PageBg>
    );

    if(bookingStep===2) return (
      <PageBg>
        <link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;600;700&family=Playfair+Display:wght@700;800&display=swap" rel="stylesheet"/>
        {/* Driver approaches pickup, then rides to dropoff */}
        {(()=>{
          const dest = dropoffCoords||POPULAR[0];
          const pct = rideProgress/100;
          const phase1end = 0.4; // first 40% = approaching
          let dLat, dLng;
          if(pct < phase1end){
            const t = pct/phase1end;
            const fromLat = pickupCoords.lat + (Math.sin(t*3)*0.003);
            const fromLng = pickupCoords.lng + (Math.cos(t*3)*0.003);
            dLat = fromLat + (pickupCoords.lat - fromLat)*t;
            dLng = fromLng + (pickupCoords.lng - fromLng)*t;
          } else {
            const t = (pct-phase1end)/(1-phase1end);
            dLat = pickupCoords.lat + (dest.lat - pickupCoords.lat)*t;
            dLng = pickupCoords.lng + (dest.lng - pickupCoords.lng)*t;
          }
          return <LeafletMap height={230}
            lat={(pickupCoords.lat+dest.lat)/2} lng={(pickupCoords.lng+dest.lng)/2}
            zoom={11} markerA={pickupCoords} markerB={dest} rounded={false} badge={false}
            driverMarkers={driver?[{lat:dLat,lng:dLng,name:driver.name,status:"en route"}]:[]}
          />;
        })()}
        <BlackStripe/>
        <div style={{padding:"14px 16px 24px"}}>
          {driver&&(
            <div style={card({padding:20})}>
              {/* Phase banner */}
              <div style={{background:rideProgress<40?C.oliveBg:"rgba(45,158,95,0.08)",border:"1px solid "+(rideProgress<40?C.oliveBorder:"rgba(45,158,95,0.25)"),borderRadius:12,padding:"10px 14px",marginBottom:16,display:"flex",justifyContent:"space-between",alignItems:"center"}}>
                <div style={{display:"flex",alignItems:"center",gap:8}}>
                  <span style={{fontSize:18}}>{rideProgress<40?"🚗":rideProgress<70?"🛣️":"📍"}</span>
                  <span style={{fontSize:13,fontWeight:700,color:rideProgress<40?C.oliveDark:"#1a7a47"}}>
                    {rideProgress<40?T.approaching:rideProgress<70?T.enRoute:T.almostThere}{".".repeat(dots)}
                  </span>
                </div>
                <div style={{background:rideProgress<40?C.olive:"#2d9e5f",borderRadius:8,padding:"4px 10px"}}>
                  <span style={{fontSize:12,fontFamily:"'DM Mono',monospace",fontWeight:700,color:"#fff"}}>{Math.ceil((100-rideProgress)/10)} {T.minutes}</span>
                </div>
              </div>

              {/* Progress track */}
              <div style={{marginBottom:16}}>
                <div style={{display:"flex",justifyContent:"space-between",marginBottom:4}}>
                  <span style={lbl()}>{lang==="ar"?"وصول السائق":"Driver Arrival"}</span>
                  <span style={lbl()}>{lang==="ar"?"الوجهة":"Destination"}</span>
                </div>
                <div style={{position:"relative",height:8,background:C.surface2,borderRadius:4}}>
                  <div style={{height:"100%",background:"linear-gradient(90deg,"+C.olive+",#2d9e5f)",borderRadius:4,width:rideProgress+"%",transition:"width 0.15s"}}/>
                  {/* Driver dot on track */}
                  <div style={{position:"absolute",top:"50%",left:rideProgress+"%",transform:"translate(-50%,-50%)",width:16,height:16,borderRadius:"50%",background:C.olive,border:"3px solid #fff",boxShadow:"0 2px 6px rgba(0,0,0,0.2)",transition:"left 0.15s"}}/>
                </div>
                <div style={{display:"flex",justifyContent:"space-between",marginTop:4}}>
                  <span style={{fontSize:11,color:C.ink3}}>📍 {lang==="ar"?"موقعك":"Your location"}</span>
                  <span style={{fontSize:11,color:C.ink3}}>🏁 {dropoff||(lang==="ar"?"الوجهة":"Dest.")}</span>
                </div>
              </div>

              {/* Driver info */}
              <div style={{display:"flex",alignItems:"center",gap:14,marginBottom:16,paddingTop:12,borderTop:"1px solid "+C.border}}>
                <div style={{width:52,height:52,borderRadius:"50%",background:C.olive,display:"flex",alignItems:"center",justifyContent:"center",fontSize:15,fontWeight:800,color:"#fff",flexShrink:0}}>{driver.avatar}</div>
                <div style={{flex:1}}>
                  <div style={{fontSize:17,fontFamily:"'Playfair Display',serif",fontWeight:800}}>{driver.name}</div>
                  <div style={{fontSize:12,color:C.ink2,marginTop:1}}>{driver.car}</div>
                  <div style={{display:"flex",alignItems:"center",gap:6,marginTop:2}}>
                    <span style={{fontSize:11,fontFamily:"'DM Mono',monospace",fontWeight:700,color:C.ink,letterSpacing:"0.05em"}}>{driver.plate}</span>
                  </div>
                </div>
                <div style={{textAlign:"right"}}>
                  <div style={{fontSize:20,fontWeight:800,color:C.ink}}>⭐ {driver.rating}</div>
                  <div style={lbl({marginTop:2})}>{driver.trips.toLocaleString()} {lang==="ar"?"رحلة":"trips"}</div>
                </div>
              </div>

              {/* Action buttons */}
              <div style={{display:"flex",gap:8,marginBottom:12}}>
                {[{icon:"📞",key:"call"},{icon:"💬",key:"chat"},{icon:"🛡️",key:"safety"},{icon:"🔗",key:"share"}].map(a=>(
                  <button key={a.key} style={{flex:1,background:C.surface2,border:"1px solid "+C.border,borderRadius:12,padding:"10px 4px",cursor:"pointer",textAlign:"center"}}>
                    <div style={{fontSize:20}}>{a.icon}</div>
                    <div style={lbl({marginTop:4})}>{T[a.key]}</div>
                  </button>
                ))}
              </div>
              <button onClick={()=>{clearInterval(intervalRef.current);setBookingStep(0);setScreen("home");}}
                style={{width:"100%",background:C.oliveBg,border:"1px solid "+C.oliveBorder,borderRadius:12,padding:"12px",color:C.oliveDark,fontSize:14,fontWeight:600,cursor:"pointer"}}>{T.cancelRide}</button>
            </div>
          )}
        </div>
      </PageBg>
    );

    if(bookingStep===1) return (
      <PageBg style={{display:"flex",alignItems:"center",justifyContent:"center",flexDirection:"column",gap:12}}>
        <link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;600;700&family=Playfair+Display:wght@700;800&display=swap" rel="stylesheet"/>
        <div style={{fontSize:56,animation:"spin 1s linear infinite"}}>⏳</div>
        <div style={{fontSize:24,fontFamily:"'Playfair Display',serif",fontWeight:800}}>{T.findingDriver}{".".repeat(dots)}</div>
        <div style={{fontSize:13,color:C.ink3}}>{T.searchingIn} {lang==="ar"?mapCity.ar:mapCity.name}</div>
        <style>{"@keyframes spin{from{transform:rotate(0)}to{transform:rotate(360deg)}}"}</style>
      </PageBg>
    );

    return (
      <PageBg>
        <link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;600;700&family=DM+Mono:wght@400;600&family=Playfair+Display:wght@700;800&display=swap" rel="stylesheet"/>
        <div style={{position:"relative"}}>
          <LeafletMap height={180} lat={mapCity.lat} lng={mapCity.lng} zoom={mapCity.zoom} markerA={pickupCoords} markerB={dropoffCoords} rounded={false} badge={false}/>
          <button onClick={()=>setScreen("home")} style={{position:"absolute",top:14,left:14,background:C.surface,border:"1px solid "+C.border,borderRadius:"50%",width:36,height:36,cursor:"pointer",fontSize:18,display:"flex",alignItems:"center",justifyContent:"center",zIndex:500}}>←</button>
        </div>
        <BlackStripe/>
        <div style={{padding:"14px 16px 110px"}}>
          <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:14}}>
            <div style={{fontSize:20,fontFamily:"'Playfair Display',serif",fontWeight:800}}>
              {lang==="ar"?"تأكيد الرحلة":"Confirm Ride"}
            </div>
            <div style={{background:C.oliveBg,border:"1px solid "+C.oliveBorder,borderRadius:8,padding:"4px 10px"}}>
              <span style={{fontSize:11,color:C.olive,fontFamily:"'DM Mono',monospace",fontWeight:700}}>⚡ {surge}x {T.surgeLabel}</span>
            </div>
          </div>
          {/* Route summary */}
          <div style={{...card({padding:16,marginBottom:14})}}>
            <div style={{display:"flex",alignItems:"center",gap:12}}>
              <div style={{display:"flex",flexDirection:"column",alignItems:"center",gap:4,flexShrink:0}}>
                <div style={{width:10,height:10,borderRadius:"50%",background:C.olive}}/>
                <div style={{width:2,height:28,background:C.border}}/>
                <div style={{width:10,height:10,borderRadius:2,background:C.oliveDark}}/>
              </div>
              <div style={{flex:1}}>
                <div style={{fontSize:14,fontWeight:600,marginBottom:10}}>{pickup||"—"}</div>
                <div style={{fontSize:14,color:C.ink2}}>{dropoff||"—"}</div>
              </div>
              <div style={{textAlign:"right",flexShrink:0}}>
                <div style={{fontSize:20,fontWeight:800,fontFamily:"'Playfair Display',serif",color:C.ink}}>
                  {(pickup&&dropoff)?("$"+computePrice().total.toFixed(2)):"—"}
                </div>
                <div style={{fontSize:10,color:C.ink3,fontFamily:"'DM Mono',monospace"}}>
                  {(pickup&&dropoff)?(computePrice().km+" km · $3 "+(lang==="ar"?"رسوم واصي":"Wasee fee")):(lang==="ar"?"أدخل الوجهة لمعرفة السعر":"Enter destination for price")}
                </div>
                <div style={{fontSize:11,color:C.ink3,fontFamily:"'DM Mono',monospace",marginTop:2}}>~5 {T.minutes}</div>
              </div>
            </div>
          </div>
          <div style={{...card({padding:14,marginTop:14,display:"flex",alignItems:"center",gap:12})}}>
            <span style={{fontSize:22}}>💵</span>
            <div style={{flex:1}}>
              <div style={{fontSize:13,fontWeight:700}}>{lang==="ar"?"الدفع نقداً":"Cash Payment"}</div>
              <div style={{fontSize:11,color:C.ink3,marginTop:1}}>{lang==="ar"?"ادفع للسائق عند الوصول":"Pay the driver upon arrival"}</div>
            </div>
            <div style={{...lbl({background:C.oliveBg,border:"1px solid "+C.oliveBorder,borderRadius:6,padding:"3px 8px",color:C.olive})}}>
              {lang==="ar"?"نقد":"CASH"}
            </div>
          </div>
          <button onClick={confirmRide}
            style={{width:"100%",marginTop:12,background:C.olive,border:"none",borderRadius:14,padding:"16px",fontSize:15,fontWeight:700,cursor:"pointer",color:"#fff",transition:"all 0.2s"}}>
            {lang==="ar"?"تأكيد الرحلة →":"Confirm Ride →"}
          </button>
        </div>
      </PageBg>
    );
  }

  // ACTIVITY
  if(screen==="activity") return (
    <PageBg style={{paddingBottom:100}}>
      <link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;600;700&family=DM+Mono:wght@400;600&family=Playfair+Display:wght@700;800&display=swap" rel="stylesheet"/>
      <BlackStripe/>
      <div style={{padding:"24px 16px 0"}}>
        <div style={{fontSize:28,fontFamily:"'Playfair Display',serif",fontWeight:800,marginBottom:16}}>{T.activityTitle}</div>
        <div style={{display:"flex",gap:8,marginBottom:20}}>
          <button onClick={()=>setActiveTab("recent")} style={pill(activeTab==="recent")}>{T.recents}</button>
          <button onClick={()=>setActiveTab("upcoming")} style={pill(activeTab==="upcoming")}>{T.upcoming}</button>
        </div>
        {activeTab==="recent"?(
          <div style={{display:"flex",flexDirection:"column",gap:10}}>
            {ACTIVITY.map((a,i)=>(
              <div key={i} style={card({padding:16})}>
                <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:10}}>
                  <span style={lbl()}>{lang==="ar"?a.dateAr:a.dateEn}</span>
                  <div style={{display:"flex",alignItems:"center",gap:8}}>
                    <span style={{fontSize:11,color:C.olive,fontFamily:"'DM Mono',monospace",fontWeight:700}}>✓ {T.done}</span>
                    <span style={{fontSize:16,fontWeight:800,color:C.ink}}>{a.fare}</span>
                  </div>
                </div>
                <div style={{display:"flex",alignItems:"center",gap:12,marginBottom:10}}>
                  <div style={{display:"flex",flexDirection:"column",alignItems:"center",gap:2,flexShrink:0}}>
                    <div style={{width:9,height:9,borderRadius:"50%",background:C.ink}}/>
                    <div style={{width:1.5,height:20,background:C.border}}/>
                    <div style={{width:9,height:9,borderRadius:2,background:C.ink}}/>
                  </div>
                  <div>
                    <div style={{fontSize:15,fontWeight:600}}>{lang==="ar"?a.fromAr:a.fromEn}</div>
                    <div style={{fontSize:15,color:C.ink2,marginTop:5}}>{lang==="ar"?a.toAr:a.toEn}</div>
                  </div>
                </div>
                <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",paddingTop:10,borderTop:"1px solid "+C.border}}>
                  <span style={{fontSize:12,color:C.ink3}}>{a.driver}</span>
                  <div style={{display:"flex",gap:8}}>
                    <button style={{background:C.surface,border:"1px solid "+C.border,borderRadius:8,padding:"6px 12px",cursor:"pointer",fontSize:13,color:C.ink2}}>{T.receipt}</button>
                    <button onClick={()=>{setPickup(lang==="ar"?a.fromAr:a.fromEn);setDropoff(lang==="ar"?a.toAr:a.toEn);setScreen("home");}}
                      style={{background:C.olive,border:"none",borderRadius:8,padding:"6px 14px",cursor:"pointer",fontSize:13,color:"#fff",fontWeight:600}}>{T.rebook}</button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ):(
          <div style={{textAlign:"center",padding:"60px 20px",color:C.ink3}}>
            <div style={{fontSize:48,marginBottom:12}}>🕐</div>
            <div style={{fontSize:16,fontWeight:700,color:C.ink2,marginBottom:4}}>{T.noUpcoming}</div>
          </div>
        )}
      </div>
      <Nav/>
    </PageBg>
  );

  // WALLET
  if(screen==="wallet") return (
    <PageBg style={{paddingBottom:100}}>
      <link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;600;700&family=DM+Mono:wght@400;600&family=Playfair+Display:wght@700;800&display=swap" rel="stylesheet"/>
      <BlackStripe/>
      <div style={{padding:"24px 16px 0"}}>
        <div style={{fontSize:28,fontFamily:"'Playfair Display',serif",fontWeight:800,marginBottom:20}}>{T.walletTitle}</div>
        <div style={{background:"linear-gradient(135deg,"+C.oliveDark+","+C.olive+")",borderRadius:20,padding:24,marginBottom:14,position:"relative",overflow:"hidden"}}>
          <div style={{position:"absolute",right:-20,top:-20,width:100,height:100,borderRadius:"50%",background:"rgba(255,255,255,0.07)"}}/>
          <div style={{fontSize:36,marginBottom:8}}>💵</div>
          <div style={{fontSize:24,fontFamily:"'Playfair Display',serif",fontWeight:800,color:"#fff",margin:"4px 0"}}>
            {lang==="ar"?"الدفع نقداً فقط":"Cash Only"}
          </div>
          <div style={{fontSize:13,color:"rgba(255,255,255,0.7)",marginTop:4}}>
            {lang==="ar"?"تُدفع جميع الرحلات نقداً للسائق":"All rides paid in cash to the driver"}
          </div>
        </div>
        <div style={card({padding:20,marginBottom:12})}>
          <div style={{fontSize:15,fontWeight:700,marginBottom:14}}>{lang==="ar"?"طريقة الدفع":"Payment Method"}</div>
          <div style={{display:"flex",alignItems:"center",gap:14,padding:"14px",background:C.oliveBg,borderRadius:12,border:"1px solid "+C.oliveBorder}}>
            <span style={{fontSize:32}}>💵</span>
            <div>
              <div style={{fontSize:15,fontWeight:700}}>{lang==="ar"?"نقد فقط":"Cash Only"}</div>
              <div style={{fontSize:12,color:C.ink2,marginTop:2}}>{lang==="ar"?"تُدفع جميع الرحلات نقداً للسائق عند الوصول":"All rides are paid in cash to the driver on arrival"}</div>
            </div>
          </div>
        </div>
        <div style={card({padding:20,marginBottom:12})}>
          <div style={{fontSize:15,fontWeight:700,marginBottom:14}}>{T.promos}</div>
          {PROMOS.map(pr=>(
            <div key={pr.code} style={{background:C.oliveBg,border:"1px solid "+C.oliveBorder,borderRadius:12,padding:"12px 14px",marginBottom:8,display:"flex",justifyContent:"space-between",alignItems:"center"}}>
              <div style={{display:"flex",alignItems:"center",gap:10}}>
                <div style={{background:C.olive,borderRadius:6,padding:"3px 8px"}}>
                  <span style={{fontSize:11,fontFamily:"'DM Mono',monospace",fontWeight:700,color:"#fff"}}>{pr.code}</span>
                </div>
                <div style={{fontSize:12,color:C.ink}}>{lang==="ar"?pr.descAr:pr.descEn}</div>
              </div>
              <span style={{fontSize:11,color:C.ink3}}>{T.expiresOn} {pr.expires}</span>
            </div>
          ))}
        </div>
        <div style={card({padding:20})}>
          <div style={{fontSize:15,fontWeight:700,marginBottom:14}}>{T.thisMonth}</div>
          {(()=>{
            const riderTrips=tripStore.filter(t=>!t.asDriver);
            const total=riderTrips.reduce((s,t)=>s+(t.fare||0),0);
            const avg=riderTrips.length?total/riderTrips.length:0;
            return (
              <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10}}>
                {[
                  {icon:"💸",label:lang==="ar"?"المصاريف":"Total Spent",val:"$"+total.toFixed(2)},
                  {icon:"🚗",label:lang==="ar"?"عدد الرحلات":"Rides Taken",val:riderTrips.length},
                  {icon:"📊",label:lang==="ar"?"متوسط الرحلة":"Avg Fare",val:riderTrips.length?"$"+avg.toFixed(2):"—"},
                  {icon:"📍",label:lang==="ar"?"آخر رحلة":"Last Ride",val:riderTrips.length?riderTrips[riderTrips.length-1].dropoff?.split(",")[0]||"—":"—"},
                ].map(s=>(
                  <div key={s.label} style={{background:C.surface2,border:"1px solid "+C.border,borderRadius:14,padding:"14px"}}>
                    <div style={{fontSize:22}}>{s.icon}</div>
                    <div style={{fontSize:18,fontWeight:800,fontFamily:"'Playfair Display',serif",marginTop:6,color:C.ink,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{s.val}</div>
                    <div style={{fontSize:11,color:C.ink3,marginTop:2}}>{s.label}</div>
                  </div>
                ))}
              </div>
            );
          })()}
          {tripStore.filter(t=>!t.asDriver).length>0&&(
            <div style={{marginTop:14,borderTop:"1px solid "+C.border,paddingTop:14}}>
              <div style={{fontSize:12,fontWeight:700,color:C.ink3,fontFamily:"'DM Mono',monospace",textTransform:"uppercase",marginBottom:10}}>
                {lang==="ar"?"آخر الرحلات":"Recent Trips"}
              </div>
              {tripStore.filter(t=>!t.asDriver).slice(-4).reverse().map((t,i,arr)=>(
                <div key={i} style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"10px 0",borderBottom:i<arr.length-1?"1px solid "+C.border:"none"}}>
                  <div style={{flex:1,minWidth:0}}>
                    <div style={{fontSize:13,fontWeight:600,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{t.pickup} → {t.dropoff}</div>
                    <div style={{fontSize:11,color:C.ink3}}>{new Date(t.completedAt).toLocaleDateString([],{month:"short",day:"numeric"})}</div>
                  </div>
                  <div style={{fontSize:14,fontWeight:700,color:C.ink,marginLeft:12}}>💵 ${t.fare?.toFixed(2)||"—"}</div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
      <Nav/>
    </PageBg>
  );

  // ACCOUNT
  if(screen==="account") return (
    <PageBg style={{paddingBottom:100}}>
      <link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;600;700&family=DM+Mono:wght@400;600&family=Playfair+Display:wght@700;800&display=swap" rel="stylesheet"/>
      <LeafletMap height={160} lat={34.8021} lng={38.9968} zoom={6} rounded={false} badge={true}/>
      <BlackStripe/>
      <div style={{padding:"20px 16px 0"}}>
        {/* Sign In banner if not logged in */}
        {!currentUser&&(
          <button onClick={()=>setShowAuth(true)}
            style={{width:"100%",marginBottom:16,background:C.olive,border:"none",borderRadius:14,padding:"14px 20px",cursor:"pointer",display:"flex",alignItems:"center",gap:14,textAlign:"left"}}>
            <div style={{width:44,height:44,borderRadius:"50%",background:"rgba(255,255,255,0.2)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:20}}>👤</div>
            <div style={{flex:1}}>
              <div style={{fontSize:15,fontWeight:700,color:"#fff"}}>{T.signIn} / {T.createAccount}</div>
              <div style={{fontSize:12,color:"rgba(255,255,255,0.7)",marginTop:2}}>{lang==="ar"?"سجل للحصول على رحلات أسرع":"Sign up for faster rides"}</div>
            </div>
            <span style={{color:"rgba(255,255,255,0.8)",fontSize:20}}>›</span>
          </button>
        )}
        <div style={{display:"flex",alignItems:"center",gap:16,marginBottom:22}}>
          <div style={{width:72,height:72,borderRadius:"50%",background:C.olive,display:"flex",alignItems:"center",justifyContent:"center",fontSize:22,fontWeight:800,color:"#fff",flexShrink:0,border:"3px solid #fff",boxShadow:"0 0 0 3px "+C.olive}}>
            {currentUser?currentUser.name.slice(0,2).toUpperCase():"GU"}
          </div>
          <div>
            <div style={{fontSize:24,fontFamily:"'Playfair Display',serif",fontWeight:800}}>{currentUser?currentUser.name:T.name}</div>
            <div style={{fontSize:13,color:C.ink2}}>{currentUser?currentUser.phone:(lang==="ar"?"سجّل الدخول للمتابعة":"Sign in to continue")}</div>
            <div style={{fontSize:12,color:C.olive,marginTop:3,fontFamily:"'DM Mono',monospace",fontWeight:700}}>⭐ 4.94 · {lang==="ar"?"دمشق":"Damascus"}</div>
          </div>
        </div>
        <div style={{display:"flex",gap:8,marginBottom:16}}>
          {[{key:"totalRides",val:"247"},{key:"since",val:"2023"},{key:"cities",val:"4"}].map(s=>(
            <div key={s.key} style={{flex:1,...card({padding:"14px 10px",textAlign:"center"})}}>
              <div style={{fontSize:22,fontFamily:"'Playfair Display',serif",fontWeight:800,color:C.ink}}>{s.val}</div>
              <div style={lbl({marginTop:3})}>{T[s.key]}</div>
            </div>
          ))}
        </div>
        <div style={{background:"linear-gradient(135deg,"+C.oliveDark+","+C.olive+")",borderRadius:20,padding:20,marginBottom:14,position:"relative",overflow:"hidden"}}>
          <div style={{position:"absolute",right:-16,top:-16,width:90,height:90,borderRadius:"50%",background:"rgba(255,255,255,0.07)"}}/>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
            <div>
              <div style={lbl({color:"rgba(255,255,255,0.4)"})}>{T.memberPass}</div>
              <div style={{fontSize:20,fontFamily:"'Playfair Display',serif",fontWeight:800,color:"#fff",marginTop:4}}>{T.goldMember}</div>
              <div style={{fontSize:12,color:"rgba(255,255,255,0.5)",marginTop:4}}>{T.memberPerks}</div>
            </div>
            <div style={{fontSize:36}}>🥇</div>
          </div>
          <div style={{marginTop:14,height:4,background:"rgba(255,255,255,0.15)",borderRadius:4}}>
            <div style={{width:"68%",height:"100%",background:"rgba(255,255,255,0.6)",borderRadius:4}}/>
          </div>
          <div style={{fontSize:11,color:"rgba(255,255,255,0.4)",marginTop:6,fontFamily:"'DM Mono',monospace"}}>680/1000 {T.ridesToPlatinum}</div>
        </div>

        {/* ── SETTINGS CARD ── */}
        <div style={{...card({overflow:"hidden",marginBottom:10})}}>
          <div style={{padding:"10px 16px",...lbl(),borderBottom:"1px solid "+C.border}}>{T.settingsTitle}</div>
          {/* Language toggle */}
          <div style={{padding:"16px",borderBottom:"1px solid "+C.border}}>
            <div style={{fontSize:13,fontWeight:600,color:C.ink,marginBottom:10}}>{T.languageSettings}</div>
            <div style={{display:"flex",gap:8}}>
              <button onClick={()=>setLang("ar")}
                style={{flex:1,background:lang==="ar"?C.olive:C.surface2,border:"1.5px solid "+(lang==="ar"?C.olive:C.border),borderRadius:12,padding:"12px 8px",cursor:"pointer",display:"flex",flexDirection:"column",alignItems:"center",gap:4,transition:"all 0.2s"}}>
                <span style={{fontSize:22}}>🇸🇾</span>
                <span style={{fontSize:13,fontWeight:700,color:lang==="ar"?"#fff":C.ink}}>العربية</span>
                <span style={{fontSize:11,color:lang==="ar"?"rgba(255,255,255,0.6)":C.ink3}}>Arabic</span>
                {lang==="ar"&&<div style={{fontSize:16,color:"#fff"}}>✓</div>}
              </button>
              <button onClick={()=>setLang("en")}
                style={{flex:1,background:lang==="en"?C.olive:C.surface2,border:"1.5px solid "+(lang==="en"?C.olive:C.border),borderRadius:12,padding:"12px 8px",cursor:"pointer",display:"flex",flexDirection:"column",alignItems:"center",gap:4,transition:"all 0.2s"}}>
                <span style={{fontSize:22}}>🇬🇧</span>
                <span style={{fontSize:13,fontWeight:700,color:lang==="en"?"#fff":C.ink}}>English</span>
                <span style={{fontSize:11,color:lang==="en"?"rgba(255,255,255,0.6)":C.ink3}}>الإنجليزية</span>
                {lang==="en"&&<div style={{fontSize:16,color:"#fff"}}>✓</div>}
              </button>
            </div>
          </div>
          {/* Drive with Wasee entry point */}
          <button onClick={()=>setShowDriverPortal(true)}
            style={{width:"100%",background:"none",border:"none",cursor:"pointer",display:"flex",alignItems:"center",gap:14,padding:"16px",textAlign:"left"}}>
            <div style={{width:42,height:42,borderRadius:12,background:C.oliveBg,border:"1px solid "+C.oliveBorder,display:"flex",alignItems:"center",justifyContent:"center",fontSize:22,flexShrink:0}}>🚘</div>
            <div style={{flex:1}}>
              <div style={{fontSize:15,fontWeight:700,color:C.ink}}>{T.driveWithWasee}</div>
              <div style={{fontSize:12,color:C.ink3,marginTop:1}}>{T.becomeDriver}</div>
            </div>
            <span style={{fontSize:16,color:C.olive}}>›</span>
          </button>
        </div>

        {[
          {sectionKey:"prefSection",  items:[{icon:"🔔",key:"notifications"},{icon:"🌍",key:"language"},{icon:"♿",key:"accessibility"}]},
          {sectionKey:"safetySection",items:[{icon:"🛡️",key:"emergency"},{icon:"📍",key:"shareTrip"},{icon:"🔐",key:"privacy"}]},
          {sectionKey:"supportSection",items:[{icon:"💬",key:"helpCenter"},{icon:"📝",key:"reportIssue"},{icon:"⭐",key:"rateWasee"}]},
        ].map(group=>(
          <div key={group.sectionKey} style={{...card({overflow:"hidden",marginBottom:10})}}>
            <div style={{padding:"10px 16px",...lbl(),borderBottom:"1px solid "+C.border}}>{T[group.sectionKey]}</div>
            {group.items.map((item,i)=>(
              <button key={item.key} style={{width:"100%",background:"none",border:"none",cursor:"pointer",display:"flex",alignItems:"center",gap:14,padding:"14px 16px",borderBottom:i<group.items.length-1?"1px solid "+C.border:"none",textAlign:"left"}}>
                <span style={{fontSize:20}}>{item.icon}</span>
                <span style={{flex:1,fontSize:15,color:C.ink}}>{T[item.key]}</span>
                <span style={{fontSize:16,color:C.ink3}}>›</span>
              </button>
            ))}
          </div>
        ))}
        <button onClick={()=>{ if(currentUser){ setCurrentUser(null); } else { setShowAuth(true); } }} style={{width:"100%",background:currentUser?C.oliveBg:"#fff",border:"1px solid "+(currentUser?C.oliveBorder:C.olive),borderRadius:14,padding:"14px",color:currentUser?C.oliveDark:C.olive,fontSize:15,fontWeight:600,cursor:"pointer",marginBottom:10}}>
          {currentUser?T.signOut:(T.signIn+" / "+T.createAccount)}
        </button>
      </div>
      {AuthOverlay}
      <Nav/>
    </PageBg>
  );

  return null;
}
