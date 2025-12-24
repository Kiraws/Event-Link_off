import { useEffect } from "react"
import { useLocation } from "react-router-dom"

export function ScrollToHash() {
  const { hash } = useLocation()

  useEffect(() => {
    if (hash) {
      const element = document.querySelector(hash)
      if (element) {
        element.scrollIntoView({
          behavior: "smooth",
          block: "start",
        })
      }
    }
  }, [hash])

  return null
}
