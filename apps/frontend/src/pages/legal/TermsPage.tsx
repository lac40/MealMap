/**
 * Terms of Use Page
 * 
 * Student-friendly terms of service for the MealMap university project.
 * Provides clear information about usage, limitations, and user rights.
 */

import { Link } from 'react-router-dom'
import { ChefHat, ArrowLeft } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/Card'

const TermsPage = () => {
  return (
    <div className="min-h-screen bg-background py-8 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <Link
            to="/"
            className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors mb-4"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Home
          </Link>
          
          <div className="flex items-center gap-3 mb-4">
            <ChefHat className="h-8 w-8 text-primary-600 dark:text-primary-500" />
            <h1 className="text-3xl font-bold text-foreground">Terms of Use</h1>
          </div>
          <p className="text-muted-foreground">Last updated: November 25, 2025</p>
        </div>

        {/* Content */}
        <Card>
          <CardContent className="p-8 space-y-6 prose prose-sm dark:prose-invert max-w-none">
            {/* Educational Project Notice */}
            <section>
              <h2 className="text-2xl font-semibold text-foreground mb-3">Educational Project Notice</h2>
              <p className="text-muted-foreground">
                MealMap is a university project developed as part of the Fontys University of Applied Sciences 
                Semester 3 Individual Project by László Kornis (l.kornis@student.fontys.nl). This application 
                is created for <strong>educational purposes only</strong> and is not intended for commercial use 
                or production deployment.
              </p>
            </section>

            {/* Acceptance of Terms */}
            <section>
              <h2 className="text-2xl font-semibold text-foreground mb-3">1. Acceptance of Terms</h2>
              <p className="text-muted-foreground">
                By creating an account and using MealMap, you acknowledge that:
              </p>
              <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
                <li>This is a student project with no warranties or guarantees</li>
                <li>The service may be unavailable, modified, or discontinued at any time</li>
                <li>You understand this is not a production-ready commercial service</li>
                <li>You agree to these terms and our Privacy Policy</li>
              </ul>
            </section>

            {/* Use of the Service */}
            <section>
              <h2 className="text-2xl font-semibold text-foreground mb-3">2. Use of the Service</h2>
              <p className="text-muted-foreground mb-2">
                MealMap provides meal planning and grocery list management features. You agree to:
              </p>
              <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
                <li>Use the service only for lawful purposes</li>
                <li>Not attempt to hack, exploit, or damage the application</li>
                <li>Not use automated tools to extract data from the service</li>
                <li>Provide accurate information during registration</li>
                <li>Keep your account credentials secure</li>
              </ul>
            </section>

            {/* User Accounts */}
            <section>
              <h2 className="text-2xl font-semibold text-foreground mb-3">3. User Accounts</h2>
              <p className="text-muted-foreground">
                When you create an account, you are responsible for:
              </p>
              <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
                <li>Maintaining the confidentiality of your password</li>
                <li>All activities that occur under your account</li>
                <li>Notifying us immediately of any unauthorized access</li>
              </ul>
              <p className="text-muted-foreground mt-2">
                You may delete your account at any time from the Account Settings page. Upon deletion, 
                all your data will be permanently removed from our database.
              </p>
            </section>

            {/* Data and Content */}
            <section>
              <h2 className="text-2xl font-semibold text-foreground mb-3">4. Your Data and Content</h2>
              <p className="text-muted-foreground">
                You retain ownership of all content you create in MealMap (meal plans, recipes, grocery lists, etc.). 
                By using the service, you grant us permission to store and process your data solely for the purpose 
                of providing the service to you.
              </p>
              <p className="text-muted-foreground mt-2">
                We do not claim ownership of your content, sell your data to third parties, or use it for any 
                purpose other than operating the application.
              </p>
            </section>

            {/* Limitations and Disclaimers */}
            <section>
              <h2 className="text-2xl font-semibold text-foreground mb-3">5. Limitations and Disclaimers</h2>
              <p className="text-muted-foreground mb-2">
                <strong>Important:</strong> As this is an educational project:
              </p>
              <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
                <li>The service is provided "as is" without any warranties</li>
                <li>We cannot guarantee 100% uptime or data availability</li>
                <li>Features may be incomplete, experimental, or subject to change</li>
                <li>We are not liable for any data loss or service interruptions</li>
                <li>Nutritional information (if provided) is for reference only and should not replace professional dietary advice</li>
              </ul>
            </section>

            {/* Service Availability */}
            <section>
              <h2 className="text-2xl font-semibold text-foreground mb-3">6. Service Availability</h2>
              <p className="text-muted-foreground">
                The service may be temporarily unavailable due to:
              </p>
              <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
                <li>Maintenance and updates</li>
                <li>Server issues or downtime</li>
                <li>End of semester (the project may be taken offline after the academic period)</li>
              </ul>
              <p className="text-muted-foreground mt-2">
                We will make reasonable efforts to notify users of planned downtime, but cannot guarantee 
                advance notice in all cases.
              </p>
            </section>

            {/* Changes to Terms */}
            <section>
              <h2 className="text-2xl font-semibold text-foreground mb-3">7. Changes to These Terms</h2>
              <p className="text-muted-foreground">
                We may update these Terms of Use from time to time. Changes will be posted on this page with 
                an updated "Last updated" date. Continued use of the service after changes constitutes acceptance 
                of the modified terms.
              </p>
            </section>

            {/* Contact */}
            <section>
              <h2 className="text-2xl font-semibold text-foreground mb-3">8. Contact Information</h2>
              <p className="text-muted-foreground">
                If you have questions about these Terms of Use, please contact:
              </p>
              <p className="text-muted-foreground mt-2">
                <strong>Email:</strong>{' '}
                <a 
                  href="mailto:l.kornis@student.fontys.nl" 
                  className="text-primary-600 hover:text-primary-700 dark:text-primary-500"
                >
                  l.kornis@student.fontys.nl
                </a>
              </p>
              <p className="text-muted-foreground">
                <strong>Institution:</strong> Fontys University of Applied Sciences
              </p>
            </section>

            {/* Acknowledgment */}
            <section className="bg-muted p-4 rounded-lg border border-border">
              <p className="text-sm text-muted-foreground">
                <strong>By using MealMap, you acknowledge that you have read, understood, and agree to be bound 
                by these Terms of Use and our Privacy Policy.</strong>
              </p>
            </section>
          </CardContent>
        </Card>

        {/* Footer Links */}
        <div className="mt-8 text-center text-sm text-muted-foreground">
          <Link 
            to="/privacy" 
            className="text-primary-600 hover:text-primary-700 dark:text-primary-500"
          >
            Privacy Policy
          </Link>
          {' · '}
          <Link 
            to="/" 
            className="text-primary-600 hover:text-primary-700 dark:text-primary-500"
          >
            Back to MealMap
          </Link>
        </div>
      </div>
    </div>
  )
}

export default TermsPage
