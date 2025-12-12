
import { Link } from '@tanstack/react-router'
import { CloudOff } from 'lucide-react'

export function NotFound() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-white dark:bg-[#1a1a1a] font-sans text-[#333] dark:text-[#d1d1d1] p-4">
      <div className="max-w-2xl w-full">
        {/* Header Section */}
        <div className="flex items-center gap-4 mb-8">
            <CloudOff className="h-12 w-12 text-[#f48120]" />
            <h1 className="text-4xl font-light">404 | Not Found</h1>
        </div>

        {/* Main Content */}
        <div className="space-y-6">
          <p className="text-lg">
            The page you are looking for does not exist.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 my-10 text-sm">
            <div>
              <h3 className="font-bold mb-2 text-[#404040] dark:text-[#a0a0a0]">What can I do?</h3>
              <ul className="list-disc pl-5 space-y-1 text-gray-600 dark:text-gray-400">
                <li>If you typed the URL directly, please make sure the spelling is correct.</li>
                <li>If you clicked on a link to get here, the link is outdated.</li>
              </ul>
            </div>
            <div>
               <h3 className="font-bold mb-2 text-[#404040] dark:text-[#a0a0a0]">Ray ID</h3>
               <p className="font-mono text-xs text-gray-500">{crypto.randomUUID().split('-')[0]}-{crypto.randomUUID().split('-')[1]}</p>
            </div>
          </div>
          
           <div className="pt-6 border-t border-gray-200 dark:border-gray-800">
              <Link 
                to="/" 
                className="inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-[#f48120] hover:bg-[#d9731c] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#f48120] transition-colors"
              >
                Go Home
              </Link>
           </div>
        </div>
      </div>
    </div>
  )
}
