import Link from "next/link"
import { Code2, Github, Linkedin, Twitter } from "lucide-react"

export function Footer() {
  return (
    <footer className="py-6 border-t">
      <div className="container flex flex-col items-center justify-between px-4 mx-auto space-y-4 md:flex-row md:space-y-0">
        <div className="flex items-center space-x-2">
          <Code2 className="w-5 h-5 text-primary" />
          <span className="font-semibold">DeCodeX</span>
        </div>

        <div className="flex items-center space-x-4">
          <Link href="#" className="text-sm text-muted-foreground hover:text-foreground">
            About
          </Link>
          <Link href="#" className="text-sm text-muted-foreground hover:text-foreground">
            Privacy
          </Link>
          <Link href="#" className="text-sm text-muted-foreground hover:text-foreground">
            Terms
          </Link>
        </div>

        <div className="flex items-center space-x-4">
          <Link href="https://github.com/Tekkieware" className="text-muted-foreground hover:text-foreground">
            <Github className="w-5 h-5" />
            <span className="sr-only">GitHub</span>
          </Link>
          <Link href="https://www.linkedin.com/in/isaiah-ozadhe/" className="text-muted-foreground hover:text-foreground">
            <Linkedin className="w-5 h-5" />
            <span className="sr-only">Linkedin</span>
          </Link>
        </div>
      </div>
    </footer>
  )
}

