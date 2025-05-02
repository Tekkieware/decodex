import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ExternalLink, BookOpen, Video, Code, FileText } from "lucide-react"
import { Badge } from "@/components/ui/badge"

interface LearnMoreSectionProps {
  language: string
}

interface Resource {
  title: string
  description: string
  url: string
  type: "documentation" | "tutorial" | "video" | "article"
  level: "beginner" | "intermediate" | "advanced"
}

const LANGUAGE_RESOURCES: Record<string, Resource[]> = {
  javascript: [
    {
      title: "MDN JavaScript Guide",
      description: "Comprehensive guide to JavaScript for both beginners and experienced developers",
      url: "https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide",
      type: "documentation",
      level: "beginner",
    },
    {
      title: "JavaScript.info",
      description: "Modern JavaScript tutorial with simple explanations and practical examples",
      url: "https://javascript.info/",
      type: "tutorial",
      level: "beginner",
    },
    {
      title: "Eloquent JavaScript",
      description: "A book about JavaScript, programming, and the wonders of the digital",
      url: "https://eloquentjavascript.net/",
      type: "article",
      level: "intermediate",
    },
    {
      title: "JavaScript: The Good Parts",
      description:
        "A book that highlights the good parts of JavaScript, showing how to create truly extensible and efficient code",
      url: "https://www.oreilly.com/library/view/javascript-the-good/9780596517748/",
      type: "article",
      level: "advanced",
    },
  ],
  python: [
    {
      title: "Python Documentation",
      description: "Official Python documentation with tutorials, library references, and more",
      url: "https://docs.python.org/3/",
      type: "documentation",
      level: "beginner",
    },
    {
      title: "Real Python",
      description: "Python tutorials for developers of all skill levels",
      url: "https://realpython.com/",
      type: "tutorial",
      level: "intermediate",
    },
    {
      title: "Python for Everybody",
      description: "Free course that teaches Python programming and data analysis",
      url: "https://www.py4e.com/",
      type: "video",
      level: "beginner",
    },
    {
      title: "Fluent Python",
      description: "Clear, concise, and effective programming patterns for Python",
      url: "https://www.oreilly.com/library/view/fluent-python-2nd/9781492056348/",
      type: "article",
      level: "advanced",
    },
  ],
  typescript: [
    {
      title: "TypeScript Documentation",
      description: "Official TypeScript documentation with guides and references",
      url: "https://www.typescriptlang.org/docs/",
      type: "documentation",
      level: "beginner",
    },
    {
      title: "TypeScript Deep Dive",
      description: "Free book covering TypeScript in detail",
      url: "https://basarat.gitbook.io/typescript/",
      type: "article",
      level: "intermediate",
    },
    {
      title: "TypeScript Tutorial for Beginners",
      description: "Step-by-step tutorial for learning TypeScript",
      url: "https://www.tutorialspoint.com/typescript/index.htm",
      type: "tutorial",
      level: "beginner",
    },
    {
      title: "Advanced TypeScript Types",
      description: "Deep dive into TypeScript's advanced type system",
      url: "https://www.typescriptlang.org/docs/handbook/2/types-from-types.html",
      type: "documentation",
      level: "advanced",
    },
  ],
}

// Default resources for languages without specific resources
const DEFAULT_RESOURCES: Resource[] = [
  {
    title: "Programming Fundamentals",
    description: "Learn the core concepts of programming that apply to all languages",
    url: "https://www.freecodecamp.org/",
    type: "tutorial",
    level: "beginner",
  },
  {
    title: "Algorithm Visualization",
    description: "Visualize algorithms and data structures to better understand them",
    url: "https://visualgo.net/",
    type: "tutorial",
    level: "intermediate",
  },
  {
    title: "Big-O Notation Explained",
    description: "Understanding time and space complexity in algorithms",
    url: "https://www.freecodecamp.org/news/big-o-notation-why-it-matters-and-why-it-doesnt-1674cfa8a23c/",
    type: "article",
    level: "intermediate",
  },
]

const TYPE_ICONS = {
  documentation: <FileText className="w-4 h-4" />,
  tutorial: <Code className="w-4 h-4" />,
  video: <Video className="w-4 h-4" />,
  article: <BookOpen className="w-4 h-4" />,
}

const LEVEL_COLORS = {
  beginner: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100",
  intermediate: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-100",
  advanced: "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-100",
}

export function LearnMoreSection({ language }: LearnMoreSectionProps) {
  const resources = LANGUAGE_RESOURCES[language] || DEFAULT_RESOURCES

  return (
    <Card className="shadow-md border-border/50">
      <CardHeader>
        <CardTitle className="text-xl flex items-center">
          <BookOpen className="w-5 h-5 mr-2 text-primary" />
          Learning Resources
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {resources.map((resource, index) => (
            <a
              key={index}
              href={resource.url}
              target="_blank"
              rel="noopener noreferrer"
              className="block p-4 border rounded-lg hover:bg-muted/30 transition-colors"
            >
              <div className="flex items-start justify-between">
                <div className="flex items-center">
                  <div className="mr-3 text-primary">{TYPE_ICONS[resource.type]}</div>
                  <div>
                    <h3 className="font-medium flex items-center">
                      {resource.title}
                      <ExternalLink className="ml-2 w-3 h-3 text-muted-foreground" />
                    </h3>
                    <p className="text-sm text-muted-foreground mt-1">{resource.description}</p>
                  </div>
                </div>
                <Badge variant="outline" className={`ml-2 text-xs ${LEVEL_COLORS[resource.level]}`}>
                  {resource.level}
                </Badge>
              </div>
            </a>
          ))}

          {/* Language-specific documentation link */}
          <div className="mt-6 pt-4 border-t">
            <h3 className="font-medium mb-2">Official Documentation</h3>
            <a
              href={LANGUAGE_RESOURCES[language]?.[0]?.url || "https://developer.mozilla.org/"}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center text-primary hover:underline"
            >
              Visit the official {language.charAt(0).toUpperCase() + language.slice(1)} documentation
              <ExternalLink className="ml-2 w-4 h-4" />
            </a>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

