"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Code, Search, Bug, MessageSquare } from "lucide-react"
import { motion } from "framer-motion"

export function HowItWorks() {
  const features = [
    {
      icon: <Code className="w-10 h-10 mb-4 text-primary" />,
      title: "Automatic Language Detection",
      description: "Our AI automatically identifies the programming language from your code snippet.",
    },
    {
      icon: <Search className="w-10 h-10 mb-4 text-primary" />,
      title: "Detailed Code Explanations",
      description: "Get comprehensive breakdowns of functions, variables, and logic flow.",
    },
    {
      icon: <Bug className="w-10 h-10 mb-4 text-primary" />,
      title: "Intelligent Bug Detection",
      description: "Identify potential issues, bugs, and optimization opportunities in your code.",
    },
    {
      icon: <MessageSquare className="w-10 h-10 mb-4 text-primary" />,
      title: "Interactive Q&A",
      description: "Ask follow-up questions about specific parts of your code for deeper understanding.",
    },
  ]

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  }

  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 },
  }

  return (
    <section className="py-16">
      <h2 className="mb-4 text-3xl font-bold text-center">Key Features</h2>
      <p className="mb-12 text-center text-muted-foreground max-w-2xl mx-auto">
        Designed with a developer's workflow in mind, our tool helps you understand, debug, and optimize your code.
      </p>

      <motion.div
        className="grid gap-6 md:grid-cols-2 lg:grid-cols-4"
        variants={container}
        initial="hidden"
        whileInView="show"
        viewport={{ once: true, margin: "-100px" }}
      >
        {features.map((feature, index) => (
          <motion.div key={index} variants={item}>
            <Card className="h-full overflow-hidden transition-all duration-300 hover:shadow-lg border-border/50 hover:border-primary/20">
              <CardContent className="p-6 text-center">
                <div className="flex items-center justify-center w-16 h-16 mx-auto mb-4 rounded-full bg-primary/10">
                  {feature.icon}
                </div>
                <h3 className="mb-2 text-xl font-semibold">{feature.title}</h3>
                <p className="text-muted-foreground">{feature.description}</p>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </motion.div>

      {/* Language Support Section */}
      <div className="mt-20">
        <h3 className="mb-6 text-2xl font-bold text-center">Supported Languages</h3>
        <div className="flex flex-wrap justify-center gap-4 max-w-3xl mx-auto">
          {[
            { name: "JavaScript", icon: "📜" },
            { name: "Python", icon: "🐍" },
            { name: "TypeScript", icon: "🔷" },
            { name: "Java", icon: "☕" },
            { name: "C#", icon: "🔧" },
            { name: "C++", icon: "⚙️" },
            { name: "Go", icon: "🔵" },
            { name: "Rust", icon: "⚓" },
            { name: "PHP", icon: "🐘" },
            { name: "Ruby", icon: "💎" },
            { name: "Swift", icon: "🦅" },
            { name: "Kotlin", icon: "🧩" },
          ].map((lang, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              transition={{ delay: index * 0.05 }}
              viewport={{ once: true }}
              className="px-4 py-2 rounded-full bg-muted/50 border border-border/50 flex items-center space-x-2"
            >
              <span>{lang.icon}</span>
              <span>{lang.name}</span>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}

