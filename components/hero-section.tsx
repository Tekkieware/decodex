"use client"

import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { motion, AnimatePresence } from "framer-motion"
import { useTheme } from "next-themes"
import { Code, ArrowRight, Sparkles, Check, Zap } from "lucide-react"

const languageExamples = [
  {
    name: "JavaScript",
    code: 'console.log("Hello, World!");',
    icon: "📜",
    color: "text-yellow-500",
    explanation: 'Simple console log statement that prints "Hello, World!" to the console.',
  },
  {
    name: "Python",
    code: 'print("Hello, World!")',
    icon: "🐍",
    color: "text-green-500",
    explanation: 'Basic print function that outputs "Hello, World!" to the console.',
  },
  {
    name: "TypeScript",
    code: 'const greeting: string = "Hello, World!";',
    icon: "🔷",
    color: "text-blue-500",
    explanation: "String variable declaration with explicit type annotation.",
  },
  {
    name: "Java",
    code: 'System.out.println("Hello, World!");',
    icon: "☕",
    color: "text-orange-500",
    explanation: "Standard output statement using System.out.println method.",
  },
  {
    name: "C++",
    code: 'std::cout << "Hello, World!" << std::endl;',
    icon: "⚙️",
    color: "text-purple-500",
    explanation: "Console output using the standard C++ iostream library.",
  },
]

export function HeroSection() {
  const [mounted, setMounted] = useState(false)
  const { theme } = useTheme()
  const [currentLanguageIndex, setCurrentLanguageIndex] = useState(0)
  const [typingText, setTypingText] = useState("")
  const [isTyping, setIsTyping] = useState(true)
  const [detectedLanguage, setDetectedLanguage] = useState("")
  const [showExplanation, setShowExplanation] = useState(false)
  const typingRef = useRef<NodeJS.Timeout | null>(null)

  useEffect(() => {
    setMounted(true)

    // Start the typing animation
    startTypingAnimation()

    return () => {
      if (typingRef.current) {
        clearTimeout(typingRef.current)
      }
    }
  }, [])

  useEffect(() => {
    if (isTyping) {
      startTypingAnimation()
    }
  }, [currentLanguageIndex, isTyping])

  const startTypingAnimation = () => {
    const currentExample = languageExamples[currentLanguageIndex]
    const targetText = currentExample.code

    // Reset states
    setTypingText("")
    setDetectedLanguage("")
    setShowExplanation(false)

    // Clear any existing timeout
    if (typingRef.current) {
      clearTimeout(typingRef.current)
    }

    let i = 0
    const typeNextChar = () => {
      if (i < targetText.length) {
        setTypingText(targetText.substring(0, i + 1))
        i++
        typingRef.current = setTimeout(typeNextChar, 50 + Math.random() * 50)
      } else {
        // Show detected language after typing is complete
        setTimeout(() => {
          setDetectedLanguage(currentExample.name)

          // Show explanation
          setTimeout(() => {
            setShowExplanation(true)

            // Move to next language after a delay
            setTimeout(() => {
              setIsTyping(true)
              setShowExplanation(false)
              setCurrentLanguageIndex((prev) => (prev + 1) % languageExamples.length)
            }, 3000)
          }, 500)
        }, 500)
      }
    }

    // Start typing animation
    typeNextChar()
  }

  if (!mounted) return null

  const currentExample = languageExamples[currentLanguageIndex]

  return (
    <section className="py-20 text-center relative overflow-hidden">
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-b from-background to-background/80 -z-10"></div>

      {/* Animated code snippets in background */}
      <div className="absolute inset-0 -z-5 overflow-hidden opacity-10">
        <motion.div
          className="absolute top-10 left-1/4 transform -rotate-6 animate-float"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 0.7, y: 0 }}
          transition={{ duration: 1, delay: 0.2 }}
        >
          <pre className="text-sm bg-muted p-3 rounded-lg shadow-lg">
            <code>{`function quickSort(arr) {
  if (arr.length <= 1) return arr;
  const pivot = arr[0];
  const left = arr.slice(1).filter(x => x < pivot);
  const right = arr.slice(1).filter(x => x >= pivot);
  return [...quickSort(left), pivot, ...quickSort(right)];
}`}</code>
          </pre>
        </motion.div>

        <motion.div
          className="absolute top-40 right-1/4 transform rotate-3 animate-float"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 0.7, y: 0 }}
          transition={{ duration: 1, delay: 0.4 }}
          style={{ animationDelay: "2s" }}
        >
          <pre className="text-sm bg-muted p-3 rounded-lg shadow-lg">
            <code>{`class Node:
  def __init__(self, value):
    self.value = value
    self.left = None
    self.right = None
    
def inorder(root):
  if root:
    inorder(root.left)
    print(root.value)
    inorder(root.right)`}</code>
          </pre>
        </motion.div>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="max-w-4xl mx-auto relative z-10"
      >
        <h1 className="mb-6 text-4xl font-extrabold tracking-tight sm:text-4xl md:text-5xl">
          Decode Code with <span className="gradient-text">AI</span>: Instant Explanations, Corrections & Language Detection
        </h1>

        <p className="mb-8 text-xl text-muted-foreground max-w-2xl mx-auto">
          Paste your code, and we'll automatically detect the language and provide clear, concise explanations.
        </p>

        <Button
          size="lg"
          className="px-8 py-6 text-lg group transition-all duration-300 hover:shadow-lg"
          onClick={() => {
            const codeInputElement = document.getElementById("code-input-area")
            if (codeInputElement) {
              codeInputElement.scrollIntoView({ behavior: "smooth" })
            }
          }}
        >
          Analyze Code
          <ArrowRight className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-1" />
        </Button>

        {/* Language detection demo */}
        <div className="mt-16 max-w-lg mx-auto">
          <div className="bg-card shadow-lg rounded-lg p-4 border relative">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center space-x-2">
                <Code className="h-5 w-5 text-primary" />
                <span className="font-medium">Code</span>
              </div>
              {detectedLanguage && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="px-3 py-1 rounded-full text-xs font-medium bg-primary/10 text-primary"
                >
                  {currentExample.icon} {detectedLanguage}
                </motion.div>
              )}
            </div>
            <div className="font-mono text-sm bg-muted p-3 rounded-md min-h-[60px] text-left">
              <pre>
                <code>{typingText}</code>
              </pre>
            </div>

            {/* Animated explanation */}
            <AnimatePresence>
              {showExplanation && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 10 }}
                  className="mt-4 p-3 border rounded-md bg-background relative"
                >
                  <div className="absolute -top-2 left-4 bg-background px-2 text-xs font-medium text-primary flex items-center">
                    <Sparkles className="w-3 h-3 mr-1" />
                    AI Analysis
                  </div>

                  <div className="flex items-start space-x-3">
                    <div className="mt-1">
                      <Zap className={`w-5 h-5 ${currentExample.color}`} />
                    </div>
                    <div className="flex-1">
                      <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.2 }}
                        className="mb-2"
                      >
                        <span className="font-medium">Language detected:</span>
                        <span className={`ml-1 font-semibold ${currentExample.color}`}>{detectedLanguage}</span>
                      </motion.div>

                      <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.4 }}
                        className="mb-2 text-sm text-muted-foreground"
                      >
                        {currentExample.explanation}
                      </motion.div>

                      <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.6 }}
                        className="flex items-center text-xs text-success"
                      >
                        <Check className="w-3 h-3 mr-1" />
                        Syntax is valid
                      </motion.div>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </motion.div>
    </section>
  )
}

