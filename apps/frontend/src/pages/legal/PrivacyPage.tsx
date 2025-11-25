/**
 * Privacy Policy Page
 * 
 * Student-friendly privacy policy explaining data collection, usage, and storage.
 * Transparent about what data is collected and how it's used in this educational project.
 */

import { Link } from 'react-router-dom'
import { ChefHat, ArrowLeft } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/Card'

const PrivacyPage = () => {
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
            <h1 className="text-3xl font-bold text-foreground">Privacy Policy</h1>
          </div>
          <p className="text-muted-foreground">Last updated: November 25, 2025</p>
        </div>

        {/* Content */}
        <Card>
          <CardContent className="p-8 space-y-6 prose prose-sm dark:prose-invert max-w-none">
            {/* Introduction */}
            <section>
              <h2 className="text-2xl font-semibold text-foreground mb-3">Introduction</h2>
              <p className="text-muted-foreground">
                This Privacy Policy explains how MealMap, a university project created by Laszlo Kornis 
                for Fontys University of Applied Sciences, collects, uses, and protects your personal information. 
                We are committed to being transparent about data practices and protecting your privacy.
              </p>
            </section>

            {/* What Data We Collect */}
            <section>
              <h2 className="text-2xl font-semibold text-foreground mb-3">1. Information We Collect</h2>
              
              <h3 className="text-xl font-semibold text-foreground mt-4 mb-2">Account Information</h3>
              <p className="text-muted-foreground mb-2">When you create an account, we collect:</p>
              <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
                <li><strong>Email address:</strong> Used for account login and password reset</li>
                <li><strong>Display name:</strong> Your chosen name shown in the application</li>
                <li><strong>Password:</strong> Stored securely using industry-standard hashing (never stored in plain text)</li>
                <li><strong>Account creation date:</strong> When your account was created</li>
                <li><strong>Terms acceptance date:</strong> When you agreed to our terms</li>
              </ul>

              <h3 className="text-xl font-semibold text-foreground mt-4 mb-2">Application Data</h3>
              <p className="text-muted-foreground mb-2">As you use MealMap, we store:</p>
              <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
                <li><strong>Ingredients:</strong> Custom ingredients you create or modify</li>
                <li><strong>Recipes:</strong> Your saved recipes and meal ideas</li>
                <li><strong>Meal plans:</strong> Your weekly meal schedules</li>
                <li><strong>Pantry items:</strong> Items you track in your pantry</li>
                <li><strong>Grocery lists:</strong> Your shopping lists and trip plans</li>
              </ul>

              <h3 className="text-xl font-semibold text-foreground mt-4 mb-2">Technical Information</h3>
              <p className="text-muted-foreground mb-2">We automatically collect:</p>
              <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
                <li><strong>Authentication tokens:</strong> JWT tokens for session management (stored temporarily)</li>
                <li><strong>Preferences:</strong> Your theme choice (dark/light mode) stored in your browser</li>
                <li><strong>Browser information:</strong> Used for compatibility and troubleshooting</li>
              </ul>
            </section>

            {/* How We Use Data */}
            <section>
              <h2 className="text-2xl font-semibold text-foreground mb-3">2. How We Use Your Information</h2>
              <p className="text-muted-foreground mb-2">We use your information solely to:</p>
              <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
                <li>Provide and maintain the MealMap service</li>
                <li>Authenticate your account and manage your sessions</li>
                <li>Store and retrieve your meal plans, recipes, and grocery lists</li>
                <li>Send password reset emails when requested</li>
                <li>Improve the application based on usage patterns (anonymized)</li>
                <li>Demonstrate the project for academic evaluation</li>
              </ul>
              <p className="text-muted-foreground mt-3">
                <strong>We do not:</strong>
              </p>
              <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
                <li>Sell or rent your personal information to third parties</li>
                <li>Use your data for marketing or advertising</li>
                <li>Share your data with anyone except as required by law</li>
                <li>Track you across other websites or applications</li>
              </ul>
            </section>

            {/* Data Storage and Security */}
            <section>
              <h2 className="text-2xl font-semibold text-foreground mb-3">3. Data Storage and Security</h2>
              
              <h3 className="text-xl font-semibold text-foreground mt-4 mb-2">Where Your Data is Stored</h3>
              <p className="text-muted-foreground">
                Your data is stored in a Microsoft SQL Server database hosted on university infrastructure. 
                All data is isolated per user - you can only access your own meal plans, recipes, and lists.
              </p>

              <h3 className="text-xl font-semibold text-foreground mt-4 mb-2">Security Measures</h3>
              <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
                <li><strong>Password encryption:</strong> Passwords are hashed using bcrypt (industry standard)</li>
                <li><strong>Secure authentication:</strong> JWT tokens with 15-minute expiration for access tokens</li>
                <li><strong>HTTPS encryption:</strong> All data transmitted over secure connections</li>
                <li><strong>HttpOnly cookies:</strong> Refresh tokens stored securely to prevent XSS attacks</li>
                <li><strong>User isolation:</strong> Database-level security ensures users can only access their own data</li>
              </ul>

              <p className="text-muted-foreground mt-3">
                <strong>Note:</strong> While we implement security best practices, as this is an educational project, 
                we cannot guarantee the same level of security as commercial services. Please do not store sensitive 
                or critical information in MealMap.
              </p>
            </section>

            {/* Data Retention */}
            <section>
              <h2 className="text-2xl font-semibold text-foreground mb-3">4. Data Retention</h2>
              <p className="text-muted-foreground">
                We retain your information for as long as your account is active. If you delete your account:
              </p>
              <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
                <li>All your personal data is permanently deleted from our database</li>
                <li>Your meal plans, recipes, pantry items, and grocery lists are removed</li>
                <li>The deletion is immediate and cannot be undone</li>
                <li>We may keep anonymized usage statistics for educational purposes</li>
              </ul>
              <p className="text-muted-foreground mt-3">
                You can delete your account at any time from the Account Settings page.
              </p>
            </section>

            {/* Cookies and Local Storage */}
            <section>
              <h2 className="text-2xl font-semibold text-foreground mb-3">5. Cookies and Local Storage</h2>
              <p className="text-muted-foreground mb-2">MealMap uses:</p>
              <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
                <li>
                  <strong>Essential Cookies:</strong> HttpOnly cookie for refresh token (required for authentication). 
                  This cookie expires after 7 days or when you log out.
                </li>
                <li>
                  <strong>Browser Storage:</strong> We store your theme preference (dark/light mode) and sidebar 
                  collapse state in your browser's localStorage for convenience. This data never leaves your device.
                </li>
              </ul>
              <p className="text-muted-foreground mt-2">
                <strong>We do not use:</strong> Tracking cookies, analytics cookies, or advertising cookies.
              </p>
            </section>

            {/* Third-Party Services */}
            <section>
              <h2 className="text-2xl font-semibold text-foreground mb-3">6. Third-Party Services</h2>
              <p className="text-muted-foreground">
                MealMap does not integrate with third-party services for analytics, advertising, or tracking. 
                The application is self-contained and does not share your data with external services.
              </p>
              <p className="text-muted-foreground mt-2">
                <strong>Email Service:</strong> Password reset emails are sent using the configured email service 
                (Spring Mail). Your email address is only used for authentication and password recovery.
              </p>
            </section>

            {/* Your Rights */}
            <section>
              <h2 className="text-2xl font-semibold text-foreground mb-3">7. Your Rights and Choices</h2>
              <p className="text-muted-foreground mb-2">You have the right to:</p>
              <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
                <li><strong>Access your data:</strong> View all your stored information in the application</li>
                <li><strong>Update your data:</strong> Modify your profile, recipes, and meal plans at any time</li>
                <li><strong>Delete your data:</strong> Permanently remove your account and all associated data</li>
                <li><strong>Export your data:</strong> Download your meal plans and grocery lists (export features available in-app)</li>
                <li><strong>Change your password:</strong> Update your password from Account Settings</li>
              </ul>
            </section>

            {/* Children's Privacy */}
            <section>
              <h2 className="text-2xl font-semibold text-foreground mb-3">8. Children's Privacy</h2>
              <p className="text-muted-foreground">
                MealMap is not directed to individuals under the age of 13. We do not knowingly collect personal 
                information from children. If you believe a child has provided us with personal information, 
                please contact us and we will delete it.
              </p>
            </section>

            {/* Changes to Privacy Policy */}
            <section>
              <h2 className="text-2xl font-semibold text-foreground mb-3">9. Changes to This Privacy Policy</h2>
              <p className="text-muted-foreground">
                We may update this Privacy Policy from time to time. Changes will be posted on this page with 
                an updated "Last updated" date. We encourage you to review this policy periodically.
              </p>
            </section>

            {/* Contact */}
            <section>
              <h2 className="text-2xl font-semibold text-foreground mb-3">10. Contact Information</h2>
              <p className="text-muted-foreground">
                If you have questions about this Privacy Policy or how we handle your data, please contact:
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
                <strong>Project:</strong> MealMap - Fontys S3 Individual Project
              </p>
              <p className="text-muted-foreground">
                <strong>Institution:</strong> Fontys University of Applied Sciences
              </p>
            </section>

            {/* Summary */}
            <section className="bg-muted p-4 rounded-lg border border-border">
              <h3 className="text-lg font-semibold text-foreground mb-2">In Summary</h3>
              <p className="text-sm text-muted-foreground">
                MealMap collects only the data necessary to provide the meal planning service. We store your 
                account information, meal plans, recipes, and grocery lists securely. We do not sell, share, 
                or use your data for any purpose other than operating this educational application. You can 
                delete your account and all your data at any time.
              </p>
            </section>
          </CardContent>
        </Card>

        {/* Footer Links */}
        <div className="mt-8 text-center text-sm text-muted-foreground">
          <Link 
            to="/terms" 
            className="text-primary-600 hover:text-primary-700 dark:text-primary-500"
          >
            Terms of Use
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

export default PrivacyPage
