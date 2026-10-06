import pptxgen from 'pptxgenjs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const pres = new pptxgen();
pres.layout = 'LAYOUT_16x9';
pres.author = 'Team Sanjeevani';
pres.company = 'Sanjeevani AI';
pres.title = 'Sanjeevani AI - Hackathon Pitch Deck';

// Brand Colors
const DARK_BG = '0B1120';    // Deep Slate / Navy
const CARD_BG = '1E293B';    // Slate 800
const ACCENT_RED = 'E11D48'; // Rose 600 / Red
const ACCENT_GREEN = '10B981'; // Emerald 500
const ACCENT_CYAN = '06B6D4'; // Cyan 500
const TEXT_WHITE = 'FFFFFF';
const TEXT_MUTED = '94A3B8';
const TEXT_GOLD = 'FBBF24';

function addHeader(slide, title, category) {
  slide.background = { color: DARK_BG };

  // Category Tag / Pill
  if (category) {
    slide.addText(category.toUpperCase(), {
      x: 0.8,
      y: 0.5,
      w: 8.0,
      h: 0.35,
      fontSize: 10,
      fontFace: 'Arial',
      bold: true,
      color: ACCENT_GREEN,
      charSpacing: 2
    });
  }

  // Slide Title
  slide.addText(title, {
    x: 0.8,
    y: 0.85,
    w: 11.5,
    h: 0.7,
    fontSize: 24,
    fontFace: 'Arial',
    bold: true,
    color: TEXT_WHITE
  });

  // Thin Accent Line
  slide.addShape(pres.ShapeType.line, {
    x: 0.8,
    y: 1.6,
    w: 11.7,
    h: 0,
    line: { color: '334155', width: 1.5 }
  });
}

// ============================================================================
// SLIDE 1: TITLE / HERO SLIDE
// ============================================================================
const slide1 = pres.addSlide();
slide1.background = { color: DARK_BG };

// Glowing Pill
slide1.addText('HACKATHON INNOVATION PITCH • HEALTHCARE AI', {
  x: 1.5,
  y: 1.5,
  w: 10.3,
  h: 0.4,
  fontSize: 12,
  fontFace: 'Arial',
  bold: true,
  color: ACCENT_GREEN,
  align: 'center',
  charSpacing: 3
});

slide1.addText('SANJEEVANI AI', {
  x: 1.5,
  y: 2.1,
  w: 10.3,
  h: 1.3,
  fontSize: 54,
  fontFace: 'Arial Black',
  bold: true,
  color: TEXT_WHITE,
  align: 'center'
});

slide1.addText('Autonomous Emergency Medical Command & Smart OPD Pacing Ecosystem', {
  x: 1.5,
  y: 3.4,
  w: 10.3,
  h: 0.6,
  fontSize: 20,
  fontFace: 'Arial',
  color: ACCENT_CYAN,
  align: 'center',
  bold: true
});

slide1.addText('"Bridging the Golden Hour Delay & Eliminating Hospital Lobby Congestion in Real-Time"', {
  x: 2.0,
  y: 4.2,
  w: 9.3,
  h: 0.6,
  fontSize: 14,
  fontFace: 'Georgia',
  italic: true,
  color: TEXT_MUTED,
  align: 'center'
});

// Feature Highlights Box
slide1.addShape(pres.ShapeType.roundRect, {
  x: 2.5,
  y: 5.2,
  w: 8.3,
  h: 1.0,
  fill: { color: CARD_BG },
  line: { color: '334155', width: 1 },
  radius: 12
});

slide1.addText('🚑 108 Emergency Siren   •   🎙️ Multilingual Voice AI   •   ⏱️ 2-Min Auto-Lock   •   🏥 Live Bed Reservation', {
  x: 2.5,
  y: 5.5,
  w: 8.3,
  h: 0.4,
  fontSize: 12,
  fontFace: 'Arial',
  bold: true,
  color: TEXT_WHITE,
  align: 'center'
});

// ============================================================================
// SLIDE 2: THE CRITICAL PROBLEM
// ============================================================================
const slide2 = pres.addSlide();
addHeader(slide2, 'The Critical Problem in Emergency Healthcare', 'Challenge Analysis');

const problems = [
  {
    title: 'The Fatal "Golden Hour" Delay',
    desc: 'Critical cardiac and trauma patients lose life-saving minutes wandering between hospitals searching for available ICU beds and cath labs.',
    tag: '🚨 CRITICAL CARE CRISIS'
  },
  {
    title: 'Disconnected Ambulance Systems',
    desc: 'Ambulances operate as isolated islands. Hospitals have zero pre-arrival telemetry or patient vital data before the stretcher rolls through the door.',
    tag: '📡 ZERO TELEMETRY'
  },
  {
    title: 'Overcrowded Hospital OPD Lobbies',
    desc: 'Outpatient departments are overwhelmed with 3+ hour physical queues, exposing vulnerable patients to cross-infections and severe anxiety.',
    tag: '👥 INFECTIOUS CONGESTION'
  },
  {
    title: 'Language & Panic Barriers in Distress',
    desc: 'Callers in severe distress panic and struggle to articulate clinical symptoms in English, causing vital dispatch misclassification.',
    tag: '🗣️ COMMUNICATION GAP'
  }
];

problems.forEach((p, idx) => {
  const col = idx % 2;
  const row = Math.floor(idx / 2);
  const x = 0.8 + col * 5.9;
  const y = 2.0 + row * 2.3;

  slide2.addShape(pres.ShapeType.roundRect, {
    x, y, w: 5.6, h: 2.0,
    fill: { color: CARD_BG },
    line: { color: ACCENT_RED, width: 1.5 },
    radius: 10
  });

  slide2.addText(p.tag, {
    x: x + 0.3, y: y + 0.2, w: 5.0, h: 0.3,
    fontSize: 10, fontFace: 'Arial', bold: true, color: ACCENT_RED
  });

  slide2.addText(p.title, {
    x: x + 0.3, y: y + 0.5, w: 5.0, h: 0.4,
    fontSize: 14, fontFace: 'Arial', bold: true, color: TEXT_WHITE
  });

  slide2.addText(p.desc, {
    x: x + 0.3, y: y + 0.95, w: 5.0, h: 0.9,
    fontSize: 11, fontFace: 'Arial', color: TEXT_MUTED
  });
});

// ============================================================================
// SLIDE 3: THE SANJEEVANI AI SOLUTION
// ============================================================================
const slide3 = pres.addSlide();
addHeader(slide3, 'The Sanjeevani AI Solution: Unified Ecosystem', 'Our Solution');

const solutions = [
  {
    icon: '🎙️',
    title: 'Multilingual Voice AI',
    points: ['150ms instant symptom extraction', 'Native Telugu, Hindi & English speech', 'Clinical-grade auto-standardization']
  },
  {
    icon: '⏱️',
    title: '2-Min Auto-Lock Chooser',
    points: ['Patient chooses preferred hospital', '2-Minute fail-safe countdown timer', 'Auto-locks to #1 closest ICU on expiry']
  },
  {
    icon: '🚨',
    title: '108 Ambulance Siren Alert',
    points: ['Loud hi-lo two-tone siren blast', 'Dual WebAudio API + WAV loop engine', 'Synchronous alert on patient & admin']
  },
  {
    icon: '🗺️',
    title: 'Trauma ER GPS Intercept',
    points: ['Live Patient -> Ambulance -> ER route', '30-Min Bed #2 reservation hold', 'Instant "Admitted Successfully" loop']
  }
];

solutions.forEach((s, idx) => {
  const x = 0.8 + idx * 2.95;
  const y = 2.0;

  slide3.addShape(pres.ShapeType.roundRect, {
    x, y, w: 2.8, h: 4.6,
    fill: { color: CARD_BG },
    line: { color: ACCENT_GREEN, width: 1.5 },
    radius: 12
  });

  slide3.addText(s.icon, {
    x, y: y + 0.3, w: 2.8, h: 0.6,
    fontSize: 28, align: 'center'
  });

  slide3.addText(s.title, {
    x: x + 0.15, y: y + 1.0, w: 2.5, h: 0.6,
    fontSize: 14, fontFace: 'Arial', bold: true, color: TEXT_WHITE, align: 'center'
  });

  const bulletText = s.points.map(pt => `• ${pt}`).join('\n\n');
  slide3.addText(bulletText, {
    x: x + 0.2, y: y + 1.7, w: 2.4, h: 2.6,
    fontSize: 11, fontFace: 'Arial', color: TEXT_MUTED, lineSpacing: 18
  });
});

// ============================================================================
// SLIDE 4: SYSTEM ARCHITECTURE & TECH STACK
// ============================================================================
const slide4 = pres.addSlide();
addHeader(slide4, 'System Architecture & Modern Tech Stack', 'Technical Blueprint');

const techBlocks = [
  {
    layer: 'FRONTEND COMMAND INTERFACE',
    tech: 'React 19 + TypeScript + Vite 8',
    detail: 'Modular dual-dashboard architecture (Patient Portal & Hospital Admin). Styled with Tailwind CSS for glassmorphic dark-mode clinical UI.'
  },
  {
    layer: 'REAL-TIME SYNCHRONIZATION ENGINE',
    tech: 'Supabase Cloud Realtime + BroadcastChannel',
    detail: 'Zero-latency WebSocket events for instantaneous dispatch alerts. LocalStorage cross-tab fallbacks ensure zero lost emergency signals.'
  },
  {
    layer: 'GEOSPATIAL CORRIDOR & TELEMETRY',
    tech: 'Leaflet.js + CARTO Dark Matter GIS',
    detail: 'Live dynamic polyline route tracking from Patient GPS 📍 through moving ALS Ambulance 🚑 to destination Trauma Bay 🏥.'
  },
  {
    layer: 'ACOUSTIC EMERGENCY AUDIO ENGINE',
    tech: 'Dual Web Audio API + PCM WAV Loop',
    detail: 'Authentic 108 Indian ambulance two-tone cadence (960Hz <-> 770Hz). Browser autoplay pre-warm protocol guarantees sound delivery.'
  }
];

techBlocks.forEach((tb, idx) => {
  const y = 2.0 + idx * 1.15;
  slide4.addShape(pres.ShapeType.roundRect, {
    x: 0.8, y, w: 11.7, h: 1.0,
    fill: { color: CARD_BG },
    line: { color: '334155', width: 1 },
    radius: 8
  });

  slide4.addText(tb.layer, {
    x: 1.1, y: y + 0.12, w: 4.0, h: 0.25,
    fontSize: 9, fontFace: 'Arial', bold: true, color: ACCENT_CYAN, charSpacing: 1.5
  });

  slide4.addText(tb.tech, {
    x: 1.1, y: y + 0.38, w: 4.0, h: 0.45,
    fontSize: 13, fontFace: 'Arial', bold: true, color: TEXT_WHITE
  });

  slide4.addText(tb.detail, {
    x: 5.2, y: y + 0.15, w: 7.0, h: 0.7,
    fontSize: 11, fontFace: 'Arial', color: TEXT_MUTED
  });
});

// ============================================================================
// SLIDE 5: EMERGENCY SOS & 2-MINUTE SMART DISPATCH
// ============================================================================
const slide5 = pres.addSlide();
addHeader(slide5, 'Feature Deep-Dive: Patient SOS & 2-Min Auto-Lock', 'Core Innovation');

// Left Box: Voice AI
slide5.addShape(pres.ShapeType.roundRect, {
  x: 0.8, y: 2.0, w: 5.7, h: 4.6,
  fill: { color: CARD_BG },
  line: { color: ACCENT_RED, width: 1.5 },
  radius: 12
});

slide5.addText('🎙️ MULTILINGUAL VOICE DISTRESS AI', {
  x: 1.1, y: 2.2, w: 5.1, h: 0.3,
  fontSize: 12, fontFace: 'Arial', bold: true, color: ACCENT_RED
});

slide5.addText(
  '• Real-time speech recognition tuned for emergency phonetic catches:\n' +
  '  - Telugu: "యాక్సిడెంట్ అయింది", "గుండె నొప్పి", "ఆయాసం"\n' +
  '  - Hindi: "सीने में दर्द", "एक्सीडेंट", "सांस फूलना"\n' +
  '  - English / Telenglish: "Accident ayindi", "Chest pain"\n\n' +
  '• 150ms Rapid Prefix-Match: Immediately auto-standardizes raw colloquial words into clinical emergency triage classes.\n\n' +
  '• Fail-Safe 1-Tap Chips: Quick touch buttons for instant dispatch when voice input is not feasible.',
  {
    x: 1.1, y: 2.65, w: 5.1, h: 3.7,
    fontSize: 11, fontFace: 'Arial', color: TEXT_WHITE, lineSpacing: 18
  }
);

// Right Box: 2-Min Auto-Lock & Siren
slide5.addShape(pres.ShapeType.roundRect, {
  x: 6.8, y: 2.0, w: 5.7, h: 4.6,
  fill: { color: CARD_BG },
  line: { color: ACCENT_GREEN, width: 1.5 },
  radius: 12
});

slide5.addText('⏱️ 2-MINUTE AUTO-LOCK & 108 SIREN', {
  x: 7.1, y: 2.2, w: 5.1, h: 0.3,
  fontSize: 12, fontFace: 'Arial', bold: true, color: ACCENT_GREEN
});

slide5.addText(
  '• Hospital Chooser Screen:\n' +
  '  Displays live nearby emergency centers (Apollo, City Care, Fortis) with real-time distance and available ICU bed count.\n\n' +
  '• 2-Minute Fail-Safe Countdown Timer:\n' +
  '  If patient or family is unconscious or incapacitated, system automatically locks and dispatches the #1 closest hospital.\n\n' +
  '• 108 Ambulance Siren Blast:\n' +
  '  On booking confirmation, the authentic 108 ambulance siren immediately sounds loud and continuous, reassuring the caller help is en route.',
  {
    x: 7.1, y: 2.65, w: 5.1, h: 3.7,
    fontSize: 11, fontFace: 'Arial', color: TEXT_WHITE, lineSpacing: 18
  }
);

// ============================================================================
// SLIDE 6: HOSPITAL COMMAND CENTER & GPS MAP
// ============================================================================
const slide6 = pres.addSlide();
addHeader(slide6, 'Feature Deep-Dive: Hospital Command & Live GPS Map', 'ER Trauma Desk');

const adminFeatures = [
  {
    title: '🚨 Code Red Modal & 108 Siren',
    desc: 'Instant full-screen alert pops up on the hospital screen with ambulance siren audio. Clicking OK silences the siren and enters the Trauma ER Desk.'
  },
  {
    title: '🗺️ Live GPS Intercept Corridor',
    desc: 'Leaflet dark-mode map displays the live GPS position of the patient, the moving ALS ambulance, and the hospital destination with route telemetry.'
  },
  {
    title: '🔒 30-Min Bed & Cath-Lab Lock',
    desc: 'Reserves Trauma Resuscitation Bay #2 and prepares the on-duty catheterization team before patient arrival, safeguarding the Golden Hour.'
  },
  {
    title: '✅ 1-Click Clinical Admission Handoff',
    desc: 'When the ambulance arrives, Admin clicks "Patient Received (Done)". Resolves the incident and broadcasts admission feedback to the patient.'
  }
];

adminFeatures.forEach((f, idx) => {
  const col = idx % 2;
  const row = Math.floor(idx / 2);
  const x = 0.8 + col * 5.9;
  const y = 2.0 + row * 2.3;

  slide6.addShape(pres.ShapeType.roundRect, {
    x, y, w: 5.6, h: 2.0,
    fill: { color: CARD_BG },
    line: { color: '334155', width: 1.5 },
    radius: 10
  });

  slide6.addText(f.title, {
    x: x + 0.3, y: y + 0.25, w: 5.0, h: 0.4,
    fontSize: 14, fontFace: 'Arial', bold: true, color: TEXT_GOLD
  });

  slide6.addText(f.desc, {
    x: x + 0.3, y: y + 0.75, w: 5.0, h: 1.1,
    fontSize: 11, fontFace: 'Arial', color: TEXT_MUTED
  });
});

// ============================================================================
// SLIDE 7: LIVE ADMISSION POPUP FEEDBACK LOOP
// ============================================================================
const slide7 = pres.addSlide();
addHeader(slide7, 'Synchronous Feedback Loop: "Admitted Successfully!"', 'Patient Reassurance');

slide7.addShape(pres.ShapeType.roundRect, {
  x: 1.8, y: 2.0, w: 9.7, h: 4.6,
  fill: { color: CARD_BG },
  line: { color: ACCENT_GREEN, width: 2 },
  radius: 16
});

slide7.addText('🏥 PATIENT ADMITTED SUCCESSFULLY! (LIVE POPUP MODAL)', {
  x: 2.2, y: 2.3, w: 8.9, h: 0.4,
  fontSize: 15, fontFace: 'Arial', bold: true, color: ACCENT_GREEN, align: 'center'
});

slide7.addText(
  '• Two-Way Closed Loop Communication:\n' +
  '  The moment the ER Doctor clicks "PATIENT RECEIVED AT HOSPITAL (DONE)" on the admin desk, the Patient Portal automatically catches the event in real-time.\n\n' +
  '• Celebratory Glassmorphic Modal Popup:\n' +
  '  - Displays verified destination hospital name (Apollo Trauma & Heart Institute)\n' +
  '  - Displays locked room & bay: Trauma Bay #2 (Reserved & Locked)\n' +
  '  - Displays attending doctor: Dr. Sudhir Rao, MD (Cardiology & Trauma In-Charge)\n' +
  '  - Displays exact clock timestamp of medical handoff\n\n' +
  '• Emotional & Clinical Reassurance:\n' +
  '  Silences all emergency alarms and displays: "Clinical care initiated. You are in safe hands."',
  {
    x: 2.2, y: 2.85, w: 8.9, h: 3.5,
    fontSize: 12, fontFace: 'Arial', color: TEXT_WHITE, lineSpacing: 20
  }
);

// ============================================================================
// SLIDE 8: SMART OPD QUEUE & HOME-WAITING PACING
// ============================================================================
const slide8 = pres.addSlide();
addHeader(slide8, 'Smart Just-in-Time OPD Queue Management', 'Outpatient Innovation');

const opdCards = [
  {
    title: 'Dynamic Home-Waiting Pacing',
    desc: 'Algorithms compute travel time and live room delays. Instead of waiting in crowded hospitals, patients stay safely at home and arrive just in time.'
  },
  {
    title: 'Sequential Token Integrity',
    desc: '100% unified token numbers between online app appointments and offline walk-in kiosks (SANJ-104, 105, 106...). Never skips or duplicates.'
  },
  {
    title: 'Doctor Delay Broadcast',
    desc: 'When an emergency delays the doctor by +15 minutes, a single click notifies all home-waiting patients, auto-adjusting their departure time.'
  }
];

opdCards.forEach((c, idx) => {
  const x = 0.8 + idx * 3.95;
  const y = 2.1;

  slide8.addShape(pres.ShapeType.roundRect, {
    x, y, w: 3.7, h: 4.4,
    fill: { color: CARD_BG },
    line: { color: ACCENT_CYAN, width: 1.5 },
    radius: 12
  });

  slide8.addText(`0${idx + 1}`, {
    x: x + 0.3, y: y + 0.3, w: 3.1, h: 0.5,
    fontSize: 28, fontFace: 'Arial Black', color: ACCENT_CYAN
  });

  slide8.addText(c.title, {
    x: x + 0.3, y: y + 0.9, w: 3.1, h: 0.6,
    fontSize: 14, fontFace: 'Arial', bold: true, color: TEXT_WHITE
  });

  slide8.addText(c.desc, {
    x: x + 0.3, y: y + 1.6, w: 3.1, h: 2.6,
    fontSize: 11, fontFace: 'Arial', color: TEXT_MUTED, lineSpacing: 18
  });
});

// ============================================================================
// SLIDE 9: BUSINESS IMPACT & SCALABILITY
// ============================================================================
const slide9 = pres.addSlide();
addHeader(slide9, 'Real-World Impact, Metrics & Scalability', 'Value Proposition');

const metrics = [
  { val: '65%', label: 'Reduction in Golden Hour Delays', sub: 'Instant bed hold + route green-lighting' },
  { val: '3+ Hrs', label: 'Lobby Wait Time Eliminated', sub: 'Patients wait comfortably at home' },
  { val: '150 ms', label: 'Multilingual Voice AI Catch', sub: 'Instant clinical symptom standardization' },
  { val: '100%', label: 'Real-Time Sync Integrity', sub: 'Cross-tab & WebSocket zero-drop ledger' }
];

metrics.forEach((m, idx) => {
  const x = 0.8 + idx * 2.95;
  const y = 2.1;

  slide9.addShape(pres.ShapeType.roundRect, {
    x, y, w: 2.8, h: 4.4,
    fill: { color: CARD_BG },
    line: { color: '334155', width: 1.5 },
    radius: 12
  });

  slide9.addText(m.val, {
    x, y: y + 0.5, w: 2.8, h: 0.9,
    fontSize: 36, fontFace: 'Arial Black', bold: true, color: ACCENT_GREEN, align: 'center'
  });

  slide9.addText(m.label, {
    x: x + 0.2, y: y + 1.6, w: 2.4, h: 0.8,
    fontSize: 13, fontFace: 'Arial', bold: true, color: TEXT_WHITE, align: 'center'
  });

  slide9.addText(m.sub, {
    x: x + 0.2, y: y + 2.6, w: 2.4, h: 1.2,
    fontSize: 10, fontFace: 'Arial', color: TEXT_MUTED, align: 'center'
  });
});

// ============================================================================
// SLIDE 10: CONCLUSION & LIVE DEMO
// ============================================================================
const slide10 = pres.addSlide();
slide10.background = { color: DARK_BG };

slide10.addText('HACKATHON GRAND FINALE', {
  x: 1.5, y: 1.2, w: 10.3, h: 0.4,
  fontSize: 12, fontFace: 'Arial', bold: true, color: ACCENT_GREEN, align: 'center', charSpacing: 3
});

slide10.addText('Transforming Emergency Care with Sanjeevani AI', {
  x: 1.5, y: 1.8, w: 10.3, h: 0.9,
  fontSize: 34, fontFace: 'Arial Black', bold: true, color: TEXT_WHITE, align: 'center'
});

slide10.addText('"From blind panic to real-time, life-saving clinical orchestration."', {
  x: 2.0, y: 2.8, w: 9.3, h: 0.5,
  fontSize: 14, fontFace: 'Georgia', italic: true, color: TEXT_MUTED, align: 'center'
});

// Demo Links Box
slide10.addShape(pres.ShapeType.roundRect, {
  x: 2.5, y: 3.6, w: 8.3, h: 2.6,
  fill: { color: CARD_BG },
  line: { color: ACCENT_GREEN, width: 2 },
  radius: 14
});

slide10.addText('🚀 LIVE INTERACTIVE DEMO READY FOR JUDGES', {
  x: 2.5, y: 3.9, w: 8.3, h: 0.35,
  fontSize: 13, fontFace: 'Arial', bold: true, color: ACCENT_GREEN, align: 'center'
});

slide10.addText('👉 Patient Emergency Portal:  http://localhost:5173\n👉 Hospital Admin ER Desk:     http://localhost:5173/admin', {
  x: 2.8, y: 4.4, w: 7.7, h: 0.8,
  fontSize: 14, fontFace: 'Courier New', bold: true, color: TEXT_WHITE, align: 'center', lineSpacing: 24
});

slide10.addText('Thank You! Open for Questions & Live Interactive Trial.', {
  x: 2.5, y: 5.4, w: 8.3, h: 0.4,
  fontSize: 12, fontFace: 'Arial', italic: true, color: TEXT_GOLD, align: 'center'
});

// Save Presentation
const outputPath = path.join(__dirname, 'Sanjeevani_AI_Hackathon_Pitch.pptx');
pres.writeFile({ fileName: outputPath })
  .then(() => {
    console.log(`SUCCESS: PowerPoint saved to ${outputPath}`);
  })
  .catch((err) => {
    console.error('Error generating PPTX:', err);
  });
