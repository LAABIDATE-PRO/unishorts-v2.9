import Header from '@/components/Header';
import Footer from '@/components/Footer';
import BackButton from '@/components/BackButton';

const Terms = () => {
  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-grow container mx-auto p-8">
        <BackButton />
        <h1 className="text-3xl font-bold mb-4">Terms of Service – UniShorts</h1>
        <div className="prose dark:prose-invert max-w-none">
          <p><strong>Effective Date:</strong> July 11, 2025</p>
          <p><strong>Contact:</strong> <a href="mailto:oussamalaabidatepro@gmail.com">oussamalaabidatepro@gmail.com</a></p>

          <h2 className="text-2xl font-bold mt-6 mb-2">1. Introduction</h2>
          <p>Welcome to UniShorts, a platform that empowers university students to publish, discover, and engage with academic short films. By accessing or using the UniShorts platform (the "Service"), you agree to be bound by these Terms of Service and all applicable laws.</p>
          <p>If you do not agree with any of these terms, you must refrain from using the platform.</p>

          <h2 className="text-2xl font-bold mt-6 mb-2">2. Eligibility</h2>
          <p>To use UniShorts, you must be at least 18 years old or a registered university student with a verified email. Users under 18 must obtain permission from a parent or guardian and may have limited access.</p>

          <h2 className="text-2xl font-bold mt-6 mb-2">3. Account Registration & Verification</h2>
          <ul>
            <li>Users must provide accurate information during registration.</li>
            <li>An account must be verified via email before accessing features.</li>
            <li>Final access is subject to manual approval by UniShorts administrators.</li>
            <li>Accounts may be suspended or revoked if terms are violated.</li>
          </ul>

          <h2 className="text-2xl font-bold mt-6 mb-2">4. User Conduct</h2>
          <p>By using UniShorts, you agree to:</p>
          <ul>
            <li>Not post or distribute content that is illegal, hateful, or infringes on others’ rights.</li>
            <li>Not impersonate other individuals or institutions.</li>
            <li>Use the platform only for academic or creative purposes, not for spam, fraud, or commercial misuse.</li>
          </ul>

          <h2 className="text-2xl font-bold mt-6 mb-2">5. Content Ownership & Responsibility</h2>
          <p>You retain full rights to the content you upload.</p>
          <p>You grant UniShorts a non-exclusive, royalty-free license to display and distribute your content within the platform for educational and promotional purposes.</p>
          <p>You are fully responsible for your content. UniShorts is not liable for content posted by users.</p>

          <h2 className="text-2xl font-bold mt-6 mb-2">6. Moderation and Removal</h2>
          <ul>
            <li>All uploaded films undergo AI and human moderation before public display.</li>
            <li>UniShorts reserves the right to approve, reject, or remove any content that violates guidelines without prior notice.</li>
            <li>You may receive feedback or rejection notices via email.</li>
          </ul>

          <h2 className="text-2xl font-bold mt-6 mb-2">7. Data & Privacy</h2>
          <p>Our handling of your personal information is outlined in our Privacy Policy. Please review it carefully.</p>

          <h2 className="text-2xl font-bold mt-6 mb-2">8. Termination</h2>
          <p>We may suspend or terminate your access if:</p>
          <ul>
            <li>You breach these Terms</li>
            <li>You engage in harmful or unlawful activity</li>
            <li>You request account deletion</li>
          </ul>
          <p>You may terminate your account at any time from your user dashboard.</p>

          <h2 className="text-2xl font-bold mt-6 mb-2">9. Intellectual Property</h2>
          <p>All content created by UniShorts (site design, branding, interface, etc.) is protected by copyright and may not be reused without permission.</p>
          <p>User-generated content remains the intellectual property of the creator.</p>

          <h2 className="text-2xl font-bold mt-6 mb-2">10. Disclaimer of Warranties</h2>
          <p>UniShorts is provided on an “as-is” and “as-available” basis. We do not guarantee that the service will be uninterrupted or error-free.</p>

          <h2 className="text-2xl font-bold mt-6 mb-2">11. Limitation of Liability</h2>
          <p>Under no circumstance shall UniShorts, its administrators, or its developers be liable for any indirect, incidental, or consequential damages resulting from the use or inability to use the platform.</p>

          <h2 className="text-2xl font-bold mt-6 mb-2">12. External Links</h2>
          <p>Our website may contain links to third-party sites. We are not responsible for the content or privacy practices of those sites.</p>

          <h2 className="text-2xl font-bold mt-6 mb-2">13. Modifications to These Terms</h2>
          <p>We may update these Terms from time to time. Users will be notified via email or platform notification in case of significant changes. Continued use of UniShorts constitutes acceptance of the new terms.</p>

          <h2 className="text-2xl font-bold mt-6 mb-2">14. Contact Us</h2>
          <p>For any questions, disputes, or support requests, you may contact us at:<br />📧 <a href="mailto:oussamalaabidatepro@gmail.com">oussamalaabidatepro@gmail.com</a></p>

          <p>© 2025 UniShorts. All rights reserved.</p>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Terms;