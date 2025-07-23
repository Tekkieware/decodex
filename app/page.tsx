"use client"

import { HeroSection } from "@/components/hero-section"
import { CodeInputArea } from "@/components/code-input-area"
import { HowItWorks } from "@/components/how-it-works"
import { Testimonials } from "@/components/testimonials"
import { useDispatch } from 'react-redux';
import { setCode } from '../lib/store/codeSlice';
import { useRouter } from 'next/navigation';

export default function HomePage() {
  const dispatch = useDispatch();
  const router = useRouter();

  const handleAnalyze = (code: string) => {
    dispatch(setCode(code));
    router.push('/analysis');
  };

  return (
    <main className="min-h-screen bg-gradient-to-b from-background to-background/80">
      <div className="container px-4 py-8 mx-auto">
        <HeroSection />
        <CodeInputArea onAnalyze={handleAnalyze} />
        <HowItWorks />
      </div>
    </main>
  )
}

