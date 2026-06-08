import React from "react";
import { Link } from "react-router-dom";

export default function AuthLayout({ icon: Icon, title, subtitle, footer, children }) {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-[#0a0a0f] px-4">
      {/* Logo link */}
      <Link to="/" className="flex items-center gap-2 mb-8">
        <img
          src="https://media.base44.com/images/public/6a2402b3a9b98ed1e7bf2a16/eb8ee9b31_3d-ai-robot-character-chat-bot-wink-mascot-icon.png"
          alt="logo"
          className="w-7 h-7 object-contain"
        />
        <span className="font-display font-bold text-sm text-foreground">
          SaaS<span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-amber-400">Share</span>
        </span>
      </Link>

      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-cyan-500 mb-5">
            <Icon className="w-7 h-7 text-white" aria-hidden="true" />
          </div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">{title}</h1>
          {subtitle && <p className="text-muted-foreground mt-1.5 text-sm">{subtitle}</p>}
        </div>

        {/* Card */}
        <div className="bg-[#111116] rounded-2xl border border-white/8 p-8">
          {children}
        </div>

        {/* Footer */}
        {footer && (
          <p className="text-center text-sm text-muted-foreground mt-6">{footer}</p>
        )}
      </div>
    </div>
  );
}