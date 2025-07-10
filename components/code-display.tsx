"use client"

import type React from "react"
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Slider } from "@/components/ui/slider"
import {
  RefreshCw,
  Copy,
  Check,
  ExternalLink,
  Code,
  Download,
  Maximize2,
  Minimize2,
  Settings,
  Palette,
  Type,
  FileText,
  Undo2,
  Redo2,
  Zap,
} from "lucide-react"
import { useState, useEffect, useRef } from "react"
import dynamic from "next/dynamic"
import type { editor } from "monaco-editor"
import { motion } from "framer-motion"
import { useToast } from "@/hooks/use-toast"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"

// Dynamically import Monaco Editor to avoid SSR issues
const MonacoEditor = dynamic(() => import("@monaco-editor/react").then((mod) => mod.default), { ssr: false })

interface CodeDisplayProps {
  code: string
  language: string
  onCodeChange: (code: string) => void
  onReanalyze: () => void
  highlightedLine?: number | null
  editorRef?: React.MutableRefObject<any>
  onCopyCode?: () => void
  isAnalyzing?: boolean
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

const THEMES = [
  { value: "vs-dark", label: "Dark", icon: "🌙" },
  { value: "light", label: "Light", icon: "☀️" },
  { value: "hc-black", label: "High Contrast", icon: "⚫" },
]

export function CodeDisplay({
  code,
  language,
  onCodeChange,
  onReanalyze,
  highlightedLine,
  editorRef,
  onCopyCode,
  isAnalyzing = false,
}: CodeDisplayProps) {
  const [copied, setCopied] = useState(false)
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [theme, setTheme] = useState("vs-dark")
  const [fontSize, setFontSize] = useState([14])
  const [showMinimap, setShowMinimap] = useState(false)
  const [wordWrap, setWordWrap] = useState(false)
  const [showLineNumbers, setShowLineNumbers] = useState(true)
  const [autoFormat, setAutoFormat] = useState(true)
  const [editorLoaded, setEditorLoaded] = useState(false)
  const [canUndo, setCanUndo] = useState(false)
  const [canRedo, setCanRedo] = useState(false)
  const [showFind, setShowFind] = useState(false)
  const [codeStats, setCodeStats] = useState({
    lines: 0,
    characters: 0,
    words: 0,
    functions: 0,
  })

  const { toast } = useToast()
  const fullscreenRef = useRef<HTMLDivElement>(null)

  const [editorOptions, setEditorOptions] = useState<editor.IStandaloneEditorConstructionOptions>({
    minimap: { enabled: showMinimap },
    scrollBeyondLastLine: false,
    fontSize: fontSize[0],
    automaticLayout: true,
    lineNumbers: showLineNumbers ? "on" : "off",
    renderLineHighlight: "all",
    smoothScrolling: true,
    cursorBlinking: "smooth",
    cursorSmoothCaretAnimation: "on",
    padding: { top: 16, bottom: 16 },
    wordWrap: wordWrap ? "on" : "off",
    formatOnPaste: autoFormat,
    formatOnType: autoFormat,
    folding: true,
    foldingHighlight: true,
    showFoldingControls: "always",
    bracketPairColorization: { enabled: true },
    guides: {
      bracketPairs: true,
      indentation: true,
    },
  })

  // Update editor options when settings change
  useEffect(() => {
    setEditorOptions((prev) => ({
      ...prev,
      minimap: { enabled: showMinimap },
      fontSize: fontSize[0],
      lineNumbers: showLineNumbers ? "on" : "off",
      wordWrap: wordWrap ? "on" : "off",
      formatOnPaste: autoFormat,
      formatOnType: autoFormat,
    }))
  }, [showMinimap, fontSize, showLineNumbers, wordWrap, autoFormat])

  // Calculate code statistics
  useEffect(() => {
    if (code) {
      const lines = code.split("\n").length
      const characters = code.length
      const words = code.split(/\s+/).filter((word) => word.length > 0).length
      const functions = (code.match(/function\s+\w+|def\s+\w+|const\s+\w+\s*=|let\s+\w+\s*=/g) || []).length

      setCodeStats({ lines, characters, words, functions })
    } else {
      setCodeStats({ lines: 0, characters: 0, words: 0, functions: 0 })
    }
  }, [code])

  // Handle fullscreen mode
  useEffect(() => {
    const handleEscapeKey = (event: KeyboardEvent) => {
      if (event.key === "Escape" && isFullscreen) {
        setIsFullscreen(false)
      }
    }

    if (isFullscreen) {
      document.addEventListener("keydown", handleEscapeKey)
      document.body.style.overflow = "hidden"
    } else {
      document.body.style.overflow = "unset"
    }

    return () => {
      document.removeEventListener("keydown", handleEscapeKey)
      document.body.style.overflow = "unset"
    }
  }, [isFullscreen])

  // Handle highlighted line
  useEffect(() => {
    if (highlightedLine && editorRef?.current) {
      editorRef.current.revealLineInCenter(highlightedLine)
      editorRef.current.setPosition({ lineNumber: highlightedLine, column: 1 })

      // Add visual highlight
      const decoration = editorRef.current.deltaDecorations(
        [],
        [
          {
            range: {
              startLineNumber: highlightedLine,
              startColumn: 1,
              endLineNumber: highlightedLine,
              endColumn: 1,
            },
            options: {
              isWholeLine: true,
              className: "highlighted-line",
              glyphMarginClassName: "highlighted-line-glyph",
            },
          },
        ],
      )

      // Clear highlight after 3 seconds
      setTimeout(() => {
        if (editorRef?.current) {
          editorRef.current.deltaDecorations(decoration, [])
        }
      }, 3000)
    }
  }, [highlightedLine, editorRef])

  const handleEditorChange = (value: string | undefined) => {
    if (value !== undefined) {
      onCodeChange(value)
    }
  }

  const handleEditorDidMount = (editor: any, monaco: any) => {
    if (editorRef) {
      editorRef.current = editor
    }

    setEditorLoaded(true)

    // Track undo/redo state
    editor.onDidChangeModelContent(() => {
      setCanUndo(editor.getModel()?.canUndo() || false)
      setCanRedo(editor.getModel()?.canRedo() || false)
    })

    // Add custom CSS for highlighted lines
    const style = document.createElement("style")
    style.textContent = `
      .highlighted-line {
        background-color: rgba(255, 193, 7, 0.2) !important;
        border-left: 3px solid #ffc107 !important;
      }
      .highlighted-line-glyph {
        background-color: #ffc107 !important;
        width: 3px !important;
      }
    `
    document.head.appendChild(style)

    // Keyboard shortcuts
    editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.KeyS, () => {
      handleExportCode()
    })

    editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.KeyF, () => {
      setShowFind(true)
      editor.getAction("actions.find").run()
    })

    editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.KeyH, () => {
      editor.getAction("editor.action.startFindReplaceAction").run()
    })

    toast({
      title: "Editor Ready",
      description: "Code editor loaded successfully with enhanced features",
    })
  }

  const handleCopyClick = async () => {
    try {
      if (onCopyCode) {
        onCopyCode()
      } else {
        await navigator.clipboard.writeText(code)
      }
      setCopied(true)
      toast({
        title: "Code Copied",
        description: "Code has been copied to your clipboard",
      })
      setTimeout(() => setCopied(false), 2000)
    } catch (err) {
      toast({
        title: "Copy Failed",
        description: "Failed to copy code to clipboard",
        variant: "destructive",
      })
    }
  }

  const handleExportCode = () => {
    const blob = new Blob([code], { type: "text/plain" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `code.${language === "javascript" ? "js" : language === "typescript" ? "ts" : language === "python" ? "py" : "txt"}`
    a.click()
    URL.revokeObjectURL(url)

    toast({
      title: "Code Exported",
      description: "Code has been saved to file",
    })
  }

  const handleFormatCode = () => {
    if (editorRef?.current) {
      editorRef.current.getAction("editor.action.formatDocument").run()
      toast({
        title: "Code Formatted",
        description: "Code has been automatically formatted",
      })
    }
  }

  const handleUndo = () => {
    if (editorRef?.current) {
      editorRef.current.trigger("keyboard", "undo", null)
    }
  }

  const handleRedo = () => {
    if (editorRef?.current) {
      editorRef.current.trigger("keyboard", "redo", null)
    }
  }

  const toggleFullscreen = () => {
    setIsFullscreen(!isFullscreen)
    toast({
      title: isFullscreen ? "Exited Fullscreen" : "Entered Fullscreen",
      description: isFullscreen ? "Press F11 to enter fullscreen again" : "Press Escape to exit fullscreen",
    })
  }

  const cardContent = (
    <>
      <CardHeader className="flex flex-row items-center justify-between pb-2 bg-muted/30">
        <div className="flex items-center space-x-2">
          <Code className="h-5 w-5 text-primary" />
          <CardTitle className="text-xl">Your Code</CardTitle>
          {isAnalyzing && (
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              className="flex items-center space-x-2"
            >
              <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
              <span className="text-sm text-muted-foreground">Analyzing...</span>
            </motion.div>
          )}
        </div>

        <div className="flex items-center space-x-2">
          <Badge variant="outline" className="text-xs font-normal flex items-center">
            <span className="mr-1">{LANGUAGE_ICONS[language] || "🔍"}</span>
            {language.charAt(0).toUpperCase() + language.slice(1)}
          </Badge>

          {LANGUAGE_DOCS[language] && (
            <Button variant="ghost" size="sm" asChild className="h-8 w-8 p-0">
              <a
                href={LANGUAGE_DOCS[language]}
                target="_blank"
                rel="noopener noreferrer"
                title={`${language.charAt(0).toUpperCase() + language.slice(1)} Documentation`}
              >
                <ExternalLink className="h-4 w-4" />
                <span className="sr-only">Documentation</span>
              </a>
            </Button>
          )}

          <Button variant="ghost" size="sm" onClick={toggleFullscreen} className="h-8 w-8 p-0">
            {isFullscreen ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
          </Button>
        </div>
      </CardHeader>

      <CardContent className="p-0">
        {/* Enhanced Toolbar */}
        <div className="p-3 bg-muted/10 border-y flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Badge variant="outline" className="text-xs font-normal flex items-center">
              <span className="mr-1">{LANGUAGE_ICONS[language] || "🔍"}</span>
              {language.charAt(0).toUpperCase() + language.slice(1)}
            </Badge>

            {/* Undo/Redo */}
            <div className="flex items-center space-x-1">
              <Button
                variant="ghost"
                size="sm"
                onClick={handleUndo}
                disabled={!canUndo || !editorLoaded}
                className="h-8 w-8 p-0"
                title="Undo (Ctrl+Z)"
              >
                <Undo2 className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleRedo}
                disabled={!canRedo || !editorLoaded}
                className="h-8 w-8 p-0"
                title="Redo (Ctrl+Y)"
              >
                <Redo2 className="h-4 w-4" />
              </Button>
            </div>

            <Separator orientation="vertical" className="h-6" />

            {/* Format Code */}
            <Button
              variant="ghost"
              size="sm"
              onClick={handleFormatCode}
              disabled={!editorLoaded || !code}
              className="h-8 px-2"
              title="Format Code"
            >
              <Zap className="h-4 w-4 mr-1" />
              Format
            </Button>
          </div>

          <div className="flex items-center space-x-2">
            {/* Editor Settings */}
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                  <Settings className="h-4 w-4" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-80" align="end">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <h4 className="font-medium leading-none">Editor Settings</h4>
                    <p className="text-sm text-muted-foreground">Customize your coding experience</p>
                  </div>

                  <div className="space-y-4">
                    {/* Theme Selection */}
                    <div className="space-y-2">
                      <Label className="text-sm font-medium flex items-center">
                        <Palette className="w-4 h-4 mr-2" />
                        Theme
                      </Label>
                      <Select value={theme} onValueChange={setTheme}>
                        <SelectTrigger className="h-8">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {THEMES.map((t) => (
                            <SelectItem key={t.value} value={t.value}>
                              {t.icon} {t.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Font Size */}
                    <div className="space-y-2">
                      <Label className="text-sm font-medium flex items-center justify-between">
                        <span className="flex items-center">
                          <Type className="w-4 h-4 mr-2" />
                          Font Size
                        </span>
                        <span className="text-xs text-muted-foreground">{fontSize[0]}px</span>
                      </Label>
                      <Slider
                        value={fontSize}
                        onValueChange={setFontSize}
                        max={24}
                        min={10}
                        step={1}
                        className="w-full"
                      />
                    </div>

                    {/* Toggle Options */}
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <Label htmlFor="minimap" className="text-sm font-medium">
                          Show Minimap
                        </Label>
                        <Switch id="minimap" checked={showMinimap} onCheckedChange={setShowMinimap} />
                      </div>

                      <div className="flex items-center justify-between">
                        <Label htmlFor="line-numbers" className="text-sm font-medium">
                          Line Numbers
                        </Label>
                        <Switch id="line-numbers" checked={showLineNumbers} onCheckedChange={setShowLineNumbers} />
                      </div>

                      <div className="flex items-center justify-between">
                        <Label htmlFor="word-wrap" className="text-sm font-medium">
                          Word Wrap
                        </Label>
                        <Switch id="word-wrap" checked={wordWrap} onCheckedChange={setWordWrap} />
                      </div>

                      <div className="flex items-center justify-between">
                        <Label htmlFor="auto-format" className="text-sm font-medium">
                          Auto Format
                        </Label>
                        <Switch id="auto-format" checked={autoFormat} onCheckedChange={setAutoFormat} />
                      </div>
                    </div>
                  </div>
                </div>
              </PopoverContent>
            </Popover>

            {/* Copy Button */}
            <Button
              variant="outline"
              size="sm"
              onClick={handleCopyClick}
              className="flex items-center h-8 bg-transparent"
            >
              {copied ? (
                <>
                  <Check className="h-4 w-4 mr-1 text-green-600" />
                  Copied
                </>
              ) : (
                <>
                  <Copy className="h-4 w-4 mr-1" />
                  Copy
                </>
              )}
            </Button>

            {/* Export Button */}
            <Button variant="ghost" size="sm" onClick={handleExportCode} className="h-8 px-2" title="Export Code">
              <Download className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Monaco Editor */}
        <div className="border-0 min-h-[500px] relative">
          {!editorLoaded && (
            <div className="absolute inset-0 flex items-center justify-center bg-muted/20 z-10">
              <div className="flex items-center space-x-2">
                <div className="w-4 h-4 rounded-full bg-primary animate-pulse" />
                <span className="text-sm text-muted-foreground">Loading editor...</span>
              </div>
            </div>
          )}

          <MonacoEditor
            height="500px"
            language={language}
            value={code}
            onChange={handleEditorChange}
            theme={theme}
            options={editorOptions}
            onMount={handleEditorDidMount}
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

      <CardFooter className="flex justify-between p-3 bg-muted/10 border-t">
        <div className="flex items-center space-x-4 text-sm text-muted-foreground">
          <div className="flex items-center space-x-2">
            <FileText className="w-4 h-4" />
            <span>
              {codeStats.lines} lines • {codeStats.characters} chars • {codeStats.words} words
            </span>
          </div>
          {codeStats.functions > 0 && (
            <div className="flex items-center space-x-1">
              <Code className="w-4 h-4" />
              <span>{codeStats.functions} functions</span>
            </div>
          )}
        </div>

        <Button
          variant="outline"
          onClick={onReanalyze}
          size="sm"
          className="flex items-center bg-transparent"
          disabled={!code || isAnalyzing}
        >
          <RefreshCw className={`w-4 h-4 mr-2 ${isAnalyzing ? "animate-spin" : ""}`} />
          {isAnalyzing ? "Analyzing..." : "Reanalyze"}
        </Button>
      </CardFooter>
    </>
  )

  if (isFullscreen) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        ref={fullscreenRef}
        className="fixed inset-0 z-50 bg-background"
      >
        <Card className="h-full shadow-none border-0 rounded-none">{cardContent}</Card>
      </motion.div>
    )
  }

  return <Card className="h-full shadow-md border-border/50">{cardContent}</Card>
}
