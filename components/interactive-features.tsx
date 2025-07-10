"use client"

import { useState, useRef, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import {
  Loader2,
  MessageSquare,
  Sparkles,
  Send,
  Mic,
  MicOff,
  Volume2,
  VolumeX,
  RotateCcw,
  BookOpen,
} from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Textarea } from "@/components/ui/textarea"
import { motion, AnimatePresence } from "framer-motion"
import { useToast } from "@/hooks/use-toast"

interface InteractiveFeaturesProps {
  code: string
  language: string
  explanation?: any
  isAnalyzing?: boolean
}

interface Message {
  role: "user" | "assistant"
  content: string
  timestamp: Date
  isTyping?: boolean
}

export function InteractiveFeatures({ code, language, explanation, isAnalyzing }: InteractiveFeaturesProps) {
  const [question, setQuestion] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [conversation, setConversation] = useState<Message[]>([])
  const [suggestedQuestions, setSuggestedQuestions] = useState<string[]>([
    "Explain the recursion in this function",
    "How can I optimize this code?",
    "What's the time complexity?",
    "Are there any edge cases I should handle?",
  ])
  const [isListening, setIsListening] = useState(false)
  const [isSpeaking, setIsSpeaking] = useState(false)
  const [conversationHistory, setConversationHistory] = useState<Message[]>([])
  const [showHistory, setShowHistory] = useState(false)

  const messagesEndRef = useRef<HTMLDivElement>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const recognitionRef = useRef<any>(null)
  const { toast } = useToast()

  // Auto-scroll to bottom
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" })
    }
  }, [conversation])

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto"
      textareaRef.current.style.height = textareaRef.current.scrollHeight + "px"
    }
  }, [question])

  // Generate contextual suggestions
  useEffect(() => {
    if (explanation && !isAnalyzing) {
      const newSuggestions = []

      if (explanation.functions && explanation.functions.length > 0) {
        const func = explanation.functions[0]
        newSuggestions.push(`Explain the ${func.name} function in more detail`)
        newSuggestions.push(`What are the parameters of ${func.name}?`)
      }

      if (explanation.bugs && explanation.bugs.some((bug: any) => bug.type === "warning")) {
        newSuggestions.push("Show me how to optimize this code")
        newSuggestions.push("How can I fix the warnings?")
      }

      if (language === "javascript" || language === "typescript") {
        newSuggestions.push("How would this look using modern ES6+ features?")
        newSuggestions.push("Can you show me the async/await version?")
      } else if (language === "python") {
        newSuggestions.push("How can I make this more Pythonic?")
        newSuggestions.push("Show me the list comprehension version")
      }

      newSuggestions.push("What are the performance implications?")
      newSuggestions.push("How would you test this code?")

      if (newSuggestions.length > 0) {
        setSuggestedQuestions(newSuggestions.slice(0, 6))
      }
    }
  }, [explanation, language, isAnalyzing])

  // Speech recognition setup
  useEffect(() => {
    if (typeof window !== "undefined" && "webkitSpeechRecognition" in window) {
      const SpeechRecognition = (window as any).webkitSpeechRecognition
      recognitionRef.current = new SpeechRecognition()
      recognitionRef.current.continuous = false
      recognitionRef.current.interimResults = false
      recognitionRef.current.lang = "en-US"

      recognitionRef.current.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript
        setQuestion(transcript)
        setIsListening(false)
      }

      recognitionRef.current.onerror = () => {
        setIsListening(false)
        toast({
          title: "Speech recognition error",
          description: "Could not recognize speech. Please try again.",
          variant: "destructive",
        })
      }

      recognitionRef.current.onend = () => {
        setIsListening(false)
      }
    }
  }, [toast])

  const startListening = () => {
    if (recognitionRef.current) {
      setIsListening(true)
      recognitionRef.current.start()
    } else {
      toast({
        title: "Speech recognition not supported",
        description: "Your browser doesn't support speech recognition.",
        variant: "destructive",
      })
    }
  }

  const stopListening = () => {
    if (recognitionRef.current) {
      recognitionRef.current.stop()
    }
    setIsListening(false)
  }

  const speakText = (text: string) => {
    if ("speechSynthesis" in window) {
      const utterance = new SpeechSynthesisUtterance(text)
      utterance.onstart = () => setIsSpeaking(true)
      utterance.onend = () => setIsSpeaking(false)
      speechSynthesis.speak(utterance)
    }
  }

  const stopSpeaking = () => {
    if ("speechSynthesis" in window) {
      speechSynthesis.cancel()
      setIsSpeaking(false)
    }
  }

  const handleAskQuestion = async (questionText: string = question) => {
    if (!questionText.trim() || !code) return

    const userMessage: Message = {
      role: "user",
      content: questionText,
      timestamp: new Date(),
    }

    setConversation((prev) => [...prev, userMessage])
    setConversationHistory((prev) => [...prev, userMessage])
    setQuestion("")
    setIsLoading(true)

    // Add typing indicator
    const typingMessage: Message = {
      role: "assistant",
      content: "",
      timestamp: new Date(),
      isTyping: true,
    }
    setConversation((prev) => [...prev, typingMessage])

    try {
      // Simulate AI response with more realistic delay
      setTimeout(
        () => {
          const aiResponse = generateAIResponse(questionText)

          const assistantMessage: Message = {
            role: "assistant",
            content: aiResponse,
            timestamp: new Date(),
          }

          // Remove typing indicator and add real response
          setConversation((prev) => prev.slice(0, -1).concat(assistantMessage))
          setConversationHistory((prev) => [...prev, assistantMessage])
          setIsLoading(false)

          toast({
            title: "Response ready",
            description: "AI has responded to your question",
          })
        },
        1000 + Math.random() * 2000,
      )
    } catch (error) {
      console.error("Error getting AI response:", error)
      setIsLoading(false)

      const errorMessage: Message = {
        role: "assistant",
        content: "I'm sorry, I couldn't process your question. Please try again.",
        timestamp: new Date(),
      }

      setConversation((prev) => prev.slice(0, -1).concat(errorMessage))

      toast({
        title: "Error",
        description: "Failed to get AI response",
        variant: "destructive",
      })
    }
  }

  const generateAIResponse = (questionText: string): string => {
    // Enhanced AI response generation with more context awareness
    const lowerQuestion = questionText.toLowerCase()

    if (lowerQuestion.includes("recursion")) {
      return "This code uses recursion in the fibonacci function. Recursion is when a function calls itself. In this case, fibonacci(n) calls fibonacci(n-1) and fibonacci(n-2) to calculate the nth Fibonacci number.\n\nThe recursion creates a tree of function calls:\n\n```\nfibonacci(4)\n├── fibonacci(3)\n│   ├── fibonacci(2)\n│   │   ├── fibonacci(1) → returns 1\n│   │   └── fibonacci(0) → returns 0\n│   └── fibonacci(1) → returns 1\n└── fibonacci(2)\n    ├── fibonacci(1) → returns 1\n    └── fibonacci(0) → returns 0\n```\n\nThis recursive approach is elegant but inefficient for large values of n due to repeated calculations."
    }

    if (
      lowerQuestion.includes("optimize") ||
      lowerQuestion.includes("performance") ||
      lowerQuestion.includes("memoization")
    ) {
      return "To optimize this code, you can use memoization to store previously calculated Fibonacci numbers. This changes the time complexity from O(2^n) to O(n).\n\n```javascript\nfunction fibonacci(n, memo = {}) {\n  if (n in memo) return memo[n];\n  if (n <= 1) return n;\n  memo[n] = fibonacci(n-1, memo) + fibonacci(n-2, memo);\n  return memo[n];\n}\n```\n\nAlternatively, you could use an iterative approach which is even more efficient:\n\n```javascript\nfunction fibonacci(n) {\n  if (n <= 1) return n;\n  \n  let a = 0, b = 1;\n  for (let i = 2; i <= n; i++) {\n    const temp = a + b;\n    a = b;\n    b = temp;\n  }\n  return b;\n}\n```"
    }

    if (lowerQuestion.includes("complexity")) {
      return "The time complexity of this recursive Fibonacci implementation is O(2^n), which is exponential.\n\nThis is because each call to fibonacci(n) makes two recursive calls: fibonacci(n-1) and fibonacci(n-2), creating a binary tree of calls with a depth of n.\n\nThe space complexity is O(n) due to the maximum depth of the recursion stack.\n\nThis is why the function becomes very slow for larger values of n. For example, calculating fibonacci(50) would take trillions of operations with this implementation."
    }

    if (lowerQuestion.includes("edge")) {
      return "You should handle these edge cases in your Fibonacci function:\n\n1. **Negative inputs**: The function doesn't handle negative numbers. You could either throw an error or define behavior for negative inputs.\n\n2. **Non-integer inputs**: The function assumes n is an integer. You should validate the input type.\n\n3. **Large inputs**: Due to the exponential time complexity, large inputs will cause a stack overflow. You should either use an optimized algorithm or set a reasonable upper limit.\n\n4. **Floating point precision**: For very large Fibonacci numbers, JavaScript's number precision might be an issue. Consider using BigInt for large values.\n\nHere's an improved implementation:\n\n```javascript\nfunction fibonacci(n) {\n  // Handle edge cases\n  if (!Number.isInteger(n)) {\n    throw new Error('Input must be an integer');\n  }\n  if (n < 0) {\n    throw new Error('Input must be non-negative');\n  }\n  if (n > 50) {\n    throw new Error('Input too large, consider using an optimized algorithm');\n  }\n  \n  // Base case\n  if (n <= 1) return n;\n  \n  // Recursive case\n  return fibonacci(n - 1) + fibonacci(n - 2);\n}\n```"
    }

    if (lowerQuestion.includes("arrow") || lowerQuestion.includes("es6") || lowerQuestion.includes("modern")) {
      return "Here's how the code would look using modern ES6+ features:\n\n```javascript\nconst fibonacci = (n) => {\n  if (n <= 1) return n;\n  return fibonacci(n - 1) + fibonacci(n - 2);\n};\n\n// One-liner version (not recommended for readability)\nconst fibonacciOneLine = n => n <= 1 ? n : fibonacciOneLine(n - 1) + fibonacciOneLine(n - 2);\n\n// With memoization using ES6 features\nconst fibonacciMemo = (n, memo = new Map()) => {\n  if (memo.has(n)) return memo.get(n);\n  if (n <= 1) return n;\n  \n  const result = fibonacciMemo(n - 1, memo) + fibonacciMemo(n - 2, memo);\n  memo.set(n, result);\n  return result;\n};\n\n// Using destructuring and spread operator\nconst fibonacciIterative = (n) => {\n  if (n <= 1) return n;\n  \n  let [a, b] = [0, 1];\n  for (let i = 2; i <= n; i++) {\n    [a, b] = [b, a + b];\n  }\n  return b;\n};\n```\n\nThe arrow function syntax makes the code more concise, and using a Map for memoization is a modern approach."
    }

    if (lowerQuestion.includes("pythonic") || lowerQuestion.includes("python")) {
      return 'Here\'s a more Pythonic version of the algorithm:\n\n```python\ndef fibonacci(n):\n    """Calculate the nth Fibonacci number using memoization."""\n    if n <= 1:\n        return n\n    \n    # Use a dictionary for memoization\n    memo = {0: 0, 1: 1}\n    \n    def fib_helper(num):\n        if num not in memo:\n            memo[num] = fib_helper(num - 1) + fib_helper(num - 2)\n        return memo[num]\n    \n    return fib_helper(n)\n\n# Using functools.lru_cache decorator (most Pythonic)\nfrom functools import lru_cache\n\n@lru_cache(maxsize=None)\ndef fibonacci_cached(n):\n    """Fibonacci with automatic memoization."""\n    if n <= 1:\n        return n\n    return fibonacci_cached(n - 1) + fibonacci_cached(n - 2)\n\n# Generator version for sequences\ndef fibonacci_sequence(limit):\n    """Generate Fibonacci sequence up to limit."""\n    a, b = 0, 1\n    while a < limit:\n        yield a\n        a, b = b, a + b\n\n# List comprehension version (for small sequences)\nfib_list = [fibonacci_cached(i) for i in range(10)]\n```\n\nThis version uses Python idioms like decorators, generators, and proper docstrings.'
    }

    if (lowerQuestion.includes("test") || lowerQuestion.includes("testing")) {
      return "Here's how you could test this code:\n\n```javascript\n// Unit tests using Jest\ndescribe('Fibonacci Function', () => {\n  test('should return 0 for fibonacci(0)', () => {\n    expect(fibonacci(0)).toBe(0);\n  });\n  \n  test('should return 1 for fibonacci(1)', () => {\n    expect(fibonacci(1)).toBe(1);\n  });\n  \n  test('should calculate correct fibonacci numbers', () => {\n    expect(fibonacci(2)).toBe(1);\n    expect(fibonacci(3)).toBe(2);\n    expect(fibonacci(4)).toBe(3);\n    expect(fibonacci(5)).toBe(5);\n    expect(fibonacci(6)).toBe(8);\n  });\n  \n  test('should handle edge cases', () => {\n    expect(() => fibonacci(-1)).toThrow();\n    expect(() => fibonacci(1.5)).toThrow();\n    expect(() => fibonacci('string')).toThrow();\n  });\n  \n  test('should handle large inputs efficiently', () => {\n    const start = performance.now();\n    fibonacci(40);\n    const end = performance.now();\n    expect(end - start).toBeLessThan(1000); // Should complete in under 1 second\n  });\n});\n```\n\nKey testing strategies:\n1. **Base cases**: Test n=0 and n=1\n2. **Known values**: Test several known Fibonacci numbers\n3. **Edge cases**: Invalid inputs, negative numbers\n4. **Performance**: Ensure reasonable execution time\n5. **Boundary conditions**: Test limits of your implementation"
    }

    if (lowerQuestion.includes("async") || lowerQuestion.includes("await")) {
      return "Here's how you could make this asynchronous (though Fibonacci calculation doesn't typically need to be async):\n\n```javascript\n// Async version with artificial delay\nasync function fibonacciAsync(n) {\n  if (n <= 1) return n;\n  \n  // Simulate async operation\n  await new Promise(resolve => setTimeout(resolve, 1));\n  \n  const [prev1, prev2] = await Promise.all([\n    fibonacciAsync(n - 1),\n    fibonacciAsync(n - 2)\n  ]);\n  \n  return prev1 + prev2;\n}\n\n// Usage\nasync function calculateFibonacci() {\n  try {\n    const result = await fibonacciAsync(10);\n    console.log(`Fibonacci(10) = ${result}`);\n  } catch (error) {\n    console.error('Error calculating Fibonacci:', error);\n  }\n}\n\n// With async memoization\nconst asyncMemo = new Map();\n\nasync function fibonacciAsyncMemo(n) {\n  if (asyncMemo.has(n)) {\n    return asyncMemo.get(n);\n  }\n  \n  if (n <= 1) {\n    asyncMemo.set(n, n);\n    return n;\n  }\n  \n  const result = await fibonacciAsyncMemo(n - 1) + await fibonacciAsyncMemo(n - 2);\n  asyncMemo.set(n, result);\n  return result;\n}\n```"
    }

    // Default response
    return `This code implements a ${language} function that appears to be calculating values recursively. Based on the structure, it follows a divide-and-conquer approach where the problem is broken down into smaller subproblems.\n\nKey characteristics I can see:\n- Recursive function calls\n- Base case handling\n- Mathematical computation\n\nThe implementation is clear and follows good coding practices. However, depending on the input size, you might want to consider optimization techniques like memoization or iterative approaches for better performance.\n\nIs there a specific aspect of the code you'd like me to explain in more detail?`
  }

  const clearConversation = () => {
    setConversation([])
    toast({
      title: "Conversation cleared",
      description: "Chat history has been cleared",
    })
  }

  const exportConversation = () => {
    const conversationText = conversation.map((msg) => `${msg.role.toUpperCase()}: ${msg.content}`).join("\n\n")

    const blob = new Blob([conversationText], { type: "text/plain" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = "code-analysis-conversation.txt"
    a.click()
    URL.revokeObjectURL(url)

    toast({
      title: "Conversation exported",
      description: "Chat history has been saved to file",
    })
  }

  return (
    <Card className="shadow-md border-border/50 flex flex-col h-[600px]">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-xl flex items-center">
            <MessageSquare className="w-5 h-5 mr-2 text-primary" />
            Ask Follow-up Questions
          </CardTitle>

          <div className="flex items-center space-x-2">
            {conversation.length > 0 && (
              <>
                <Button variant="ghost" size="sm" onClick={exportConversation} className="text-xs">
                  <BookOpen className="w-4 h-4 mr-1" />
                  Export
                </Button>
                <Button variant="ghost" size="sm" onClick={clearConversation} className="text-xs">
                  <RotateCcw className="w-4 h-4 mr-1" />
                  Clear
                </Button>
              </>
            )}
          </div>
        </div>

        {isAnalyzing && (
          <div className="flex items-center space-x-2 text-sm text-muted-foreground">
            <Loader2 className="w-4 h-4 animate-spin" />
            <span>Analyzing code to provide better suggestions...</span>
          </div>
        )}
      </CardHeader>

      <CardContent className="flex-grow overflow-hidden flex flex-col">
        <div className="flex-grow overflow-y-auto mb-4 pr-2">
          {conversation.length === 0 ? (
            <div className="p-6 text-center text-muted-foreground h-full flex flex-col items-center justify-center">
              <MessageSquare className="w-10 h-10 mx-auto mb-4 opacity-50" />
              <p className="mb-4">Ask a question about your code to get more specific explanations.</p>

              <div className="grid grid-cols-1 gap-2 w-full max-w-md">
                <AnimatePresence>
                  {suggestedQuestions.map((q, idx) => (
                    <motion.div
                      key={q}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      transition={{ delay: idx * 0.1 }}
                    >
                      <Button
                        variant="outline"
                        size="sm"
                        className="text-left justify-start h-auto py-2 px-3 hover:bg-muted/80 transition-colors bg-transparent"
                        onClick={() => handleAskQuestion(q)}
                        disabled={!code || isAnalyzing}
                      >
                        <Sparkles className="w-4 h-4 mr-2 text-primary flex-shrink-0" />
                        <span className="text-sm">{q}</span>
                      </Button>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <AnimatePresence>
                {conversation.map((message, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3 }}
                    className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}
                  >
                    <div
                      className={`flex items-start max-w-[85%] ${message.role === "user" ? "flex-row-reverse" : ""}`}
                    >
                      <Avatar className={`w-8 h-8 flex-shrink-0 ${message.role === "user" ? "ml-2" : "mr-2"}`}>
                        {message.role === "user" ? (
                          <AvatarFallback className="bg-primary text-primary-foreground">U</AvatarFallback>
                        ) : (
                          <>
                            <AvatarImage src="/placeholder.svg?height=32&width=32" />
                            <AvatarFallback className="bg-muted">AI</AvatarFallback>
                          </>
                        )}
                      </Avatar>

                      <div
                        className={`p-3 rounded-lg ${message.role === "user"
                          ? "bg-primary text-primary-foreground"
                          : "bg-muted border border-border/50"
                          }`}
                      >
                        {message.isTyping ? (
                          <div className="flex items-center space-x-2">
                            <div className="flex space-x-1">
                              <div className="w-2 h-2 rounded-full bg-primary animate-pulse"></div>
                              <div
                                className="w-2 h-2 rounded-full bg-primary animate-pulse"
                                style={{ animationDelay: "0.2s" }}
                              ></div>
                              <div
                                className="w-2 h-2 rounded-full bg-primary animate-pulse"
                                style={{ animationDelay: "0.4s" }}
                              ></div>
                            </div>
                            <span className="text-xs text-muted-foreground">AI is thinking...</span>
                          </div>
                        ) : (
                          <>
                            <div className="whitespace-pre-line text-sm">{message.content}</div>
                            <div className="flex items-center justify-between mt-2">
                              <span className="text-xs opacity-70">{message.timestamp.toLocaleTimeString()}</span>
                              {message.role === "assistant" && (
                                <div className="flex items-center space-x-1">
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => speakText(message.content)}
                                    disabled={isSpeaking}
                                    className="h-6 w-6 p-0"
                                  >
                                    {isSpeaking ? <VolumeX className="w-3 h-3" /> : <Volume2 className="w-3 h-3" />}
                                  </Button>
                                </div>
                              )}
                            </div>
                          </>
                        )}
                      </div>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
              <div ref={messagesEndRef} />
            </div>
          )}
        </div>
      </CardContent>

      <CardFooter className="border-t p-4">
        <div className="flex w-full space-x-2">
          <div className="flex-grow relative">
            <Textarea
              ref={textareaRef}
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              placeholder="Ask a question about your code..."
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault()
                  handleAskQuestion()
                }
              }}
              disabled={isLoading || !code}
              className="min-h-[40px] max-h-[120px] resize-none pr-20"
              rows={1}
            />

            <div className="absolute right-2 top-2 flex items-center space-x-1">
              {typeof window !== "undefined" && "webkitSpeechRecognition" in window && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={isListening ? stopListening : startListening}
                  disabled={isLoading || !code}
                  className="h-6 w-6 p-0"
                >
                  {isListening ? <MicOff className="h-4 w-4 text-red-500" /> : <Mic className="h-4 w-4" />}
                </Button>
              )}

              {isSpeaking && (
                <Button variant="ghost" size="sm" onClick={stopSpeaking} className="h-6 w-6 p-0">
                  <VolumeX className="h-4 w-4 text-red-500" />
                </Button>
              )}
            </div>
          </div>

          <Button
            onClick={() => handleAskQuestion()}
            disabled={!question.trim() || isLoading || !code}
            size="icon"
            className="h-10 w-10 flex-shrink-0"
          >
            {isLoading ? <Loader2 className="h-5 w-5 animate-spin" /> : <Send className="h-5 w-5" />}
          </Button>
        </div>

        {isListening && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="absolute bottom-16 left-4 right-4 bg-primary/10 border border-primary/20 rounded-lg p-2 text-center"
          >
            <div className="flex items-center justify-center space-x-2">
              <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></div>
              <span className="text-sm text-primary">Listening... Speak now</span>
            </div>
          </motion.div>
        )}
      </CardFooter>
    </Card>
  )
}
