"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Skeleton } from "@/components/ui/skeleton"
import { AlertCircle, AlertTriangle, CheckCircle2, Info, Bug } from "lucide-react"
import { Button } from "@/components/ui/button"
import { motion } from "framer-motion"

interface BugType {
  type: "error" | "warning" | "suggestion"
  message: string
  line: number
  suggestion?: string
}

interface BugDetectionProps {
  bugs: BugType[] | undefined
  isLoading: boolean
  code: string
  onHighlightLine?: (lineNumber: number) => void
}

export function BugDetection({ bugs, isLoading, code, onHighlightLine }: BugDetectionProps) {
  if (isLoading) {
    return (
      <Card className="shadow-md border-border/50">
        <CardHeader>
          <CardTitle className="text-xl flex items-center">
            <Bug className="w-5 h-5 mr-2 text-primary" />
            Issues & Suggestions
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <Skeleton className="w-full h-4" />
            <Skeleton className="w-full h-4" />
            <Skeleton className="w-3/4 h-4" />
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
            <Alert className="bg-success/10 border-success/30">
              <CheckCircle2 className="w-4 h-4 text-success" />
              <AlertTitle>No issues detected</AlertTitle>
              <AlertDescription>Your code looks good! No errors or warnings were found.</AlertDescription>
            </Alert>
          ) : (
            <div className="flex flex-col items-center justify-center p-6 text-center">
              <Info className="w-12 h-12 mb-4 text-muted-foreground" />
              <p className="text-muted-foreground">Paste your code and click "Analyze" to detect bugs and issues.</p>
            </div>
          )}
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="shadow-md border-border/50">
      <CardHeader>
        <CardTitle className="text-xl flex items-center">
          <Bug className="w-5 h-5 mr-2 text-primary" />
          Issues & Suggestions
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {bugs.map((bug, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <Alert
              variant={bug.type === "error" ? "destructive" : bug.type === "warning" ? "default" : "outline"}
              className={bug.type === "warning" ? "bg-warning/10 border-warning/30" : ""}
            >
              {bug.type === "error" ? (
                <AlertCircle className="w-4 h-4" />
              ) : bug.type === "warning" ? (
                <AlertTriangle className="w-4 h-4 text-warning" />
              ) : (
                <Info className="w-4 h-4" />
              )}
              <AlertTitle className="flex items-center">
                {bug.type === "error" ? "Error" : bug.type === "warning" ? "Warning" : "Suggestion"}
                <span className="ml-2 text-xs font-normal text-muted-foreground">Line {bug.line}</span>

                {onHighlightLine && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onHighlightLine(bug.line)}
                    className="ml-auto text-xs"
                  >
                    View in Code
                  </Button>
                )}
              </AlertTitle>
              <AlertDescription className="mt-2">
                <p>{bug.message}</p>
                {bug.suggestion && (
                  <div className="mt-2 p-3 bg-muted/50 rounded-md text-sm border border-border/50">
                    <strong className="text-primary">Suggestion:</strong> {bug.suggestion}
                    <div className="mt-2 flex justify-end">
                      <Button size="sm" variant="outline" className="text-xs">
                        Apply Fix
                      </Button>
                    </div>
                  </div>
                )}
              </AlertDescription>
            </Alert>
          </motion.div>
        ))}
      </CardContent>
    </Card>
  )
}

