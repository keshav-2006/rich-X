"use client"

import { useEffect, useState } from "react"
import Image from "next/image"

export default function LogoMarquee() {
  const [isClient, setIsClient] = useState(false)

  useEffect(() => {
    setIsClient(true)
  }, [])

  // Updated list of logos with the uploaded images
  const logos = [
    { src: "/logos/google.png", alt: "Google", width: 120, height: 40 },
    { src: "/logos/amazon.png", alt: "Amazon", width: 120, height: 40 },
    { src: "/logos/microsoft-logo.png", alt: "Microsoft", width: 120, height: 40 },
    { src: "/logos/whirlpool.png", alt: "Whirlpool", width: 120, height: 40 },
    { src: "/logos/iit-delhi.png", alt: "IIT Delhi", width: 80, height: 80 },
    { src: "/logos/zepto.png", alt: "Zepto", width: 120, height: 50 },
  ]

  if (!isClient) {
    return <div className="h-20"></div> // Placeholder height during SSR
  }

  return (
    <div className="w-full overflow-hidden py-6 my-4 relative">
      <div className="flex logo-marquee">
        {/* First set of logos */}
        {logos.map((logo, index) => (
          <div key={`first-${index}`} className="logo-item flex-shrink-0 mx-6">
            <Image
              src={logo.src || "/placeholder.svg"}
              alt={logo.alt}
              width={logo.width}
              height={logo.height}
              className="object-contain h-12"
            />
          </div>
        ))}

        {/* Duplicate set of logos to create seamless loop */}
        {logos.map((logo, index) => (
          <div key={`second-${index}`} className="logo-item flex-shrink-0 mx-6">
            <Image
              src={logo.src || "/placeholder.svg"}
              alt={logo.alt}
              width={logo.width}
              height={logo.height}
              className="object-contain h-12"
            />
          </div>
        ))}
      </div>
    </div>
  )
}
