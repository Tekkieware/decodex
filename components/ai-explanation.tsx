"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Skeleton } from "@/components/ui/skeleton"
import { Info, Code, Variable, GitBranch, MessageSquare } from "lucide-react"
import { Button } from "@/components/ui/button"
import { motion } from "framer-motion"

interface AIExplanationProps {
  explanation: any
  isLoading: boolean
  onHighlightLine?: (lineNumber: number) => void
}

export function AIExplanation({ explanation, isLoading, onHighlightLine }: AIExplanationProps) {
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({
    summary: true,
    functions: true,
    variables: true,
    logicFlow: true,
  })

  const toggleSection = (section: string) => {
    setExpandedSections((prev) => ({
      ...prev,
      [section]: !prev[section],
    }))
  }

  if (isLoading) {
    return (
      <Card className="shadow-md border-border/50">
        <CardHeader>
          <CardTitle className="text-xl flex items-center">
            <Info className="w-5 h-5 mr-2 text-primary" />
            AI Explanation
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <Skeleton className="w-full h-4" />
            <Skeleton className="w-full h-4" />
            <Skeleton className="w-full h-4" />
            <Skeleton className="w-3/4 h-4" />
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
          <div className="flex flex-col items-center justify-center p-6 text-center">
            <Info className="w-12 h-12 mb-4 text-muted-foreground" />
            <p className="text-muted-foreground">Paste your code and click "Analyze" to get an AI explanation.</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="shadow-md border-border/50">
      <CardHeader>
        <CardTitle className="text-xl flex items-center">
          <Info className="w-5 h-5 mr-2 text-primary" />
          AI Explanation
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="overview" className="w-full">
          <TabsList className="w-full">
            <TabsTrigger value="overview" className="flex items-center">
              <Code className="w-4 h-4 mr-2" />
              Overview
            </TabsTrigger>
            <TabsTrigger value="functions" className="flex items-center">
              <GitBranch className="w-4 h-4 mr-2" />
              Functions
            </TabsTrigger>
            <TabsTrigger value="variables" className="flex items-center">
              <Variable className="w-4 h-4 mr-2" />
              Variables
            </TabsTrigger>
            <TabsTrigger value="logic" className="flex items-center">
              <MessageSquare className="w-4 h-4 mr-2" />
              Logic Flow
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="mt-4">
            <div className="p-4 border rounded-lg bg-muted/10">
              <h3 className="text-lg font-medium mb-2">Code Summary</h3>
              <p className="text-muted-foreground">{explanation.summary}</p>
            </div>
          </TabsContent>

          <TabsContent value="functions" className="mt-4 space-y-4">
            {explanation.functions.map((func: any, index: number) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="p-4 border rounded-lg bg-muted/10 hover:bg-muted/20 transition-colors"
              >
                <h4 className="font-semibold text-primary text-lg">{func.name}</h4>
                <p className="mt-2 mb-3 text-muted-foreground">{func.explanation}</p>

                {func.parameters && func.parameters.length > 0 && (
                  <div className="mt-3">
                    <p className="text-sm font-medium">Parameters:</p>
                    <ul className="pl-5 mt-1 text-sm list-disc text-muted-foreground">
                      {func.parameters.map((param: string, i: number) => (
                        <li key={i}>{param}</li>
                      ))}
                    </ul>
                  </div>
                )}

                {func.returns && (
                  <div className="mt-3">
                    <p className="text-sm font-medium">Returns:</p>
                    <p className="pl-5 mt-1 text-sm text-muted-foreground">{func.returns}</p>
                  </div>
                )}

                {onHighlightLine && (
                  <div className="mt-4 text-right">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onHighlightLine(3)} // This would be the actual line number in a real implementation
                      className="text-xs"
                    >
                      View in Code
                    </Button>
                  </div>
                )}
              </motion.div>
            ))}
          </TabsContent>

          <TabsContent value="variables" className="mt-4">
            <div className="p-4 border rounded-lg bg-muted/10">
              <h3 className="text-lg font-medium mb-3">Key Variables</h3>
              <div className="space-y-3">
                {explanation.variables &&
                  explanation.variables.map((variable: any, index: number) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className="p-3 border rounded-md bg-card/50"
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-mono text-sm font-semibold text-primary">{variable.name}</span>
                        {variable.type && (
                          <span className="text-xs px-2 py-1 rounded-full bg-muted text-muted-foreground">
                            {variable.type}
                          </span>
                        )}
                      </div>
                      <p className="mt-2 text-sm text-muted-foreground">{variable.purpose}</p>

                      {onHighlightLine && (
                        <div className="mt-2 text-right">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => onHighlightLine(2)} // This would be the actual line number in a real implementation
                            className="text-xs"
                          >
                            View in Code
                          </Button>
                        </div>
                      )}
                    </motion.div>
                  ))}
              </div>
            </div>
          </TabsContent>

          <TabsContent value="logic" className="mt-4">
            <div className="p-4 border rounded-lg bg-muted/10">
              <h3 className="text-lg font-medium mb-3">Logic Flow</h3>
              <div className="relative pl-8 border-l-2 border-primary/30 space-y-6">
                {explanation.logicFlow &&
                  explanation.logicFlow.map((step: any, index: number) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.15 }}
                      className="relative"
                    >
                      <div className="absolute -left-[41px] flex items-center justify-center w-6 h-6 rounded-full bg-primary text-primary-foreground text-xs font-bold">
                        {step.step}
                      </div>
                      <div className="p-3 border rounded-md bg-card/50">
                        <p className="text-muted-foreground">{step.description}</p>

                        {onHighlightLine && (
                          <div className="mt-2 text-right">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => onHighlightLine(index + 2)} // This would be the actual line number in a real implementation
                              className="text-xs"
                            >
                              View in Code
                            </Button>
                          </div>
                        )}
                      </div>
                    </motion.div>
                  ))}
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  )
}

