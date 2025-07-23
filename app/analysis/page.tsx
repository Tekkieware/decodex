"use client"

import { useState, useEffect, useRef, useCallback } from "react"
import { CodeInputArea } from "@/components/code-input-area"
import { AIExplanation } from "@/components/ai-explanation"
import { BugDetection } from "@/components/bug-detection"
import { InteractiveFeatures } from "@/components/interactive-features"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ArrowLeft, Code, BookOpen, Copy, Check, RefreshCw, Zap, Sparkles, Brain } from "lucide-react"
import Link from "next/link"
import { LearnMoreSection } from "@/components/learn-more-section"
import { useToast } from "@/hooks/use-toast"
import { motion, AnimatePresence } from "framer-motion"
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '../../lib/store/store';
import { useRouter } from "next/navigation"
import { CodeDisplay } from "@/components/code-display"

export default function AnalysisPage() {
  const dispatch = useDispatch();
  const initialCode = useSelector((state: RootState) => state.code.code);
  const [code, setCode] = useState<string>(initialCode);
  const [language, setLanguage] = useState<string>("javascript")
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [analysisProgress, setAnalysisProgress] = useState(0)
  const [explanation, setExplanation] = useState<any>(null)
  const [activeTab, setActiveTab] = useState("code")
  const [highlightedLine, setHighlightedLine] = useState<number | null>(null)
  const [copied, setCopied] = useState(false)
  const [connectionStatus, setConnectionStatus] = useState<"idle" | "connecting" | "connected" | "error">("idle")
  const [retryCount, setRetryCount] = useState(0)
  const [autoSaveEnabled, setAutoSaveEnabled] = useState(true)

  const codeEditorRef = useRef<any>(null)
  const analysisTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const progressIntervalRef = useRef<NodeJS.Timeout | null>(null)
  const [analysisStage, setAnalysisStage] = useState("")
  const [particles, setParticles] = useState<Array<{ id: number; x: number; y: number; delay: number }>>([])
  const { toast } = useToast()

  const router = useRouter()



  // Debounced code analysis
  const debouncedAnalyze = useCallback((codeToAnalyze: string) => {
    if (analysisTimeoutRef.current !== null) {
      clearTimeout(analysisTimeoutRef.current)
    }

    analysisTimeoutRef.current = setTimeout(() => {
      if (codeToAnalyze.trim()) {
        analyzeCode(codeToAnalyze)
      }
    }, 1000)
  }, [])

  useEffect(() => {
    if (initialCode && initialCode.trim()) {
      setCode(initialCode);
      debouncedAnalyze(initialCode);
    }
  }, [initialCode, debouncedAnalyze]);

  // Auto-save functionality
  useEffect(() => {
    if (autoSaveEnabled && code) {
      const savedCode = localStorage.getItem("analysis-code")
      if (savedCode !== code) {
        localStorage.setItem("analysis-code", code)
        localStorage.setItem("analysis-timestamp", Date.now().toString())
      }
    }
  }, [code, autoSaveEnabled])

  // Enhanced progress simulation with realistic stages
  const simulateProgress = useCallback(() => {
    setAnalysisProgress(0);
    let stageIndex = 0;
    let currentProgress = 0; // track progress across stages
    const FINAL_HOLD_POINT = 90; // stop here until real results come

    const stages = [
      { text: "🚀 Starting code analysis...", target: 5, duration: 1000 },
      { text: "🔌 Connecting to analysis engine...", target: 10, duration: 1500 },
      { text: "📤 Sending code for processing...", target: 30, duration: 2000 },
      { text: "⏳ Waiting for response...", target: 50, duration: 2500 },
      { text: "📥 Receiving insights...", target: 70, duration: 1800 },
      { text: "🎉 Finalizing report...", target: FINAL_HOLD_POINT, duration: 2000 }, // stop at 90%
    ];

    const newParticles = Array.from({ length: 20 }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100,
      delay: Math.random() * 3,
    }));
    setParticles(newParticles);

    if (progressIntervalRef.current) {
      clearInterval(progressIntervalRef.current);
    }

    const advanceStage = () => {
      const stage = stages[stageIndex];
      if (!stage) return;

      setAnalysisStage(stage.text);

      const start = currentProgress;
      const end = stage.target;
      const steps = 30;
      const increment = (end - start) / steps;
      let currentStep = 0;

      progressIntervalRef.current = setInterval(() => {
        currentStep++;
        currentProgress = start + increment * currentStep;
        setAnalysisProgress(Math.min(currentProgress, end));

        if (currentStep >= steps) {
          clearInterval(progressIntervalRef.current!);
          stageIndex++;
          if (stageIndex < stages.length) {
            setTimeout(advanceStage, 300);
          }
        }
      }, stage.duration / steps);
    };

    advanceStage();
  }, []);



  const analyzeCode = async (codeToAnalyze: string) => {
    setIsAnalyzing(true);
    setConnectionStatus("connecting");
    setAnalysisProgress(0);
    simulateProgress();

    try {
      setAnalysisStage("🚀 Starting code analysis...");

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/analyze`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code: codeToAnalyze }),
      });

      setAnalysisStage("📤 Sending code for processing...");

      const result = await response.json();
      if (result.status !== "sent") {
        throw new Error(result.detail || "Failed to start analysis");
      }

      const analysisId = result.analysis_id;
      setAnalysisStage("🔌 Connecting to analysis engine...");
      setConnectionStatus("connected");
      router.replace(`/analysis/${analysisId}`);

      const socket = new WebSocket(`${process.env.NEXT_PUBLIC_API_BASE_URL}/a/${analysisId}`);

      socket.onopen = () => {
        setAnalysisStage("⏳ Waiting for results...");
      };

      socket.onmessage = (event) => {
        const data = JSON.parse(event.data);
        setAnalysisStage("📥 Receiving insights...");
        setExplanation(data);

        if (data.detected_language) {
          setLanguage(data.detected_language.toLowerCase());
        }

        setAnalysisStage("🎉 Finalizing report...");
        setAnalysisProgress(100);
        setIsAnalyzing(false);
        setConnectionStatus("idle");
        setParticles([]);
        toast({
          title: "✨ Analysis Complete!",
          description: "Your code has been successfully analyzed.",
        });
        socket.close();
      };
    } catch (error) {
      console.error("Error analyzing code:", error);
      handleAnalysisError();
    }
  };

  const handleAnalysisError = () => {
    setIsAnalyzing(false)
    setConnectionStatus("error")
    setAnalysisProgress(0)
    setParticles([])

    if (progressIntervalRef.current !== null) {
      clearInterval(progressIntervalRef.current)
    }

    toast({
      title: "❌ Analysis Failed",
      description: "There was an error analyzing your code. Please try again.",
      variant: "destructive",
    })
  }

  const handleCodeChange = (newCode: string) => {
    setCode(newCode)
    if (newCode.trim()) {
      debouncedAnalyze(newCode)
    }
  }

  const handleLanguageChange = (newLanguage: string) => {
    setLanguage(newLanguage)
  }

  const handleReanalyze = () => {
    if (code.trim()) {
      setRetryCount((prev) => prev + 1)
      analyzeCode(code)
    }
  }

  const handleHighlightLine = (lineNumber: number) => {
    setHighlightedLine(lineNumber)
    if (codeEditorRef.current) {
      codeEditorRef.current.revealLineInCenter(lineNumber)
    }

    // Auto-clear highlight after 3 seconds
    setTimeout(() => {
      setHighlightedLine(null)
    }, 3000)
  }

  const handleCopyCode = async () => {
    try {
      await navigator.clipboard.writeText(code)
      setCopied(true)
      toast({
        title: "Code Copied",
        description: "Code has been copied to your clipboard!",
      })

      setTimeout(() => setCopied(false), 2000)
    } catch (err) {
      console.error("Failed to copy code:", err)
      toast({
        title: "Copy Failed",
        description: "Failed to copy code to clipboard.",
        variant: "destructive",
      })
    }
  }

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.ctrlKey || e.metaKey) {
        switch (e.key) {
          case "Enter":
            e.preventDefault()
            handleReanalyze()
            break
          case "c":
            if (e.shiftKey) {
              e.preventDefault()
              handleCopyCode()
            }
            break
          case "s":
            e.preventDefault()
            // Auto-save is already handled
            toast({
              title: "Auto-saved",
              description: "Your code is automatically saved!",
            })
            break
        }
      }
    }

    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [code])

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (analysisTimeoutRef.current !== null) {
        clearTimeout(analysisTimeoutRef.current)
      }
      if (progressIntervalRef.current !== null) {
        clearInterval(progressIntervalRef.current)
      }
    }
  }, [])

  return (
    <div className="container px-4 py-8 mx-auto">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between mb-6"
      >
        <div className="flex items-center space-x-4">
          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
            <Link href="/">
              <Button variant="ghost" size="sm" className="backdrop-blur-sm bg-background/50">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Home
              </Button>
            </Link>
          </motion.div>

          <div className="flex items-center space-x-2">
            <motion.div
              animate={{
                rotate: [0, 360],
                scale: [1, 1.1, 1],
              }}
              transition={{
                rotate: { duration: 10, repeat: Number.POSITIVE_INFINITY, ease: "linear" },
                scale: { duration: 3, repeat: Number.POSITIVE_INFINITY },
              }}
            >
              <Brain className="w-6 h-6 text-primary" />
            </motion.div>
            <h1 className="text-2xl font-bold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
              AI Code Analysis
            </h1>
          </div>
        </div>

        <div className="flex items-center space-x-3">
          {/* Enhanced Connection Status */}
          <motion.div
            className={`flex items-center space-x-2 px-3 py-1 rounded-full text-xs backdrop-blur-sm ${connectionStatus === "connected"
              ? "bg-green-100 text-green-700 border border-green-200"
              : connectionStatus === "connecting"
                ? "bg-yellow-100 text-yellow-700 border border-yellow-200"
                : connectionStatus === "error"
                  ? "bg-red-100 text-red-700 border border-red-200"
                  : "bg-muted text-muted-foreground border border-border"
              }`}
            animate={{ scale: [1, 1.05, 1] }}
            transition={{ duration: 2, repeat: Number.POSITIVE_INFINITY }}
          >
            <motion.div
              className={`w-2 h-2 rounded-full ${connectionStatus === "connected"
                ? "bg-green-500"
                : connectionStatus === "connecting"
                  ? "bg-yellow-500"
                  : connectionStatus === "error"
                    ? "bg-red-500"
                    : "bg-muted-foreground"
                }`}
              animate={
                connectionStatus === "connecting"
                  ? { scale: [1, 1.5, 1], opacity: [0.5, 1, 0.5] }
                  : connectionStatus === "connected"
                    ? { scale: [1, 1.2, 1] }
                    : {}
              }
              transition={{ duration: 1, repeat: Number.POSITIVE_INFINITY }}
            />
            <span className="font-medium">
              {connectionStatus === "connected"
                ? "Connected"
                : connectionStatus === "connecting"
                  ? "Connecting..."
                  : connectionStatus === "error"
                    ? "Connection Error"
                    : "Ready"}
            </span>
          </motion.div>

          {/* Enhanced Progress Indicator */}
          <AnimatePresence>
            {isAnalyzing && (
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                className="flex items-center space-x-3 bg-primary/10 backdrop-blur-sm border border-primary/20 rounded-lg px-4 py-2"
              >
                <div className="relative w-32 h-2 bg-muted rounded-full overflow-hidden">
                  <motion.div
                    className="absolute top-0 left-0 h-full bg-gradient-to-r from-primary via-primary/80 to-primary rounded-full"
                    initial={{ width: "0%" }}
                    animate={{ width: `${analysisProgress}%` }}
                    transition={{ duration: 0.5, ease: "easeOut" }}
                  />
                  {/* Shimmer effect */}
                  <motion.div
                    className="absolute top-0 left-0 h-full w-8 bg-gradient-to-r from-transparent via-white/30 to-transparent"
                    animate={{ x: [-32, 128] }}
                    transition={{ duration: 1.5, repeat: Number.POSITIVE_INFINITY, ease: "linear" }}
                  />
                </div>
                <div className="text-xs font-medium text-primary min-w-[3rem]">{Math.round(analysisProgress)}%</div>
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 2, repeat: Number.POSITIVE_INFINITY, ease: "linear" }}
                >
                  <Sparkles className="w-4 h-4 text-primary" />
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>
          <AnimatePresence>
            {isAnalyzing && analysisStage && (
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                className="flex items-center space-x-3 bg-primary/10 backdrop-blur-sm border border-primary/20 rounded-lg px-4 py-2"
              >
                <motion.p
                  className="text-xs text-muted-foreground"
                  animate={{ scale: [1, 1.02, 1] }}
                  transition={{ duration: 1.5, repeat: Number.POSITIVE_INFINITY }}
                >
                  {analysisStage}
                </motion.p>


              </motion.div>
            )}
          </AnimatePresence>

          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
            <Button
              variant="outline"
              size="sm"
              onClick={handleCopyCode}
              disabled={!code}
              className="backdrop-blur-sm bg-background/50"
            >
              <motion.div animate={copied ? { rotate: 360 } : {}} transition={{ duration: 0.5 }}>
                {copied ? <Check className="w-4 h-4 mr-2 text-green-600" /> : <Copy className="w-4 h-4 mr-2" />}
              </motion.div>
              {copied ? "Copied!" : "Copy Code"}
            </Button>
          </motion.div>
        </div>
      </motion.div>

      <div className="grid gap-6 lg:grid-cols-6">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.1 }}
          className="lg:col-span-3"
        >
          <Tabs defaultValue="code" className="w-full">
            <TabsList className="w-full">
              <TabsTrigger value="code" className="flex-1 transition-colors">
                <Code className="w-4 h-4 mr-2" />
                Code
              </TabsTrigger>
              <TabsTrigger value="learn" className="flex-1 transition-colors">
                <BookOpen className="w-4 h-4 mr-2" />
                Learn More
              </TabsTrigger>
            </TabsList>
            <TabsContent value="code" className="mt-4">
              <CodeDisplay
                code={code}
                language={explanation?.detected_language?.toLowerCase() || "Detecting...."}
                onCodeChange={handleCodeChange}
                onReanalyze={handleReanalyze}
                highlightedLine={highlightedLine}
                editorRef={codeEditorRef}
                onCopyCode={handleCopyCode}
                isAnalyzing={isAnalyzing}
              />
            </TabsContent>
            <TabsContent value="learn" className="mt-4">
              <LearnMoreSection language={language} />
            </TabsContent>
          </Tabs>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
          className="space-y-6 lg:col-span-3"
        >
          <Tabs defaultValue="analysis" className="w-full">
            <TabsList className="w-full">
              <TabsTrigger value="analysis" className="flex-1 transition-colors">
                Analysis
              </TabsTrigger>
              <TabsTrigger value="chat" className="flex-1 transition-colors">
                Q&A
              </TabsTrigger>
            </TabsList>
            <TabsContent value="analysis" className="mt-4 space-y-6">
              <AIExplanation
                explanation={explanation}
                isLoading={isAnalyzing}
                onHighlightLine={handleHighlightLine}
                analysisProgress={analysisProgress}
              />
              <BugDetection
                bugs={explanation?.bugs}
                isLoading={isAnalyzing}
                code={code}
                onHighlightLine={handleHighlightLine}
                analysisProgress={analysisProgress}
              />
            </TabsContent>
            <TabsContent value="chat" className="mt-4">
              <InteractiveFeatures
                code={code}
                language={language}
                explanation={explanation}
                isAnalyzing={isAnalyzing}
              />
            </TabsContent>
          </Tabs>
        </motion.div>
      </div>

      {/* Retry prompt for failed analyses */}
      <AnimatePresence>
        {connectionStatus === "error" && retryCount < 3 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed bottom-4 right-4 bg-card border border-border rounded-lg p-4 shadow-lg max-w-sm"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-sm">Analysis failed</p>
                <p className="text-xs text-muted-foreground">Would you like to retry?</p>
              </div>
              <Button size="sm" onClick={handleReanalyze} className="ml-4">
                Retry
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
