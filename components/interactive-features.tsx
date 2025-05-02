"use client"

import { useState, useRef, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Loader2, MessageSquare, Sparkles, Send } from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { motion, AnimatePresence } from "framer-motion"

interface InteractiveFeaturesProps {
  code: string
  language: string
  explanation?: any
}

export function InteractiveFeatures({ code, language, explanation }: InteractiveFeaturesProps) {
  const [question, setQuestion] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [conversation, setConversation] = useState<Array<{ role: "user" | "assistant"; content: string }>>([])
  const [suggestedQuestions, setSuggestedQuestions] = useState<string[]>([
    "Explain the recursion in this function",
    "How can I optimize this code?",
    "What's the time complexity?",
    "Are there any edge cases I should handle?",
  ])
  const messagesEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    // Scroll to bottom of messages when new messages are added
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" })
    }
  }, [conversation])

  useEffect(() => {
    // Generate suggested questions based on the code and explanation
    if (explanation) {
      const newSuggestions = []

      // Add function-specific questions
      if (explanation.functions && explanation.functions.length > 0) {
        const func = explanation.functions[0]
        newSuggestions.push(`Explain the ${func.name} function in more detail`)
      }

      // Add optimization questions if there are warnings
      if (explanation.bugs && explanation.bugs.some((bug: any) => bug.type === "warning")) {
        newSuggestions.push("Show me how to optimize this code with memoization")
      }

      // Add language-specific questions
      if (language === "javascript" || language === "typescript") {
        newSuggestions.push("How would this look using ES6 arrow functions?")
      } else if (language === "python") {
        newSuggestions.push("How can I make this more Pythonic?")
      }

      if (newSuggestions.length > 0) {
        setSuggestedQuestions(newSuggestions)
      }
    }
  }, [explanation, language])

  const handleAskQuestion = async (questionText: string = question) => {
    if (!questionText.trim() || !code) return

    // Add user question to conversation
    const userMessage = { role: "user" as const, content: questionText }
    setConversation((prev) => [...prev, userMessage])

    // Clear input and show loading
    setQuestion("")
    setIsLoading(true)

    try {
      // In a real app, this would be an API call to your AI service
      // For now, we'll simulate a response after a delay
      setTimeout(() => {
        // Simulate AI response based on question
        let aiResponse = ""

        if (questionText.toLowerCase().includes("recursion")) {
          aiResponse =
            "This code uses recursion in the fibonacci function. Recursion is when a function calls itself. In this case, fibonacci(n) calls fibonacci(n-1) and fibonacci(n-2) to calculate the nth Fibonacci number.\n\nThe recursion creates a tree of function calls:\n\n```\nfibonacci(4)\n├── fibonacci(3)\n│   ├── fibonacci(2)\n│   │   ├── fibonacci(1) → returns 1\n│   │   └── fibonacci(0) → returns 0\n│   └── fibonacci(1) → returns 1\n└── fibonacci(2)\n    ├── fibonacci(1) → returns 1\n    └── fibonacci(0) → returns 0\n```\n\nThis recursive approach is elegant but inefficient for large values of n due to repeated calculations."
        } else if (
          questionText.toLowerCase().includes("optimize") ||
          questionText.toLowerCase().includes("performance") ||
          questionText.toLowerCase().includes("memoization")
        ) {
          aiResponse =
            "To optimize this code, you can use memoization to store previously calculated Fibonacci numbers. This changes the time complexity from O(2^n) to O(n).\n\n```javascript\nfunction fibonacci(n, memo = {}) {\n  if (n in memo) return memo[n];\n  if (n <= 1) return n;\n  memo[n] = fibonacci(n-1, memo) + fibonacci(n-2, memo);\n  return memo[n];\n}\n```\n\nAlternatively, you could use an iterative approach which is even more efficient:\n\n```javascript\nfunction fibonacci(n) {\n  if (n <= 1) return n;\n  \n  let a = 0, b = 1;\n  for (let i = 2; i <= n; i++) {\n    const temp = a + b;\n    a = b;\n    b = temp;\n  }\n  return b;\n}\n```"
        } else if (questionText.toLowerCase().includes("complexity")) {
          aiResponse =
            "The time complexity of this recursive Fibonacci implementation is O(2^n), which is exponential.\n\nThis is because each call to fibonacci(n) makes two recursive calls: fibonacci(n-1) and fibonacci(n-2), creating a binary tree of calls with a depth of n.\n\nThe space complexity is O(n) due to the maximum depth of the recursion stack.\n\nThis is why the function becomes very slow for larger values of n. For example, calculating fibonacci(50) would take trillions of operations with this implementation."
        } else if (questionText.toLowerCase().includes("edge")) {
          aiResponse =
            "You should handle these edge cases in your Fibonacci function:\n\n1. **Negative inputs**: The function doesn't handle negative numbers. You could either throw an error or define behavior for negative inputs.\n\n2. **Non-integer inputs**: The function assumes n is an integer. You should validate the input type.\n\n3. **Large inputs**: Due to the exponential time complexity, large inputs will cause a stack overflow. You should either use an optimized algorithm or set a reasonable upper limit.\n\n4. **Floating point precision**: For very large Fibonacci numbers, JavaScript's number precision might be an issue. Consider using BigInt for large values.\n\nHere's an improved implementation:\n\n```javascript\nfunction fibonacci(n) {\n  // Handle edge cases\n  if (!Number.isInteger(n)) {\n    throw new Error('Input must be an integer');\n  }\n  if (n < 0) {\n    throw new Error('Input must be non-negative');\n  }\n  if (n > 50) {\n    throw new Error('Input too large, consider using an optimized algorithm');\n  }\n  \n  // Base case\n  if (n <= 1) return n;\n  \n  // Recursive case\n  return fibonacci(n - 1) + fibonacci(n - 2);\n}\n```"
        } else if (questionText.toLowerCase().includes("arrow") || questionText.toLowerCase().includes("es6")) {
          aiResponse =
            "Here's how the Fibonacci function would look using ES6 arrow functions:\n\n```javascript\nconst fibonacci = (n) => {\n  if (n <= 1) return n;\n  return fibonacci(n - 1) + fibonacci(n - 2);\n};\n\n// One-liner version (not recommended for readability)\nconst fibonacciOneLine = n => n <= 1 ? n : fibonacciOneLine(n - 1) + fibonacciOneLine(n - 2);\n\n// With memoization using ES6 features\nconst fibonacciMemo = (n, memo = new Map()) => {\n  if (memo.has(n)) return memo.get(n);\n  if (n <= 1) return n;\n  \n  const result = fibonacciMemo(n - 1, memo) + fibonacciMemo(n - 2, memo);\n  memo.set(n, result);\n  return result;\n  return result;\n};\n```\n\nThe arrow function syntax makes the code more concise, and using a Map for memoization is a modern approach."
        } else if (questionText.toLowerCase().includes("pythonic")) {
          aiResponse =
            "Here's a more Pythonic version of the merge sort algorithm:\n\n```python\ndef merge_sort(arr):\n    # Base case: lists of 0 or 1 items are already sorted\n    if len(arr) <= 1:\n        return arr\n        \n    # Divide the list into halves\n    mid = len(arr) // 2\n    left = merge_sort(arr[:mid])\n    right = merge_sort(arr[mid:])\n    \n    # Use a list comprehension for merging\n    return merge(left, right)\n    \ndef merge(left, right):\n    result = []\n    i = j = 0\n    \n    # Use a more Pythonic approach for merging\n    while i < len(left) and j < len(right):\n        if left[i] < right[j]:\n            result.append(left[i])\n            i += 1\n        else:\n            result.append(right[j])\n            j += 1\n            \n    # Use list extension instead of individual appends\n    result.extend(left[i:])\n    result.extend(right[j:])\n    return result\n\n# Even more Pythonic: use built-in sorted function for small lists\ndef merge_sort_pythonic(arr):\n    if len(arr) <= 10:  # Use built-in sort for small lists\n        return sorted(arr)\n    \n    mid = len(arr) // 2\n    left = merge_sort_pythonic(arr[:mid])\n    right = merge_sort_pythonic(arr[mid:])\n    \n    # One-liner merge using a generator expression\n    return sorted(list(left) + list(right))\n```\n\nThis version uses more Python idioms like list comprehensions, the extend method, and leverages the built-in sorted function for small lists which is more efficient."
        } else {
          aiResponse =
            "This code calculates the nth number in the Fibonacci sequence using a recursive approach. The Fibonacci sequence starts with 0 and 1, and each subsequent number is the sum of the two preceding ones.\n\nThe function has a base case (n <= 1) and a recursive case where it calls itself with smaller inputs. While this implementation is clear and elegant, it's not efficient for large values of n due to the exponential time complexity.\n\nIs there a specific aspect of the code you'd like me to explain in more detail?"
        }

        // Add AI response to conversation
        setConversation((prev) => [...prev, { role: "assistant", content: aiResponse }])
        setIsLoading(false)
      }, 1500)
    } catch (error) {
      console.error("Error getting AI response:", error)
      setIsLoading(false)
      setConversation((prev) => [
        ...prev,
        {
          role: "assistant",
          content: "I'm sorry, I couldn't process your question. Please try again.",
        },
      ])
    }
  }

  return (
    <Card className="shadow-md border-border/50 flex flex-col h-[600px]">
      <CardHeader>
        <CardTitle className="text-xl flex items-center">
          <MessageSquare className="w-5 h-5 mr-2 text-primary" />
          Ask Follow-up Questions
        </CardTitle>
      </CardHeader>
      <CardContent className="flex-grow overflow-hidden flex flex-col">
        <div className="flex-grow overflow-y-auto mb-4 pr-2">
          {conversation.length === 0 ? (
            <div className="p-6 text-center text-muted-foreground h-full flex flex-col items-center justify-center">
              <MessageSquare className="w-10 h-10 mx-auto mb-4 opacity-50" />
              <p className="mb-4">Ask a question about your code to get more specific explanations.</p>

              <div className="grid grid-cols-1 gap-2 w-full max-w-md">
                {suggestedQuestions.map((q, idx) => (
                  <Button
                    key={idx}
                    variant="outline"
                    size="sm"
                    className="text-left justify-start h-auto py-2 px-3"
                    onClick={() => handleAskQuestion(q)}
                  >
                    <Sparkles className="w-4 h-4 mr-2 text-primary" />
                    {q}
                  </Button>
                ))}
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
                      className={`flex items-start max-w-[80%] ${message.role === "user" ? "flex-row-reverse" : ""}`}
                    >
                      <Avatar className={`w-8 h-8 ${message.role === "user" ? "ml-2" : "mr-2"}`}>
                        {message.role === "user" ? (
                          <AvatarFallback>U</AvatarFallback>
                        ) : (
                          <>
                            <AvatarImage src="/placeholder.svg?height=32&width=32" />
                            <AvatarFallback>AI</AvatarFallback>
                          </>
                        )}
                      </Avatar>
                      <div
                        className={`p-3 rounded-lg ${
                          message.role === "user"
                            ? "bg-primary text-primary-foreground"
                            : "bg-muted border border-border/50"
                        }`}
                      >
                        <div className="whitespace-pre-line">{message.content}</div>
                      </div>
                    </div>
                  </motion.div>
                ))}

                {isLoading && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex justify-start"
                  >
                    <div className="flex items-start max-w-[80%]">
                      <Avatar className="w-8 h-8 mr-2">
                        <AvatarImage src="/placeholder.svg?height=32&width=32" />
                        <AvatarFallback>AI</AvatarFallback>
                      </Avatar>
                      <div className="p-3 rounded-lg bg-muted border border-border/50">
                        <div className="flex items-center space-x-2">
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
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
              <div ref={messagesEndRef} />
            </div>
          )}
        </div>
      </CardContent>
      <CardFooter className="border-t p-4">
        <div className="flex w-full space-x-2">
          <Input
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
            className="flex-grow"
          />
          <Button onClick={() => handleAskQuestion()} disabled={!question.trim() || isLoading || !code} size="icon">
            {isLoading ? <Loader2 className="h-5 w-5 animate-spin" /> : <Send className="h-5 w-5" />}
          </Button>
        </div>
      </CardFooter>
    </Card>
  )
}

