import React, { useState, useEffect, useRef } from 'react';
import { MessageSquare, X, ArrowRight, Pause, Play } from 'lucide-react';
import gsap from 'gsap';
import type { Language } from '../types';

interface RoamingDocBotProps {
  lang: Language;
  onOpenChat: (initialQuery?: string) => void;
  onOpenHazardReport?: () => void;
}

interface DocBotThought {
  id: string;
  sectionId?: string;
  type: 'fact' | 'precaution' | 'alert' | 'pa_prompt' | 'savings';
  badgeEn: string;
  badgeTa: string;
  badgeColor: string;
  textEn: string;
  textTa: string;
  quickQueryEn: string;
  quickQueryTa: string;
}

const DOCBOT_THOUGHTS: DocBotThought[] = [
  {
    id: 'hero',
    sectionId: 'hero-section',
    type: 'pa_prompt',
    badgeEn: 'Health Assistant',
    badgeTa: 'மருத்துவ உதவியாளர்',
    badgeColor: 'bg-teal-600 text-white',
    textEn: "Vanakkam! I'm DocBot, your 24/7 health companion. Is anyone in your family feeling unwell today?",
    textTa: "வணக்கம்! நான் DocBot. வீட்டில் யாருக்காவது காய்ச்சல் அல்லது உடல் சோர்வு உள்ளதா? என்னிடம் கேளுங்கள்!",
    quickQueryEn: "How to tell if mild fever needs a doctor visit?",
    quickQueryTa: "சாதாரண காய்ச்சலுக்கு எப்போது மருத்துவரிடம் செல்ல வேண்டும்?",
  },
  {
    id: 'doctor',
    sectionId: 'action-card-doctor',
    type: 'fact',
    badgeEn: 'Clinical Fact',
    badgeTa: 'மருத்துவர் ஆலோசனை',
    badgeColor: 'bg-teal-700 text-white',
    textEn: "Doctor Fact: Drinking 8 glasses of lukewarm boiled water cuts viral throat and gut infection chances by 45%.",
    textTa: "மருத்துவ உண்மை: தினமும் கொதித்து ஆறிய வெந்நீர் அருந்துவது தொண்டை மற்றும் வயிற்றுத் தொற்றை 45% குறைக்கிறது.",
    quickQueryEn: "What home remedies help soothe viral throat pain?",
    quickQueryTa: "தொண்டை வலிக்கு வீட்டில் செய்யக்கூடிய எளிய வழிகள் என்ன?",
  },
  {
    id: 'ambulance',
    sectionId: 'action-card-ambulance',
    type: 'alert',
    badgeEn: 'Emergency Alert',
    badgeTa: 'அவசர சிகிச்சை',
    badgeColor: 'bg-rose-600 text-white',
    textEn: "Golden Hour: Chest pain radiating to left arm or sudden slurred speech requires immediate 108 dispatch!",
    textTa: "அவசர எச்சரிக்கை: இடது கைக்கு பரவும் நெஞ்சு வலி அல்லது பேச்சு தடுமாற்றம் இருந்தால் தாமதிக்காமல் 108 அழைக்கவும்!",
    quickQueryEn: "What are the earliest signs of a heart attack or stroke?",
    quickQueryTa: "மாரடைப்பு மற்றும் பக்கவாதத்தின் ஆரம்ப அறிகுறிகள் என்ன?",
  },
  {
    id: 'prescription',
    sectionId: 'action-card-prescription',
    type: 'fact',
    badgeEn: 'Prescription Guide',
    badgeTa: 'சீட்டு ஸ்கேன்',
    badgeColor: 'bg-sky-600 text-white',
    textEn: "Prescription Tip: Uploading your doctor's slip helps decipher doctor handwriting and translates dosage into Tamil.",
    textTa: "மருத்துவர் சீட்டு: உங்கள் மருந்து சீட்டை பதிவேற்றினால், மருந்துகளின் பெயர் மற்றும் சாப்பிடும் நேரத்தை தமிழில் தெரிந்து கொள்ளலாம்.",
    quickQueryEn: "How to understand timing and food restrictions for my medicines?",
    quickQueryTa: "மருந்துகளை உணவுக்கு முன் அல்லது பின் எப்போது சாப்பிட வேண்டும்?",
  },
  {
    id: 'medicines',
    sectionId: 'action-card-medicines',
    type: 'savings',
    badgeEn: 'Generic Savings',
    badgeTa: '90% பண சேமிப்பு',
    badgeColor: 'bg-emerald-600 text-white',
    textEn: "Medicine Tip: Brand name BP tablets cost ₹140. Government Jan Aushadhi generic costs only ₹14! Ask me how to get them.",
    textTa: "மருந்து சேமிப்பு: கடைகளில் ₹140 விற்கும் BP மாத்திரை மக்கள் மருந்தகத்தில் வெறும் ₹14 மட்டுமே! விவரம் அறிய தொடவும்.",
    quickQueryEn: "Where can I find generic BP and diabetes medicines near me?",
    quickQueryTa: "அருகிலுள்ள அரசு மக்கள் மருந்தகம் எங்குள்ளது?",
  },
  {
    id: 'clinic',
    sectionId: 'action-card-clinic',
    type: 'alert',
    badgeEn: 'Dengue Prevention',
    badgeTa: 'டெங்கு எச்சரிக்கை',
    badgeColor: 'bg-rose-600 text-white',
    textEn: "Dengue Alert: Even half a cup of stagnant water can breed 100 mosquitoes in 7 days. Check flower pots today!",
    textTa: "டெங்கு எச்சரிக்கை: தேங்கிய சிறு நீரில் கூட 7 நாட்களில் 100 கொசுக்கள் உற்பத்தியாகும்! தொட்டிகளை உடனே மூடுங்கள்!",
    quickQueryEn: "What are the earliest warning signs of Dengue fever?",
    quickQueryTa: "டெங்கு காய்ச்சலின் ஆரம்ப அறிகுறிகள் என்ன?",
  },
  {
    id: 'babyshots',
    sectionId: 'action-card-babyshots',
    type: 'precaution',
    badgeEn: 'Child Wellness',
    badgeTa: 'குழந்தை நலம்',
    badgeColor: 'bg-amber-600 text-white',
    textEn: "Parenting Tip: Never give honey to babies under 1 year old. For vaccination dates, tap my Baby Shots schedule!",
    textTa: "குழந்தை நலம்: 1 வயதுக்குட்பட்ட குழந்தைகளுக்கு தேன் தரக்கூடாது! தடுப்பூசி விவரங்களுக்கு என்னை தொடவும்!",
    quickQueryEn: "Which vaccines are due for a 6 month baby?",
    quickQueryTa: "6 மாத குழந்தைக்கு போட வேண்டிய தடுப்பூசிகள் என்ன?",
  },
  {
    id: 'sentinel',
    sectionId: 'trust-strip',
    type: 'pa_prompt',
    badgeEn: 'Civic Health',
    badgeTa: 'கள ஆய்வு புகார்',
    badgeColor: 'bg-purple-600 text-white',
    textEn: "Seeing dirty water or open drainage near your street? Tell me, I will notify the sanitary inspector team directly!",
    textTa: "உங்கள் தெருவில் கழிவு நீர் அல்லது சாக்கடை அடைப்பு உள்ளதா? என்னிடம் சொல்லுங்கள், சுகாதார குழுவுக்கு புகார் அனுப்புவோம்!",
    quickQueryEn: "Report stagnant water and request mosquito fogging",
    quickQueryTa: "தேங்கிய தண்ணீர் மற்றும் கொசு மருந்து அடிக்க புகார் செய்",
  },
];

export const RoamingDocBot: React.FC<RoamingDocBotProps> = ({
  lang,
  onOpenChat,
}) => {
  const [currentThoughtIndex, setCurrentThoughtIndex] = useState(0);
  const [bubbleVisible, setBubbleVisible] = useState(true);
  const [isRoamingPaused, setIsRoamingPaused] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [isWalking, setIsWalking] = useState(false);
  
  const botContainerRef = useRef<HTMLDivElement>(null);
  const robotWrapperRef = useRef<HTMLDivElement>(null);
  const speechBubbleRef = useRef<HTMLDivElement>(null);
  const roamingTweenRef = useRef<gsap.core.Tween | null>(null);

  // GSAP Organic Idle Float
  useEffect(() => {
    const robot = robotWrapperRef.current;
    if (!robot) return;

    const hoverTween = gsap.to(robot, {
      y: -8,
      rotation: 1.5,
      duration: 2.2,
      yoyo: true,
      repeat: -1,
      ease: 'sine.inOut',
    });

    return () => {
      hoverTween.kill();
    };
  }, []);

  // Autonomous Roaming Patrol
  useEffect(() => {
    const container = botContainerRef.current;
    const robot = robotWrapperRef.current;
    if (!container || !robot) return;

    const positions = [0, -120, -250, -130, 25, -75];
    let posIndex = 0;

    const patrolNext = () => {
      if (isRoamingPaused) return;

      const targetX = positions[posIndex % positions.length];
      posIndex++;

      // Start Walking: rhythmic swagger
      setIsWalking(true);

      const walkSway = gsap.to(robot, {
        rotation: 3.5,
        y: -4,
        duration: 0.28,
        yoyo: true,
        repeat: -1,
        ease: 'sine.inOut',
      });

      // Move smoothly to next patrol stop
      roamingTweenRef.current = gsap.to(container, {
        x: targetX,
        duration: 4.8,
        ease: 'power1.inOut',
        onComplete: () => {
          walkSway.kill();
          setIsWalking(false);
          setBubbleVisible(true);

          setCurrentThoughtIndex((prev) => {
            const nextIndex = (prev + 1) % DOCBOT_THOUGHTS.length;
            const nextThought = DOCBOT_THOUGHTS[nextIndex];

            // Trigger responsive pose gesture
            if (nextThought.type === 'pa_prompt') {
              gsap.to(robot, {
                rotation: 6,
                duration: 0.22,
                yoyo: true,
                repeat: 5,
                ease: 'sine.inOut',
              });
            } else {
              gsap.to(robot, {
                y: -14,
                scale: 1.05,
                duration: 0.3,
                yoyo: true,
                repeat: 1,
                ease: 'power2.out',
              });
            }

            return nextIndex;
          });

          // Wait 8 seconds while user reads the thought, then roam to next position
          setTimeout(() => {
            if (!isHovered && !isRoamingPaused) {
              patrolNext();
            }
          }, 8000);
        },
      });
    };

    const initialTimer = setTimeout(() => {
      patrolNext();
    }, 5000);

    return () => {
      clearTimeout(initialTimer);
      if (roamingTweenRef.current) roamingTweenRef.current.kill();
    };
  }, [isRoamingPaused, isHovered]);

  // SMART SCROLL TRACKING: DocBot observes user scroll and points towards the active in-view card
  useEffect(() => {
    let scrollTimeout: ReturnType<typeof setTimeout>;
    const container = botContainerRef.current;
    const robot = robotWrapperRef.current;
    if (!container || !robot) return;

    const handleScroll = () => {
      // User is scrolling: immediately pause background patrol and clear walking state
      if (roamingTweenRef.current) roamingTweenRef.current.pause();
      setIsWalking(false);
      gsap.killTweensOf(robot);

      // If at top of page, always show hero greeting with friendly wave
      if (window.scrollY < 120) {
        if (currentThoughtIndex !== 0) {
          setCurrentThoughtIndex(0);
          setBubbleVisible(true);
          gsap.to(robot, {
            rotation: 6,
            duration: 0.2,
            yoyo: true,
            repeat: 4,
            ease: 'sine.inOut',
          });
        }
        return;
      }

      const viewportCenter = window.innerHeight * 0.45;
      let matchedIndex = -1;
      let closestDistance = Infinity;

      DOCBOT_THOUGHTS.forEach((thought, idx) => {
        if (!thought.sectionId) return;
        const el = document.getElementById(thought.sectionId);
        if (el) {
          const rect = el.getBoundingClientRect();
          // Element is in the active viewport band
          if (rect.bottom > 120 && rect.top < window.innerHeight - 100) {
            const elCenter = rect.top + rect.height / 2;
            const dist = Math.abs(elCenter - viewportCenter);
            if (dist < closestDistance) {
              closestDistance = dist;
              matchedIndex = idx;
            }
          }
        }
      });

      if (matchedIndex !== -1 && matchedIndex !== currentThoughtIndex) {
        const targetThought = DOCBOT_THOUGHTS[matchedIndex];
        setIsWalking(false);
        gsap.killTweensOf(robot);
        setCurrentThoughtIndex(matchedIndex);
        setBubbleVisible(true);

        // Temporarily pause patrol during scroll tracking
        if (roamingTweenRef.current) roamingTweenRef.current.pause();

        // Responsive gesture: Point towards the active card or wave
        if (targetThought.type === 'pa_prompt') {
          gsap.to(robot, {
            rotation: 6,
            duration: 0.2,
            yoyo: true,
            repeat: 4,
            ease: 'sine.inOut',
          });
        } else {
          // Point index finger upwards directly towards the feature card message
          gsap.to(robot, {
            y: -16,
            scale: 1.08,
            duration: 0.28,
            yoyo: true,
            repeat: 1,
            ease: 'power2.out',
          });
        }

        // Animate speech bubble pop-in
        if (speechBubbleRef.current) {
          gsap.fromTo(
            speechBubbleRef.current,
            { scale: 0.75, opacity: 0, y: 12 },
            { scale: 1, opacity: 1, y: 0, duration: 0.45, ease: 'back.out(2)' }
          );
        }
      }

      // Resume autonomous patrol after user stops scrolling for 10 seconds
      clearTimeout(scrollTimeout);
      scrollTimeout = setTimeout(() => {
        if (!isRoamingPaused && !isHovered) {
          if (roamingTweenRef.current) roamingTweenRef.current.resume();
        }
      }, 10000);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => {
      window.removeEventListener('scroll', handleScroll);
      clearTimeout(scrollTimeout);
    };
  }, [currentThoughtIndex, isRoamingPaused, isHovered]);

  const activeThought = DOCBOT_THOUGHTS[currentThoughtIndex];

  // Dynamic 3D Pose Selection: Waving for greetings, Pointing for facts/alerts, Standing for walk
  const getDocBotPose = () => {
    if (isWalking) return '/docbot_mascot.png';
    if (activeThought.type === 'pa_prompt') return '/docbot_waving.png';
    return '/docbot_pointing.png';
  };

  const handleBotClick = () => {
    // Joyful bounce animation on click
    if (robotWrapperRef.current) {
      gsap.to(robotWrapperRef.current, {
        scale: 1.15,
        y: -18,
        duration: 0.22,
        yoyo: true,
        repeat: 1,
        ease: 'power2.out',
        onComplete: () => {
          onOpenChat(lang === 'ta' ? activeThought.quickQueryTa : activeThought.quickQueryEn);
        },
      });
    } else {
      onOpenChat(lang === 'ta' ? activeThought.quickQueryTa : activeThought.quickQueryEn);
    }
  };

  return (
    <div
      ref={botContainerRef}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className="fixed bottom-16 md:bottom-6 right-6 md:right-10 z-50 flex flex-col items-end select-none pointer-events-auto"
      style={{ willChange: 'transform' }}
    >
      {/* Dynamic Pop-up Thought / Health Fact Bubble */}
      {bubbleVisible && (
        <div
          ref={speechBubbleRef}
          onClick={handleBotClick}
          className="mb-3 max-w-[280px] sm:max-w-[320px] bg-white/95 backdrop-blur-md rounded-2xl p-3.5 shadow-[0_16px_36px_rgba(15,23,42,0.18)] border border-teal-200/80 cursor-pointer transform hover:scale-[1.03] transition-all duration-200 relative group animate-in fade-in"
        >
          {/* Top Badge & Close/Pause controls */}
          <div className="flex items-center justify-between gap-2 mb-1.5">
            <div className="flex items-center gap-1.5">
              <span className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-full ${activeThought.badgeColor}`}>
                {lang === 'ta' ? activeThought.badgeTa : activeThought.badgeEn}
              </span>
            </div>

            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setIsRoamingPaused(!isRoamingPaused);
                }}
                title={isRoamingPaused ? 'Resume Roaming' : 'Pause Roaming'}
                className="p-1 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 transition-colors"
              >
                {isRoamingPaused ? <Play className="w-3 h-3 text-teal-600" /> : <Pause className="w-3 h-3" />}
              </button>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setBubbleVisible(false);
                }}
                title="Dismiss Thought"
                className="p-1 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 transition-colors"
              >
                <X className="w-3 h-3" />
              </button>
            </div>
          </div>

          {/* Thought Content */}
          <p className="text-xs text-slate-800 font-medium leading-relaxed">
            {lang === 'ta' ? activeThought.textTa : activeThought.textEn}
          </p>

          {/* Action Callout Prompt */}
          <div className="mt-2 pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] font-bold text-teal-700 group-hover:text-teal-800">
            <span className="flex items-center gap-1.5">
              <MessageSquare className="w-3 h-3 text-teal-600" />
              <span>{lang === 'en' ? 'Tap DocBot to ask anything' : 'DocBot-உடன் பேச தொடவும்'}</span>
            </span>
            <ArrowRight className="w-3 h-3 transform group-hover:translate-x-1 transition-transform" />
          </div>

          {/* Speech Bubble Arrow pointing cleanly to DocBot's antenna */}
          <div className="absolute -bottom-2 right-10 w-4 h-4 bg-white/95 border-r border-b border-teal-200/80 rotate-45" />
        </div>
      )}

      {/* The 3D Robot Doctor Mascot with Intact Limbs & Adaptive Poses */}
      <div
        ref={robotWrapperRef}
        className="relative group cursor-pointer"
        onClick={handleBotClick}
        role="button"
        tabIndex={0}
        aria-label="Talk to DocBot AI Health Assistant"
      >
        {/* Pulsing Medical Aura Ring around DocBot */}
        <div className="absolute -inset-2 bg-gradient-to-r from-teal-400/30 to-cyan-400/30 rounded-full blur-md opacity-75 group-hover:opacity-100 animate-pulse pointer-events-none" />

        {/* 3D Mascot Image with GSAP Float & Adaptive Waving / Pointing Pose */}
        <div className="relative">
          <img
            src={getDocBotPose()}
            key={getDocBotPose()}
            alt="DocBot AI Health Assistant"
            className={`w-24 h-auto object-contain filter drop-shadow-[0_12px_24px_rgba(15,23,42,0.22)] transition-all duration-300 animate-in fade-in zoom-in-95 ${
              isHovered ? 'scale-110 drop-shadow-[0_16px_32px_rgba(13,148,136,0.45)]' : ''
            }`}
          />

          {/* Magnetic Boot Thruster Glow when Walking */}
          {isWalking && (
            <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 flex items-center gap-5 pointer-events-none">
              <span className="w-4 h-1.5 bg-cyan-400/80 rounded-full blur-xs animate-ping" />
              <span className="w-4 h-1.5 bg-cyan-400/80 rounded-full blur-xs animate-ping" />
            </div>
          )}

          {/* Online Doctor Live Beacon */}
          <span className="absolute bottom-6 right-2 w-3.5 h-3.5 bg-emerald-500 border-2 border-white rounded-full shadow-md animate-ping" />
          <span className="absolute bottom-6 right-2 w-3.5 h-3.5 bg-emerald-500 border-2 border-white rounded-full shadow-md" />

          {/* Name Tag Pill */}
          <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 bg-slate-900/90 text-white font-black text-[10px] px-2.5 py-0.5 rounded-full shadow-md border border-slate-700 whitespace-nowrap flex items-center gap-1">
            <span className="text-teal-400">●</span>
            <span>DocBot AI</span>
          </div>
        </div>

        {/* Hover Tooltip when bubble is closed */}
        {!bubbleVisible && (
          <div className="absolute -top-9 right-0 bg-slate-900 text-white text-[11px] font-bold px-3 py-1 rounded-xl shadow-lg whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
            {lang === 'en' ? 'Click to speak with DocBot' : 'DocBot உடன் பேச தொடவும்'}
          </div>
        )}
      </div>

    </div>
  );
};
