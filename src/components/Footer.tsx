import { Link } from "react-router-dom";

export const Footer = () => {
  return (
    <footer className="bg-muted border-t border-border mt-16">
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <h3 className="font-bold text-lg mb-4">T-<span className="text-primary">Care</span></h3>
            <p className="text-sm text-muted-foreground">
              Your trusted carrier for seamless connectivity
            </p>
          </div>
          
          <div>
            <h4 className="font-semibold mb-3">Quick Links</h4>
            <div className="flex flex-col space-y-2">
              <Link to="/privacy" className="text-sm text-muted-foreground hover:text-primary">
                Privacy Policy
              </Link>
              <Link to="/terms" className="text-sm text-muted-foreground hover:text-primary">
                Terms of Service
              </Link>
              <Link to="/contact" className="text-sm text-muted-foreground hover:text-primary">
                Contact Us
              </Link>
            </div>
          </div>

          <div>
            <h4 className="font-semibold mb-3">Support</h4>
            <div className="flex flex-col space-y-2">
              <Link to="/help" className="text-sm text-muted-foreground hover:text-primary">
                Help Center
              </Link>
              <Link to="/status" className="text-sm text-muted-foreground hover:text-primary">
                Network Status
              </Link>
              <Link to="/coverage" className="text-sm text-muted-foreground hover:text-primary">
                Coverage Map
              </Link>
            </div>
          </div>
        </div>

        <div className="mt-8 pt-8 border-t border-border text-center text-sm text-muted-foreground">
          © {new Date().getFullYear()} T-Care. All rights reserved.
        </div>
      </div>
    </footer>
  );
};
