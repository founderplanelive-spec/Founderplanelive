import { Link } from "react-router-dom";
import { MessageCircle } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import founderplaneLogo from "@/assets/founderplane-logo-new.png";

interface ServiceFooterProps {
  engineName: string;
  engineIcon: LucideIcon;
  engineIconBg?: string;
  engineIconColor?: string;
  engineBrandColor?: string;
  engineIconBgColor?: string;
}

const ServiceFooter = ({ engineName, engineIcon: EngineIcon, engineIconBg = "bg-slate-100", engineIconColor = "text-slate-800", engineBrandColor, engineIconBgColor }: ServiceFooterProps) => {
  return (
    <footer data-testid="service-footer" className="bg-[#FAFAFA]">
      {/* Layer 1: Main Row */}
      <div className="container mx-auto px-4 py-8 md:py-10">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          {/* Left — Dynamic System Branding */}
          <div data-testid="service-footer-branding" className="flex items-center gap-2 flex-wrap">
            <div 
              className={`w-7 h-7 rounded-lg flex items-center justify-center ${!engineIconBgColor ? engineIconBg : ''}`}
              style={engineIconBgColor ? { backgroundColor: engineIconBgColor } : undefined}
            >
              {engineIconBgColor ? (
                <EngineIcon className="w-4 h-4 text-white" />
              ) : engineBrandColor ? (
                <EngineIcon className="w-4 h-4" style={{ color: engineBrandColor }} />
              ) : (
                <EngineIcon className={`w-4 h-4 ${engineIconColor}`} />
              )}
            </div>
            <span className="text-[#1D1D1F] font-semibold text-sm">{engineName}</span>
            <span className="text-[#86868B] text-sm">by</span>
            <Link to="/" className="flex items-center gap-1.5 hover:opacity-80 transition-opacity">
              <img src={founderplaneLogo} alt="FounderPlane" className="w-5 h-5" />
              <span className="text-[#1D1D1F] font-semibold text-sm">FounderPlane</span>
            </Link>
          </div>

          {/* Right — Support */}
          <div className="flex items-center gap-4 md:gap-5 flex-wrap">
            <Button
              onClick={() => {
                if (window.Intercom) {
                  window.Intercom('show');
                }
              }}
              data-testid="service-footer-intercom-button"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#1D1D1F] text-white text-sm font-medium hover:bg-[#333] transition-colors"
            >
              <MessageCircle className="w-3.5 h-3.5" />
              Need Support? Chat with us
            </Button>
          </div>
        </div>
      </div>

      {/* Layer 2: Legal Bottom Bar */}
      <div className="border-t" style={{ borderColor: '#EAEAEA' }}>
        <div className="container mx-auto px-4 py-4">
          <div className="flex flex-col md:flex-row items-center justify-between gap-3">
            {/* Left — Copyright */}
            <p data-testid="service-footer-copyright" className="text-xs text-[#86868B]">
              Built with <span className="text-cyan-500">&#x1FA75;</span> for the next generation of business. &copy; 2026 FounderPlane. All rights reserved.
            </p>

            {/* Right — Legal Links */}
            <div data-testid="service-footer-legal" className="flex items-center gap-1 text-xs text-[#86868B]">
              <Link to="/terms-of-service" className="hover:text-[#1D1D1F] transition-colors">Terms of Service</Link>
              <span>|</span>
              <Link to="/privacy-policy" className="hover:text-[#1D1D1F] transition-colors">Privacy Policy</Link>
              <span>|</span>
              <Link to="/refund-policy" className="hover:text-[#1D1D1F] transition-colors">Refund & Cancellation Policy</Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default ServiceFooter;
