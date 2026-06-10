"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

interface Slide {
  id: string;
  image: string;
  title: string;
  subtitle: string;
  link: string;
}

export function HeroCarousel({ slides }: { slides: Slide[] }) {
  const [currentSlide, setCurrentSlide] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [slides.length]);

  if (!slides || slides.length === 0) {
    return null; // Don't render anything if no slides are configured
  }

  return (
    <div className="relative w-full h-[calc(100vh-70px)] overflow-hidden bg-gray-100 group">
      {/* Slides */}
      {slides.map((slide, index) => (
        <div
          key={slide.id}
          className={`absolute inset-0 w-full h-full transition-opacity duration-1000 ease-in-out ${
            index === currentSlide ? "opacity-100 z-10" : "opacity-0 z-0"
          }`}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={slide.image}
            alt={slide.title}
            className="w-full h-full object-cover object-center"
          />
          {/* Subtle dark overlay for text readability */}
          <div className="absolute inset-0 bg-black/20" />
          
          {/* Text Content */}
          <div className="absolute inset-0 flex flex-col items-center justify-center text-white text-center px-4">
            <h2 className="text-[10px] md:text-xs font-bold tracking-[0.3em] uppercase mb-4 opacity-90">
              {slide.subtitle}
            </h2>
            <h1 className="text-4xl md:text-7xl font-black tracking-tight uppercase mb-8">
              {slide.title}
            </h1>
            <Link 
              href={slide.link}
              className="border-2 border-white px-8 py-3 text-xs font-bold tracking-widest uppercase hover:bg-white hover:text-black transition-colors"
            >
              Discover
            </Link>
          </div>
        </div>
      ))}

      {/* Navigation Dots */}
      <div className="absolute bottom-8 left-0 right-0 z-20 flex justify-center gap-3">
        {slides.map((_, index) => (
          <button
            key={index}
            onClick={() => setCurrentSlide(index)}
            className={`w-2 h-2 rounded-full transition-all duration-300 ${
              index === currentSlide 
                ? "bg-white scale-125" 
                : "bg-white/50 hover:bg-white/80"
            }`}
            aria-label={`Go to slide ${index + 1}`}
          />
        ))}
      </div>
    </div>
  );
}
