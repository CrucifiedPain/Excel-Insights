import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default function TermsOfService() {
  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
         <Link href="/" className="inline-flex items-center text-sm font-medium text-indigo-600 dark:text-indigo-400 hover:underline mb-8">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Home
        </Link>
        <h1 className="text-3xl font-bold mb-6">Terms of Service</h1>
        <p className="text-zinc-600 dark:text-zinc-400 mb-8">Last Updated: June 22, 2026</p>

        <div className="space-y-8 text-zinc-700 dark:text-zinc-300 leading-relaxed">
          <section>
            <h2 className="text-xl font-semibold text-zinc-900 dark:text-zinc-100 mb-4">1. Acceptance of Terms</h2>
            <p>
              By accessing and using Excel Insight (&quot;the Application&quot;), you agree to be bound by these Terms of Service. 
              If you do not agree to these terms, please do not use the Application.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-zinc-900 dark:text-zinc-100 mb-4">2. Description of Service</h2>
            <p>
              Excel Insight is a web-based utility that allows users to open, view, visualize, and query spreadsheet data 
              (including XLSX and CSV formats) locally within their browser. The Application integrates with Google Drive and 
              Google Sheets to facilitate the opening and exporting of files directly from and to your Google Account.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-zinc-900 dark:text-zinc-100 mb-4">3. User Conduct and Responsibilities</h2>
            <p className="mb-2">When using this Application, you agree not to:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Use the service for any illegal or unauthorized purpose.</li>
              <li>Attempt to disrupt or compromise the integrity and security of the Application.</li>
              <li>Use the Application to distribute malware or harmful files.</li>
            </ul>
            <p className="mt-4">
              You are responsible for safeguarding the credentials associated with your Google Account used to connect with our service.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-zinc-900 dark:text-zinc-100 mb-4">4. Third-Party Services</h2>
            <p>
              The Application uses Google APIs to function. Your use of these integrations is governed by the respective terms of service of Google. 
              We do not claim ownership of any files, data, or content you access through our service.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-zinc-900 dark:text-zinc-100 mb-4">5. Disclaimer of Warranties</h2>
            <p>
              The Application is provided &quot;as is&quot; and &quot;as available&quot; without any warranties of any kind. 
              We do not guarantee that the service will be uninterrupted, error-free, or completely secure. 
              All data processing happens locally, and we are not responsible for lost data or modified spreadsheets.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-zinc-900 dark:text-zinc-100 mb-4">6. Limitation of Liability</h2>
            <p>
              To the maximum extent permitted by applicable law, in no event shall we be liable for any direct, indirect, punitive, 
              incidental, special, consequential, or exemplary damages, including without limitation damages for loss of profits, 
              goodwill, use, data, or other intangible losses, that result from the use of, or inability to use, this service.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-zinc-900 dark:text-zinc-100 mb-4">7. Changes to Terms</h2>
            <p>
              We reserve the right to modify these Terms at any time. We will notify users of any significant changes by updating the date at the top of this document. 
              Your continued use of the Application after such modifications constitutes your acceptance of the new Terms.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
