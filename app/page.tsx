import { HeroSection } from "@/components/hero-section"
import { CodeInputArea } from "@/components/code-input-area"
import { HowItWorks } from "@/components/how-it-works"
import { Testimonials } from "@/components/testimonials"

export default function HomePage() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-background to-background/80">
      <div className="container px-4 py-8 mx-auto">
        <HeroSection />
        <CodeInputArea />
        <HowItWorks />
      </div>
    </main>
  )
}

