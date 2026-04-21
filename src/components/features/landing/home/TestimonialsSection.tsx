"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import Reveal from "./Reveal";
import { getAllTestimonials, TestimonialAPI } from "@/src/api/services/testimonials";

const avatarColors = ["from-violet-600 to-purple-700", "from-blue-600 to-indigo-700", "from-pink-600 to-rose-700", "from-emerald-600 to-teal-700", "from-amber-600 to-orange-700"];

function TestimonialsSlider({ testimonials }: { testimonials: TestimonialAPI[] }) {
  const [active, setActive] = useState(0);
  const [animating, setAnimating] = useState(false);
  const [direction, setDirection] = useState<"left" | "right">("right");
  const total = testimonials.length;

  function go(next: number, dir: "left" | "right") {
    if (animating || total === 0) return;
    setDirection(dir);
    setAnimating(true);
    setTimeout(() => { setActive((next + total) % total); setAnimating(false); }, 350);
  }

  useEffect(() => {
    if (total === 0) return;
    const id = setInterval(() => go((active + 1) % total, "right"), 4500);
    return () => clearInterval(id);
  }, [active, animating, total]);

  if (total === 0) return <div className="text-center text-gray-400 py-12">No testimonials yet.</div>;

  const t = testimonials[active];
  const color = avatarColors[active % avatarColors.length];
  const avatar = t.name.split(" ").map((w: string) => w[0]).join("").slice(0, 2).toUpperCase();

  return (
    <div className="relative">
      <div className="absolute -top-6 left-1/2 -translate-x-1/2 text-violet-800/30 text-[120px] leading-none font-serif select-none pointer-events-none">&ldquo;</div>
      <div className="relative bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-3xl p-10 md:p-14 max-w-3xl mx-auto overflow-hidden"
        style={{ opacity: animating ? 0 : 1, transform: animating ? `translateX(${direction === "right" ? "-40px" : "40px"})` : "translateX(0)", transition: "opacity 0.35s ease, transform 0.35s ease" }}>
        <div className={`absolute top-0 left-0 right-0 h-1 bg-gradient-to-r ${color} rounded-t-3xl`} />
        <div className="flex gap-1 mb-6 justify-center">
          {Array.from({ length: t.rating }).map((_, i) => (
            <svg key={i} className="w-5 h-5 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
            </svg>
          ))}
        </div>
        <p className="text-gray-700 dark:text-gray-200 text-lg md:text-xl leading-relaxed text-center mb-10 italic">&ldquo;{t.review_text}&rdquo;</p>
        <div className="flex flex-col items-center gap-3">
          <div className={`w-14 h-14 rounded-full bg-gradient-to-br ${color} flex items-center justify-center text-white font-bold text-lg shadow-lg`}>
            {avatar}
          </div>
          <div className="text-center">
            <p className="font-semibold text-gray-900 dark:text-white">{t.name}</p>
            <p className="text-violet-400 text-sm">{t.role} @ {t.company}</p>
          </div>
        </div>
      </div>

      <button onClick={() => go(active - 1, "left")} className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-2 md:-translate-x-6 w-10 h-10 rounded-full bg-gray-100 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 hover:border-violet-500 flex items-center justify-center text-gray-500 dark:text-gray-400 hover:text-violet-400 transition-all">
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
      </button>
      <button onClick={() => go(active + 1, "right")} className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-2 md:translate-x-6 w-10 h-10 rounded-full bg-gray-100 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 hover:border-violet-500 flex items-center justify-center text-gray-500 dark:text-gray-400 hover:text-violet-400 transition-all">
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
      </button>

      <div className="flex justify-center gap-2 mt-8">
        {testimonials.map((_, i) => (
          <button key={i} onClick={() => go(i, i > active ? "right" : "left")}
            className={`transition-all duration-300 rounded-full ${i === active ? "w-8 h-2.5 bg-violet-500" : "w-2.5 h-2.5 bg-gray-300 dark:bg-gray-700 hover:bg-gray-400 dark:hover:bg-gray-500"}`} />
        ))}
      </div>
    </div>
  );
}

export default function TestimonialsSection() {
  const [testimonials, setTestimonials] = useState<TestimonialAPI[]>([]);

  useEffect(() => {
    getAllTestimonials({ status: "Published", page_size: 10 })
      .then(data => setTestimonials(Array.isArray(data) ? data : data.results ?? []))
      .catch(() => {});
  }, []);

  return (
    <section id="testimonials" className="py-24 overflow-hidden bg-white dark:bg-transparent">
      <div className="max-w-6xl mx-auto px-6">
        <Reveal><h2 className="text-4xl font-bold text-center mb-3">Client <span className="text-violet-500">Testimonials</span></h2></Reveal>
        <Reveal delay={100}><p className="text-center text-gray-500 dark:text-gray-400 mb-10">What people say about my work</p></Reveal>
        <Reveal delay={120}>
          <div className="flex justify-center mb-12">
            <Link href="/testimonials" className="inline-flex items-center gap-2 border border-violet-600 text-violet-400 hover:bg-violet-600 hover:text-white px-5 py-2 rounded-lg text-sm font-semibold transition-all">
              View All Testimonials
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" /></svg>
            </Link>
          </div>
        </Reveal>
        <TestimonialsSlider testimonials={testimonials} />
      </div>
    </section>
  );
}
