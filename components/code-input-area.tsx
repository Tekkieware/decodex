"use client"

import { useState, useEffect, useCallback } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Alert, AlertDescription } from "@/components/ui/alert"
import {
  Loader2,
  Code,
  ChevronDown,
  ChevronUp,
  Sparkles,
  FileText,
  History,
  Trash2,
  Save,
  AlertCircle,
  CheckCircle2,
  ClipboardPasteIcon as Paste,
  RotateCcw,
} from "lucide-react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { motion, AnimatePresence } from "framer-motion"
import { useToast } from "@/hooks/use-toast"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import dynamic from "next/dynamic"

// Dynamically import Monaco Editor to avoid SSR issues
const MonacoEditor = dynamic(() => import("@monaco-editor/react").then((mod) => mod.default), { ssr: false })

const SAMPLE_CODES = {
  javascript: `function fibonacci(n) {
  if (n <= 1) return n;
  return fibonacci(n - 1) + fibonacci(n - 2);
}

// Calculate the 10th Fibonacci number
const result = fibonacci(10);
console.log(result);`,
  python: `def merge_sort(arr):
    if len(arr) <= 1:
        return arr
        
    mid = len(arr) // 2
    left = merge_sort(arr[:mid])
    right = merge_sort(arr[mid:])
    
    return merge(left, right)
    
def merge(left, right):
    result = []
    i = j = 0
    
    while i < len(left) and j < len(right):
        if left[i] < right[j]:
            result.append(left[i])
            i += 1
        else:
            result.append(right[j])
            j += 1
            
    result.extend(left[i:])
    result.extend(right[j:])
    return result

# Test the merge sort
test_array = [38, 27, 43, 3, 9, 82, 10]
sorted_array = merge_sort(test_array)
print(sorted_array)`,
  typescript: `interface User {
  id: number;
  name: string;
  email: string;
  isActive: boolean;
}

class UserService {
  private users: User[] = [];
  
  constructor() {
    // Initialize with a sample user
    this.users.push({
      id: 1,
      name: "John Doe",
      email: "john@example.com",
      isActive: true
    });
  }
  
  getAllUsers(): User[] {
    return this.users;
  }
  
  getUserById(id: number): User | undefined {
    return this.users.find(user => user.id === id);
  }
  
  addUser(user: Omit<User, "id">): User {
    const newUser = {
      ...user,
      id: this.users.length + 1
    };
    
    this.users.push(newUser);
    return newUser;
  }
}

// Usage
const userService = new UserService();
const newUser = userService.addUser({
  name: "Jane Smith",
  email: "jane@example.com",
  isActive: true
});

console.log(userService.getAllUsers());`,
}

const LANGUAGE_ICONS: Record<string, string> = {
  javascript: "📜",
  typescript: "🔷",
  python: "🐍",
  java: "☕",
  csharp: "🔧",
  cpp: "⚙️",
  go: "🔵",
  rust: "⚓",
}

const MAX_CODE_LENGTH = 50000
const MAX_LINES = 2000

interface CodeHistory {
  id: string
  code: string
  language: string
  timestamp: Date
  name: string
}

export function CodeInputArea() {
  const router = useRouter()
  const [code, setCode] = useState("")
  const [language, setLanguage] = useState("javascript")
  const [isLoading, setIsLoading] = useState(false)
  const [analysisProgress, setAnalysisProgress] = useState(0)
  const [showSamples, setShowSamples] = useState(false)
  const [detectedLanguage, setDetectedLanguage] = useState<string | null>(null)
  const [codeHistory, setCodeHistory] = useState<CodeHistory[]>([])
  const [showHistory, setShowHistory] = useState(false)
  const [validationErrors, setValidationErrors] = useState<string[]>([])
  const [autoSave, setAutoSave] = useState(true)
  const [lastSaved, setLastSaved] = useState<Date | null>(null)
  const [isValidating, setIsValidating] = useState(false)

  const { toast } = useToast()

  // Enhanced language detection
  const detectLanguage = useCallback((codeContent: string) => {
    const patterns = {
      python: [
        /def\s+\w+\s*\(/,
        /import\s+\w+/,
        /from\s+\w+\s+import/,
        /print\s*\(/,
        /if\s+__name__\s*==\s*['"']__main__['"']/,
      ],
      typescript: [
        /interface\s+\w+/,
        /type\s+\w+\s*=/,
        /:\s*(string|number|boolean|any)/,
        /export\s+(interface|type|class)/,
        /import.*from\s+['"][^'"]+['"];?$/m,
      ],
      javascript: [
        /function\s+\w+\s*\(/,
        /const\s+\w+\s*=/,
        /let\s+\w+\s*=/,
        /var\s+\w+\s*=/,
        /=>\s*{?/,
        /console\.log\s*\(/,
      ],
      java: [/public\s+class\s+\w+/, /System\.out\.println\s*\(/, /public\s+static\s+void\s+main/, /import\s+java\./],
      csharp: [/using\s+System/, /public\s+class\s+\w+/, /Console\.WriteLine\s*\(/, /namespace\s+\w+/],
      cpp: [/#include\s*</, /std::/, /cout\s*<</, /int\s+main\s*\(/],
      go: [/package\s+\w+/, /func\s+\w+\s*\(/, /import\s*\(/, /fmt\.Print/],
      rust: [/fn\s+\w+\s*\(/, /let\s+mut\s+/, /println!\s*\(/, /use\s+std::/],
    }

    let maxScore = 0
    let detectedLang = null

    for (const [lang, langPatterns] of Object.entries(patterns)) {
      const score = langPatterns.reduce((acc, pattern) => {
        return acc + (pattern.test(codeContent) ? 1 : 0)
      }, 0)

      if (score > maxScore) {
        maxScore = score
        detectedLang = lang
      }
    }

    return maxScore > 0 ? detectedLang : null
  }, [])

  // Validate code
  const validateCode = useCallback((codeContent: string) => {
    const errors: string[] = []

    if (codeContent.length > MAX_CODE_LENGTH) {
      errors.push(`Code is too long (${codeContent.length} characters). Maximum allowed: ${MAX_CODE_LENGTH}`)
    }

    const lines = codeContent.split("\n")
    if (lines.length > MAX_LINES) {
      errors.push(`Too many lines (${lines.length}). Maximum allowed: ${MAX_LINES}`)
    }

    // Basic syntax validation
    const openBraces = (codeContent.match(/\{/g) || []).length
    const closeBraces = (codeContent.match(/\}/g) || []).length
    if (openBraces !== closeBraces) {
      errors.push("Mismatched braces detected")
    }

    const openParens = (codeContent.match(/\(/g) || []).length
    const closeParens = (codeContent.match(/\)/g) || []).length
    if (openParens !== closeParens) {
      errors.push("Mismatched parentheses detected")
    }

    return errors
  }, [])

  // Auto-detect language and validate
  useEffect(() => {
    if (code) {
      setIsValidating(true)
      const detected = detectLanguage(code)
      setDetectedLanguage(detected)

      const errors = validateCode(code)
      setValidationErrors(errors)

      setIsValidating(false)
    } else {
      setDetectedLanguage(null)
      setValidationErrors([])
    }
  }, [code, detectLanguage, validateCode])

  // Auto-save functionality
  useEffect(() => {
    if (autoSave && code && code.length > 10) {
      const timeoutId = setTimeout(() => {
        const saved = {
          code,
          language: detectedLanguage || language,
          timestamp: new Date(),
        }
        localStorage.setItem("code-analysis-autosave", JSON.stringify(saved))
        setLastSaved(new Date())
      }, 2000)

      return () => clearTimeout(timeoutId)
    }
  }, [code, language, detectedLanguage, autoSave])

  // Load code history
  useEffect(() => {
    const savedHistory = localStorage.getItem("code-analysis-history")
    if (savedHistory) {
      try {
        const history = JSON.parse(savedHistory)
        setCodeHistory(history.map((item: any) => ({ ...item, timestamp: new Date(item.timestamp) })))
      } catch (error) {
        console.error("Failed to load code history:", error)
      }
    }

    // Load auto-saved code
    const autoSaved = localStorage.getItem("code-analysis-autosave")
    if (autoSaved && !code) {
      try {
        const saved = JSON.parse(autoSaved)
        setCode(saved.code)
        setLanguage(saved.language)
        setLastSaved(new Date(saved.timestamp))
        toast({
          title: "Auto-saved code restored",
          description: "Your previous work has been restored",
        })
      } catch (error) {
        console.error("Failed to load auto-saved code:", error)
      }
    }
  }, [])

  const handleEditorChange = (value: string | undefined) => {
    if (value !== undefined) {
      setCode(value)
    }
  }

  const handleLanguageChange = (value: string) => {
    setLanguage(value)
  }

  const handleAnalyzeClick = () => {
    if (!code.trim()) return

    if (validationErrors.length > 0) {
      toast({
        title: "Validation Errors",
        description: "Please fix the validation errors before analyzing",
        variant: "destructive",
      })
      return
    }

    setIsLoading(true)
    setAnalysisProgress(0)

    // Save to history
    const historyItem: CodeHistory = {
      id: Date.now().toString(),
      code,
      language: detectedLanguage || language,
      timestamp: new Date(),
      name: `Analysis ${new Date().toLocaleString()}`,
    }

    const updatedHistory = [historyItem, ...codeHistory.slice(0, 9)] // Keep last 10
    setCodeHistory(updatedHistory)
    localStorage.setItem("code-analysis-history", JSON.stringify(updatedHistory))

    // Simulate progress
    const progressInterval = setInterval(() => {
      setAnalysisProgress((prev) => {
        if (prev >= 90) {
          clearInterval(progressInterval)
          return 90
        }
        return prev + Math.random() * 15
      })
    }, 200)

    // Navigate to analysis page
    setTimeout(() => {
      const encodedCode = encodeURIComponent(code)
      router.push(`/analysis?code=${encodedCode}&language=${detectedLanguage || language}`)
    }, 1000)
  }

  const handleUseSampleCode = (lang: string) => {
    setCode(SAMPLE_CODES[lang as keyof typeof SAMPLE_CODES] || SAMPLE_CODES.javascript)
    setLanguage(lang)
    setShowSamples(false)
    toast({
      title: "Sample Code Loaded",
      description: `${lang.charAt(0).toUpperCase() + lang.slice(1)} sample code has been loaded`,
    })
  }

  const handlePasteFromClipboard = async () => {
    try {
      const text = await navigator.clipboard.readText()
      if (text) {
        setCode(text)
        toast({
          title: "Code pasted",
          description: "Code has been pasted from clipboard",
        })
      }
    } catch (err) {
      toast({
        title: "Paste failed",
        description: "Failed to read from clipboard",
        variant: "destructive",
      })
    }
  }

  const handleLoadFromHistory = (historyItem: CodeHistory) => {
    setCode(historyItem.code)
    setLanguage(historyItem.language)
    setShowHistory(false)
    toast({
      title: "Code loaded",
      description: `Loaded code from ${historyItem.timestamp.toLocaleString()}`,
    })
  }

  const handleClearHistory = () => {
    setCodeHistory([])
    localStorage.removeItem("code-analysis-history")
    toast({
      title: "History cleared",
      description: "Code history has been cleared",
    })
  }

  const handleClearCode = () => {
    setCode("")
    setValidationErrors([])
    toast({
      title: "Code cleared",
      description: "Editor has been cleared",
    })
  }

  return (
    <Card className="w-full mt-8 shadow-lg border-border/50 overflow-hidden" id="code-input-area">
      <CardHeader className="bg-muted/30">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center">
            <Code className="mr-2 h-5 w-5 text-primary" />
            Paste Your Code
            {isValidating && (
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                className="ml-2 flex items-center"
              >
                <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
                <span className="ml-1 text-xs text-muted-foreground">Validating...</span>
              </motion.div>
            )}
          </CardTitle>

          <div className="flex items-center space-x-2">
            {detectedLanguage && (
              <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
                <Badge variant="outline" className="px-3 py-1">
                  <span className="mr-1">{LANGUAGE_ICONS[detectedLanguage] || "🔍"}</span>
                  Detected: {detectedLanguage.charAt(0).toUpperCase() + detectedLanguage.slice(1)}
                </Badge>
              </motion.div>
            )}

            {lastSaved && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-xs text-muted-foreground">
                <Save className="w-3 h-3 inline mr-1" />
                Saved {lastSaved.toLocaleTimeString()}
              </motion.div>
            )}
          </div>
        </div>

        {/* Validation Errors */}
        <AnimatePresence>
          {validationErrors.length > 0 && (
            <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }}>
              <Alert variant="destructive" className="mt-2">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  <ul className="list-disc list-inside space-y-1">
                    {validationErrors.map((error, index) => (
                      <li key={index} className="text-sm">
                        {error}
                      </li>
                    ))}
                  </ul>
                </AlertDescription>
              </Alert>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Progress Bar */}
        <AnimatePresence>
          {isLoading && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="mt-2"
            >
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Preparing analysis...</span>
                  <span className="text-muted-foreground">{Math.round(analysisProgress)}%</span>
                </div>
                <Progress value={analysisProgress} className="h-2" />
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </CardHeader>

      <CardContent className="p-0">
        <div className="p-4 bg-muted/10 border-b">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Select value={language} onValueChange={handleLanguageChange}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Select Language" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="javascript">📜 JavaScript</SelectItem>
                  <SelectItem value="typescript">🔷 TypeScript</SelectItem>
                  <SelectItem value="python">🐍 Python</SelectItem>
                  <SelectItem value="java">☕ Java</SelectItem>
                  <SelectItem value="csharp">🔧 C#</SelectItem>
                  <SelectItem value="cpp">⚙️ C++</SelectItem>
                  <SelectItem value="go">🔵 Go</SelectItem>
                  <SelectItem value="rust">⚓ Rust</SelectItem>
                </SelectContent>
              </Select>

              {/* Quick Actions */}
              <div className="flex items-center space-x-1">
                <Button variant="ghost" size="sm" onClick={handlePasteFromClipboard} className="h-8 px-2">
                  <Paste className="h-4 w-4 mr-1" />
                  Paste
                </Button>
              </div>
            </div>

            <div className="flex items-center space-x-2">
              {/* History */}
              <Popover open={showHistory} onOpenChange={setShowHistory}>
                <PopoverTrigger asChild>
                  <Button variant="ghost" size="sm" className="h-8 px-2">
                    <History className="h-4 w-4 mr-1" />
                    History
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-80" align="end">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <h4 className="font-medium">Code History</h4>
                      {codeHistory.length > 0 && (
                        <Button variant="ghost" size="sm" onClick={handleClearHistory} className="h-6 px-2">
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      )}
                    </div>

                    {codeHistory.length === 0 ? (
                      <p className="text-sm text-muted-foreground text-center py-4">No history available</p>
                    ) : (
                      <div className="space-y-2 max-h-60 overflow-y-auto">
                        {codeHistory.map((item) => (
                          <div
                            key={item.id}
                            className="p-2 border rounded-md hover:bg-muted/50 cursor-pointer transition-colors"
                            onClick={() => handleLoadFromHistory(item)}
                          >
                            <div className="flex items-center justify-between">
                              <span className="text-sm font-medium">{item.language}</span>
                              <span className="text-xs text-muted-foreground">
                                {item.timestamp.toLocaleDateString()}
                              </span>
                            </div>
                            <p className="text-xs text-muted-foreground mt-1 truncate">
                              {item.code.substring(0, 50)}...
                            </p>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </PopoverContent>
              </Popover>

              {/* Sample Code */}
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowSamples(!showSamples)}
                className="flex items-center h-8"
              >
                <Sparkles className="mr-1 h-4 w-4" />
                Sample Code
                {showSamples ? <ChevronUp className="ml-1 h-4 w-4" /> : <ChevronDown className="ml-1 h-4 w-4" />}
              </Button>

              {code && (
                <Button variant="ghost" size="sm" onClick={handleClearCode} className="h-8 px-2 text-destructive">
                  <RotateCcw className="h-4 w-4" />
                </Button>
              )}
            </div>
          </div>

          <AnimatePresence>
            {showSamples && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="mt-4"
              >
                <Tabs defaultValue="javascript">
                  <TabsList className="w-full">
                    <TabsTrigger value="javascript" className="flex-1">
                      JavaScript
                    </TabsTrigger>
                    <TabsTrigger value="typescript" className="flex-1">
                      TypeScript
                    </TabsTrigger>
                    <TabsTrigger value="python" className="flex-1">
                      Python
                    </TabsTrigger>
                  </TabsList>

                  {Object.entries(SAMPLE_CODES).map(([lang, sampleCode]) => (
                    <TabsContent key={lang} value={lang} className="mt-2">
                      <div className="bg-muted/30 p-2 rounded-md text-sm font-mono max-h-32 overflow-y-auto">
                        <pre>{sampleCode}</pre>
                      </div>
                      <div className="flex items-center justify-between mt-2">
                        <span className="text-xs text-muted-foreground">
                          {sampleCode.split("\n").length} lines • {sampleCode.length} characters
                        </span>
                        <Button variant="ghost" size="sm" onClick={() => handleUseSampleCode(lang)}>
                          Use This Example
                        </Button>
                      </div>
                    </TabsContent>
                  ))}
                </Tabs>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Monaco Editor */}
        <div className="border-0 min-h-[350px] relative">
          <MonacoEditor
            height="350px"
            language={language}
            value={code}
            onChange={handleEditorChange}
            theme="vs-dark"
            options={{
              minimap: { enabled: false },
              scrollBeyondLastLine: false,
              fontSize: 14,
              automaticLayout: true,
              padding: { top: 16, bottom: 16 },
              lineNumbers: "on",
              renderLineHighlight: "all",
              smoothScrolling: true,
              cursorBlinking: "smooth",
              cursorSmoothCaretAnimation: "on",
              formatOnPaste: true,
              formatOnType: true,
              bracketPairColorization: { enabled: true },
              guides: {
                bracketPairs: true,
                indentation: true,
              },
            }}
            loading={
              <div className="flex items-center justify-center h-full">
                <div className="flex items-center space-x-2">
                  <div className="w-4 h-4 rounded-full bg-primary animate-pulse" />
                  <span className="text-sm text-muted-foreground">Loading editor...</span>
                </div>
              </div>
            }
          />
        </div>
      </CardContent>

      <CardFooter className="flex justify-between p-4 bg-muted/10 border-t">
        <div className="flex items-center space-x-4 text-sm text-muted-foreground">
          <div className="flex items-center space-x-2">
            <FileText className="w-4 h-4" />
            {code ? (
              <span>
                {code.split("\n").length} lines • {code.length} characters
              </span>
            ) : (
              <span>Paste your code or select a sample</span>
            )}
          </div>

          {validationErrors.length === 0 && code && (
            <div className="flex items-center space-x-1 text-green-600">
              <CheckCircle2 className="w-4 h-4" />
              <span>Valid</span>
            </div>
          )}
        </div>

        <Button
          onClick={handleAnalyzeClick}
          disabled={!code.trim() || isLoading || validationErrors.length > 0}
          className="px-6 transition-all duration-300 hover:shadow-md"
        >
          {isLoading ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Analyzing...
            </>
          ) : (
            <>
              <Sparkles className="w-4 h-4 mr-2" />
              Analyze Code
            </>
          )}
        </Button>
      </CardFooter>
    </Card>
  )
}
