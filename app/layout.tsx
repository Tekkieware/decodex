import type React from "react"
import "./globals.css"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import { ThemeProvider } from "@/components/theme-provider"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { Toaster } from "@/components/ui/toaster"
import { ReduxProvider } from "@/components/redux-provider"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "DeCodeX",
  description: "Understand and correct your code instantly with AI",
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <ReduxProvider>
          <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange={false}>
            <div className="flex flex-col min-h-screen">
              <Header />
              <div className="flex-1">{children}</div>
              <Footer />
            </div>
          </ThemeProvider>
          <Toaster />
        </ReduxProvider>
      </body>
    </html>
  )
}

