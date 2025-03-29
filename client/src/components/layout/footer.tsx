import { HammerIcon, HelpCircle, Shield, FileText } from "lucide-react";

export default function Footer() {
  return (
    <footer className="bg-white border-t border-gray-200 mt-12">
      <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between">
          <div className="flex items-center">
            <HammerIcon className="h-5 w-5 text-primary mr-2" />
            <span className="text-gray-900 font-medium">Renovation & Construction Buddy</span>
          </div>
          <div className="mt-4 md:mt-0">
            <div className="flex space-x-6">
              <a href="#" className="text-gray-500 hover:text-gray-700">
                <span className="sr-only">Help Center</span>
                <HelpCircle className="h-5 w-5" />
              </a>
              <a href="#" className="text-gray-500 hover:text-gray-700">
                <span className="sr-only">Privacy</span>
                <Shield className="h-5 w-5" />
              </a>
              <a href="#" className="text-gray-500 hover:text-gray-700">
                <span className="sr-only">Terms</span>
                <FileText className="h-5 w-5" />
              </a>
            </div>
          </div>
        </div>
        <div className="mt-4 text-center text-sm text-gray-500">
          <p>&copy; {new Date().getFullYear()} Renovation & Construction Buddy. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
