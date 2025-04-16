"use client"
import { motion, AnimatePresence } from "framer-motion"
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { X, FileText } from "lucide-react"

export default function CurriculumModal({ course, onClose }) {
  // UI/UX Curriculum Content
  const uiuxCurriculum = [
    {
      title: "Introduction to UI/UX",
      topics: [
        "What is UI/UX Design?",
        "Difference between UI, UX, and Product Design",
        "Design Thinking vs Design Process",
        "Real-world case study breakdowns (Airbnb, Zomato)",
        "Tools overview: Figma, Adobe XD, Notion, Maze",
        "Mini Project: Audit and redesign a poorly designed app screen",
      ],
    },
    {
      title: "User Research & Psychology",
      topics: [
        "Importance of research in UX",
        "Creating user personas & empathy maps",
        "Understanding cognitive biases in design",
        "Journey mapping and user stories",
        "Tools: Typeform, Maze, Google Forms",
        "Mini Project: Create personas and empathy maps for a student learning app",
      ],
    },
    {
      title: "UX Strategy & Information Architecture",
      topics: [
        "Problem framing and HMW questions",
        "Sitemaps and card sorting",
        "User flows and task analysis",
        "Decision tree sketching",
        "Creating user journeys for digital products",
        "Mini Project: Create sitemap and user flow for an e-commerce platform",
      ],
    },
    {
      title: "Wireframing & Layout",
      topics: [
        "Low-fidelity vs high-fidelity wireframes",
        "Sketching wireframes on paper and digitally",
        "8pt Grid system and spacing principles",
        "Common UI patterns and layout best practices",
        "Mini Project: Build a Wireframe for an onboarding flow for a mobile finance app",
      ],
    },
    {
      title: "Visual UI Design",
      topics: [
        "Color theory and typography basics",
        "Building a design system: components, styles, tokens",
        "Accessibility in design (WCAG guidelines)",
        "Working with UI kits and libraries",
        "Mini Project: Design a 3-screen flow using your design system",
      ],
    },
    {
      title: "Prototyping & User Testing",
      topics: [
        "Creating clickable prototypes in Figma",
        "Testing methods: moderated and unmoderated",
        "Tools: Maze, Hotjar, Figma Comments",
        "Feedback gathering and iterative design",
        "Mini Project: Prototype a mobile app and conduct at least 3 usability tests",
      ],
    },
    {
      title: "Speculative Design & Design Fiction",
      topics: [
        "Introduction to speculative design",
        "Understanding design fiction and critical design",
        "Futures thinking in UI/UX",
        "Examples from MIT Media Lab, Dunne & Raby",
        "Designing future scenarios and ethical considerations",
        "Mini Project: Design a speculative future interface (e.g., health app for 2040)",
      ],
    },
    {
      title: "Developer Handoff & Freelance Practice",
      topics: [
        "Preparing designs for developer handoff (Figma Inspect, Zeplin)",
        "Writing design documentation and specs",
        "Freelancing basics: pricing, scope, client communication",
        "Best practices for collaboration with developers",
        "Mini Project: Finalize a full product flow with developer annotations",
      ],
    },
    {
      title: "Portfolio & Career Preparation",
      topics: [
        "Structuring a case study (Problem, Process, Solution, Impact)",
        "Hosting your portfolio (Notion, Behance, Webflow)",
        "Resume tips tailored for UI/UX roles",
        "Building your brand and networking",
        "Final Project: Upload at least 2 case studies and submit for review",
      ],
    },
    {
      title: "Bonus Content",
      topics: [
        "Weekly UI Clone Challenges (e.g., Spotify, Twitter, Duolingo)",
        "Motion design fundamentals (Framer, Figma Smart Animate)",
        "Dark mode design principles",
        "Accessibility audits using tools",
      ],
    },
    {
      title: "Tools Covered",
      topics: [
        "Design: Figma, Adobe XD, Sketch",
        "Research: Typeform, Maze, Hotjar",
        "Docs: Notion, Google Docs, Miro",
        "Freelance & Web: Upwork, Fiverr, Framer, Webflow",
      ],
    },
  ]

  // Web Development Curriculum Content
  const webDevCurriculum = [
    {
      title: "Section 1: Foundations of Web Development",
      topics: [
        "What is Web Development? (Frontend vs Backend vs Full-stack)",
        "How the Internet Works (DNS, HTTP, Servers, Clients)",
        "Tools Setup: Code Editors (VS Code), Browsers (Chrome DevTools), Terminal basics",
        "Version Control: Git and GitHub",
        "HTML Basics: Structure, Tags, Semantic HTML, Forms, Media, Tables",
        "CSS Basics: Selectors, Box Model, Positioning, Flexbox and Grid, Media Queries",
        "Mini Projects: Personal Portfolio (HTML + CSS)",
      ],
    },
    {
      title: "Section 2: JavaScript Essentials",
      topics: [
        "Introduction to JavaScript: Variables, Data Types, Operators, Loops, Conditionals, Functions",
        "DOM Manipulation",
        "Events and Event Handling",
        "JavaScript in the Browser",
        "ES6+ Features: Arrow Functions, Spread/Rest, Destructuring, Modules and Imports",
        "Mini Projects: Interactive To-do List, Image Slider",
      ],
    },
    {
      title: "Section 3: Advanced Frontend & Modern Tools",
      topics: [
        "Advanced CSS (Animations, Transitions)",
        "Tailwind CSS",
        "Responsive Design & Mobile First Design",
        "Introduction to React.js: Components, Props, State, Conditional Rendering",
        "Lists & Keys, Forms and Controlled Components",
        "React Router DOM",
        "Mini Projects: Blog Frontend with React, Responsive Landing Page",
      ],
    },
    {
      title: "Section 4: Backend Development with Node.js",
      topics: [
        "Node.js Basics",
        "NPM, Express.js",
        "REST APIs",
        "CRUD with MongoDB (using Mongoose)",
        "Middleware and Routing",
        "User Authentication (JWT)",
        "Mini Projects: Notes API, Auth-enabled Blog Backend",
      ],
    },
    {
      title: "Section 5: Full-stack Integration & Deployment",
      topics: [
        "Connecting Frontend with Backend (Axios, Fetch API)",
        "MERN Stack Overview",
        "Environment Variables and Configs",
        "Deployment: Frontend (Vercel/Netlify), Backend (Render/Cyclic), MongoDB Atlas",
        "Capstone Project: Full-stack MERN App (e.g., Blog, Task Manager, Social App)",
        "Extras: Weekly Quizzes & Assignments, GitHub Profile Optimization, Resume Tips for Developers, Final Portfolio Review",
      ],
    },
  ]

  // Graphic Design Curriculum (placeholder)
  const graphicDesignCurriculum = []

  // Select the appropriate curriculum based on the course
  const curriculumData =
    course === "uiux" ? uiuxCurriculum : course === "webdev" ? webDevCurriculum : graphicDesignCurriculum

  const courseTitle =
    course === "uiux"
      ? "UI/UX Design Fundamentals"
      : course === "webdev"
        ? "Web Development Bootcamp"
        : "Graphic Designing"

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          transition={{ type: "spring", damping: 25, stiffness: 300 }}
          className="w-full max-w-4xl max-h-[90vh] overflow-hidden flex"
          onClick={(e) => e.stopPropagation()}
        >
          <Card className="bg-black/90 border border-white/10 shadow-2xl overflow-hidden flex flex-col h-full w-full">
            <CardHeader className="relative border-b border-white/10 pb-4">
              <Button
                variant="ghost"
                size="icon"
                className="absolute right-4 top-4 text-white/70 hover:text-white hover:bg-white/10"
                onClick={onClose}
              >
                <X className="h-5 w-5" />
              </Button>
              <CardTitle className="text-2xl font-bold text-white flex items-center">
                <FileText className="mr-2 h-6 w-6 text-red-500" /> {courseTitle} Curriculum
              </CardTitle>
              {course === "uiux" && <p className="text-white/70 text-sm">Mentor: Sarthak Bhudija</p>}
              {course === "webdev" && <p className="text-white/70 text-sm">Mentor: Keshav Mishra</p>}
              {course === "graphicdesign" && <p className="text-white/70 text-sm">Mentor: Bhavesh Sharma</p>}
            </CardHeader>

            <CardContent className="p-6 overflow-y-auto max-h-[60vh] flex-grow">
              {curriculumData.length > 0 ? (
                <div className="space-y-6">
                  {curriculumData.map((section, index) => (
                    <div
                      key={index}
                      className="bg-white/5 rounded-lg p-4 border border-white/10 transition-all duration-300 hover:bg-white/10 hover:border-red-500/30 hover:shadow-lg hover:shadow-red-500/5"
                    >
                      <h3 className="text-lg font-semibold text-white mb-3">{section.title}</h3>
                      <ul className="space-y-2">
                        {section.topics.map((topic, topicIndex) => (
                          <li
                            key={topicIndex}
                            className="text-white/80 text-sm flex items-start group transition-all duration-200 hover:text-white"
                          >
                            <span className="inline-block h-1.5 w-1.5 rounded-full bg-red-500 mt-1.5 mr-2 flex-shrink-0 group-hover:bg-red-400 group-hover:scale-125 transition-all duration-300"></span>
                            <span className="group-hover:translate-x-1 transition-transform duration-200">{topic}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <FileText className="h-16 w-16 text-white/20 mb-4" />
                  <h3 className="text-xl font-medium text-white mb-2">Curriculum Not Available</h3>
                  <p className="text-white/60 max-w-md">
                    The curriculum for this course is currently being developed and will be available soon.
                  </p>
                </div>
              )}
            </CardContent>

            <CardFooter className="border-t border-white/10 p-4 flex justify-end">
              <Button variant="ghost" className="text-white/70 hover:text-white" onClick={onClose}>
                Close
              </Button>
            </CardFooter>
          </Card>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}
