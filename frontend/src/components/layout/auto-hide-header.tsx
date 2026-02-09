import { useState } from "react"
import { Header } from "./header"

export function AutoHideHeader() {
  const [visible, setVisible] = useState(false)

  return (
    <>
      <div
        className="fixed top-0 left-0 right-0 h-3 z-[60]"
        onMouseEnter={() => setVisible(true)}
      />
      <div
        className={`fixed top-0 left-0 right-0 z-50 transition-transform duration-300 ${
          visible ? "translate-y-0" : "-translate-y-full"
        }`}
        onMouseLeave={() => setVisible(false)}
      >
        <Header />
      </div>
    </>
  )
}
