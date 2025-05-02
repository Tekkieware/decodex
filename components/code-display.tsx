"use client"

import type React from "react"

import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { RefreshCw, Copy, Check, ExternalLink, Code } from "lucide-react"
import { useState, useEffect } from "react"
import dynamic from "next/dynamic"

// Dynamically import Monaco Editor to avoid SSR issues
const MonacoEditor = dynamic(() => import("@monaco-editor/react").then((mod) => mod.default), { ssr: false })

interface CodeDisplayProps {
  code: string
  language: string
  onCodeChange: (code: string) => void
  onLanguageChange: (language: string) => void
  onReanalyze: () => void
  highlightedLine?: number | null
  editorRef?: React.MutableRefObject<any>
  onCopyCode?: () => void
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

const LANGUAGE_DOCS: Record<string, string> = {
  javascript: "https://developer.mozilla.org/en-US/docs/Web/JavaScript",
  typescript: "https://www.typescriptlang.org/docs/",
  python: "https://docs.python.org/3/",
  java: "https://docs.oracle.com/en/java/",
  csharp: "https://docs.microsoft.com/en-us/dotnet/csharp/",
  cpp: "https://en.cppreference.com/w/",
  go: "https://golang.org/doc/",
  rust: "https://doc.rust-lang.org/book/",
}

export function CodeDisplay({
  code,
  language,
  onCodeChange,
  onLanguageChange,
  onReanalyze,
  highlightedLine,
  editorRef,
  onCopyCode,
}: CodeDisplayProps) {
  const [copied, setCopied] = useState(false)
  const [editorOptions, setEditorOptions] = useState({
    minimap: { enabled: false },
    scrollBeyondLastLine: false,
    fontSize: 14,
    automaticLayout: true,
    lineNumbers: "on",
    renderLineHighlight: "all",
    smoothScrolling: true,
    cursorBlinking: "smooth",
    cursorSmoothCaretAnimation: "on",
    padding: { top: 16, bottom: 16 },
  })

  useEffect(() => {
    if (highlightedLine) {
      // Update editor options to highlight the line
      setEditorOptions((prev) => ({
        ...prev,
        renderLineHighlight: "all",
      }))
    }
  }, [highlightedLine])

  const handleEditorChange = (value: string | undefined) => {
    if (value !== undefined) {
      onCodeChange(value)
    }
  }

  const handleEditorDidMount = (editor: any) => {
    if (editorRef) {
      editorRef.current = editor
    }

    // Add custom CSS for line highlighting
    editor.onDidChangeModelContent(() => {
      if (highlightedLine) {
        const lineElement = document.querySelector(`.view-line[linenumber="${highlightedLine}"]`)
        if (lineElement) {
          lineElement.classList.add("code-line-highlight")
        }
      }
    })
  }

  const handleCopyClick = () => {
    if (onCopyCode) {
      onCopyCode()
    } else {
      navigator.clipboard.writeText(code)
    }

    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <Card className="h-full shadow-md border-border/50">
      <CardHeader className="flex flex-row items-center justify-between pb-2 bg-muted/30">
        <div className="flex items-center space-x-2">
          <Code className="h-5 w-5 text-primary" />
          <CardTitle className="text-xl">Your Code</CardTitle>
        </div>
        <div className="flex items-center space-x-2">
          <Badge variant="outline" className="text-xs font-normal flex items-center">
            <span className="mr-1">{LANGUAGE_ICONS[language] || "🔍"}</span>
            {language.charAt(0).toUpperCase() + language.slice(1)}
          </Badge>
          {LANGUAGE_DOCS[language] && (
            <a
              href={LANGUAGE_DOCS[language]}
              target="_blank"
              rel="noopener noreferrer"
              className="text-muted-foreground hover:text-foreground transition-colors"
              title={`${language.charAt(0).toUpperCase() + language.slice(1)} Documentation`}
            >
              <ExternalLink className="h-4 w-4" />
              <span className="sr-only">Documentation</span>
            </a>
          )}
        </div>
      </CardHeader>
      <CardContent className="p-0">
        <div className="p-3 bg-muted/10 border-y flex items-center justify-between">
          <Select value={language} onValueChange={onLanguageChange}>
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

          <div className="flex items-center space-x-2">
            <Button variant="outline" size="sm" onClick={handleCopyClick} className="flex items-center">
              {copied ? (
                <>
                  <Check className="h-4 w-4 mr-1" />
                  Copied
                </>
              ) : (
                <>
                  <Copy className="h-4 w-4 mr-1" />
                  Copy
                </>
              )}
            </Button>
          </div>
        </div>

        <div className="border-0 min-h-[500px]">
          <MonacoEditor
            height="500px"
            language={language}
            value={code}
            onChange={handleEditorChange}
            theme="vs-dark"
            options={editorOptions}
            onMount={handleEditorDidMount}
            line={highlightedLine || undefined}
          />
        </div>
      </CardContent>
      <CardFooter className="flex justify-between p-3 bg-muted/10 border-t">
        <div className="text-sm text-muted-foreground">
          {code ? (
            <span>
              {code.split("\n").length} lines • {code.length} characters
            </span>
          ) : (
            <span>No code to analyze</span>
          )}
        </div>
        <Button variant="outline" onClick={onReanalyze} size="sm" className="flex items-center">
          <RefreshCw className="w-4 h-4 mr-2" />
          Reanalyze
        </Button>
      </CardFooter>
    </Card>
  )
}

