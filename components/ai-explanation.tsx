"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Skeleton } from "@/components/ui/skeleton"
import { Info, Code, Variable, GitBranch, MessageSquare, Search, Copy, Check } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { motion, AnimatePresence } from "framer-motion"
import { useToast } from "@/hooks/use-toast"

interface AIExplanationProps {
  explanation: any
  isLoading: boolean
  onHighlightLine?: (lineNumber: number) => void
  analysisProgress?: number
}

export function AIExplanation({ explanation, isLoading, onHighlightLine, analysisProgress = 0 }: AIExplanationProps) {
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({
    summary: true,
    functions: true,
    variables: true,
    logicFlow: true,
  })
  const [searchTerm, setSearchTerm] = useState("")
  const [copiedItems, setCopiedItems] = useState<Record<string, boolean>>({})
  const { toast } = useToast()

  const toggleSection = (section: string) => {
    setExpandedSections((prev) => ({
      ...prev,
      [section]: !prev[section],
    }))
  }

  const handleCopyItem = async (content: string, itemId: string) => {
    try {
      await navigator.clipboard.writeText(content)
      setCopiedItems((prev) => ({ ...prev, [itemId]: true }))
      toast({
        title: "Copied!",
        description: "Content copied to clipboard",
      })

      setTimeout(() => {
        setCopiedItems((prev) => ({ ...prev, [itemId]: false }))
      }, 2000)
    } catch (err) {
      toast({
        title: "Copy failed",
        description: "Failed to copy content",
        variant: "destructive",
      })
    }
  }

  const filterContent = (content: any[], searchTerm: string) => {
    if (!searchTerm) return content
    return content.filter((item) => JSON.stringify(item).toLowerCase().includes(searchTerm.toLowerCase()))
  }

  if (isLoading) {
    return (
      <Card className="shadow-md border-border/50">
        <CardHeader>
          <CardTitle className="text-xl flex items-center justify-between">
            <div className="flex items-center">
              <Info className="w-5 h-5 mr-2 text-primary" />
              AI Explanation
            </div>
            {analysisProgress > 0 && (
              <div className="text-sm text-muted-foreground">{Math.round(analysisProgress)}%</div>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {/* Enhanced skeleton with shimmer effect */}
            <div className="space-y-4">
              <div className="flex items-center space-x-2">
                <Skeleton className="w-6 h-6 rounded" />
                <Skeleton className="w-32 h-4" />
              </div>
              <div className="pl-8 space-y-2">
                <Skeleton className="w-full h-4" />
                <Skeleton className="w-full h-4" />
                <Skeleton className="w-3/4 h-4" />
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-center space-x-2">
                <Skeleton className="w-6 h-6 rounded" />
                <Skeleton className="w-28 h-4" />
              </div>
              <div className="pl-8 space-y-3">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="p-3 border rounded-lg space-y-2">
                    <Skeleton className="w-24 h-4" />
                    <Skeleton className="w-full h-3" />
                    <Skeleton className="w-2/3 h-3" />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (!explanation) {
    return (
      <Card className="shadow-md border-border/50">
        <CardHeader>
          <CardTitle className="text-xl flex items-center">
            <Info className="w-5 h-5 mr-2 text-primary" />
            AI Explanation
          </CardTitle>
        </CardHeader>
        <CardContent>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col items-center justify-center p-6 text-center"
          >
            <Info className="w-12 h-12 mb-4 text-muted-foreground" />
            <p className="text-muted-foreground">Paste your code and click "Analyze" to get an AI explanation.</p>
          </motion.div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="shadow-md border-border/50">
      <CardHeader>
        <CardTitle className="text-xl flex items-center justify-between">
          <div className="flex items-center">
            <Info className="w-5 h-5 mr-2 text-primary" />
            AI Explanation
          </div>
          <div className="flex items-center space-x-2">
            <div className="relative">
              <Search className="w-4 h-4 absolute left-2 top-1/2 transform -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search explanation..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-8 h-8 w-48"
              />
            </div>
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="overview" className="w-full">
          <TabsList className="w-full">
            <TabsTrigger value="overview" className="flex items-center transition-colors">
              <Code className="w-4 h-4 mr-2" />
              Overview
            </TabsTrigger>
            <TabsTrigger value="functions" className="flex items-center transition-colors">
              <GitBranch className="w-4 h-4 mr-2" />
              Functions
            </TabsTrigger>
            <TabsTrigger value="variables" className="flex items-center transition-colors">
              <Variable className="w-4 h-4 mr-2" />
              Variables
            </TabsTrigger>
            <TabsTrigger value="logic" className="flex items-center transition-colors">
              <MessageSquare className="w-4 h-4 mr-2" />
              Logic Flow
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="mt-4">
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="p-4 border rounded-lg bg-muted/10 hover:bg-muted/20 transition-colors group"
            >
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-lg font-medium">Code Summary</h3>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleCopyItem(explanation.summary, "summary")}
                  className="opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  {copiedItems.summary ? <Check className="w-4 h-4 text-green-600" /> : <Copy className="w-4 h-4" />}
                </Button>
              </div>
              <p className="text-muted-foreground">{explanation.summary}</p>
            </motion.div>
          </TabsContent>

          <TabsContent value="functions" className="mt-4 space-y-4">
            <AnimatePresence>
              {explanation?.functions && explanation.functions.length > 0 ? (
                filterContent(explanation.functions, searchTerm).map((func: any, index: number) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ delay: index * 0.1 }}
                    className="p-4 border rounded-lg bg-muted/10 hover:bg-muted/20 transition-colors group"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-semibold text-primary text-lg">{func.name || `Function ${index + 1}`}</h4>
                      <div className="flex items-center space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() =>
                            handleCopyItem(
                              func.explanation || func.description || "No description available",
                              `func-${index}`,
                            )
                          }
                        >
                          {copiedItems[`func-${index}`] ? (
                            <Check className="w-4 h-4 text-green-600" />
                          ) : (
                            <Copy className="w-4 h-4" />
                          )}
                        </Button>
                        {onHighlightLine && func.line && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => onHighlightLine(func.line)}
                            className="text-xs"
                          >
                            View in Code
                          </Button>
                        )}
                      </div>
                    </div>

                    <p className="mt-2 mb-3 text-muted-foreground">
                      {func.explanation || func.description || "Function detected in your code"}
                    </p>

                    {func.parameters && func.parameters.length > 0 && (
                      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mt-3">
                        <p className="text-sm font-medium">Parameters:</p>
                        <ul className="pl-5 mt-1 text-sm list-disc text-muted-foreground space-y-1">
                          {func.parameters.map((param: any, i: number) => (
                            <li key={i}>
                              <span className="font-mono text-primary">{param.name}</span>
                              {param.type && (
                                <span className="text-xs px-2 py-1 ml-2 rounded-full bg-muted text-muted-foreground">
                                  {param.type}
                                </span>
                              )}
                              {param.role && (
                                <div className="text-xs text-muted-foreground mt-1 ml-4">{param.role}</div>
                              )}
                            </li>
                          ))}
                        </ul>
                      </motion.div>
                    )}

                    {func.returns && (
                      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mt-3">
                        <p className="text-sm font-medium">Returns:</p>
                        <p className="pl-5 mt-1 text-sm text-muted-foreground">{func.returns}</p>
                      </motion.div>
                    )}
                  </motion.div>
                ))
              ) : (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="text-center py-8 text-muted-foreground"
                >
                  <Code className="w-8 h-8 mx-auto mb-2" />
                  <p>No functions detected in your code yet.</p>
                  <p className="text-sm mt-1">Try analyzing some code with function definitions.</p>
                </motion.div>
              )}
            </AnimatePresence>
          </TabsContent>

          <TabsContent value="variables" className="mt-4">
            <div className="p-4 border rounded-lg bg-muted/10">
              <h3 className="text-lg font-medium mb-3">Key Variables</h3>
              <div className="space-y-3">
                <AnimatePresence>
                  {explanation?.variables && explanation.variables.length > 0 ? (
                    filterContent(explanation.variables, searchTerm).map((variable: any, index: number) => (
                      <motion.div
                        key={index}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 10 }}
                        transition={{ delay: index * 0.1 }}
                        className="p-3 border rounded-md bg-card/50 hover:bg-card/70 transition-colors group"
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-2">
                            <span className="font-mono text-sm font-semibold text-primary">{variable.name}</span>
                            {variable.type && (
                              <span className="text-xs px-2 py-1 rounded-full bg-muted text-muted-foreground">
                                {variable.type}
                              </span>
                            )}
                          </div>
                          <div className="flex items-center space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() =>
                                handleCopyItem(
                                  variable.purpose || variable.description || "Variable detected",
                                  `var-${index}`,
                                )
                              }
                            >
                              {copiedItems[`var-${index}`] ? (
                                <Check className="w-4 h-4 text-green-600" />
                              ) : (
                                <Copy className="w-4 h-4" />
                              )}
                            </Button>
                            {onHighlightLine && variable.line && (
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => onHighlightLine(variable.line)}
                                className="text-xs"
                              >
                                View in Code
                              </Button>
                            )}
                          </div>
                        </div>
                        <p className="mt-2 text-sm text-muted-foreground">
                          {variable.purpose || variable.description || "Variable detected in your code"}
                        </p>
                      </motion.div>
                    ))
                  ) : (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="text-center py-8 text-muted-foreground"
                    >
                      <Variable className="w-8 h-8 mx-auto mb-2" />
                      <p>No variables detected in your code yet.</p>
                      <p className="text-sm mt-1">Try analyzing some code with variable declarations.</p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="logic" className="mt-4">
            <div className="p-4 border rounded-lg bg-muted/10">
              <h3 className="text-lg font-medium mb-3">Logic Flow</h3>
              <div className="relative pl-8 border-l-2 border-primary/30 space-y-6">
                <AnimatePresence>
                  {explanation?.logicFlow && explanation.logicFlow.length > 0 ? (
                    filterContent(explanation.logicFlow, searchTerm).map((step: any, index: number) => (
                      <motion.div
                        key={index}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 10 }}
                        transition={{ delay: index * 0.15 }}
                        className="relative group"
                      >
                        <div className="absolute -left-[41px] flex items-center justify-center w-6 h-6 rounded-full bg-primary text-primary-foreground text-xs font-bold">
                          {step.step || index + 1}
                        </div>
                        <div className="p-3 border rounded-md bg-card/50 hover:bg-card/70 transition-colors">
                          <div className="flex items-center justify-between">
                            <p className="text-muted-foreground flex-1">
                              {step.description || step.explanation || `Step ${index + 1} in the logic flow`}
                            </p>
                            <div className="flex items-center space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() =>
                                  handleCopyItem(step.description || step.explanation || "", `step-${index}`)
                                }
                              >
                                {copiedItems[`step-${index}`] ? (
                                  <Check className="w-4 h-4 text-green-600" />
                                ) : (
                                  <Copy className="w-4 h-4" />
                                )}
                              </Button>
                              {onHighlightLine && step.line && (
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => onHighlightLine(step.line)}
                                  className="text-xs"
                                >
                                  View in Code
                                </Button>
                              )}
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    ))
                  ) : (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="text-center py-8 text-muted-foreground"
                    >
                      <MessageSquare className="w-8 h-8 mx-auto mb-2" />
                      <p>No logic flow analysis available yet.</p>
                      <p className="text-sm mt-1">Try analyzing some code to see the execution flow.</p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  )
}
