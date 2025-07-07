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

    if (codeParam) {
      setCode(decodeURIComponent(codeParam))
    }

    if (code) {
      analyzeCode(code)
    }
  }, [searchParams, code])

  const analyzeCode = async (codeToAnalyze: string) => {
    setIsAnalyzing(true);

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/analyze`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ code: codeToAnalyze }),
      });

      const result = await response.json();

      if (result.status !== "sent") {
        throw new Error(result.detail || "Failed to start analysis");
      }

      const analysisId = result.analysis_id;

      const socket = new WebSocket(`${process.env.NEXT_PUBLIC_API_BASE_URL}/a/${analysisId}`);

      socket.onmessage = (event) => {
        const data = JSON.parse(event.data);
        setExplanation(data);

        if (data.detected_language) {
          setLanguage(data.detected_language.toLowerCase());
        }

        setIsAnalyzing(false);
        socket.close();
      };

      socket.onerror = (err) => {
        console.error("WebSocket error:", err);
        setIsAnalyzing(false);
      };

    } catch (error) {
      console.error("Error analyzing code:", error);
      setIsAnalyzing(false);
    }
  };




  const handleCodeChange = (newCode: string) => {
    setCode(newCode)
  }

  const handleLanguageChange = (newLanguage: string) => {
    setLanguage(newLanguage)
  }

  const handleReanalyze = () => {
    analyzeCode(code)
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
                language={explanation?.detected_language?.toLowerCase() || language}
                onCodeChange={handleCodeChange}
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

