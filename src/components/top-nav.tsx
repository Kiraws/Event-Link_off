"use client"

import {PanelLeftIcon} from "lucide-react"
import { ModeToggle } from "./mode-toogle"
import { UserProfileButton } from "./UserProfileButton"


interface TopNavProps {
  onToggleSidebar?: () => void
}

export default function TopNav({ onToggleSidebar }: TopNavProps) {

  return (
    <div className="border-b border-border bg-background">
      <div className="flex items-center justify-between px-6 py-4">
        {/* Left side - Menu icon */}
        <div className="flex items-center gap-4">

          <button onClick={onToggleSidebar} className="p-2 hover:bg-muted rounded-lg transition-colors">
            <PanelLeftIcon className="w-5 h-5" />
          </button>
        </div>

        {/* Right side - Icons */}
        <div className="flex items-center gap-2">
          <ModeToggle/>
          <UserProfileButton />
        </div>
      </div>
    </div>
  )
}
