import ExcelViewer from '@/components/ExcelViewer';
import Link from 'next/link';

export default function Home() {
  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 flex flex-col">
      <main className="flex-grow">
        <ExcelViewer />
      </main>
      
      <footer className="w-full py-6 text-center text-sm text-zinc-500 dark:text-zinc-400">
        <div className="flex justify-center space-x-4">
          <Link href="/privacy" className="hover:text-zinc-800 dark:hover:text-zinc-200 transition-colors">
            Privacy Policy
          </Link>
          <span>&middot;</span>
          <Link href="/terms" className="hover:text-zinc-800 dark:hover:text-zinc-200 transition-colors">
            Terms of Service
          </Link>
        </div>
        <p className="mt-2 text-xs opacity-75">© {new Date().getFullYear()} Excel Insights. All rights reserved.</p>
      </footer>
    </div>
  );
}
