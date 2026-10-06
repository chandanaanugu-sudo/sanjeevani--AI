import React, { useState, useEffect, useRef } from 'react';
import { 
  Heart, 
  Calendar, 
  MapPin, 
  Clock, 
  Phone, 
  Share2, 
  Mic, 
  AlertTriangle, 
  Sparkles, 
  ArrowRight, 
  Leaf,
  Building2, 
  CheckCircle2, 
  X, 
  Compass,
  Ambulance as AmbulanceIcon,
  Timer,
  Volume2,
  RotateCcw
} from 'lucide-react';
import { MapContainer, TileLayer, Marker, Popup, Polyline } from 'react-leaflet';
import L from 'leaflet';
import { useHealthEcosystem } from '../../store/healthEcosystemStore';

// ==========================================
// 🎵 ROBUST AUDIO SYNTHESIZER
// ==========================================
function playSuccessDing() {
  try {
    const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (!AudioCtx) return;
    const ctx = new AudioCtx();

    const triggerChime = () => {
      const now = ctx.currentTime;
      // High-clarity 4-note celebration chime (C5 -> E5 -> G5 -> C6)
      const notes = [
        { freq: 523.25, time: 0, dur: 0.22, vol: 0.45 },     // C5
        { freq: 659.25, time: 0.12, dur: 0.25, vol: 0.5 },   // E5
        { freq: 783.99, time: 0.24, dur: 0.3, vol: 0.55 },   // G5
        { freq: 1046.50, time: 0.38, dur: 0.7, vol: 0.65 },  // C6 (High Bell Finish)
      ];

      notes.forEach(({ freq, time, dur, vol }) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'triangle'; // Warm, crisp, and clearly audible through speakers
        osc.frequency.setValueAtTime(freq, now + time);
        gain.gain.setValueAtTime(vol, now + time);
        gain.gain.exponentialRampToValueAtTime(0.001, now + time + dur);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(now + time);
        osc.stop(now + time + dur);
      });
    };

    if (ctx.state === 'suspended') {
      ctx.resume().then(triggerChime).catch(() => triggerChime());
    } else {
      triggerChime();
    }
  } catch (e) {
    console.warn('Audio chime error:', e);
  }
}

function playEmergencySiren() {
  try {
    const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (!AudioCtx) return;
    const ctx = new AudioCtx();

    const triggerSiren = () => {
      const now = ctx.currentTime;
      // Real Medical Two-Tone 108 Emergency Siren (Hi-Lo: 880 Hz / 660 Hz)
      const sirenBeats = [
        { freq: 880, start: 0, dur: 0.22 },     // Hi
        { freq: 660, start: 0.22, dur: 0.22 },  // Lo
        { freq: 880, start: 0.44, dur: 0.22 },  // Hi
        { freq: 660, start: 0.66, dur: 0.26 }   // Lo
      ];

      sirenBeats.forEach(({ freq, start, dur }) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine'; // Pure, authentic acoustic emergency tone (no funny slide whistle)
        osc.frequency.setValueAtTime(freq, now + start);
        gain.gain.setValueAtTime(0.35, now + start);
        gain.gain.exponentialRampToValueAtTime(0.01, now + start + dur);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(now + start);
        osc.stop(now + start + dur);
      });
    };

    if (ctx.state === 'suspended') {
      ctx.resume().then(triggerSiren).catch(() => triggerSiren());
    } else {
      triggerSiren();
    }
  } catch (e) {
    console.warn('Emergency siren error:', e);
  }
}

class CPRPlayer {
  private interval: number | null = null;
  start(onBeat: (c: number) => void) {
    let count = 0;
    const tick = () => {
      try {
        const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
        const ctx = new AudioCtx();
        ctx.resume().then(() => {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.type = 'sine';
          osc.frequency.setValueAtTime(count % 30 === 0 ? 1046.5 : 850, ctx.currentTime);
          gain.gain.setValueAtTime(0.3, ctx.currentTime);
          gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.08);
          osc.connect(gain);
          gain.connect(ctx.destination);
          osc.start();
          osc.stop(ctx.currentTime + 0.08);
          count++;
          onBeat(count);
        });
      } catch (e) {
        console.warn(e);
      }
    };
    tick();
    this.interval = window.setInterval(tick, (60 / 110) * 1000);
  }
  stop() {
    if (this.interval) {
      clearInterval(this.interval);
      this.interval = null;
    }
  }
}

const cprPlayer = new CPRPlayer();

// Leaflet map icons
const hospIcon = L.divIcon({
  className: 'custom-hosp',
  html: '<div class="w-8 h-8 rounded-xl bg-indigo-600 border-2 border-white flex items-center justify-center text-white text-xs shadow-lg font-bold">🏥</div>',
  iconSize: [32, 32],
  iconAnchor: [16, 16]
});

const patientIcon = L.divIcon({
  className: 'custom-pat',
  html: '<div class="w-8 h-8 rounded-full bg-rose-600 border-2 border-white flex items-center justify-center text-white text-xs shadow-lg animate-bounce font-bold">📍</div>',
  iconSize: [32, 32],
  iconAnchor: [16, 16]
});

const ambIcon = L.divIcon({
  className: 'custom-amb',
  html: '<div class="w-9 h-9 rounded-full bg-amber-500 border-2 border-white flex items-center justify-center text-white text-sm shadow-xl animate-pulse font-bold">🚑</div>',
  iconSize: [36, 36],
  iconAnchor: [18, 18]
});

const COMMON_OPD_SYMPTOMS = [
  { label: '🫀 Chest Pain / BP', dept: 'Cardiology (Heart Care)' },
  { label: '🦴 Knee / Joint Pain', dept: 'Orthopedics (Bone & Joint)' },
  { label: '🤒 High Fever & Chills', dept: 'General Medicine' },
  { label: '👶 Child Cough / Fever', dept: 'Pediatrics (Child Health)' },
  { label: '🧠 Severe Headache / Stroke', dept: 'Neurology (Brain & Spine)' },
  { label: '🤢 Stomach Ache / Acidity', dept: 'Gastroenterology' },
  { label: '🩺 Routine Full Checkup', dept: 'General Health' }
];

export const PatientPortal: React.FC = () => {
  const { actions } = useHealthEcosystem();
  const [activeTab, setActiveTab] = useState<'opd' | 'emergency'>('opd');

  // --- OPD FORM STATE ---
  const [patientName, setPatientName] = useState('');
  const [age, setAge] = useState('');
  const [gender, setGender] = useState('M');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [locationName, setLocationName] = useState('Detecting current GPS location...');
  const [userCoords, setUserCoords] = useState<{ lat: number; lng: number }>({ lat: 17.3850, lng: 78.4867 });
  const [hospital, setHospital] = useState('');
  const [medicalProblem, setMedicalProblem] = useState('');
  const [commuteTime, setCommuteTime] = useState('20');

  // Validation & Duplicate State
  const [phoneError, setPhoneError] = useState('');
  const [emailError, setEmailError] = useState('');
  const [symptomError, setSymptomError] = useState('');
  const [opdDuplicateError, setOpdDuplicateError] = useState('');
  const [sosPhoneError, setSosPhoneError] = useState('');
  const [sosDuplicateError, setSosDuplicateError] = useState('');

  // Real-time Queue Tracking (Sequential & Consistent)
  const [currentServingNumber, setCurrentServingNumber] = useState(104);
  const [nextTokenNumber, setNextTokenNumber] = useState(107);

  const [bookedPhones, setBookedPhones] = useState<string[]>([]);
  const [bookedEmails, setBookedEmails] = useState<string[]>([]);
  const [activeSosPhones, setActiveSosPhones] = useState<string[]>([]);

  // Confirmed Token & Modal
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [generatedToken, setGeneratedToken] = useState<any | null>(null);

  // --- EMERGENCY SOS STATE ---
  const [sosPhone, setSosPhone] = useState('');
  const [sosSymptom, setSosSymptom] = useState('');
  const [bloodGroup, setBloodGroup] = useState('O+');
  const [selectedSosHospitalId, setSelectedSosHospitalId] = useState('h1');
  const [isSosActive, setIsSosActive] = useState(false);
  const [sosEta, setSosEta] = useState(5);
  const [isCprRunning, setIsCprRunning] = useState(false);
  const [cprBeat, setCprBeat] = useState(0);
  const [isListeningVoice, setIsListeningVoice] = useState(false);

  // 3-MINUTE AUTO-DISPATCH COUNTDOWN (Starts ONLY after user clicks Dispatch)
  const [isSelectingHospital, setIsSelectingHospital] = useState(false);
  const [autoDispatchSeconds, setAutoDispatchSeconds] = useState(180);
  const autoDispatchTimerRef = useRef<number | null>(null);

  // Surroundings Hospitals List
  const [nearbyHospitals, setNearbyHospitals] = useState<Array<{ id: string; name: string; distance: string; lat: number; lng: number; icu: number; address: string }>>([]);

  // Auto-detect real device location and sync
  useEffect(() => {
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const lat = pos.coords.latitude;
          const lng = pos.coords.longitude;
          setUserCoords({ lat, lng });
          setLocationName(`GPS Area: Lat ${lat.toFixed(3)}, Lng ${lng.toFixed(3)}`);

          const list = [
            { id: 'h1', name: 'Apollo Emergency & Multi-Speciality', distance: '1.8 km', lat: lat + 0.008, lng: lng + 0.006, icu: 3, address: 'Main Ring Road, Health Hub 1' },
            { id: 'h2', name: 'City Care Trauma & Stroke Institute', distance: '2.5 km', lat: lat - 0.009, lng: lng + 0.012, icu: 2, address: 'Metro West Corridor' },
            { id: 'h3', name: 'Metro Regional Super-Speciality Hospital', distance: '3.9 km', lat: lat + 0.015, lng: lng - 0.008, icu: 4, address: 'Sector 4 Emergency Zone' },
            { id: 'h4', name: 'Government General Hospital (GGH)', distance: '4.7 km', lat: lat - 0.012, lng: lng - 0.015, icu: 1, address: 'Civil Hospital Road' }
          ];
          setNearbyHospitals(list);
          setHospital(list[0].name);
          setSelectedSosHospitalId(list[0].id);
        },
        () => {
          // Fallback coords (Metro area)
          const fallbackLat = 17.3850;
          const fallbackLng = 78.4867;
          setLocationName('Metro City Center (GPS Default)');
          const list = [
            { id: 'h1', name: 'Apollo Emergency & Multi-Speciality', distance: '1.8 km', lat: fallbackLat + 0.01, lng: fallbackLng + 0.01, icu: 3, address: 'Apollo Health Way' },
            { id: 'h2', name: 'Care Hospital & Trauma Center', distance: '2.5 km', lat: fallbackLat - 0.01, lng: fallbackLng + 0.015, icu: 2, address: 'Road No. 1, Banjara' },
            { id: 'h3', name: 'Yashoda Super-Speciality Hospital', distance: '3.9 km', lat: fallbackLat + 0.018, lng: fallbackLng - 0.01, icu: 4, address: 'Somajiguda Circle' }
          ];
          setNearbyHospitals(list);
          setHospital(list[0].name);
          setSelectedSosHospitalId(list[0].id);
        }
      );
    }
  }, []);

  // 3-Minute Hospital Selection Countdown (Runs ONLY after user clicks Dispatch Emergency SOS)
  useEffect(() => {
    if (isSelectingHospital && !isSosActive) {
      autoDispatchTimerRef.current = window.setInterval(() => {
        setAutoDispatchSeconds((prev) => {
          if (prev <= 1) {
            // 3 minutes expired! Auto-lock to #1 nearest hospital!
            if (autoDispatchTimerRef.current) clearInterval(autoDispatchTimerRef.current);
            const defaultHosp = nearbyHospitals[0];
            confirmEmergencyDispatch(defaultHosp ? defaultHosp.id : 'h1', true);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      if (autoDispatchTimerRef.current) clearInterval(autoDispatchTimerRef.current);
    }
    return () => {
      if (autoDispatchTimerRef.current) clearInterval(autoDispatchTimerRef.current);
    };
  }, [isSelectingHospital, isSosActive, nearbyHospitals]);

  // Confirm Dispatch helper (called when user clicks hospital OR when 3-min timer expires)
  const confirmEmergencyDispatch = (hospId: string, isAutoDefault = false) => {
    if (autoDispatchTimerRef.current) clearInterval(autoDispatchTimerRef.current);
    setSelectedSosHospitalId(hospId);
    setIsSelectingHospital(false);
    setIsSosActive(true);
    setSosEta(5);
    setActiveSosPhones(prev => [...prev, sosPhone.trim() || 'Emergency-Contact']);
    playEmergencySiren();
    playSuccessDing();
  };

  // Strict Phone Validation (No 0 start, 10 digits)
  const validatePhone = (num: string) => {
    const cleaned = num.trim();
    if (cleaned.startsWith('0')) {
      return { valid: false, message: 'Mobile number cannot start with 0! Must start with 6, 7, 8, or 9.' };
    }
    if (!/^[6-9]\d{9}$/.test(cleaned)) {
      return { valid: false, message: 'Must be exactly 10 digits starting with 6, 7, 8, or 9.' };
    }
    return { valid: true, message: '' };
  };

  const validateEmail = (mail: string) => {
    if (!mail.trim()) return { valid: true, message: '' };
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(mail.trim())) {
      return { valid: false, message: 'Please enter a valid email format (e.g. name@gmail.com)!' };
    }
    return { valid: true, message: '' };
  };

  const getAutoDepartment = (problem: string) => {
    const p = problem.toLowerCase();
    if (p.includes('heart') || p.includes('chest') || p.includes('gunde') || p.includes('bp')) return 'Cardiology (Heart Care)';
    if (p.includes('bone') || p.includes('knee') || p.includes('joint') || p.includes('fracture') || p.includes('kaalu')) return 'Orthopedics (Bone & Joint)';
    if (p.includes('baby') || p.includes('child') || p.includes('pillalu')) return 'Pediatrics (Child Health)';
    if (p.includes('brain') || p.includes('head') || p.includes('stroke') || p.includes('nerve')) return 'Neurology (Brain & Spine)';
    if (p.includes('stomach') || p.includes('gastric') || p.includes('vomit')) return 'Gastroenterology';
    return 'General Internal Medicine';
  };

  // Multilingual Web Speech API (Telugu / English)
  const startVoiceMic = () => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      setSosSymptom('Gunde noppi, breathing kastam ga undi (Mic not supported in this browser)');
      return;
    }

    try {
      const recognition = new SpeechRecognition();
      recognition.lang = 'te-IN';
      recognition.continuous = false;
      recognition.interimResults = false;
      setIsListeningVoice(true);

      recognition.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        setSosSymptom(transcript);
        setIsListeningVoice(false);
      };

      recognition.onerror = () => {
        setIsListeningVoice(false);
        setSosSymptom('Gunde noppi, breathing kastam ga undi');
      };

      recognition.onend = () => setIsListeningVoice(false);
      recognition.start();
    } catch (e) {
      setIsListeningVoice(false);
      setSosSymptom('Severe chest pain radiating to left arm');
    }
  };

  // Handle OPD Submit (Uses REAL-TIME current clock & Sequential Queue)
  const handleBookToken = (e: React.FormEvent) => {
    e.preventDefault();
    setPhoneError('');
    setEmailError('');
    setSymptomError('');
    setOpdDuplicateError('');

    const phoneVal = validatePhone(phone);
    if (!phoneVal.valid) {
      setPhoneError(phoneVal.message);
      return;
    }

    const emailVal = validateEmail(email);
    if (!emailVal.valid) {
      setEmailError(emailVal.message);
      return;
    }

    // MANDATORY SYMPTOM VALIDATION
    if (!medicalProblem.trim()) {
      setSymptomError('⚠️ Please select or type your medical symptoms/problem! (Required)');
      return;
    }

    if (bookedPhones.includes(phone.trim()) || (email.trim() && bookedEmails.includes(email.trim()))) {
      setOpdDuplicateError(`⚠️ Already Booked! An active OPD token is already booked with this mobile number (${phone}). Please check your active token below.`);
      return;
    }

    playSuccessDing();

    // REAL-TIME CURRENT TIME CLOCK & ACCURATE QUEUE NUMBER
    const now = new Date();
    const bookingTimeString = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    
    const assignedTokenNum = nextTokenNumber;
    const currentServingNum = currentServingNumber;
    const peopleAheadCount = Math.max(1, assignedTokenNum - currentServingNum);
    const tokenNum = `SANJ-${assignedTokenNum}`;
    const currentlyServingStr = `SANJ-${currentServingNum}`;
    
    // Advance token counter for next booking
    setNextTokenNumber(prev => prev + 1);

    // Each person ahead takes ~12-15 mins
    const waitMins = peopleAheadCount * 15;
    const consultTime = new Date(now.getTime() + waitMins * 60000);
    const leaveTime = new Date(consultTime.getTime() - parseInt(commuteTime) * 60000);

    const tokenData = {
      tokenNumber: tokenNum,
      name: patientName,
      age: age || '42',
      gender,
      phone,
      email,
      hospital: hospital || nearbyHospitals[0]?.name,
      department: getAutoDepartment(medicalProblem),
      problem: medicalProblem,
      currentlyServing: currentlyServingStr,
      peopleAhead: peopleAheadCount,
      bookingTime: bookingTimeString,
      consultationTime: consultTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      leaveHomeTime: leaveTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      commuteMinutes: commuteTime
    };

    setGeneratedToken(tokenData);
    setBookedPhones(prev => [...prev, phone.trim()]);
    if (email.trim()) setBookedEmails(prev => [...prev, email.trim()]);
    setShowSuccessModal(true);
  };

  // Handle SOS Trigger (Stage 1: User clicks "DISPATCH EMERGENCY SOS")
  const handleTriggerSOS = () => {
    setSosPhoneError('');
    setSosDuplicateError('');

    const phoneVal = validatePhone(sosPhone);
    if (!phoneVal.valid) {
      setSosPhoneError(phoneVal.message);
      return;
    }

    if (activeSosPhones.includes(sosPhone.trim()) && isSosActive) {
      setSosDuplicateError(`⚠️ Ambulance is ALREADY booked and en route for this number (${sosPhone})! Paramedic is arriving.`);
      return;
    }

    playEmergencySiren();
    setAutoDispatchSeconds(180); // Reset to 3 minutes (180s)
    setIsSelectingHospital(true); // Open near locations hospital chooser!
  };

  // Toggle CPR Metronome
  const toggleCPR = () => {
    if (isCprRunning) {
      cprPlayer.stop();
      setIsCprRunning(false);
    } else {
      cprPlayer.start((c) => setCprBeat(c));
      setIsCprRunning(true);
    }
  };

  useEffect(() => {
    return () => cprPlayer.stop();
  }, []);

  const assignedHospital = nearbyHospitals.find(h => h.id === selectedSosHospitalId) || nearbyHospitals[0] || {
    id: 'h1',
    name: 'Apollo Emergency & Multi-Speciality',
    distance: '1.8 km',
    lat: userCoords.lat + 0.008,
    lng: userCoords.lng + 0.006,
    icu: 3,
    address: 'Main Ring Road, Health Hub 1'
  };

  const formatTimer = (s: number) => {
    const mins = Math.floor(s / 60);
    const secs = s % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-12">
      {/* 🌿 BRAND HEADER WITH HOSPITAL + SANJEEVANI LEAF ICON */}
      <div className="p-6 rounded-3xl bg-slate-900/60 backdrop-blur-xl border border-slate-800 shadow-2xl flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center space-x-4">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-emerald-500 via-teal-500 to-indigo-600 p-0.5 shadow-lg shadow-emerald-950/40 flex items-center justify-center">
            <div className="w-full h-full bg-slate-950/90 rounded-2xl flex items-center justify-center relative backdrop-blur-sm">
              <Building2 className="w-7 h-7 text-white" />
              <Leaf className="w-4 h-4 text-emerald-400 absolute -top-1 -right-1 fill-emerald-400 animate-pulse" />
            </div>
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h1 className="text-2xl font-black text-white tracking-tight">
                Sanjeevani <span className="text-emerald-400 font-extrabold">AI</span>
              </h1>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-950 text-emerald-300 border border-emerald-700">
                PATIENT PORTAL
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">Smart Hospital Queue & Rapid Emergency Life-Line</p>
          </div>
        </div>

        {/* Live GPS Area Badge */}
        <div className="flex items-center space-x-2 px-3.5 py-2 rounded-xl bg-slate-950/80 border border-slate-800 text-xs text-slate-300">
          <MapPin className="w-4 h-4 text-rose-500 shrink-0 animate-pulse" />
          <span className="truncate max-w-[220px] font-medium">{locationName}</span>
        </div>
      </div>

      {/* 🔄 TAB SWITCHER */}
      <div className="grid grid-cols-2 p-1.5 rounded-2xl bg-slate-900/80 backdrop-blur-lg border border-slate-800">
        <button
          onClick={() => setActiveTab('opd')}
          className={`py-3.5 rounded-xl font-bold text-xs sm:text-sm flex items-center justify-center space-x-2 transition-all ${
            activeTab === 'opd'
              ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-lg shadow-emerald-950'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <Calendar className="w-4 h-4" />
          <span>📅 Smart OPD Queue</span>
        </button>

        <button
          onClick={() => setActiveTab('emergency')}
          className={`py-3.5 rounded-xl font-bold text-xs sm:text-sm flex items-center justify-center space-x-2 transition-all ${
            activeTab === 'emergency'
              ? 'bg-gradient-to-r from-rose-600 to-red-600 text-white shadow-lg shadow-rose-950'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <AlertTriangle className="w-4 h-4" />
          <span>🚨 Emergency SOS & Ambulance</span>
        </button>
      </div>

      {/* ========================================================================= */}
      {/* 🌟 CONFIRMED SUCCESSFULLY RIGHT-TICK POPUP MODAL                          */}
      {/* ========================================================================= */}
      {showSuccessModal && generatedToken && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 animate-in fade-in">
          <div className="bg-slate-900 border-2 border-emerald-500 rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl shadow-emerald-950 text-center space-y-4 relative">
            <button 
              onClick={() => setShowSuccessModal(false)}
              className="absolute right-4 top-4 text-slate-400 hover:text-white p-1"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="w-20 h-20 rounded-full bg-emerald-500/20 border-2 border-emerald-400 flex items-center justify-center mx-auto shadow-lg shadow-emerald-950 animate-bounce">
              <CheckCircle2 className="w-12 h-12 text-emerald-400" />
            </div>

            <div>
              <span className="px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                CONFIRMED SUCCESSFULLY! ✅
              </span>
              <h3 className="text-2xl font-black text-white mt-2">
                Token #{generatedToken.tokenNumber}
              </h3>
              <p className="text-xs text-emerald-400 font-bold mt-0.5">
                (OPD Queue Pass • Doctor Turn Number)
              </p>
              <p className="text-[11px] text-slate-400 mt-1">
                {generatedToken.hospital} • {generatedToken.department}
              </p>
              <button
                type="button"
                onClick={() => playSuccessDing()}
                className="mt-2.5 px-3 py-1.5 rounded-xl bg-slate-950 border border-emerald-500/40 hover:border-emerald-400 text-emerald-300 text-xs font-bold inline-flex items-center space-x-1.5 transition shadow-sm"
              >
                <Volume2 className="w-3.5 h-3.5 text-emerald-400" />
                <span>Replay Confirmation Chime 🔔</span>
              </button>
            </div>

            <div className="p-3.5 bg-slate-950/80 rounded-2xl border border-slate-800 text-left text-xs space-y-1.5">
              <div className="flex justify-between">
                <span className="text-slate-400">Patient Name:</span>
                <span className="font-bold text-white">{generatedToken.name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Actual Booking Time:</span>
                <span className="font-bold text-slate-200">{generatedToken.bookingTime}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Estimated Turn:</span>
                <span className="font-bold text-emerald-400">{generatedToken.consultationTime}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Recommended Leave Time:</span>
                <span className="font-bold text-emerald-300">{generatedToken.leaveHomeTime}</span>
              </div>
            </div>

            <button
              onClick={() => setShowSuccessModal(false)}
              className="w-full py-3.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl text-sm transition shadow-lg shadow-emerald-950"
            >
              View My Live Token Screen
            </button>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 📅 TAB 1: SMART OPD QUEUE BOOKING                                         */}
      {/* ========================================================================= */}
      {activeTab === 'opd' && (
        <div className="space-y-6">
          {/* DUPLICATE BOOKING WARNING */}
          {opdDuplicateError && (
            <div className="p-4 rounded-2xl bg-amber-950/60 border border-amber-600/80 text-amber-200 text-xs font-semibold flex items-center justify-between">
              <span>{opdDuplicateError}</span>
              <button onClick={() => setOpdDuplicateError('')} className="p-1 text-amber-400 hover:text-white">✕</button>
            </div>
          )}

          {/* ACTIVE TOKEN CARD (Once booked) */}
          {generatedToken && (
            <div className="p-6 rounded-3xl bg-slate-900/80 backdrop-blur-2xl border-2 border-emerald-500/80 shadow-2xl shadow-emerald-950/40 relative overflow-hidden">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
                <div>
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                    DIGITAL TOKEN ACTIVE ✅ (OPD QUEUE PASS)
                  </span>
                  <div className="text-3xl font-black text-white mt-1 flex items-center space-x-2">
                    <span>#{generatedToken.tokenNumber}</span>
                    <button
                      type="button"
                      onClick={() => playSuccessDing()}
                      title="Replay Confirmation Chime"
                      className="p-1.5 rounded-lg bg-emerald-950/80 border border-emerald-500/40 text-emerald-400 hover:text-white transition"
                    >
                      <Volume2 className="w-4 h-4" />
                    </button>
                  </div>
                  <div className="text-xs text-slate-400">
                    {generatedToken.name} • {generatedToken.department} (Doctor Turn Pass)
                  </div>
                </div>

                <div className="bg-slate-950/90 p-4 rounded-2xl border border-slate-800 text-right">
                  <div className="text-2xl font-black text-emerald-400">{generatedToken.peopleAhead} Ahead</div>
                  <div className="text-[11px] text-slate-400">Currently in Room: {generatedToken.currentlyServing}</div>
                </div>
              </div>

              {/* Dynamic Home-Wait Pacing */}
              <div className="my-5 p-4 rounded-2xl bg-emerald-950/40 border border-emerald-700/60 flex items-start space-x-3.5">
                <Clock className="w-6 h-6 text-emerald-400 shrink-0 mt-0.5" />
                <div>
                  <h3 className="text-xs font-black text-emerald-200 uppercase tracking-wide">
                    Smart Just-in-Time Home Waiting Pacing
                  </h3>
                  <p className="text-sm font-bold text-white mt-1">
                    Booked at <span className="text-slate-300">{generatedToken.bookingTime}</span> • Please leave home at <span className="text-emerald-400">{generatedToken.leaveHomeTime}</span> (Estimated Turn: {generatedToken.consultationTime})
                  </p>
                  <p className="text-xs text-emerald-100/70 mt-1">
                    Travel time: ~{generatedToken.commuteMinutes} mins. Do not sit in packed hospital lobbies—relax safely at home until your scheduled leave time!
                  </p>
                </div>
              </div>

              {/* Progress Steps */}
              <div className="grid grid-cols-3 gap-2 text-center text-xs pt-1 font-semibold">
                <div className="p-2.5 rounded-xl bg-emerald-600/20 border border-emerald-500 text-emerald-200">
                  🏠 Safe at Home
                </div>
                <div className="p-2.5 rounded-xl bg-slate-950/60 border border-slate-800 text-slate-400">
                  🚗 Leave at {generatedToken.leaveHomeTime}
                </div>
                <div className="p-2.5 rounded-xl bg-slate-950/60 border border-slate-800 text-slate-400">
                  👨⚕️ Consult at {generatedToken.consultationTime}
                </div>
              </div>
            </div>
          )}

          {/* OPD BOOKING FORM */}
          <div className="p-6 sm:p-8 rounded-3xl bg-slate-900/60 backdrop-blur-xl border border-slate-800 shadow-2xl space-y-6">
            <div>
              <h2 className="text-xl font-bold text-white">Book Digital OPD Token</h2>
              <p className="text-xs text-slate-400 mt-0.5">
                Zero waiting in crowded lines. Receive dynamic pacing alerts on when to leave home.
              </p>
            </div>

            <form onSubmit={handleBookToken} className="space-y-4">
              {/* Name + Age/Gender */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Patient Full Name *</label>
                  <input
                    type="text"
                    required
                    value={patientName}
                    onChange={(e) => setPatientName(e.target.value)}
                    placeholder="e.g. Ramesh Verma"
                    className="w-full bg-slate-950/80 border border-slate-700 rounded-xl px-4 py-3 text-xs sm:text-sm text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">Age</label>
                    <input
                      type="number"
                      value={age}
                      onChange={(e) => setAge(e.target.value)}
                      placeholder="45"
                      className="w-full bg-slate-950/80 border border-slate-700 rounded-xl px-3 py-3 text-xs sm:text-sm text-white focus:outline-none focus:border-emerald-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">Gender</label>
                    <select
                      value={gender}
                      onChange={(e) => setGender(e.target.value)}
                      className="w-full bg-slate-950/80 border border-slate-700 rounded-xl px-2 py-3 text-xs sm:text-sm text-white focus:outline-none focus:border-emerald-500"
                    >
                      <option value="M">Male</option>
                      <option value="F">Female</option>
                      <option value="O">Other</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Phone (No 0, 10 Digits) + Email */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Mobile Number (10 Digits, Cannot start with 0) *
                  </label>
                  <input
                    type="tel"
                    required
                    maxLength={10}
                    value={phone}
                    onChange={(e) => {
                      setPhone(e.target.value);
                      if (phoneError) setPhoneError('');
                    }}
                    placeholder="9845012345 (Cannot start with 0)"
                    className={`w-full bg-slate-950/80 border rounded-xl px-4 py-3 text-xs sm:text-sm text-white focus:outline-none ${
                      phoneError ? 'border-rose-500' : 'border-slate-700 focus:border-emerald-500'
                    }`}
                  />
                  {phoneError && <p className="text-[11px] text-rose-400 mt-1 font-bold">{phoneError}</p>}
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Email ID (Valid Email)</label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => {
                      setEmail(e.target.value);
                      if (emailError) setEmailError('');
                    }}
                    placeholder="patient@gmail.com"
                    className={`w-full bg-slate-950/80 border rounded-xl px-4 py-3 text-xs sm:text-sm text-white focus:outline-none ${
                      emailError ? 'border-rose-500' : 'border-slate-700 focus:border-emerald-500'
                    }`}
                  />
                  {emailError && <p className="text-[11px] text-rose-400 mt-1 font-bold">{emailError}</p>}
                </div>
              </div>

              {/* Select Hospital & Commute Time */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Select Hospital (Nearest Around Your Location) *
                  </label>
                  <select
                    value={hospital}
                    onChange={(e) => setHospital(e.target.value)}
                    className="w-full bg-slate-950/80 border border-slate-700 rounded-xl px-4 py-3 text-xs sm:text-sm text-white focus:outline-none focus:border-emerald-500"
                  >
                    {nearbyHospitals.map(h => (
                      <option key={h.id} value={h.name}>
                        {h.name} ({h.distance} • {h.icu} ICU Beds)
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Travel Time from Home</label>
                  <select
                    value={commuteTime}
                    onChange={(e) => setCommuteTime(e.target.value)}
                    className="w-full bg-slate-950/80 border border-slate-700 rounded-xl px-3 py-3 text-xs sm:text-sm text-white focus:outline-none focus:border-emerald-500"
                  >
                    <option value="15">~15 Minutes</option>
                    <option value="20">~20 Minutes</option>
                    <option value="30">~30 Minutes</option>
                    <option value="45">~45 Minutes</option>
                  </select>
                </div>
              </div>

              {/* Choose Symptoms Chips + Custom Type */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-semibold text-slate-300">
                    Choose Symptoms (Tap or Type Custom) <span className="text-rose-400">* Required</span>
                  </label>
                  {medicalProblem && (
                    <span className="text-[11px] text-emerald-400 font-bold">
                      Auto-Assigned: {getAutoDepartment(medicalProblem)}
                    </span>
                  )}
                </div>

                <div className="flex flex-wrap gap-1.5">
                  {COMMON_OPD_SYMPTOMS.map((sym, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => {
                        setMedicalProblem(sym.label);
                        if (symptomError) setSymptomError('');
                      }}
                      className={`px-2.5 py-1.5 rounded-xl text-xs transition border ${
                        medicalProblem === sym.label
                          ? 'bg-emerald-600 text-white border-emerald-400 font-bold shadow-md shadow-emerald-950'
                          : 'bg-slate-950/70 text-slate-300 border-slate-800 hover:border-slate-700'
                      }`}
                    >
                      {sym.label}
                    </button>
                  ))}
                </div>

                <input
                  type="text"
                  value={medicalProblem}
                  onChange={(e) => {
                    setMedicalProblem(e.target.value);
                    if (symptomError) setSymptomError('');
                  }}
                  placeholder="Or type custom symptoms (e.g. Chest tightness with palpitations, joint swelling)..."
                  className={`w-full bg-slate-950/80 border rounded-xl px-4 py-3 text-xs sm:text-sm text-white focus:outline-none mt-2 ${
                    symptomError ? 'border-rose-500 ring-1 ring-rose-500/50' : 'border-slate-700 focus:border-emerald-500'
                  }`}
                />
                {symptomError && (
                  <p className="text-[11px] text-rose-400 font-bold mt-1 animate-pulse">
                    {symptomError}
                  </p>
                )}
              </div>

              <button
                type="submit"
                className="w-full py-4 bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-500 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-sm sm:text-base rounded-2xl shadow-xl shadow-emerald-950 transition-all flex items-center justify-center space-x-2"
              >
                <span>Confirm & Generate Digital Token</span>
                <ArrowRight className="w-5 h-5" />
              </button>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 🚨 TAB 2: EMERGENCY SOS WITH HOSPITAL CHOOSER & 2-MIN AUTO-DISPATCH       */}
      {/* ========================================================================= */}
      {activeTab === 'emergency' && (
        <div className="space-y-6">
          {/* DUPLICATE SOS WARNING */}
          {sosDuplicateError && (
            <div className="p-4 rounded-2xl bg-rose-950/60 border border-rose-600 text-rose-200 text-xs font-semibold flex items-center justify-between">
              <span>{sosDuplicateError}</span>
              <button onClick={() => setSosDuplicateError('')} className="p-1 text-rose-400 hover:text-white">✕</button>
            </div>
          )}

          {/* ========================================================================= */}
          {/* 🚨 CASE 1: ACTIVE EMERGENCY DISPATCH STATUS (Ambulance En Route)         */}
          {/* ========================================================================= */}
          {isSosActive && (
            <div className="p-6 rounded-3xl bg-slate-900/80 backdrop-blur-2xl border-2 border-rose-500 shadow-2xl shadow-rose-950/50 space-y-5">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
                <div className="flex items-center space-x-3">
                  <div className="p-3 bg-rose-600 text-white rounded-2xl shadow-lg shadow-rose-950 animate-bounce">
                    <AmbulanceIcon className="w-7 h-7" />
                  </div>
                  <div>
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-rose-600 text-white">
                      AMBULANCE DISPATCHED & CONFIRMED ✅
                    </span>
                    <h3 className="text-xl font-black text-white mt-1">
                      {sosSymptom || 'Acute Emergency Trauma'}
                    </h3>
                  </div>
                </div>

                <div className="text-right">
                  <div className="text-3xl font-black text-rose-400">~{sosEta} MINS</div>
                  <div className="text-xs text-slate-400">Live Ambulance Countdown</div>
                </div>
              </div>

              {/* Driver & Bed Lock Info */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="p-3.5 rounded-2xl bg-slate-950/80 border border-slate-800">
                  <span className="text-[10px] uppercase font-bold text-slate-400">Ambulance Unit</span>
                  <div className="text-sm font-bold text-white mt-1">#KA-04-E-1234 (ALS)</div>
                  <div className="text-[11px] text-slate-400">Driver: Rajesh Kumar</div>
                </div>

                <div className="p-3.5 rounded-2xl bg-slate-950/80 border border-slate-800">
                  <span className="text-[10px] uppercase font-bold text-slate-400">Pre-Locked Bed</span>
                  <div className="text-sm font-bold text-rose-300 mt-1">Trauma Bay #2 (Reserved)</div>
                  <div className="text-[11px] text-emerald-400 font-bold">{assignedHospital?.name || 'Apollo Emergency'}</div>
                </div>

                <div className="p-3.5 rounded-2xl bg-slate-950/80 border border-slate-800">
                  <span className="text-[10px] uppercase font-bold text-slate-400">Your Number</span>
                  <div className="text-sm font-bold text-cyan-300 mt-1">{sosPhone}</div>
                  <div className="text-[11px] text-slate-400">Driver Callback Line</div>
                </div>
              </div>

              {/* 🗺️ REAL MAP WITH MOVING AMBULANCE & ROUTE */}
              <div className="h-64 rounded-2xl overflow-hidden border border-slate-800 relative">
                <MapContainer
                  center={[userCoords.lat, userCoords.lng]}
                  zoom={14}
                  style={{ height: '100%', width: '100%' }}
                  scrollWheelZoom={false}
                >
                  <TileLayer
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                  />
                  <Marker position={[userCoords.lat, userCoords.lng]} icon={patientIcon}>
                    <Popup>Your Location</Popup>
                  </Marker>
                  {assignedHospital && (
                    <Marker position={[assignedHospital.lat, assignedHospital.lng]} icon={hospIcon}>
                      <Popup>{assignedHospital.name} (Assigned Hospital)</Popup>
                    </Marker>
                  )}
                  <Marker position={[userCoords.lat + 0.005, userCoords.lng + 0.005]} icon={ambIcon}>
                    <Popup>Ambulance KA-04-1234 (~5 mins away)</Popup>
                  </Marker>
                  <Polyline
                    positions={[
                      [userCoords.lat + 0.005, userCoords.lng + 0.005],
                      [userCoords.lat, userCoords.lng]
                    ]}
                    pathOptions={{ color: '#ef4444', weight: 4, dashArray: '6, 6' }}
                  />
                </MapContainer>
              </div>

              {/* First-Aid Guidance */}
              <div className="p-4 rounded-2xl bg-slate-950/90 border border-slate-800 space-y-2">
                <h4 className="text-xs font-black uppercase tracking-wider text-rose-300 flex items-center space-x-1.5">
                  <Sparkles className="w-4 h-4 text-rose-400" />
                  <span>Sanjeevani AI First-Aid Guidance (While Waiting)</span>
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                  <div className="p-2.5 rounded-xl bg-emerald-950/30 border border-emerald-900/60 text-emerald-200">
                    <strong className="block text-emerald-300 mb-0.5">✅ DO:</strong>
                    Keep patient calm at a 45-degree angle. Loosen tight collar, belt, or shirt.
                  </div>
                  <div className="p-2.5 rounded-xl bg-rose-950/30 border border-rose-900/60 text-rose-200">
                    <strong className="block text-rose-300 mb-0.5">❌ DON'T:</strong>
                    Do NOT force glasses of water if patient is breathless or unconscious.
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-wrap gap-3 pt-1">
                <button
                  onClick={toggleCPR}
                  className={`px-4 py-2.5 rounded-xl text-xs font-bold flex items-center space-x-2 transition ${
                    isCprRunning 
                      ? 'bg-rose-600 text-white shadow-lg shadow-rose-950 animate-pulse' 
                      : 'bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700'
                  }`}
                >
                  <Heart className="w-4 h-4 fill-current text-rose-400" />
                  <span>{isCprRunning ? `Stop CPR Beat (#${cprBeat})` : 'Launch Bystander CPR Copilot (110 BPM)'}</span>
                </button>

                <a
                  href={`https://wa.me/?text=EMERGENCY:%20Ambulance%20KA-04-1234%20dispatched%20to%20my%20location.%20Hospital:%20${encodeURIComponent(assignedHospital?.name || 'Apollo')}.%20Bay%202%20Locked.`}
                  target="_blank"
                  rel="noreferrer"
                  className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold flex items-center space-x-2 transition shadow-lg shadow-emerald-950"
                >
                  <Share2 className="w-4 h-4" />
                  <span>Share Live Status on WhatsApp</span>
                </a>

                <a
                  href="tel:108"
                  className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-bold flex items-center space-x-2 border border-slate-700 transition"
                >
                  <Phone className="w-4 h-4 text-emerald-400" />
                  <span>Call Paramedic Directly</span>
                </a>

                <button
                  type="button"
                  onClick={() => {
                    setIsSosActive(false);
                    setIsSelectingHospital(false);
                    if (autoDispatchTimerRef.current) clearInterval(autoDispatchTimerRef.current);
                  }}
                  className="px-4 py-2.5 bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-white rounded-xl text-xs font-bold flex items-center space-x-1.5 border border-slate-800 transition"
                >
                  <RotateCcw className="w-4 h-4 text-rose-400" />
                  <span>Reset / Test Again</span>
                </button>
              </div>
            </div>
          )}

          {/* ========================================================================= */}
          {/* 🏥 CASE 2: SELECT DESTINATION HOSPITAL (After Dispatch Button Clicked)     */}
          {/* ⏱️ 3-MINUTE AUTO-DISPATCH COUNTDOWN TO #1 NEAREST HOSPITAL               */}
          {/* ========================================================================= */}
          {!isSosActive && isSelectingHospital && (
            <div className="space-y-4 animate-in fade-in">
              {/* 3-Minute Live Auto-Lock Countdown Banner */}
              <div className="p-5 rounded-3xl bg-rose-950/80 border-2 border-rose-500 shadow-2xl shadow-rose-950/60 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-center space-x-3">
                  <div className="p-3 bg-rose-600 text-white rounded-2xl animate-bounce">
                    <Timer className="w-6 h-6" />
                  </div>
                  <div>
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-rose-600 text-white">
                      EMERGENCY AMBULANCE TRIGGERED 🚨
                    </span>
                    <h3 className="text-xl font-black text-white mt-1">
                      Choose Preferred Destination Hospital
                    </h3>
                    <p className="text-xs text-rose-200 mt-0.5">
                      Select your destination from near locations below. If not selected within <strong>{formatTimer(autoDispatchSeconds)}</strong>, system will auto-lock to <strong className="text-white">#1 {nearbyHospitals[0]?.name || 'Apollo'}</strong>!
                    </p>
                  </div>
                </div>

                <div className="bg-slate-950 px-4 py-3 rounded-2xl border border-rose-800 text-center shrink-0">
                  <span className="text-[10px] text-rose-400 font-bold uppercase block">Auto-Lock Timer</span>
                  <span className="text-2xl font-black font-mono text-white animate-pulse">
                    {formatTimer(autoDispatchSeconds)}
                  </span>
                </div>
              </div>

              {/* Near Locations / Hospitals Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {nearbyHospitals.map((h) => {
                  return (
                    <div
                      key={h.id}
                      className="p-5 rounded-3xl bg-slate-900 border border-slate-800 hover:border-rose-500/70 shadow-xl transition flex flex-col justify-between space-y-3"
                    >
                      <div className="flex justify-between items-start">
                        <div>
                          <div className="flex items-center space-x-2">
                            <span className="text-lg">🏥</span>
                            <h4 className="text-sm font-black text-white">{h.name}</h4>
                          </div>
                          <p className="text-xs text-slate-400 mt-1">{h.address}</p>
                        </div>
                        <div className="text-right shrink-0">
                          <span className="text-sm font-black text-rose-400 block">{h.distance}</span>
                          <span className="text-[10px] font-bold text-emerald-400">{h.icu} ICU Beds</span>
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={() => confirmEmergencyDispatch(h.id)}
                        className="w-full py-3 bg-rose-600 hover:bg-rose-500 text-white font-bold rounded-xl text-xs flex items-center justify-center space-x-2 transition shadow-lg shadow-rose-950"
                      >
                        <span>Select & Confirm Ambulance ➔</span>
                      </button>
                    </div>
                  );
                })}
              </div>

              {/* Quick Actions: Instant Default or Modify */}
              <div className="flex flex-col sm:flex-row items-center gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => confirmEmergencyDispatch(nearbyHospitals[0]?.id || 'h1')}
                  className="w-full py-3.5 bg-gradient-to-r from-emerald-700 to-teal-700 hover:from-emerald-600 hover:to-teal-600 text-white font-bold rounded-2xl text-xs transition shadow-lg flex items-center justify-center space-x-2"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Instant Confirm #1 Closest ({nearbyHospitals[0]?.name || 'Apollo'})</span>
                </button>

                <button
                  type="button"
                  onClick={() => setIsSelectingHospital(false)}
                  className="w-full sm:w-auto px-5 py-3.5 bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-white font-bold rounded-2xl text-xs transition border border-slate-800 flex items-center justify-center space-x-1.5 shrink-0"
                >
                  <RotateCcw className="w-4 h-4" />
                  <span>Back / Edit Details</span>
                </button>
              </div>
            </div>
          )}

          {/* ========================================================================= */}
          {/* 📝 CASE 3: INITIAL EMERGENCY SOS FORM (Before Dispatch Clicked)          */}
          {/* NO AUTO-BOOKING UNTIL USER CLICKS DISPATCH!                              */}
          {/* ========================================================================= */}
          {!isSosActive && !isSelectingHospital && (
            <div className="p-6 sm:p-8 rounded-3xl bg-slate-900/60 backdrop-blur-xl border border-rose-900/40 shadow-2xl shadow-rose-950/30 space-y-6">
              <div className="text-center max-w-lg mx-auto space-y-2">
                <span className="px-3 py-1 rounded-full bg-rose-950/80 border border-rose-800 text-rose-300 text-xs font-bold">
                  RAPID LIFE-LINE DISPATCH
                </span>
                <h2 className="text-2xl sm:text-3xl font-black text-white">Emergency Medical SOS</h2>
                <p className="text-xs sm:text-sm text-slate-400">
                  Enter your details below and click Dispatch. You will be able to select your destination hospital from nearby locations.
                </p>
              </div>

              {/* Phone Number Input (Strict 10 Digits, No 0 start) */}
              <div className="max-w-lg mx-auto">
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Your Contact Number (For Ambulance Driver Callback - 10 Digits) *
                </label>
                <input
                  type="tel"
                  maxLength={10}
                  value={sosPhone}
                  onChange={(e) => {
                    setSosPhone(e.target.value);
                    if (sosPhoneError) setSosPhoneError('');
                  }}
                  placeholder="9845012345 (Cannot start with 0)"
                  className={`w-full bg-slate-950/90 border rounded-2xl px-4 py-3.5 text-sm text-white focus:outline-none ${
                    sosPhoneError ? 'border-rose-500' : 'border-rose-700/60 focus:border-rose-500'
                  }`}
                />
                {sosPhoneError && <p className="text-[11px] text-rose-400 mt-1 font-bold">{sosPhoneError}</p>}
              </div>

              {/* Quick 1-Tap Presets */}
              <div className="max-w-lg mx-auto">
                <label className="block text-xs font-semibold text-slate-400 mb-2">Tap Condition or Describe:</label>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { label: '🫀 Chest Pain / Heart', desc: 'Severe chest tightness, sweating' },
                    { label: '🚗 Road Accident', desc: 'Heavy bleeding, fracture deformity' },
                    { label: '🫁 Breathing Trouble', desc: 'Severe gasping, oxygen drop' },
                    { label: '🧠 Stroke Signs', desc: 'Sudden face / arm drop' }
                  ].map((item, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => setSosSymptom(item.desc)}
                      className={`p-3 rounded-2xl border text-left text-xs transition ${
                        sosSymptom === item.desc
                          ? 'bg-rose-950/80 border-rose-500 text-white'
                          : 'bg-slate-950/60 border-slate-800 text-slate-300 hover:border-slate-700'
                      }`}
                    >
                      <div className="font-bold">{item.label}</div>
                      <div className="text-[10px] text-slate-400 mt-0.5 truncate">{item.desc}</div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Multilingual Voice Mic */}
              <div className="max-w-lg mx-auto relative">
                <input
                  type="text"
                  value={sosSymptom}
                  onChange={(e) => setSosSymptom(e.target.value)}
                  placeholder="Type or click mic to speak (Telugu / Hindi / English)..."
                  className="w-full bg-slate-950/80 border border-slate-700 rounded-2xl px-4 py-3.5 text-xs sm:text-sm text-white pr-14 focus:outline-none focus:border-rose-500"
                />
                <button
                  type="button"
                  onClick={startVoiceMic}
                  title="Speak now (Telugu / English)"
                  className={`absolute right-2.5 top-2.5 p-2 rounded-xl border transition ${
                    isListeningVoice
                      ? 'bg-rose-600 text-white border-rose-400 animate-pulse'
                      : 'bg-rose-950/60 text-rose-300 border-rose-800 hover:bg-rose-900'
                  }`}
                >
                  <Mic className={`w-4 h-4 ${isListeningVoice ? 'animate-bounce' : ''}`} />
                </button>
              </div>
              {isListeningVoice && (
                <p className="text-center text-xs text-rose-400 font-bold animate-pulse">
                  🎙️ Mic Active: Please speak in Telugu, Hindi or English now...
                </p>
              )}

              {/* Blood Group */}
              <div className="max-w-lg mx-auto flex items-center justify-between text-xs pt-1">
                <span className="text-slate-400 font-semibold">Blood Group (Optional):</span>
                <div className="flex space-x-1">
                  {['O+', 'A+', 'B+', 'AB+', 'O-'].map((bg) => (
                    <button
                      key={bg}
                      type="button"
                      onClick={() => setBloodGroup(bg)}
                      className={`px-2 py-1 rounded-lg border text-[11px] font-bold ${
                        bloodGroup === bg
                          ? 'bg-rose-600 text-white border-rose-500'
                          : 'bg-slate-950 border-slate-800 text-slate-400'
                      }`}
                    >
                      {bg}
                    </button>
                  ))}
                </div>
              </div>

              {/* DISPATCH BUTTON */}
              <div className="max-w-lg mx-auto pt-2">
                <button
                  type="button"
                  onClick={handleTriggerSOS}
                  className="w-full py-5 rounded-3xl bg-gradient-to-r from-rose-600 via-red-600 to-rose-700 hover:from-rose-500 hover:to-red-500 text-white font-black text-base sm:text-lg shadow-2xl shadow-rose-950/80 border border-rose-400/30 transition-all flex items-center justify-center space-x-3"
                >
                  <AlertTriangle className="w-6 h-6 animate-bounce" />
                  <span>🚨 DISPATCH EMERGENCY SOS (AMBULANCE)</span>
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default PatientPortal;
