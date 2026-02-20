import React from 'react';
import { AlertTriangle, ShieldCheck, X } from 'lucide-react';
import { LOGO_URL, APP_NAME, APP_TAGLINE } from '@/lib/constants';
interface AgeVerificationModalProps {
  isOpen: boolean;
  onVerify: () => void;
  onDecline: () => void;
}
const AgeVerificationModal: React.FC<AgeVerificationModalProps> = ({
  isOpen,
  onVerify,
  onDecline
}) => {
  if (!isOpen) return null;
  return <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/90 backdrop-blur-md" />
      
      {/* Modal */}
      <div className="relative w-full max-w-lg bg-gradient-to-br from-[#2D1B4E] to-[#1a0f2e] rounded-3xl p-8 border border-[#D4AF37]/30 shadow-2xl shadow-purple-900/50">
        {/* Decorative elements */}
        <div className="absolute -top-2 -left-2 w-20 h-20 bg-[#D4AF37]/10 rounded-full blur-2xl" />
        <div className="absolute -bottom-2 -right-2 w-32 h-32 bg-pink-500/10 rounded-full blur-3xl" />
        
        {/* Large Logo */}
        <div className="relative mb-8 bg-[url('https://d64gsuwffb70l.cloudfront.net/692bc9245f44a664483e6b47_1767554281057_5dc6cadc.png')] bg-cover bg-center">
          <div className="w-32 h-32 mx-auto rounded-2xl overflow-hidden bg-gradient-to-br from-[#2D1B4E] to-[#1a0f2e] p-1 shadow-xl shadow-[#D4AF37]/20">
            <div className="w-full h-full rounded-xl bg-white/5 flex items-center justify-center overflow-hidden">
              <img src={LOGO_URL} alt={APP_NAME} className="w-full h-full object-contain p-2" onError={e => {
              // Fallback to icon if logo fails to load
              const target = e.target as HTMLImageElement;
              target.style.display = 'none';
              target.parentElement!.innerHTML = '<div class="w-20 h-20 rounded-full bg-gradient-to-br from-[#8B1538] to-pink-600 flex items-center justify-center"><svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="text-white"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10"/><path d="m9 12 2 2 4-4"/></svg></div>';
            }} />
            </div>
          </div>
          
          {/* Brand name under logo */}
          <div className="text-center mt-4">
            <h1 className="text-2xl font-bold text-white">{APP_NAME}</h1>
            <p className="text-[#D4AF37] text-sm font-medium">{APP_TAGLINE}</p>
          </div>
        </div>

        {/* Title */}
        <h2 className="text-xl font-bold text-white text-center mb-2">
          Age Verification Required
        </h2>
        
        {/* Warning */}
        <div className="flex items-center justify-center gap-2 text-[#D4AF37] mb-4">
          <AlertTriangle className="w-5 h-5" />
          <span className="text-sm font-medium">Adults Only (21+)</span>
        </div>

        {/* Description */}
        <p className="text-gray-300 text-center mb-6 leading-relaxed">
          This app contains adult content including explicit themes, 
          mature language, and intimate challenges. By entering, you confirm 
          that you are at least 21 years of age and consent to viewing adult content.
        </p>

        {/* Disclaimer */}
        <div className="bg-white/5 rounded-xl p-4 mb-6 border border-white/10">
          <p className="text-gray-400 text-xs text-center">
            By clicking "I'm 21+ Enter", you agree to our Terms of Service 
            and confirm that you are legally permitted to access adult content 
            in your jurisdiction.
          </p>
        </div>

        {/* Buttons */}
        <div className="flex flex-col gap-3">
          <button onClick={onVerify} className="w-full py-4 rounded-xl bg-gradient-to-r from-[#D4AF37] to-amber-500 text-[#2D1B4E] font-bold text-lg hover:shadow-lg hover:shadow-amber-500/30 transition-all flex items-center justify-center gap-2">
            <ShieldCheck className="w-5 h-5" />
            I'm 21+ Enter
          </button>
          <button onClick={onDecline} className="w-full py-3 rounded-xl bg-white/10 text-gray-400 font-medium hover:bg-white/20 hover:text-white transition-all">
            I'm Under 21 - Exit
          </button>
        </div>
        
        {/* Bottom logo watermark */}
        <div className="absolute bottom-3 right-3 opacity-20">
          <img src={LOGO_URL} alt="" className="w-8 h-8 object-contain" />
        </div>
      </div>
    </div>;
};
export default AgeVerificationModal;