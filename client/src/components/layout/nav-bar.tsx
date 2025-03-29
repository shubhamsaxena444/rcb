import React from "react";
import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/use-auth";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Home,
  Building,
  User,
  Wrench,
  FileText,
  LogOut,
  Menu,
  Sparkles
} from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

export default function NavBar() {
  const { user, logoutMutation } = useAuth();
  const [location] = useLocation();
  const [isMenuOpen, setIsMenuOpen] = React.useState(false);

  if (!user) return null;

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map(part => part[0])
      .join("")
      .toUpperCase();
  };

  const handleLogout = () => {
    logoutMutation.mutate();
  };

  const navItems = [
    {
      href: "/",
      label: "Home",
      icon: <Home className="h-4 w-4 mr-2" />,
      isActive: location === "/"
    },
    {
      href: "/projects/new",
      label: "New Project",
      icon: <Building className="h-4 w-4 mr-2" />,
      isActive: location === "/projects/new"
    },
    {
      href: "/design-inspiration",
      label: "Design Ideas",
      icon: <Sparkles className="h-4 w-4 mr-2" />,
      isActive: location === "/design-inspiration"
    }
  ];

  return (
    <header className="bg-background border-b sticky top-0 z-50">
      <div className="container mx-auto px-4 md:px-6">
        <div className="flex h-16 items-center justify-between">
          <div className="flex items-center">
            <Link href="/" className="text-xl font-bold bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
              RC Buddy
            </Link>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-4">
            {navItems.map((item) => (
              <Link 
                key={item.href} 
                href={item.href}
                className={`flex items-center px-3 py-2 text-sm font-medium rounded-md ${
                  item.isActive 
                    ? "bg-primary/10 text-primary" 
                    : "text-foreground/70 hover:text-foreground hover:bg-muted/50"
                }`}
              >
                {item.icon}
                {item.label}
              </Link>
            ))}
          </nav>

          <div className="flex items-center">
            {/* User Menu */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                  <Avatar className="h-8 w-8">
                    <AvatarFallback className="bg-primary/10 text-primary">
                      {getInitials(user.username)}
                    </AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel>My Account</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem disabled>
                  <User className="mr-2 h-4 w-4" />
                  <span>Profile</span>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/projects/new" className="flex cursor-pointer items-center">
                    <Building className="mr-2 h-4 w-4" />
                    <span>New Project</span>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/design-inspiration" className="flex cursor-pointer items-center">
                    <Sparkles className="mr-2 h-4 w-4" />
                    <span>Design Ideas</span>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleLogout}>
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Log out</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Mobile Menu Button */}
            <Button 
              variant="ghost" 
              size="icon" 
              className="md:hidden ml-2"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              <Menu className="h-6 w-6" />
            </Button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="md:hidden py-3 border-t">
            <nav className="grid gap-1">
              {navItems.map((item) => (
                <Link 
                  key={item.href} 
                  href={item.href} 
                  className={`flex items-center px-3 py-2 text-sm font-medium rounded-md ${
                    item.isActive 
                      ? "bg-primary/10 text-primary" 
                      : "text-foreground/70 hover:text-foreground hover:bg-muted/50"
                  }`}
                  onClick={() => setIsMenuOpen(false)}
                >
                  {item.icon}
                  {item.label}
                </Link>
              ))}
              <Button 
                variant="ghost" 
                className="flex items-center justify-start px-3 py-2 text-sm font-medium text-foreground/70"
                onClick={handleLogout}
              >
                <LogOut className="h-4 w-4 mr-2" />
                Log out
              </Button>
            </nav>
          </div>
        )}
      </div>
    </header>
  );
}