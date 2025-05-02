"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Loader2, Code, ChevronDown, ChevronUp, Sparkles } from "lucide-react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { motion } from "framer-motion"
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

export function CodeInputArea() {
  const router = useRouter()
  const [code, setCode] = useState("")
  const [language, setLanguage] = useState("javascript")
  const [isLoading, setIsLoading] = useState(false)
  const [showSamples, setShowSamples] = useState(false)
  const [detectedLanguage, setDetectedLanguage] = useState<string | null>(null)

  useEffect(() => {
    // Simple language detection based on code content
    if (code) {
      if (code.includes("def ") && code.includes(":")) {
        setDetectedLanguage("python")
      } else if (code.includes("interface ") || code.includes(": string") || code.includes(": number")) {
        setDetectedLanguage("typescript")
      } else if (code.includes("function ") || code.includes("const ") || code.includes("let ")) {
        setDetectedLanguage("javascript")
      } else if (code.includes("public class ") || code.includes("System.out.println")) {
        setDetectedLanguage("java")
      } else {
        setDetectedLanguage(null)
      }
    } else {
      setDetectedLanguage(null)
    }
  }, [code])

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

    setIsLoading(true)

    // Navigate to analysis page with code as URL parameter
    const encodedCode = encodeURIComponent(code)
    router.push(`/analysis?code=${encodedCode}&language=${detectedLanguage || language}`)
  }

  const handleUseSampleCode = (lang: string) => {
    setCode(SAMPLE_CODES[lang as keyof typeof SAMPLE_CODES] || SAMPLE_CODES.javascript)
    setLanguage(lang)
    setShowSamples(false)
  }

  return (
    <Card className="w-full mt-8 shadow-lg border-border/50 overflow-hidden" id="code-input-area">
      <CardHeader className="bg-muted/30">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center">
            <Code className="mr-2 h-5 w-5 text-primary" />
            Paste Your Code
          </CardTitle>
          {detectedLanguage && (
            <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="flex items-center">
              <Badge variant="outline" className="px-3 py-1">
                <span className="mr-1">{LANGUAGE_ICONS[detectedLanguage] || "🔍"}</span>
                Detected: {detectedLanguage.charAt(0).toUpperCase() + detectedLanguage.slice(1)}
              </Badge>
            </motion.div>
          )}
        </div>
      </CardHeader>
      <CardContent className="p-0">
        <div className="p-4 bg-muted/10 border-b">
          <div className="flex items-center justify-between">
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

            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowSamples(!showSamples)}
              className="flex items-center"
            >
              <Sparkles className="mr-1 h-4 w-4" />
              Sample Code
              {showSamples ? <ChevronUp className="ml-1 h-4 w-4" /> : <ChevronDown className="ml-1 h-4 w-4" />}
            </Button>
          </div>

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

                <TabsContent value="javascript" className="mt-2">
                  <div className="bg-muted/30 p-2 rounded-md text-sm font-mono max-h-32 overflow-y-auto">
                    <pre>{SAMPLE_CODES.javascript}</pre>
                  </div>
                  <Button variant="ghost" size="sm" className="mt-2" onClick={() => handleUseSampleCode("javascript")}>
                    Use This Example
                  </Button>
                </TabsContent>

                <TabsContent value="typescript" className="mt-2">
                  <div className="bg-muted/30 p-2 rounded-md text-sm font-mono max-h-32 overflow-y-auto">
                    <pre>{SAMPLE_CODES.typescript}</pre>
                  </div>
                  <Button variant="ghost" size="sm" className="mt-2" onClick={() => handleUseSampleCode("typescript")}>
                    Use This Example
                  </Button>
                </TabsContent>

                <TabsContent value="python" className="mt-2">
                  <div className="bg-muted/30 p-2 rounded-md text-sm font-mono max-h-32 overflow-y-auto">
                    <pre>{SAMPLE_CODES.python}</pre>
                  </div>
                  <Button variant="ghost" size="sm" className="mt-2" onClick={() => handleUseSampleCode("python")}>
                    Use This Example
                  </Button>
                </TabsContent>
              </Tabs>
            </motion.div>
          )}
        </div>

        <div className="border-0 min-h-[350px]">
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
            }}
          />
        </div>
      </CardContent>
      <CardFooter className="flex justify-between p-4 bg-muted/10 border-t">
        <div className="text-sm text-muted-foreground">
          {code ? (
            <span>
              {code.split("\n").length} lines • {code.length} characters
            </span>
          ) : (
            <span>Paste your code or select a sample</span>
          )}
        </div>
        <Button
          onClick={handleAnalyzeClick}
          disabled={!code.trim() || isLoading}
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

