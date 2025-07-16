import { Link } from 'react-router-dom';

const Footer = () => {
  return (
    <footer className="bg-background">
      <div className="container mx-auto py-8 px-4 text-center text-sm text-muted-foreground border-t">
        <div className="flex justify-center flex-wrap gap-x-6 gap-y-2 mb-4">
          <Link to="/terms" className="hover:text-primary">Terms of Service</Link>
          <Link to="/privacy" className="hover:text-primary">Privacy Policy</Link>
          <Link to="/contact-support" className="hover:text-primary">Contact Support</Link>
          <Link to="/suggest-feature" className="hover:text-primary">Suggest a Feature</Link>
        </div>
        <p>&copy; {new Date().getFullYear()} UniShorts. All rights reserved.</p>
      </div>
    </footer>
  );
};

export default Footer;