"use client";

import React, { useEffect, useState } from "react";
import Reveal from "./Reveal";
import { CheckIcon } from "@/src/assets/icons";
import { getAllServices, ServiceAPI } from "@/src/api/services/services";

const gradientTw: Record<string, string> = {
  violet_purple: "from-violet-500 to-purple-600",
  blue_indigo:   "from-blue-500 to-indigo-600",
  pink_rose:     "from-pink-500 to-rose-600",
  emerald_teal:  "from-emerald-500 to-teal-600",
  amber_orange:  "from-amber-500 to-orange-600",
  cyan_sky:      "from-cyan-500 to-sky-600",
};

const serviceIcons: Record<string, React.ReactNode> = {
  violet_purple: (
    <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
    </svg>
  ),
  blue_indigo: (
    <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M5 12h14M5 12a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v4a2 2 0 01-2 2M5 12a2 2 0 00-2 2v4a2 2 0 002 2h14a2 2 0 002-2v-4a2 2 0 00-2-2" />
    </svg>
  ),
  pink_rose: (
    <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
    </svg>
  ),
  emerald_teal: (
    <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M13 10V3L4 14h7v7l9-11h-7z" />
    </svg>
  ),
  amber_orange: (
    <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
    </svg>
  ),
  cyan_sky: (
    <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064" />
    </svg>
  ),
};

const fallbackIcon = (
  <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
  </svg>
);

export default function ServicesSection() {
  const [services, setServices] = useState<ServiceAPI[]>([]);

  useEffect(() => {
    getAllServices()
      .then(data => {
        const all: ServiceAPI[] = Array.isArray(data) ? data : data.results ?? [];
        setServices(all.filter(s => s.visible));
      })
      .catch(() => {});
  }, []);

  return (
    <section id="services" className="py-24 bg-white dark:bg-transparent">
      <div className="max-w-6xl mx-auto px-6">
        <Reveal><h2 className="text-4xl font-bold text-center mb-3">My <span className="text-violet-500">Services</span></h2></Reveal>
        <Reveal delay={100}><p className="text-center text-gray-500 dark:text-gray-400 mb-16">What I can do for you</p></Reveal>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {services.map((s, i) => {
            const tw = gradientTw[s.color_gradient] ?? "from-violet-500 to-purple-600";
            const icon = serviceIcons[s.color_gradient] ?? fallbackIcon;
            const features = s.features ? s.features.split(",").map(f => f.trim()).filter(Boolean) : [];
            return (
              <Reveal key={s.id} delay={i * 100}>
                <div className="flip-card h-72 w-full cursor-pointer">
                  <div className="flip-card-inner">
                    <div className="flip-card-front relative bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl p-6 flex flex-col overflow-hidden">
                      <div className={`absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r ${tw}`} />
                      <span className="absolute top-4 right-4 text-xs font-bold text-gray-700">0{i + 1}</span>
                      <div className={`w-14 h-14 rounded-xl bg-gradient-to-br ${tw} flex items-center justify-center text-white mb-5 shadow-lg float-anim`}
                        style={{ animationDelay: `${i * 0.4}s` }}>
                        {icon}
                      </div>
                      <h3 className="text-lg font-semibold mb-2 text-gray-900 dark:text-white">{s.title}</h3>
                      <p className="text-gray-500 dark:text-gray-400 text-sm leading-relaxed">{s.description}</p>
                      <p className={`mt-auto text-xs font-medium bg-gradient-to-r ${tw} bg-clip-text text-transparent`}>Hover to see more →</p>
                    </div>
                    <div className={`flip-card-back relative bg-gradient-to-br ${tw} rounded-2xl p-6 flex flex-col justify-between overflow-hidden`}>
                      <div className="absolute inset-0 opacity-10" style={{ backgroundImage: "radial-gradient(circle at 20% 20%, white 1px, transparent 1px), radial-gradient(circle at 80% 80%, white 1px, transparent 1px)", backgroundSize: "24px 24px" }} />
                      <div>
                        <span className="text-white/60 text-xs font-bold">0{i + 1}</span>
                        <h3 className="text-xl font-bold text-white mt-1 mb-4">{s.title}</h3>
                        <ul className="flex flex-col gap-3">
                          {features.map((f) => (
                            <li key={f} className="flex items-center gap-2 text-sm text-white/90">
                              <CheckIcon className="w-4 h-4 text-white flex-shrink-0" />
                              {f}
                            </li>
                          ))}
                        </ul>
                      </div>
                      <div className="flex items-center gap-2 text-white/70 text-xs mt-4">
                        {icon}
                        <span>Available for hire</span>
                      </div>
                    </div>
                  </div>
                </div>
              </Reveal>
            );
          })}
        </div>
      </div>
    </section>
  );
}
