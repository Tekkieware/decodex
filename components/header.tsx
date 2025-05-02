"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ModeToggle } from "@/components/mode-toggle"
import { Code2, Menu, X, Home, FileCode, Github } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import { usePathname } from "next/navigation"
import { useMobile } from "@/hooks/use-mobile"

export function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const pathname = usePathname()
  const isMobile = useMobile()

  // Close menu when route changes
  useEffect(() => {
    setIsMenuOpen(false)
  }, [pathname])

  // Prevent scrolling when menu is open
  useEffect(() => {
    if (isMenuOpen) {
      document.body.style.overflow = "hidden"
    } else {
      document.body.style.overflow = "unset"
    }

    return () => {
      document.body.style.overflow = "unset"
    }
  }, [isMenuOpen])

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen)
  }

  const menuVariants = {
    closed: {
      x: "100%",
      transition: {
        type: "spring",
        stiffness: 400,
        damping: 40,
      },
    },
    open: {
      x: "0%",
      transition: {
        type: "spring",
        stiffness: 400,
        damping: 40,
        staggerChildren: 0.1,
        delayChildren: 0.2,
      },
    },
  }

  const menuItemVariants = {
    closed: {
      x: 20,
      opacity: 0,
    },
    open: {
      x: 0,
      opacity: 1,
      transition: {
        type: "spring",
        stiffness: 300,
        damping: 30,
      },
    },
  }

  const backdropVariants = {
    closed: {
      opacity: 0,
      transition: {
        delay: 0.2,
      },
    },
    open: {
      opacity: 1,
    },
  }

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex items-center justify-between h-16 px-4 mx-auto">
        <Link href="/" className="flex items-center space-x-2">
          <Code2 className="w-6 h-6 text-primary" />
          <span className="font-bold">AI Code Explainer</span>
        </Link>

        <div className="flex items-center space-x-4">
          {/* Desktop Navigation */}
          <nav className="hidden space-x-4 md:flex">
            <Link href="/">
              <Button variant="ghost">Home</Button>
            </Link>
            <Link href="/analysis">
              <Button variant="ghost">Analysis</Button>
            </Link>
          </nav>

          <ModeToggle />

          {/* Mobile Menu Button */}
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleMenu}
            aria-label={isMenuOpen ? "Close Menu" : "Open Menu"}
            className="md:hidden"
          >
            <Menu className="w-5 h-5" />
          </Button>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isMenuOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              className="fixed inset-0 z-40 bg-background/80 backdrop-blur-sm md:hidden"
              initial="closed"
              animate="open"
              exit="closed"
              variants={backdropVariants}
              onClick={toggleMenu}
            />

            {/* Menu Panel */}
            <motion.div
              className="fixed top-0 right-0 z-50 w-[280px] h-full bg-background border-l shadow-xl md:hidden"
              initial="closed"
              animate="open"
              exit="closed"
              variants={menuVariants}
            >
              <div className="sticky top-0 flex items-center justify-between p-4 border-b bg-card z-10">
                <div className="flex items-center space-x-2">
                  <Code2 className="w-5 h-5 text-primary" />
                  <span className="font-semibold">Menu</span>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={toggleMenu}
                  aria-label="Close menu"
                  className="relative z-20"
                >
                  <X className="w-5 h-5 text-destructive" />
                </Button>
              </div>

              <nav className="flex flex-col p-4 space-y-2 bg-background">
                <motion.div variants={menuItemVariants}>
                  <Link href="/" className="w-full">
                    <Button variant={pathname === "/" ? "default" : "ghost"} className="w-full justify-start">
                      <Home className="w-5 h-5 mr-2" />
                      Home
                    </Button>
                  </Link>
                </motion.div>

                <motion.div variants={menuItemVariants}>
                  <Link href="/analysis" className="w-full">
                    <Button
                      variant={pathname.includes("/analysis") ? "default" : "ghost"}
                      className="w-full justify-start"
                    >
                      <FileCode className="w-5 h-5 mr-2" />
                      Analysis
                    </Button>
                  </Link>
                </motion.div>

                <motion.div variants={menuItemVariants} className="pt-4 mt-4 border-t">
                  <Link href="https://github.com" target="_blank" className="w-full">
                    <Button variant="outline" className="w-full justify-start">
                      <Github className="w-5 h-5 mr-2" />
                      GitHub
                    </Button>
                  </Link>
                </motion.div>
              </nav>

              <motion.div
                variants={menuItemVariants}
                className="absolute bottom-0 left-0 right-0 p-4 border-t bg-card flex justify-center"
              >
                <ModeToggle />
              </motion.div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </header>
  )
}

