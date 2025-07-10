"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Skeleton } from "@/components/ui/skeleton"
import {
  AlertCircle,
  AlertTriangle,
  CheckCircle2,
  Info,
  Bug,
  Filter,
  ChevronDown,
  ChevronUp,
  Zap,
  Copy,
  Check,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { motion, AnimatePresence } from "framer-motion"
import { useToast } from "@/hooks/use-toast"

interface BugType {
  type: "error" | "warning" | "suggestion"
  message: string
  line: number
  suggestion?: string
  severity?: "low" | "medium" | "high"
  category?: string
}

interface BugDetectionProps {
  bugs: BugType[] | undefined
  isLoading: boolean
  code: string
  onHighlightLine?: (lineNumber: number) => void
  analysisProgress?: number
}

export function BugDetection({ bugs, isLoading, code, onHighlightLine, analysisProgress = 0 }: BugDetectionProps) {
  const [filter, setFilter] = useState<"all" | "error" | "warning" | "suggestion">("all")
  const [sortBy, setSortBy] = useState<"line" | "severity" | "type">("line")
  const [expandedBugs, setExpandedBugs] = useState<Record<number, boolean>>({})
  const [appliedFixes, setAppliedFixes] = useState<Record<number, boolean>>({})
  const [copiedFixes, setCopiedFixes] = useState<Record<number, boolean>>({})
  const { toast } = useToast()

  const toggleBugExpansion = (index: number) => {
    setExpandedBugs((prev) => ({
      ...prev,
      [index]: !prev[index],
    }))
  }

  const handleApplyFix = (index: number, suggestion: string) => {
    setAppliedFixes((prev) => ({ ...prev, [index]: true }))
    toast({
      title: "Fix Applied",
      description: "The suggested fix has been noted. You can implement it in your code editor.",
    })
  }

  const handleCopyFix = async (suggestion: string, index: number) => {
    try {
      await navigator.clipboard.writeText(suggestion)
      setCopiedFixes((prev) => ({ ...prev, [index]: true }))
      toast({
        title: "Fix Copied",
        description: "Suggested fix copied to clipboard",
      })

      setTimeout(() => {
        setCopiedFixes((prev) => ({ ...prev, [index]: false }))
      }, 2000)
    } catch (err) {
      toast({
        title: "Copy failed",
        description: "Failed to copy fix to clipboard",
        variant: "destructive",
      })
    }
  }

  const filteredBugs = bugs?.filter((bug) => filter === "all" || bug.type === filter) || []

  const sortedBugs = [...filteredBugs].sort((a, b) => {
    switch (sortBy) {
      case "line":
        return a.line - b.line
      case "severity":
        const severityOrder = { high: 3, medium: 2, low: 1 }
        return (severityOrder[b.severity || "low"] || 1) - (severityOrder[a.severity || "low"] || 1)
      case "type":
        const typeOrder = { error: 3, warning: 2, suggestion: 1 }
        return (typeOrder[b.type] || 1) - (typeOrder[a.type] || 1)
      default:
        return 0
    }
  })

  const getBugStats = () => {
    if (!bugs) return { errors: 0, warnings: 0, suggestions: 0 }
    return bugs.reduce(
      (acc, bug) => {
        acc[bug.type === "error" ? "errors" : bug.type === "warning" ? "warnings" : "suggestions"]++
        return acc
      },
      { errors: 0, warnings: 0, suggestions: 0 },
    )
  }

  const stats = getBugStats()

  if (isLoading) {
    return (
      <Card className="shadow-md border-border/50">
        <CardHeader>
          <CardTitle className="text-xl flex items-center justify-between">
            <div className="flex items-center">
              <Bug className="w-5 h-5 mr-2 text-primary" />
              Issues & Suggestions
            </div>
            {analysisProgress > 0 && (
              <div className="text-sm text-muted-foreground">Scanning... {Math.round(analysisProgress)}%</div>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {/* Enhanced loading skeleton */}
            <div className="flex space-x-2">
              <Skeleton className="w-20 h-6 rounded-full" />
              <Skeleton className="w-20 h-6 rounded-full" />
              <Skeleton className="w-24 h-6 rounded-full" />
            </div>
            {[1, 2, 3].map((i) => (
              <div key={i} className="p-4 border rounded-lg space-y-2">
                <div className="flex items-center space-x-2">
                  <Skeleton className="w-5 h-5 rounded" />
                  <Skeleton className="w-16 h-4" />
                  <Skeleton className="w-12 h-4" />
                </div>
                <Skeleton className="w-full h-4" />
                <Skeleton className="w-3/4 h-4" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    )
  }

  if (!bugs || bugs.length === 0) {
    return (
      <Card className="shadow-md border-border/50">
        <CardHeader>
          <CardTitle className="text-xl flex items-center">
            <Bug className="w-5 h-5 mr-2 text-primary" />
            Issues & Suggestions
          </CardTitle>
        </CardHeader>
        <CardContent>
          {code ? (
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}>
              <Alert className="bg-green-50 border-green-200 dark:bg-green-950 dark:border-green-800">
                <CheckCircle2 className="w-4 h-4 text-green-600" />
                <AlertTitle className="text-green-800 dark:text-green-200">No issues detected</AlertTitle>
                <AlertDescription className="text-green-700 dark:text-green-300">
                  Your code looks good! No errors or warnings were found.
                </AlertDescription>
              </Alert>
            </motion.div>
          ) : (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex flex-col items-center justify-center p-6 text-center"
            >
              <Info className="w-12 h-12 mb-4 text-muted-foreground" />
              <p className="text-muted-foreground">Paste your code and click "Analyze" to detect bugs and issues.</p>
            </motion.div>
          )}
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="shadow-md border-border/50">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-xl flex items-center">
            <Bug className="w-5 h-5 mr-2 text-primary" />
            Issues & Suggestions
          </CardTitle>

          {/* Bug Statistics */}
          <div className="flex items-center space-x-2">
            {stats.errors > 0 && (
              <Badge variant="destructive" className="text-xs">
                {stats.errors} errors
              </Badge>
            )}
            {stats.warnings > 0 && (
              <Badge variant="secondary" className="text-xs bg-yellow-100 text-yellow-800">
                {stats.warnings} warnings
              </Badge>
            )}
            {stats.suggestions > 0 && (
              <Badge variant="outline" className="text-xs">
                {stats.suggestions} suggestions
              </Badge>
            )}
          </div>
        </div>

        {/* Filters and Sorting */}
        <div className="flex items-center space-x-4 mt-4">
          <div className="flex items-center space-x-2">
            <Filter className="w-4 h-4 text-muted-foreground" />
            <Select value={filter} onValueChange={(value: any) => setFilter(value)}>
              <SelectTrigger className="w-32 h-8">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Issues</SelectItem>
                <SelectItem value="error">Errors</SelectItem>
                <SelectItem value="warning">Warnings</SelectItem>
                <SelectItem value="suggestion">Suggestions</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Select value={sortBy} onValueChange={(value: any) => setSortBy(value)}>
            <SelectTrigger className="w-32 h-8">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="line">By Line</SelectItem>
              <SelectItem value="severity">By Severity</SelectItem>
              <SelectItem value="type">By Type</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        <AnimatePresence>
          {sortedBugs.map((bug, index) => (
            <motion.div
              key={`${bug.line}-${index}`}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ delay: index * 0.05 }}
            >
              <Alert
                variant={bug.type === "error" ? "destructive" : "default"}
                className={`${bug.type === "warning"
                  ? "bg-yellow-50 border-yellow-200 dark:bg-yellow-950 dark:border-yellow-800"
                  : bug.type === "suggestion"
                    ? "bg-blue-50 border-blue-200 dark:bg-blue-950 dark:border-blue-800"
                    : ""
                  } hover:shadow-md transition-shadow`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-start space-x-2">
                    {bug.type === "error" ? (
                      <AlertCircle className="w-4 h-4 mt-0.5" />
                    ) : bug.type === "warning" ? (
                      <AlertTriangle className="w-4 h-4 mt-0.5 text-yellow-600" />
                    ) : (
                      <Info className="w-4 h-4 mt-0.5 text-blue-600" />
                    )}
                    <div className="flex-1">
                      <AlertTitle className="flex items-center space-x-2">
                        <span>
                          {bug.type === "error" ? "Error" : bug.type === "warning" ? "Warning" : "Suggestion"}
                        </span>
                        <span className="text-xs font-normal text-muted-foreground">Line {bug.line}</span>
                        {bug.severity && (
                          <Badge
                            variant="outline"
                            className={`text-xs ${bug.severity === "high"
                              ? "border-red-300 text-red-700"
                              : bug.severity === "medium"
                                ? "border-yellow-300 text-yellow-700"
                                : "border-gray-300 text-gray-700"
                              }`}
                          >
                            {bug.severity}
                          </Badge>
                        )}
                      </AlertTitle>
                      <AlertDescription className="mt-2">
                        <p>{bug.message}</p>
                      </AlertDescription>
                    </div>
                  </div>

                  <div className="flex items-center space-x-2">
                    {onHighlightLine && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onHighlightLine(bug.line)}
                        className="text-xs hover:bg-muted/80"
                      >
                        View in Code
                      </Button>
                    )}
                    {bug.suggestion && (
                      <Button variant="ghost" size="sm" onClick={() => toggleBugExpansion(index)} className="text-xs">
                        {expandedBugs[index] ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                      </Button>
                    )}
                  </div>
                </div>

                <AnimatePresence>
                  {bug.suggestion && expandedBugs[index] && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      className="mt-4 p-3 bg-muted/50 rounded-md text-sm border border-border/50"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <strong className="text-primary flex items-center">
                            <Zap className="w-4 h-4 mr-1" />
                            Suggestion:
                          </strong>
                          <p className="mt-1">{bug.suggestion}</p>
                        </div>
                      </div>

                      <div className="mt-3 flex justify-end space-x-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleCopyFix(bug.suggestion!, index)}
                          className="text-xs"
                        >
                          {copiedFixes[index] ? (
                            <Check className="w-4 h-4 mr-1 text-green-600" />
                          ) : (
                            <Copy className="w-4 h-4 mr-1" />
                          )}
                          {copiedFixes[index] ? "Copied!" : "Copy Fix"}
                        </Button>
                        <Button
                          size="sm"
                          variant="default"
                          onClick={() => handleApplyFix(index, bug.suggestion!)}
                          disabled={appliedFixes[index]}
                          className="text-xs"
                        >
                          {appliedFixes[index] ? <Check className="w-4 h-4 mr-1" /> : <Zap className="w-4 h-4 mr-1" />}
                          {appliedFixes[index] ? "Applied" : "Apply Fix"}
                        </Button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </Alert>
            </motion.div>
          ))}
        </AnimatePresence>

        {sortedBugs.length === 0 && filter !== "all" && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-8 text-muted-foreground"
          >
            <Info className="w-8 h-8 mx-auto mb-2" />
            <p>No {filter}s found in your code.</p>
          </motion.div>
        )}
      </CardContent>
    </Card>
  )
}
