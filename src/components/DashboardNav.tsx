
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Bell, LogOut, Settings, User } from 'lucide-react';
import { useEffect, useState } from 'react';
import { getItem, removeItem } from '@/lib/storage';

interface DashboardNavProps {
  activeTournament: {
    name: string;
    format: string;
    status: string;
    settings?: Record<string, unknown>;
  };
}

const DashboardNav = ({ activeTournament }: DashboardNavProps) => {
  const [userEmail, setUserEmail] = useState<string | null>(null)
  useEffect(() => {
    const update = () => {
      const sess = getItem<{ user?: { email?: string } }>('session')
      setUserEmail(sess?.user?.email ?? null)
    }
    update()
    if (typeof window !== 'undefined') {
      window.addEventListener('storage', update)
    }
    return () => {
      if (typeof window !== 'undefined') {
        window.removeEventListener('storage', update)
      }
    }
  }, [])
  return (
    <nav className="bg-white border-b border-slate-200 px-4 py-3">
      <div className="container mx-auto flex items-center justify-between">
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">DM</span>
            </div>
            <div>
              <h2 className="font-semibold text-slate-900">{activeTournament.name}</h2>
              <div className="flex items-center gap-2 text-sm text-slate-600">
                <span>{activeTournament.format}</span>
                <Badge variant="outline" className="text-xs">
                  {activeTournament.status}
                </Badge>
              </div>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <Button variant="ghost" size="sm" className="relative">
            <Bell className="h-4 w-4" />
            <span className="absolute -top-1 -right-1 h-2 w-2 bg-red-500 rounded-full"></span>
          </Button>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="flex items-center gap-3 px-3">
                <Avatar className="h-8 w-8">
                  <AvatarFallback>{userEmail?.charAt(0).toUpperCase()}</AvatarFallback>
                </Avatar>
                <div className="text-left">
                  <div className="font-medium text-sm">{userEmail}</div>
                </div>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel>My Account</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem>
                <User className="mr-2 h-4 w-4" />
                Profile
              </DropdownMenuItem>
              <DropdownMenuItem>
                <Settings className="mr-2 h-4 w-4" />
                Settings
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onSelect={() => {
                removeItem('session')
                window.location.href = '/signin'
              }}>
                <LogOut className="mr-2 h-4 w-4" />
                Log out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </nav>
  );
};

export default DashboardNav;
