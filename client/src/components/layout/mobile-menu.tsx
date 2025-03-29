import { Link } from "wouter";
import { UserWithoutPassword } from "@/types";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { X, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

interface MobileMenuProps {
  isOpen: boolean;
  onClose: () => void;
  user: UserWithoutPassword | null;
  onLogout: () => void;
}

export default function MobileMenu({ isOpen, onClose, user, onLogout }: MobileMenuProps) {
  // Get user initials for avatar
  const getInitials = () => {
    if (!user || !user.name) return "U";
    const names = user.name.split(" ");
    return names.length > 1
      ? `${names[0][0]}${names[names.length - 1][0]}`
      : names[0].substring(0, 2);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md p-0">
        <div className="px-2 pt-2 pb-3 space-y-1 border-t">
          <div className="flex justify-between items-center px-3 pt-2 pb-2">
            <h2 className="text-lg font-semibold">Menu</h2>
            <Button variant="ghost" size="icon" onClick={onClose}>
              <X className="h-5 w-5" />
            </Button>
          </div>
          
          <Link href="/">
            <a className="block px-3 py-2 rounded-md text-base font-medium text-primary bg-gray-100" onClick={onClose}>
              Dashboard
            </a>
          </Link>
          <Link href="/projects/new">
            <a className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-primary hover:bg-gray-50" onClick={onClose}>
              Projects
            </a>
          </Link>
          <Link href="/#contractors">
            <a className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-primary hover:bg-gray-50" onClick={onClose}>
              Contractors
            </a>
          </Link>
          <Link href="/#quotes">
            <a className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-primary hover:bg-gray-50" onClick={onClose}>
              Quotes
            </a>
          </Link>
          
          {user && (
            <div className="pt-4 pb-3 border-t border-gray-200">
              <div className="flex items-center px-3">
                <div className="flex-shrink-0">
                  <Avatar className="h-10 w-10">
                    <AvatarFallback className="bg-primary text-white">
                      {getInitials()}
                    </AvatarFallback>
                  </Avatar>
                </div>
                <div className="ml-3">
                  <div className="text-base font-medium text-gray-800">{user.name}</div>
                  <div className="text-sm font-medium text-gray-500">{user.email}</div>
                </div>
              </div>
              <div className="mt-3 px-2 space-y-1">
                <button 
                  className="block w-full text-left px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-primary hover:bg-gray-50"
                  onClick={() => {
                    onLogout();
                    onClose();
                  }}
                >
                  Sign out
                </button>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
