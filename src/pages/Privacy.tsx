import Header from '@/components/Header';
import Footer from '@/components/Footer';
import BackButton from '@/components/BackButton';

const Privacy = () => {
  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-grow container mx-auto p-8">
        <BackButton />
        <h1 className="text-3xl font-bold mb-4">Privacy Policy – UniShorts</h1>
        <div className="prose dark:prose-invert max-w-none">
          <p><strong>Effective Date:</strong> July 11, 2025</p>
          <p><strong>Contact:</strong> <a href="mailto:oussamalaabidatepro@gmail.com">oussamalaabidatepro@gmail.com</a></p>

          <h2 className="text-2xl font-bold mt-6 mb-2">1. Introduction</h2>
          <p>At UniShorts, we value your trust and are committed to protecting your personal data. This Privacy Policy explains what data we collect, how we use it, and the choices you have regarding your information. By using UniShorts, you agree to the terms of this Privacy Policy.</p>

          <h2 className="text-2xl font-bold mt-6 mb-2">2. Who We Are</h2>
          <p>UniShorts is a web platform dedicated to showcasing academic short films created by university students. Our mission is to support creativity, collaboration, and exposure for emerging filmmakers within a secure and respectful community.</p>

          <h2 className="text-2xl font-bold mt-6 mb-2">3. What We Collect</h2>
          <p>We collect personal and technical data, including:</p>
          <ul>
            <li><strong>Account Information:</strong> Full name, email address, username, university affiliation, field of study, and profile preferences.</li>
            <li><strong>Film Data:</strong> Uploaded videos, titles, descriptions, and engagement metrics (likes, views, favorites).</li>
            <li><strong>Device and Usage Data:</strong> IP address, browser type, device type, operating system, and activity logs.</li>
            <li><strong>Cookies and Similar Technologies:</strong> For session management, analytics, and personalized content delivery.</li>
          </ul>

          <h2 className="text-2xl font-bold mt-6 mb-2">4. How We Use Your Data</h2>
          <p>Your data is used to:</p>
          <ul>
            <li>Create and manage your account.</li>
            <li>Display your uploaded films to other users.</li>
            <li>Match your preferences with recommended content.</li>
            <li>Send platform-related notifications, confirmations, and updates.</li>
            <li>Analyze usage patterns to improve platform features and user experience.</li>
            <li>Ensure platform security, detect fraud, and enforce our policies.</li>
          </ul>

          <h2 className="text-2xl font-bold mt-6 mb-2">5. Data Sharing and Third-Party Services</h2>
          <p>We do not sell your data. However, we may share limited data with trusted service providers who assist in:</p>
          <ul>
            <li>Hosting and cloud services</li>
            <li>Email delivery systems</li>
            <li>Content moderation tools</li>
            <li>AI-based film recommendation systems</li>
          </ul>
          <p>All third-party services are required to follow strict data protection protocols.</p>

          <h2 className="text-2xl font-bold mt-6 mb-2">6. Your Rights and Controls</h2>
          <p>You have the right to:</p>
          <ul>
            <li>Access, edit, or delete your personal information</li>
            <li>Download your data in a machine-readable format</li>
            <li>Request account deletion (this is irreversible)</li>
            <li>Manage your cookie preferences via browser settings</li>
          </ul>
          <p>To exercise these rights, please contact us at: <a href="mailto:oussamalaabidatepro@gmail.com">oussamalaabidatepro@gmail.com</a></p>

          <h2 className="text-2xl font-bold mt-6 mb-2">7. Account Verification & Moderation</h2>
          <p>All new accounts are subject to manual approval by platform administrators.</p>
          <p>A confirmation email must be verified before full access is granted.</p>
          <p>If your film is submitted, it will be evaluated by AI and moderators before being published.</p>

          <h2 className="text-2xl font-bold mt-6 mb-2">8. Data Retention</h2>
          <p>We retain user data as long as your account is active, and up to 6 months after deletion, to comply with legal and moderation needs.</p>

          <h2 className="text-2xl font-bold mt-6 mb-2">9. Security</h2>
          <p>We employ industry-standard measures including SSL encryption, role-based access control, hashed passwords, and AI-based fraud detection. While no system is 100% secure, we are constantly improving our protocols.</p>

          <h2 className="text-2xl font-bold mt-6 mb-2">10. Cookies</h2>
          <p>We use essential and analytics cookies to:</p>
          <ul>
            <li>Keep you signed in</li>
            <li>Store your language and preference settings</li>
            <li>Analyze traffic and performance</li>
            <li>Customize recommended films</li>
          </ul>
          <p>You can disable cookies at any time through your browser settings.</p>

          <h2 className="text-2xl font-bold mt-6 mb-2">11. Children’s Privacy</h2>
          <p>UniShorts is intended for users aged 18+. We do not knowingly collect data from minors. If you believe we have data from a minor, please contact us immediately.</p>

          <h2 className="text-2xl font-bold mt-6 mb-2">12. Policy Updates</h2>
          <p>We may update this policy occasionally to reflect legal or platform changes. You will be notified via email or on your dashboard if significant changes are made.</p>

          <h2 className="text-2xl font-bold mt-6 mb-2">13. Contact Us</h2>
          <p>For any questions, concerns, or data requests:</p>
          <p>📧 Email: <a href="mailto:oussamalaabidatepro@gmail.com">oussamalaabidatepro@gmail.com</a></p>
          
          <p>© 2025 UniShorts. All rights reserved.</p>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Privacy;