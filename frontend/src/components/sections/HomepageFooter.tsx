import { ArrowRight, MapPin, MessageCircle } from "lucide-react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import founderplaneLogo from "@/assets/founderplane-logo-new.png";

const systems = [
  { name: "BoltGuider", href: "/services/boltguider" },
  { name: "BrandToFly", href: "/services/brandtofly" },
  { name: "D2CBolt", href: "/services/d2cbolt" },
  { name: "B2BBolt", href: "/services/b2bbolt" },
  { name: "ScaleRunway", href: "/services/scalerunway" },
  { name: "BoltRunway", href: "/services/boltrunway" },
];

interface HomepageFooterProps {
  onOpenDiagnostic?: () => void;
}

const HomepageFooter = ({ onOpenDiagnostic }: HomepageFooterProps) => {
  return (
    <footer data-testid="homepage-footer" className="relative overflow-hidden">
      {/* CTA Section */}
      <div className="relative py-20 overflow-hidden">
        <motion.div 
          className="absolute inset-0 bg-gradient-to-br from-primary via-primary/90 to-primary/80"
          animate={{ 
            background: [
              "linear-gradient(135deg, hsl(221 73% 49%) 0%, hsl(221 73% 45%) 50%, hsl(221 73% 40%) 100%)",
              "linear-gradient(135deg, hsl(221 73% 45%) 0%, hsl(221 73% 49%) 50%, hsl(221 73% 45%) 100%)",
              "linear-gradient(135deg, hsl(221 73% 49%) 0%, hsl(221 73% 45%) 50%, hsl(221 73% 40%) 100%)",
            ]
          }}
          transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
        />
        <div className="absolute inset-0 bg-[linear-gradient(to_right,hsl(0_0%_100%/0.05)_1px,transparent_1px),linear-gradient(to_bottom,hsl(0_0%_100%/0.05)_1px,transparent_1px)] bg-[size:40px_40px]" />
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-white/10 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-1/4 w-64 h-64 bg-white/10 rounded-full blur-3xl" />
        
        <motion.div 
          className="container px-4 text-center relative z-10"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.5 }}
        >
          <h3 className="text-3xl md:text-5xl font-bold font-display text-white mb-4">
            Stop Guessing. Start Engineering.
          </h3>
          <p className="text-white/90 mb-8 max-w-xl mx-auto text-lg">
            The infrastructure is built. Stop wasting capital on fragmented advice and out-of-sequence execution. Find your exact coordinates today and install the engine your business actually needs.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <button
              onClick={onOpenDiagnostic}
              className="inline-flex items-center gap-2 bg-white text-primary hover:bg-white/90 font-semibold px-8 py-4 rounded-full text-lg shadow-lg transition-all duration-300 hover:scale-105 hover:shadow-xl group cursor-pointer"
            >
              Take the Stage Clarity Check
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </button>
          </div>
        </motion.div>
      </div>

      {/* ======= STACKED FOOTER ARCHITECTURE ======= */}
      <div className="bg-slate-900">

        {/* 1. Top Container — Content Grid */}
        <div data-testid="footer-content-grid" className="container px-4 pt-16 pb-14 md:pb-16">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-10 md:gap-12 lg:gap-16">

            {/* Column 1: Brand (minimal) */}
            <div>
              <motion.div
                className="flex items-center gap-3"
                whileHover={{ scale: 1.02 }}
                transition={{ type: "spring", stiffness: 400, damping: 17 }}
              >
                <img
                  src={founderplaneLogo}
                  alt="FounderPlane Logo"
                  className="w-11 h-11 object-contain"
                />
                <div>
                  <span className="text-lg font-bold text-white tracking-tight">FounderPlane</span>
                  <p className="text-xs text-slate-500 tracking-widest uppercase">Strategy. Systems. Scale.</p>
                </div>
              </motion.div>
            </div>

            {/* Column 2: Our Systems */}
            <div>
              <h4 className="text-xs font-semibold text-slate-500 uppercase tracking-widest mb-5">Our Systems</h4>
              <ul className="space-y-2.5">
                <li>
                  <button
                    onClick={() => {
                      const event = new CustomEvent('openStageClarityCheck');
                      window.dispatchEvent(event);
                    }}
                    data-testid="footer-find-your-stage"
                    className="text-white hover:text-blue-400 transition-colors duration-200 text-sm inline-flex items-center gap-1.5 font-medium cursor-pointer"
                  >
                    <span>&#x1F9ED;</span> Find Your Stage (Clarity Check)
                  </button>
                </li>
                <li className="my-2"><div className="h-px" style={{ backgroundColor: 'rgba(255, 255, 255, 0.1)' }} /></li>
                {systems.map((system) => (
                  <li key={system.name}>
                    <Link
                      to={system.href}
                      className="text-slate-400 hover:text-white transition-colors duration-200 text-sm inline-block"
                    >
                      {system.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Column 3: Support */}
            <div>
              <h4 className="text-xs font-semibold text-slate-500 uppercase tracking-widest mb-5">Support</h4>
              <ul className="space-y-5">
                <li>
                  <Button
                    onClick={() => {
                      if (window.Intercom) {
                        window.Intercom('show');
                      }
                    }}
                    data-testid="homepage-footer-intercom-button"
                    className="inline-flex items-center gap-2.5 px-5 py-2.5 rounded-full border border-slate-700 bg-slate-800/50 text-slate-300 hover:text-white hover:bg-slate-800 hover:border-slate-600 transition-all duration-200 text-sm font-medium"
                  >
                    <MessageCircle className="w-4 h-4" />
                    Need Support? Chat with us
                  </Button>
                </li>
                <li className="flex items-start gap-3">
                  <MapPin className="w-4 h-4 text-slate-500 mt-0.5 flex-shrink-0" />
                  <span className="text-slate-400 text-sm">
                    Bengaluru, India
                  </span>
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* 2. The Divider Line */}
        <div className="w-full h-px" style={{ backgroundColor: 'rgba(255, 255, 255, 0.15)' }} />

        {/* 3. Middle Container — Watermark (in-flow, no absolute) */}
        <div
          data-testid="footer-watermark"
          className="w-full overflow-hidden select-none pointer-events-none"
          aria-hidden="true"
          style={{ paddingTop: '48px', paddingBottom: '48px' }}
        >
          <div
            className="text-center"
            style={{
              fontSize: 'clamp(60px, 15vw, 240px)',
              lineHeight: 1,
              fontWeight: 800,
              color: 'rgba(255, 255, 255, 0.1)',
              letterSpacing: '-0.03em',
              fontFamily: 'system-ui, -apple-system, sans-serif',
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              maxWidth: '100%',
            }}
          >
            FounderPlane
          </div>
        </div>

        {/* 4. Bottom Container — Legal */}
        <div data-testid="footer-legal-bar" className="border-t" style={{ borderColor: 'rgba(255, 255, 255, 0.15)' }}>
          <div className="container px-4 py-6">
            <div className="text-center space-y-2">
              <p className="text-xs text-slate-500 leading-relaxed">
                By accessing this platform, you agree to our{' '}
                <Link to="/terms-of-service" className="text-slate-400 hover:text-white underline underline-offset-2 transition-colors">Terms of Service</Link>,{' '}
                <Link to="/privacy-policy" className="text-slate-400 hover:text-white underline underline-offset-2 transition-colors">Privacy Policy</Link>, and{' '}
                <Link to="/refund-policy" className="text-slate-400 hover:text-white underline underline-offset-2 transition-colors">Refund & Cancellation Policy</Link>.
              </p>
              <p className="text-xs text-slate-600">
                Built with <span className="text-cyan-400">&#x1FA75;</span> for the next generation of business. &copy; 2026 FounderPlane. All rights reserved.
              </p>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default HomepageFooter;
