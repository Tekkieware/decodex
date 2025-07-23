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
  java: [
    {
      title: "Java Documentation",
      description: "Official Java SE documentation and tutorials",
      url: "https://docs.oracle.com/javase/tutorial/",
      type: "documentation",
      level: "beginner",
    },
    {
      title: "Java Programming Masterclass",
      description: "Comprehensive course to learn Java",
      url: "https://www.udemy.com/course/java-the-complete-java-developer-course/",
      type: "video",
      level: "beginner",
    },
    {
      title: "Effective Java",
      description: "Best practices and advanced concepts for professional Java developers",
      url: "https://www.oreilly.com/library/view/effective-java-3rd/9780134686097/",
      type: "article",
      level: "advanced",
    },
  ],
  csharp: [
    {
      title: "C# Guide (Microsoft Docs)",
      description: "Official C# documentation with tutorials and guides",
      url: "https://learn.microsoft.com/en-us/dotnet/csharp/",
      type: "documentation",
      level: "beginner",
    },
    {
      title: "C# Yellow Book",
      description: "Beginner-friendly introduction to C# by Rob Miles",
      url: "http://www.csharpcourse.com/",
      type: "article",
      level: "beginner",
    },
    {
      title: "C# Advanced Topics",
      description: "C# intermediate and advanced concepts like LINQ and async",
      url: "https://dotnet.microsoft.com/learn/csharp",
      type: "tutorial",
      level: "intermediate",
    },
  ],
  cpp: [
    {
      title: "C++ Reference",
      description: "Official C++ reference and tutorials",
      url: "https://en.cppreference.com/w/",
      type: "documentation",
      level: "beginner",
    },
    {
      title: "LearnCpp",
      description: "Free website to learn C++ step by step",
      url: "https://www.learncpp.com/",
      type: "tutorial",
      level: "beginner",
    },
    {
      title: "Effective Modern C++",
      description: "Scott Meyers' guide to writing modern C++ (C++11/14)",
      url: "https://www.oreilly.com/library/view/effective-modern-c/9781491908419/",
      type: "article",
      level: "advanced",
    },
  ],
  go: [
    {
      title: "Go Tour",
      description: "Official interactive tour of the Go programming language",
      url: "https://tour.golang.org/",
      type: "tutorial",
      level: "beginner",
    },
    {
      title: "Go by Example",
      description: "Hands-on examples covering Go syntax and features",
      url: "https://gobyexample.com/",
      type: "tutorial",
      level: "intermediate",
    },
    {
      title: "Effective Go",
      description: "Best practices for writing clear and idiomatic Go code",
      url: "https://go.dev/doc/effective_go",
      type: "documentation",
      level: "advanced",
    },
  ],
  ruby: [
    {
      title: "Ruby in Twenty Minutes",
      description: "Quick introduction to Ruby for beginners",
      url: "https://www.ruby-lang.org/en/documentation/quickstart/",
      type: "tutorial",
      level: "beginner",
    },
    {
      title: "Why's Poignant Guide to Ruby",
      description: "A quirky, beginner-friendly Ruby guide",
      url: "https://poignant.guide/",
      type: "article",
      level: "beginner",
    },
    {
      title: "The Ruby Programming Language",
      description: "Comprehensive guide for intermediate and advanced Ruby programmers",
      url: "https://www.oreilly.com/library/view/the-ruby-programming/9780596516178/",
      type: "article",
      level: "advanced",
    },
  ],
  rust: [
    {
      title: "The Rust Book",
      description: "Official Rust book — the primary resource for learning Rust",
      url: "https://doc.rust-lang.org/book/",
      type: "documentation",
      level: "beginner",
    },
    {
      title: "Rust by Example",
      description: "Learn Rust through runnable examples",
      url: "https://doc.rust-lang.org/rust-by-example/",
      type: "tutorial",
      level: "intermediate",
    },
    {
      title: "Programming Rust",
      description: "Advanced guide for writing reliable and efficient Rust",
      url: "https://www.oreilly.com/library/view/programming-rust-2nd/9781492052586/",
      type: "article",
      level: "advanced",
    },
  ],
  php: [
    {
      title: "PHP Manual",
      description: "Official PHP documentation",
      url: "https://www.php.net/manual/en/",
      type: "documentation",
      level: "beginner",
    },
    {
      title: "PHP: The Right Way",
      description: "Best practices for writing modern PHP",
      url: "https://phptherightway.com/",
      type: "article",
      level: "intermediate",
    },
    {
      title: "Modern PHP",
      description: "Advanced PHP concepts for experienced developers",
      url: "https://www.oreilly.com/library/view/modern-php/9781491905173/",
      type: "article",
      level: "advanced",
    },
  ],
  kotlin: [
    {
      title: "Kotlin Docs",
      description: "Official Kotlin language reference and tutorials",
      url: "https://kotlinlang.org/docs/home.html",
      type: "documentation",
      level: "beginner",
    },
    {
      title: "Kotlin for Android Developers",
      description: "Guide to using Kotlin for Android development",
      url: "https://antonioleiva.com/kotlin-android-developers-book/",
      type: "article",
      level: "intermediate",
    },
    {
      title: "Kotlin Coroutines by Example",
      description: "Advanced asynchronous programming with Kotlin",
      url: "https://kotlinlang.org/docs/coroutines-overview.html",
      type: "documentation",
      level: "advanced",
    },
  ],
  swift: [
    {
      title: "Swift.org Documentation",
      description: "Official Swift programming language documentation and resources",
      url: "https://swift.org/documentation/",
      type: "documentation",
      level: "beginner",
    },
    {
      title: "Hacking with Swift",
      description: "Hands-on Swift tutorials and projects",
      url: "https://www.hackingwithswift.com/",
      type: "tutorial",
      level: "intermediate",
    },
    {
      title: "Advanced Swift",
      description: "Deep dive into advanced Swift concepts for professional development",
      url: "https://www.objc.io/books/advanced-swift/",
      type: "article",
      level: "advanced",
    },
  ],
  dart: [
    {
      title: "Dart Language Tour",
      description: "Official Dart documentation with syntax and examples",
      url: "https://dart.dev/guides/language/language-tour",
      type: "documentation",
      level: "beginner",
    },
    {
      title: "Flutter & Dart Tutorials",
      description: "Practical tutorials for building apps with Dart and Flutter",
      url: "https://www.raywenderlich.com/flutter",
      type: "tutorial",
      level: "intermediate",
    },
    {
      title: "Dart Asynchronous Programming",
      description: "Advanced guide to async programming and isolates in Dart",
      url: "https://dart.dev/codelabs/async-await",
      type: "documentation",
      level: "advanced",
    },
  ],
  elixir: [
    {
      title: "Elixir Lang Docs",
      description: "Official Elixir documentation and getting started guide",
      url: "https://elixir-lang.org/getting-started/introduction.html",
      type: "documentation",
      level: "beginner",
    },
    {
      title: "Elixir School",
      description: "Free, community-driven lessons to learn Elixir",
      url: "https://elixirschool.com/",
      type: "tutorial",
      level: "beginner",
    },
    {
      title: "Programming Phoenix",
      description: "Advanced Elixir guide for web development with Phoenix framework",
      url: "https://pragprog.com/titles/phoenix14/programming-phoenix-1-4/",
      type: "article",
      level: "advanced",
    },
  ],
  scala: [
    {
      title: "Scala Documentation",
      description: "Official Scala language documentation and guides",
      url: "https://docs.scala-lang.org/",
      type: "documentation",
      level: "beginner",
    },
    {
      title: "Scala Exercises",
      description: "Interactive exercises to learn Scala by doing",
      url: "https://www.scala-exercises.org/",
      type: "tutorial",
      level: "intermediate",
    },
    {
      title: "Programming in Scala",
      description: "Comprehensive book by Martin Odersky, creator of Scala",
      url: "https://www.artima.com/shop/programming_in_scala_4ed",
      type: "article",
      level: "advanced",
    },
  ],
  haskell: [
    {
      title: "Learn You a Haskell for Great Good",
      description: "Fun, beginner-friendly Haskell tutorial",
      url: "http://learnyouahaskell.com/",
      type: "tutorial",
      level: "beginner",
    },
    {
      title: "Haskell.org Documentation",
      description: "Official documentation and learning resources for Haskell",
      url: "https://www.haskell.org/documentation/",
      type: "documentation",
      level: "beginner",
    },
    {
      title: "Real World Haskell",
      description: "Intermediate-to-advanced guide to using Haskell in practice",
      url: "http://book.realworldhaskell.org/",
      type: "article",
      level: "advanced",
    },
  ],
  r: [
    {
      title: "R for Data Science",
      description: "Beginner-friendly guide to R and data analysis",
      url: "https://r4ds.had.co.nz/",
      type: "tutorial",
      level: "beginner",
    },
    {
      title: "CRAN Documentation",
      description: "Official R manuals and package documentation",
      url: "https://cran.r-project.org/manuals.html",
      type: "documentation",
      level: "beginner",
    },
    {
      title: "Advanced R",
      description: "Deep dive into R programming for experienced users",
      url: "https://adv-r.hadley.nz/",
      type: "article",
      level: "advanced",
    },
  ],
  bash: [
    {
      title: "GNU Bash Manual",
      description: "Official Bash shell reference and usage guide",
      url: "https://www.gnu.org/software/bash/manual/bash.html",
      type: "documentation",
      level: "beginner",
    },
    {
      title: "Bash Scripting Tutorial",
      description: "Hands-on guide to writing shell scripts",
      url: "https://ryanstutorials.net/bash-scripting-tutorial/",
      type: "tutorial",
      level: "beginner",
    },
    {
      title: "Advanced Bash Scripting Guide",
      description: "Comprehensive reference for advanced shell scripting",
      url: "https://tldp.org/LDP/abs/html/",
      type: "article",
      level: "advanced",
    },
  ],
  perl: [
    {
      title: "Perl Documentation",
      description: "Official Perl language reference and tutorials",
      url: "https://perldoc.perl.org/",
      type: "documentation",
      level: "beginner",
    },
    {
      title: "Modern Perl",
      description: "Free book that teaches modern Perl best practices",
      url: "http://modernperlbooks.com/books/modern_perl_2016/index.html",
      type: "article",
      level: "intermediate",
    },
    {
      title: "Intermediate Perl",
      description: "Book for Perl developers looking to deepen their knowledge",
      url: "https://www.oreilly.com/library/view/intermediate-perl-2nd/9781449338394/",
      type: "article",
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

