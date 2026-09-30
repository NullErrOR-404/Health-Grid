import React, { useEffect, useRef } from 'react';
import gsap from 'gsap';

interface LiveRiggedDocBotProps {
  isWalking: boolean;
  isWaving: boolean;
  isHovered: boolean;
  size?: number;
}

export const LiveRiggedDocBot: React.FC<LiveRiggedDocBotProps> = ({
  isWalking,
  isWaving,
  isHovered,
  size = 110,
}) => {
  // Rigged Joint Refs
  const leftUpperArmRef = useRef<SVGGElement>(null);
  const leftForearmRef = useRef<SVGGElement>(null);
  const rightUpperArmRef = useRef<SVGGElement>(null);
  const rightForearmRef = useRef<SVGGElement>(null);
  const leftLegRef = useRef<SVGGElement>(null);
  const rightLegRef = useRef<SVGGElement>(null);
  const headRef = useRef<SVGGElement>(null);
  const eyeLeftRef = useRef<SVGPathElement>(null);
  const eyeRightRef = useRef<SVGPathElement>(null);
  const torsoRef = useRef<SVGGElement>(null);

  // GSAP Limb Choreography & Inverse Kinematics Emulation
  useEffect(() => {
    const leftUpperArm = leftUpperArmRef.current;
    const leftForearm = leftForearmRef.current;
    const rightUpperArm = rightUpperArmRef.current;
    const rightForearm = rightForearmRef.current;
    const leftLeg = leftLegRef.current;
    const rightLeg = rightLegRef.current;
    const torso = torsoRef.current;
    const head = headRef.current;

    if (
      !leftUpperArm ||
      !leftForearm ||
      !rightUpperArm ||
      !rightForearm ||
      !leftLeg ||
      !rightLeg ||
      !torso ||
      !head
    )
      return;

    // Kill existing tweens on limb joints
    gsap.killTweensOf([
      leftUpperArm,
      leftForearm,
      rightUpperArm,
      rightForearm,
      leftLeg,
      rightLeg,
      torso,
      head,
    ]);

    if (isWalking) {
      // --- WALKING STATE ---
      // Left leg stride (Hip anchor: 47px 102px)
      gsap.to(leftLeg, {
        rotation: 22,
        transformOrigin: '47px 102px',
        duration: 0.32,
        yoyo: true,
        repeat: -1,
        ease: 'sine.inOut',
      });

      // Right leg counter-stride (Hip anchor: 73px 102px)
      gsap.to(rightLeg, {
        rotation: -22,
        transformOrigin: '73px 102px',
        duration: 0.32,
        yoyo: true,
        repeat: -1,
        ease: 'sine.inOut',
      });

      // Left arm swing (Shoulder anchor: 34px 68px, Elbow anchor: 34px 84px)
      gsap.to(leftUpperArm, {
        rotation: -24,
        transformOrigin: '34px 68px',
        duration: 0.32,
        yoyo: true,
        repeat: -1,
        ease: 'sine.inOut',
      });
      gsap.to(leftForearm, {
        rotation: -14,
        transformOrigin: '34px 84px',
        duration: 0.32,
        yoyo: true,
        repeat: -1,
        ease: 'sine.inOut',
      });

      // Right arm counter-swing (Shoulder anchor: 86px 68px, Elbow anchor: 86px 84px)
      gsap.to(rightUpperArm, {
        rotation: 24,
        transformOrigin: '86px 68px',
        duration: 0.32,
        yoyo: true,
        repeat: -1,
        ease: 'sine.inOut',
      });
      gsap.to(rightForearm, {
        rotation: 14,
        transformOrigin: '86px 84px',
        duration: 0.32,
        yoyo: true,
        repeat: -1,
        ease: 'sine.inOut',
      });

      // Natural vertical walking bob
      gsap.to(torso, {
        y: -3,
        duration: 0.16,
        yoyo: true,
        repeat: -1,
        ease: 'sine.inOut',
      });
      gsap.to(head, {
        y: -2,
        rotation: 1,
        transformOrigin: '60px 48px',
        duration: 0.16,
        yoyo: true,
        repeat: -1,
        ease: 'sine.inOut',
      });
    } else if (isWaving) {
      // --- WAVING / GREETING STATE ---
      // Reset legs into balanced resting superhero stance
      gsap.to(leftLeg, {
        rotation: 3,
        transformOrigin: '47px 102px',
        duration: 0.4,
        ease: 'power2.out',
      });
      gsap.to(rightLeg, {
        rotation: -3,
        transformOrigin: '73px 102px',
        duration: 0.4,
        ease: 'power2.out',
      });

      // Left upper arm lifts up in greeting
      gsap.to(leftUpperArm, {
        rotation: -78,
        transformOrigin: '34px 68px',
        duration: 0.4,
        ease: 'back.out(1.5)',
      });

      // Left forearm actively waves back and forth (Elbow: 34px 84px)
      gsap.to(leftForearm, {
        rotation: -32,
        transformOrigin: '34px 84px',
        duration: 0.24,
        yoyo: true,
        repeat: -1,
        ease: 'sine.inOut',
        delay: 0.25,
      });

      // Right arm rests comfortably holding medical datapad
      gsap.to(rightUpperArm, {
        rotation: 6,
        transformOrigin: '86px 68px',
        duration: 0.4,
        ease: 'power2.out',
      });
      gsap.to(rightForearm, {
        rotation: -8,
        transformOrigin: '86px 84px',
        duration: 0.4,
        ease: 'power2.out',
      });

      // Friendly inquisitive head tilt
      gsap.to(head, {
        rotation: 5,
        y: 0,
        transformOrigin: '60px 48px',
        duration: 1.2,
        yoyo: true,
        repeat: -1,
        ease: 'sine.inOut',
      });
      gsap.to(torso, {
        y: 0,
        duration: 0.4,
        ease: 'power2.out',
      });
    } else {
      // --- IDLE HOVERING STATE ---
      gsap.to([leftLeg, rightLeg], {
        rotation: 0,
        duration: 0.5,
        ease: 'power2.out',
      });

      gsap.to(leftUpperArm, {
        rotation: 8,
        transformOrigin: '34px 68px',
        duration: 1.6,
        yoyo: true,
        repeat: -1,
        ease: 'sine.inOut',
      });
      gsap.to(leftForearm, {
        rotation: 4,
        transformOrigin: '34px 84px',
        duration: 1.6,
        yoyo: true,
        repeat: -1,
        ease: 'sine.inOut',
      });

      gsap.to(rightUpperArm, {
        rotation: -8,
        transformOrigin: '86px 68px',
        duration: 1.6,
        yoyo: true,
        repeat: -1,
        ease: 'sine.inOut',
      });
      gsap.to(rightForearm, {
        rotation: -4,
        transformOrigin: '86px 84px',
        duration: 1.6,
        yoyo: true,
        repeat: -1,
        ease: 'sine.inOut',
      });

      gsap.to(head, {
        rotation: -2,
        y: 0,
        transformOrigin: '60px 48px',
        duration: 2,
        yoyo: true,
        repeat: -1,
        ease: 'sine.inOut',
      });
    }
  }, [isWalking, isWaving]);

  // Digital Visor Eye Blinking Cycle
  useEffect(() => {
    const eyeLeft = eyeLeftRef.current;
    const eyeRight = eyeRightRef.current;
    if (!eyeLeft || !eyeRight) return;

    const blink = () => {
      gsap.to([eyeLeft, eyeRight], {
        scaleY: 0.08,
        transformOrigin: 'center center',
        duration: 0.08,
        yoyo: true,
        repeat: 1,
        ease: 'power2.inOut',
        onComplete: () => {
          const nextBlink = Math.random() * 2600 + 2400;
          setTimeout(blink, nextBlink);
        },
      });
    };

    const timer = setTimeout(blink, 2200);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div
      className={`relative select-none transition-transform duration-300 ${
        isHovered
          ? 'scale-110 drop-shadow-[0_16px_28px_rgba(13,148,136,0.4)]'
          : 'drop-shadow-[0_10px_20px_rgba(15,23,42,0.18)]'
      }`}
      style={{ width: size, height: size * 1.18 }}
    >
      <svg
        viewBox="0 0 120 142"
        className="w-full h-full overflow-visible"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          {/* Glossy Porcelain White Ceramic Shading */}
          <linearGradient id="docPorcelain" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#FFFFFF" />
            <stop offset="50%" stopColor="#F8FAFC" />
            <stop offset="85%" stopColor="#E2E8F0" />
            <stop offset="100%" stopColor="#CBD5E1" />
          </linearGradient>

          {/* Medical Teal Accent Gradient */}
          <linearGradient id="docTealGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#14B8A6" />
            <stop offset="50%" stopColor="#0D9488" />
            <stop offset="100%" stopColor="#0F766E" />
          </linearGradient>

          {/* Dark Glass OLED Visor */}
          <linearGradient id="docVisorGlass" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#090D16" />
            <stop offset="70%" stopColor="#1E293B" />
            <stop offset="100%" stopColor="#0F172A" />
          </linearGradient>

          {/* Cyan Glow Core */}
          <radialGradient id="cyanCorePulse" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#67E8F9" stopOpacity="1" />
            <stop offset="55%" stopColor="#06B6D4" stopOpacity="0.85" />
            <stop offset="100%" stopColor="#0891B2" stopOpacity="0" />
          </radialGradient>

          {/* Soft Joint Shadow */}
          <filter id="softJointShadow" x="-10%" y="-10%" width="120%" height="120%">
            <feDropShadow dx="0" dy="1.5" stdDeviation="1" floodColor="#0F172A" floodOpacity="0.18" />
          </filter>

          {/* Cyan Visor Eyes Glow Filter */}
          <filter id="eyeGlow" x="-20%" y="-20%" width="140%" height="140%">
            <feDropShadow dx="0" dy="0" stdDeviation="1.5" floodColor="#22D3EE" floodOpacity="0.8" />
          </filter>
        </defs>

        {/* ============================================================== */}
        {/* ARTICULATED LEGS (Rooted firmly inside torso chassis at y=102) */}
        {/* ============================================================== */}

        {/* LEFT LEG (Hip Pivot: 47px 102px) */}
        <g ref={leftLegRef} id="left-leg" filter="url(#softJointShadow)">
          {/* Upper Thigh Capsule */}
          <rect x="41" y="98" width="12" height="18" rx="6" fill="url(#docTealGrad)" />
          {/* Knee Joint Disc */}
          <circle cx="47" cy="114" r="5" fill="#0F766E" stroke="#14B8A6" strokeWidth="0.8" />
          {/* Shin Armor */}
          <rect
            x="42"
            y="114"
            width="10"
            height="14"
            rx="4"
            fill="url(#docPorcelain)"
            stroke="#CBD5E1"
            strokeWidth="0.8"
          />
          {/* Medical Boot */}
          <path
            d="M 37 126 L 56 126 C 58 126 58.5 128.5 57.5 130.5 L 54.5 134 L 35 134 C 33 134 33.5 129 37 126 Z"
            fill="#0F766E"
          />
          {/* Boot Sole Cyan Ring */}
          <ellipse cx="46" cy="134" rx="7" ry="2.2" fill="#22D3EE" opacity="0.9" />
        </g>

        {/* RIGHT LEG (Hip Pivot: 73px 102px) */}
        <g ref={rightLegRef} id="right-leg" filter="url(#softJointShadow)">
          {/* Upper Thigh Capsule */}
          <rect x="67" y="98" width="12" height="18" rx="6" fill="url(#docTealGrad)" />
          {/* Knee Joint Disc */}
          <circle cx="73" cy="114" r="5" fill="#0F766E" stroke="#14B8A6" strokeWidth="0.8" />
          {/* Shin Armor */}
          <rect
            x="68"
            y="114"
            width="10"
            height="14"
            rx="4"
            fill="url(#docPorcelain)"
            stroke="#CBD5E1"
            strokeWidth="0.8"
          />
          {/* Medical Boot */}
          <path
            d="M 64 126 L 83 126 C 85 126 85.5 128.5 84.5 130.5 L 81.5 134 L 62 134 C 60 134 60.5 129 64 126 Z"
            fill="#0F766E"
          />
          {/* Boot Sole Cyan Ring */}
          <ellipse cx="73" cy="134" rx="7" ry="2.2" fill="#22D3EE" opacity="0.9" />
        </g>

        {/* ============================================================== */}
        {/* TORSO & DOCTOR COAT (Centered at x=60, spans x: 32-88, y: 60-106)*/}
        {/* ============================================================== */}
        <g ref={torsoRef} id="torso">
          {/* Main White Rounded Body Chassis */}
          <rect
            x="32"
            y="60"
            width="56"
            height="46"
            rx="20"
            fill="url(#docPorcelain)"
            stroke="#CBD5E1"
            strokeWidth="1.2"
          />

          {/* Doctor Coat Lapels (Teal V-Neck Inset) */}
          <path
            d="M 36 64 Q 48 82 50 105 L 38 105 Q 33 82 36 64 Z"
            fill="url(#docTealGrad)"
            opacity="0.85"
          />
          <path
            d="M 84 64 Q 72 82 70 105 L 82 105 Q 87 82 84 64 Z"
            fill="url(#docTealGrad)"
            opacity="0.85"
          />

          {/* Central Heart Reactor (Glowing ECG Pulse Core) */}
          <circle cx="60" cy="80" r="10" fill="#0F172A" stroke="#0D9488" strokeWidth="1.2" />
          <circle cx="60" cy="80" r="8.5" fill="url(#cyanCorePulse)" className="animate-pulse" />
          
          {/* Heart Emblem Shape & ECG Trace */}
          <path
            d="M 54 80 L 57 80 L 58.5 76 L 60.5 84 L 62 77.5 L 63.5 80 L 66 80"
            fill="none"
            stroke="#FFFFFF"
            strokeWidth="1.4"
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          {/* Red Cross Medical Pocket Badge */}
          <rect x="38" y="70" width="5" height="1.6" rx="0.5" fill="#E11D48" />
          <rect x="39.7" y="68.3" width="1.6" height="5" rx="0.5" fill="#E11D48" />

          {/* Realistic Stethoscope Tubing and Chest Piece */}
          <path
            d="M 44 60 C 44 72 52 75 56 75 M 76 60 C 76 72 68 75 64 75"
            fill="none"
            stroke="#0D9488"
            strokeWidth="2"
            strokeLinecap="round"
          />
          <circle cx="60" cy="94" r="4.2" fill="#E2E8F0" stroke="#0D9488" strokeWidth="1.2" />
          <circle cx="60" cy="94" r="2" fill="#0D9488" />
        </g>

        {/* ============================================================== */}
        {/* ARTICULATED ARMS (Double-Jointed: Shoulder + Elbow Hierarchy) */}
        {/* ============================================================== */}

        {/* LEFT ARM (Shoulder Socket: 34px 68px, Elbow Socket: 34px 84px) */}
        <g ref={leftUpperArmRef} id="left-upper-arm">
          {/* Spherical Shoulder Joint */}
          <circle cx="34" cy="68" r="5" fill="#0D9488" />
          {/* Upper Arm White Sleeve */}
          <rect
            x="29"
            y="68"
            width="10"
            height="18"
            rx="5"
            fill="url(#docPorcelain)"
            stroke="#CBD5E1"
            strokeWidth="0.8"
          />

          {/* Left Forearm & Hand (Child group rotating around elbow 34px 84px) */}
          <g ref={leftForearmRef} id="left-forearm">
            {/* Elbow Hinge Disc */}
            <circle cx="34" cy="84" r="4.2" fill="#0F766E" />
            {/* Forearm Teal Medical Glove Sleeve */}
            <rect x="29" y="84" width="10" height="15" rx="4.5" fill="url(#docTealGrad)" />
            {/* Hand Glove Palm */}
            <ellipse cx="34" cy="101" rx="5" ry="4.5" fill="#0F766E" />
            {/* Extended Cheerful Thumb / Fingers */}
            <circle cx="38" cy="99" r="2.2" fill="#0F766E" />
          </g>
        </g>

        {/* RIGHT ARM (Shoulder Socket: 86px 68px, Elbow Socket: 86px 84px) */}
        <g ref={rightUpperArmRef} id="right-upper-arm">
          {/* Spherical Shoulder Joint */}
          <circle cx="86" cy="68" r="5" fill="#0D9488" />
          {/* Upper Arm White Sleeve */}
          <rect
            x="81"
            y="68"
            width="10"
            height="18"
            rx="5"
            fill="url(#docPorcelain)"
            stroke="#CBD5E1"
            strokeWidth="0.8"
          />

          {/* Right Forearm & Hand holding Holographic Tablet */}
          <g ref={rightForearmRef} id="right-forearm">
            {/* Elbow Hinge Disc */}
            <circle cx="86" cy="84" r="4.2" fill="#0F766E" />
            {/* Forearm Teal Glove */}
            <rect x="81" y="84" width="10" height="15" rx="4.5" fill="url(#docTealGrad)" />
            {/* Hand Palm */}
            <ellipse cx="86" cy="101" rx="5" ry="4.5" fill="#0F766E" />

            {/* Glowing Holographic Medical Datapad */}
            <rect
              x="84"
              y="93"
              width="16"
              height="21"
              rx="3"
              fill="#0F172A"
              stroke="#22D3EE"
              strokeWidth="1.2"
              opacity="0.95"
            />
            {/* Datapad Screen Lines */}
            <line x1="87" y1="98" x2="96" y2="98" stroke="#22D3EE" strokeWidth="1" strokeLinecap="round" />
            <line x1="87" y1="102" x2="94" y2="102" stroke="#22D3EE" strokeWidth="1" strokeLinecap="round" />
            <circle cx="94" cy="108" r="1.8" fill="#10B981" />
          </g>
        </g>

        {/* ============================================================== */}
        {/* ARTICULATED HEAD & VISOR (Centered at x=60, spans x: 26-94)  */}
        {/* ============================================================== */}
        <g ref={headRef} id="head">
          {/* Antenna Rod & Glowing Sensor Dome */}
          <line x1="60" y1="14" x2="60" y2="4" stroke="#0D9488" strokeWidth="2.5" strokeLinecap="round" />
          <circle cx="60" cy="3" r="3.5" fill="#22D3EE" stroke="#FFFFFF" strokeWidth="1" className="animate-ping" />
          <circle cx="60" cy="3" r="3" fill="#06B6D4" />

          {/* Rounded Ear Headphones / Transducers */}
          <rect x="20" y="24" width="7" height="18" rx="3.5" fill="#0D9488" />
          <circle cx="23.5" cy="33" r="2" fill="#22D3EE" />
          <rect x="93" y="24" width="7" height="18" rx="3.5" fill="#0D9488" />
          <circle cx="96.5" cy="33" r="2" fill="#22D3EE" />

          {/* Doctor Helmet Ceramic Shell */}
          <rect
            x="26"
            y="12"
            width="68"
            height="48"
            rx="24"
            fill="url(#docPorcelain)"
            stroke="#CBD5E1"
            strokeWidth="1.2"
          />

          {/* Dark Curved Digital Visor */}
          <rect
            x="32"
            y="19"
            width="56"
            height="32"
            rx="16"
            fill="url(#docVisorGlass)"
            stroke="#334155"
            strokeWidth="1"
          />

          {/* Visor Gloss Reflection */}
          <path
            d="M 36 24 Q 48 21 58 21"
            fill="none"
            stroke="#FFFFFF"
            strokeWidth="1.5"
            strokeLinecap="round"
            opacity="0.35"
          />

          {/* Glowing Digital Cyan Eyes (Curved Happy Arcs) */}
          <g id="eyes" filter="url(#eyeGlow)">
            <path
              ref={eyeLeftRef}
              d="M 43 33 Q 48 28 53 33"
              fill="none"
              stroke="#22D3EE"
              strokeWidth="3.2"
              strokeLinecap="round"
            />
            <path
              ref={eyeRightRef}
              d="M 67 33 Q 72 28 77 33"
              fill="none"
              stroke="#22D3EE"
              strokeWidth="3.2"
              strokeLinecap="round"
            />
          </g>

          {/* Friendly Digital Smile */}
          <path
            d="M 57 41 Q 60 44 63 41"
            fill="none"
            stroke="#22D3EE"
            strokeWidth="1.8"
            strokeLinecap="round"
            opacity="0.9"
          />
        </g>
      </svg>
    </div>
  );
};
