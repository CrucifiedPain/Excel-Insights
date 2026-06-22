import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default function PrivacyPolicy() {
  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        <Link href="/" className="inline-flex items-center text-sm font-medium text-indigo-600 dark:text-indigo-400 hover:underline mb-8">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Home
        </Link>
        <h1 className="text-3xl font-bold mb-6">Privacy Policy</h1>
        <p className="text-zinc-600 dark:text-zinc-400 mb-8">Last Updated: June 22, 2026</p>

        <div className="space-y-8 text-zinc-700 dark:text-zinc-300 leading-relaxed">
          <section>
            <h2 className="text-xl font-semibold text-zinc-900 dark:text-zinc-100 mb-4">1. Introduction</h2>
            <p>
              Welcome to Excel Insights. We are committed to protecting your personal information and your right to privacy. 
              This Privacy Policy explains how we collect, use, and process your information when you use our application to 
              view, analyze, and manage your spreadsheet data.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-zinc-900 dark:text-zinc-100 mb-4">2. Information We Collect</h2>
            <p className="mb-2">When you log in and use our service, we may collect the following information:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li><strong>Google Account Information:</strong> Your email address and basic profile information provided through Google Authentication.</li>
              <li><strong>Google Drive & Sheets Data:</strong> With your explicit consent, we request access to your Google Drive and Google Sheets to allow you to select, view, and export spreadsheets from within the app.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-zinc-900 dark:text-zinc-100 mb-4">3. How We Use Your Information</h2>
            <p className="mb-2">We use the information we collect strictly to provide the core functionality of the application:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>To authenticate your identity using Firebase (Google Provider).</li>
              <li>To fetch the metadata and content of the spreadsheets you explicitly choose to open using the Google Picker API.</li>
              <li>To allow you to export modified data back to your Google Drive as a new Google Sheet.</li>
            </ul>
            <p className="mt-4 font-medium text-zinc-900 dark:text-zinc-100">
              All data parsing, visualizing, and querying is processed locally in your web browser. We do not transmit or store your spreadsheet contents on our external servers.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-zinc-900 dark:text-zinc-100 mb-4">4. Google API Services User Data Policy</h2>
            <p>
              Excel Insights&apos; use and transfer to any other app of information received from Google APIs will adhere to the{' '}
              <a href="https://developers.google.com/terms/api-services-user-data-policy" target="_blank" rel="noreferrer" className="text-indigo-600 dark:text-indigo-400 hover:underline">
                Google API Services User Data Policy
              </a>
              , including the Limited Use requirements.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-zinc-900 dark:text-zinc-100 mb-4">5. Information Sharing and Disclosure</h2>
            <p>
              We do not sell, trade, or rent your personal information to third parties. Your spreadsheet data remains strictly between you, your browser, and Google&apos;s servers.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-zinc-900 dark:text-zinc-100 mb-4">6. Security</h2>
            <p>
              We prioritize the security of your data. The application uses secure mechanisms provided by Firebase and Google OAuth 2.0. Because data processing happens locally within your browser, your sensitive spreadsheet information is not exposed to our backend infrastructure.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-zinc-900 dark:text-zinc-100 mb-4">7. Contact Us</h2>
            <p>
              If you have questions or comments about this Privacy Policy, please contact the developer at the email associated with the Google Cloud Project.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
