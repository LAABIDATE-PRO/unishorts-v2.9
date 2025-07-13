import React from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import BackButton from '@/components/BackButton';

const Terms = () => {
  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-grow container mx-auto p-8">
        <BackButton />
        <h1 className="text-3xl font-bold mb-4">Terms of Service</h1>
        <div className="prose dark:prose-invert max-w-none">
          <p>Welcome to UniShorts!</p>
          <p>These terms and conditions outline the rules and regulations for the use of UniShorts's Website, located at this domain.</p>
          <p>By accessing this website we assume you accept these terms and conditions. Do not continue to use UniShorts if you do not agree to take all of the terms and conditions stated on this page.</p>
          
          <h2 className="text-2xl font-bold mt-6 mb-2">Content Liability</h2>
          <p>You are responsible for any and all content you upload to our platform. You agree to not upload content that is unlawful, obscene, or defamatory.</p>

          <h2 className="text-2xl font-bold mt-6 mb-2">Your Privacy</h2>
          <p>Please read our Privacy Policy.</p>

          <h2 className="text-2xl font-bold mt-6 mb-2">Reservation of Rights</h2>
          <p>We reserve the right to request that you remove all links or any particular link to our Website. You approve to immediately remove all links to our Website upon request. We also reserve the right to amen these terms and conditions and it’s linking policy at any time. By continuously linking to our Website, you agree to be bound to and follow these linking terms and conditions.</p>
          
          <p><em>This is a placeholder document. Please replace with your full Terms of Service.</em></p>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Terms;