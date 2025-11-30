import { Search} from "lucide-react"
import { Input } from "@/components/ui/input"
import { ModeToggle } from './mode-toogle';
import { UserProfileButton } from './UserProfileButton';

export function TopNav() {
  return (
    <header className="border-b border-border bg-background px-6 py-4 flex items-center justify-between">
      <nav className="flex items-center gap-6 flex-1">
        <h1 className="text-2xl font-bold">Dashboard</h1>
      </nav>

      <div className="flex items-center gap-4 ml-auto">
        <div className="relative hidden md:block">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input type="text" placeholder="Search" className="pl-10 w-64 h-9" />
        </div>
        <ModeToggle/>
        <UserProfileButton />
      </div>
    </header>
  )
}
