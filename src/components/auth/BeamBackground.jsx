import React from "react";

// Glowing light-beam backdrop: bright orange streaks sweep up from the bottom
// edges, converging into a vertical column of light at center, all on deep black.
export default function BeamBackground() {
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden bg-black">
      {/* Base black */}
      <div className="absolute inset-0 bg-black" />

      {/* Curved fanning beams sweeping up from the bottom into the center column */}
      <svg
        className="absolute inset-0 w-full h-full"
        viewBox="0 0 1000 1000"
        preserveAspectRatio="xMidYMax slice"
      >
        <defs>
          <linearGradient id="beamGrad" x1="0" y1="1" x2="0" y2="0">
            <stop offset="0%" stopColor="#ff7a1a" stopOpacity="0" />
            <stop offset="35%" stopColor="#ff5a00" stopOpacity="0.55" />
            <stop offset="70%" stopColor="#ff8a3d" stopOpacity="0.9" />
            <stop offset="100%" stopColor="#ffd9b8" stopOpacity="1" />
          </linearGradient>
          <filter id="beamBlur" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="4" />
          </filter>
          <filter id="beamBlurSoft" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="14" />
          </filter>
        </defs>

        {/* Soft wide glow halo behind the beams */}
        <g filter="url(#beamBlurSoft)" opacity="0.8">
          <path d="M0 1000 C 300 850, 460 500, 480 0 L 520 0 C 540 500, 700 850, 1000 1000 Z" fill="url(#beamGrad)" opacity="0.5" />
        </g>

        {/* Crisp light streaks */}
        <g filter="url(#beamBlur)">
          {/* Center bright column */}
          <path d="M492 1000 C 494 600, 496 300, 498 0 L 502 0 C 504 300, 506 600, 508 1000 Z" fill="url(#beamGrad)" />
          {/* Inner pair */}
          <path d="M455 1000 C 470 650, 482 320, 486 0 L 490 0 C 487 320, 478 650, 468 1000 Z" fill="url(#beamGrad)" opacity="0.9" />
          <path d="M545 1000 C 530 650, 518 320, 514 0 L 510 0 C 513 320, 522 650, 532 1000 Z" fill="url(#beamGrad)" opacity="0.9" />
          {/* Mid pair — start curving from the sides */}
          <path d="M250 1000 C 360 800, 455 380, 472 0 L 478 0 C 462 400, 380 820, 300 1000 Z" fill="url(#beamGrad)" opacity="0.7" />
          <path d="M750 1000 C 640 800, 545 380, 528 0 L 522 0 C 538 400, 620 820, 700 1000 Z" fill="url(#beamGrad)" opacity="0.7" />
          {/* Outer pair — wide sweep along the bottom */}
          <path d="M40 1000 C 240 880, 430 450, 466 0 L 470 0 C 440 460, 270 900, 120 1000 Z" fill="url(#beamGrad)" opacity="0.45" />
          <path d="M960 1000 C 760 880, 570 450, 534 0 L 530 0 C 560 460, 730 900, 880 1000 Z" fill="url(#beamGrad)" opacity="0.45" />
        </g>
      </svg>

      {/* Warm bloom where the beams converge */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_50%_75%,rgba(255,90,10,0.35)_0%,transparent_55%)]" />

      {/* Bright core glow along the central column */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_50%_100%,rgba(255,140,60,0.5)_0%,transparent_45%)]" />

      {/* Vignette to deepen the corners */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_50%_60%,transparent_30%,rgba(0,0,0,0.7)_100%)]" />
    </div>
  );
}