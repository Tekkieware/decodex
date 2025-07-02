"use client"

import { useState, useEffect, useRef } from "react"
import { useSearchParams } from "next/navigation"
import { CodeDisplay } from "@/components/code-display"
import { AIExplanation } from "@/components/ai-explanation"
import { BugDetection } from "@/components/bug-detection"
import { InteractiveFeatures } from "@/components/interactive-features"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ArrowLeft, Code, BookOpen } from "lucide-react"
import Link from "next/link"
import { LearnMoreSection } from "@/components/learn-more-section"

export default function AnalysisPage() {
  const searchParams = useSearchParams()
  const [code, setCode] = useState<string>("")
  const [language, setLanguage] = useState<string>("javascript")
  const [isAnalyzing, setIsAnalyzing] = useState(true)
  const [explanation, setExplanation] = useState<any>(null)
  const [activeTab, setActiveTab] = useState("code")
  const [highlightedLine, setHighlightedLine] = useState<number | null>(null)
  const codeEditorRef = useRef<any>(null)

  useEffect(() => {
    const codeParam = searchParams.get("code")
    const langParam = searchParams.get("language")

    if (codeParam) {
      setCode(decodeURIComponent(codeParam))
    }

    if (langParam) {
      setLanguage(langParam)
    }

    if (code) {
      analyzeCode(code, language)
    }
  }, [searchParams, code])

  const analyzeCode = async (codeToAnalyze: string, lang: string) => {
    setIsAnalyzing(true)

    try {
      setTimeout(() => {
        setExplanation({
          detected_language: "Javascipt",
          summary: "This code appears to be a function that calculates the Fibonacci sequence recursively.",
          functions: [
            {
              name: "fibonacci",
              explanation: "A recursive function that calculates the nth Fibonacci number.",
              parameters: ["n - The position in the Fibonacci sequence to calculate"],
              returns: "The nth Fibonacci number",
            },
          ],
          variables: [
            {
              name: "n",
              type: "number",
              purpose: "Input parameter representing the position in the sequence",
            },
          ],
          bugs: [
            {
              type: "warning",
              message: "This recursive implementation has exponential time complexity O(2^n)",
              line: 3,
              suggestion: "Consider using memoization or an iterative approach for better performance",
              corrected_Code: "Full code with applied suggestion."
            },
          ],
          logicFlow: [
            { step: 1, description: "Check if n is less than or equal to 1" },
            { step: 2, description: "If true, return n (base case)" },
            { step: 3, description: "If false, recursively call fibonacci(n-1) and fibonacci(n-2)" },
            { step: 4, description: "Return the sum of these two recursive calls" },
          ],
        })
        setIsAnalyzing(false)
      }, 2000)
    } catch (error) {
      console.error("Error analyzing code:", error)
      setIsAnalyzing(false)
    }
  }

  const handleCodeChange = (newCode: string) => {
    setCode(newCode)
  }

  const handleLanguageChange = (newLanguage: string) => {
    setLanguage(newLanguage)
  }

  const handleReanalyze = () => {
    analyzeCode(code, language)
  }

  const handleHighlightLine = (lineNumber: number) => {
    setHighlightedLine(lineNumber)

    if (codeEditorRef.current) {
      codeEditorRef.current.revealLineInCenter(lineNumber)
    }
  }

  const handleCopyCode = () => {
    navigator.clipboard
      .writeText(code)
      .then(() => {
        console.log("Code copied to clipboard")
      })
      .catch((err) => {
        console.error("Failed to copy code:", err)
      })
  }

  return (
    <div className="container px-4 py-8 mx-auto">
      <div className="flex items-center mb-6 space-x-4">
        <Link href="/">
          <Button variant="ghost" size="sm">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Home
          </Button>
        </Link>
        <h1 className="text-2xl font-bold">Code Analysis</h1>
      </div>

      <div className="grid gap-6 lg:grid-cols-6">
        <div className="lg:col-span-3">
          <Tabs defaultValue="code" className="w-full">
            <TabsList className="w-full">
              <TabsTrigger value="code" className="flex-1">
                <Code className="w-4 h-4 mr-2" />
                Code
              </TabsTrigger>
              <TabsTrigger value="learn" className="flex-1">
                <BookOpen className="w-4 h-4 mr-2" />
                Learn More
              </TabsTrigger>
            </TabsList>

            <TabsContent value="code" className="mt-4">
              <CodeDisplay
                code={code}
                language={language}
                onCodeChange={handleCodeChange}
                onLanguageChange={handleLanguageChange}
                onReanalyze={handleReanalyze}
                highlightedLine={highlightedLine}
                editorRef={codeEditorRef}
                onCopyCode={handleCopyCode}
              />
            </TabsContent>

            <TabsContent value="learn" className="mt-4">
              <LearnMoreSection language={language} />
            </TabsContent>
          </Tabs>
        </div>

        <div className="space-y-6 lg:col-span-3">
          <Tabs defaultValue="analysis" className="w-full">
            <TabsList className="w-full">
              <TabsTrigger value="analysis" className="flex-1">
                Analysis
              </TabsTrigger>
              <TabsTrigger value="chat" className="flex-1">
                Q&A
              </TabsTrigger>
            </TabsList>

            <TabsContent value="analysis" className="mt-4 space-y-6">
              <AIExplanation explanation={explanation} isLoading={isAnalyzing} onHighlightLine={handleHighlightLine} />

              <BugDetection
                bugs={explanation?.bugs}
                isLoading={isAnalyzing}
                code={code}
                onHighlightLine={handleHighlightLine}
              />
            </TabsContent>

            <TabsContent value="chat" className="mt-4">
              <InteractiveFeatures code={code} language={language} explanation={explanation} />
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  )
}

