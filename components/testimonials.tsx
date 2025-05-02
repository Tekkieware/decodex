import { Card, CardContent } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

export function Testimonials() {
  const testimonials = [
    {
      name: "Alex Johnson",
      role: "Senior Developer",
      avatar: "/placeholder.svg?height=40&width=40",
      quote:
        "This tool has saved me hours of debugging. The explanations are clear and the bug detection is surprisingly accurate.",
    },
    {
      name: "Sarah Chen",
      role: "Full Stack Engineer",
      avatar: "/placeholder.svg?height=40&width=40",
      quote:
        "I use this to help junior developers understand complex code. It breaks down concepts in a way that's easy to understand.",
    },
    {
      name: "Michael Rodriguez",
      role: "CS Student",
      avatar: "/placeholder.svg?height=40&width=40",
      quote:
        "As a student, this has been invaluable for learning new languages and understanding code examples from my textbooks.",
    },
  ]

  return (
    <section className="py-16">
      <h2 className="mb-12 text-3xl font-bold text-center">What Developers Say</h2>

      <div className="grid gap-8 md:grid-cols-3">
        {testimonials.map((testimonial, index) => (
          <Card key={index} className="overflow-hidden transition-all duration-300 hover:shadow-lg">
            <CardContent className="p-6">
              <div className="flex items-start mb-4 space-x-4">
                <Avatar>
                  <AvatarImage src={testimonial.avatar} alt={testimonial.name} />
                  <AvatarFallback>
                    {testimonial.name
                      .split(" ")
                      .map((n) => n[0])
                      .join("")}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-semibold">{testimonial.name}</p>
                  <p className="text-sm text-muted-foreground">{testimonial.role}</p>
                </div>
              </div>
              <p className="italic text-muted-foreground">"{testimonial.quote}"</p>
            </CardContent>
          </Card>
        ))}
      </div>
    </section>
  )
}

