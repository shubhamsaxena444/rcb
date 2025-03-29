import { useState } from "react";
import { Link, useLocation } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { HammerIcon, Menu, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import MobileMenu from "./mobile-menu";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

export default function Header() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [location] = useLocation();
  const { user, logoutMutation } = useAuth();
  
  // Helper function to determine if a link is active
  const isActive = (path: string) => {
    if (path === "/" && location === "/") return true;
    if (path !== "/" && location.startsWith(path)) return true;
    return false;
  };

  const handleLogout = () => {
    logoutMutation.mutate();
  };

  // Get user initials for avatar
  const getInitials = () => {
    if (!user || !user.name) return "U";
    const names = user.name.split(" ");
    return names.length > 1
      ? `${names[0][0]}${names[names.length - 1][0]}`
      : names[0].substring(0, 2);
  };

  return (
    <header className="bg-white shadow-sm sticky top-0 z-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between h-16">
        <div className="flex items-center">
          <Link href="/" className="flex items-center gap-2">
            <HammerIcon className="h-6 w-6 text-primary" />
            <span className="font-semibold text-lg text-gray-900">
              Renovation & Construction Buddy
            </span>
          </Link>
        </div>

        <div className="md:hidden">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setIsMobileMenuOpen(true)}
            aria-label="Open mobile menu"
          >
            <Menu className="h-6 w-6" />
          </Button>
        </div>

        <nav className="hidden md:flex items-center space-x-4">
          <Link href="/">
            <span className={`px-3 py-2 text-sm font-medium cursor-pointer ${isActive("/") ? "text-primary" : "text-gray-700 hover:text-primary"}`}>
              Dashboard
            </span>
          </Link>
          <Link href="/projects/new">
            <span className={`px-3 py-2 text-sm font-medium cursor-pointer ${isActive("/projects") ? "text-primary" : "text-gray-700 hover:text-primary"}`}>
              Projects
            </span>
          </Link>
          <Link href="/#contractors">
            <span className={`px-3 py-2 text-sm font-medium cursor-pointer text-gray-700 hover:text-primary`}>
              Contractors
            </span>
          </Link>
          <Link href="/#quotes">
            <span className={`px-3 py-2 text-sm font-medium cursor-pointer text-gray-700 hover:text-primary`}>
              Quotes
            </span>
          </Link>
          
          <div className="relative ml-3">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="rounded-full">
                  <Avatar className="h-8 w-8">
                    <AvatarFallback className="bg-primary text-white">
                      {getInitials()}
                    </AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem className="font-medium text-gray-900">
                  <User className="mr-2 h-4 w-4" />
                  {user?.name}
                </DropdownMenuItem>
                <DropdownMenuItem onClick={handleLogout}>
                  Sign out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </nav>
      </div>

      {/* Mobile menu */}
      <MobileMenu 
        isOpen={isMobileMenuOpen} 
        onClose={() => setIsMobileMenuOpen(false)} 
        user={user}
        onLogout={handleLogout}
      />
    </header>
  );
}
