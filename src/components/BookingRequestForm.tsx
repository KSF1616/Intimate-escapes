import React, { useState } from 'react';
import { Calendar, Users, Flame, Send, CheckCircle, AlertCircle, Loader2, Sparkles, MapPin, Phone, Mail, User } from 'lucide-react';
import { supabase } from '@/lib/supabase';

interface BookingRequestFormProps {
  userEmail?: string;
  userName?: string;
}

const BookingRequestForm: React.FC<BookingRequestFormProps> = ({ userEmail, userName }) => {
  const [formData, setFormData] = useState({
    name: userName || '',
    email: userEmail || '',
    phone: '',
    preferredDate: '',
    numberOfGuests: '2',
    intensityLevel: 'spicy',
    specialRequests: ''
  });
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitStatus('idle');
    setErrorMessage('');

    try {
      const { data, error } = await supabase.functions.invoke('booking-request', {
        body: {
          name: formData.name,
          email: formData.email,
          phone: formData.phone || undefined,
          preferredDate: formData.preferredDate,
          numberOfGuests: parseInt(formData.numberOfGuests),
          intensityLevel: formData.intensityLevel,
          specialRequests: formData.specialRequests || undefined
        }
      });

      if (error) throw error;
      if (data?.error) throw new Error(data.error);

      setSubmitStatus('success');
      // Reset form after success
      setFormData({
        name: userName || '',
        email: userEmail || '',
        phone: '',
        preferredDate: '',
        numberOfGuests: '2',
        intensityLevel: 'spicy',
        specialRequests: ''
      });
    } catch (error: any) {
      console.error('Booking request error:', error);
      setSubmitStatus('error');
      setErrorMessage(error.message || 'Failed to submit booking request. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Get minimum date (tomorrow)
  const getMinDate = () => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    return tomorrow.toISOString().split('T')[0];
  };

  // Success state
  if (submitStatus === 'success') {
    return (
      <div className="bg-gradient-to-br from-green-900/30 to-emerald-900/30 rounded-2xl p-8 border border-green-500/30 text-center">
        <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-green-500/20 flex items-center justify-center">
          <CheckCircle className="w-8 h-8 text-green-400" />
        </div>
        <h3 className="text-2xl font-bold text-white mb-2">Booking Request Submitted!</h3>
        <p className="text-gray-300 mb-4">
          Thank you for your interest! We've sent a confirmation email to <span className="text-[#D4AF37]">{formData.email || userEmail}</span>.
        </p>
        <p className="text-gray-400 text-sm mb-6">
          Our team will review your request and get back to you within 24-48 hours to confirm availability and finalize the details.
        </p>
        <button
          onClick={() => setSubmitStatus('idle')}
          className="px-6 py-3 rounded-xl bg-white/10 text-white hover:bg-white/20 transition-all"
        >
          Submit Another Request
        </button>
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-br from-[#8B1538]/20 to-[#D4AF37]/10 rounded-2xl p-6 md:p-8 border border-[#D4AF37]/30">
      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <div className="w-14 h-14 rounded-xl bg-gradient-to-r from-[#D4AF37] to-amber-500 flex items-center justify-center">
          <MapPin className="w-7 h-7 text-[#2D1B4E]" />
        </div>
        <div>
          <h3 className="text-xl font-bold text-white">Book a Live Adventure</h3>
          <p className="text-gray-400 text-sm">Request a personalized intimate escape experience</p>
        </div>
      </div>

      {/* Description */}
      <div className="bg-white/5 rounded-xl p-4 mb-6 border border-white/10">
        <div className="flex items-start gap-3">
          <Sparkles className="w-5 h-5 text-[#D4AF37] flex-shrink-0 mt-0.5" />
          <p className="text-white/80 text-sm leading-relaxed">
            Live adventures include curated experiences with tangible items, surprise elements, and optional transportation. 
            Fill out the form below and our team will contact you to customize your perfect romantic escape.
          </p>
        </div>
      </div>

      {/* Error Message */}
      {submitStatus === 'error' && (
        <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-4 mb-6 flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-red-400 font-medium">Failed to submit request</p>
            <p className="text-red-300/80 text-sm">{errorMessage}</p>
          </div>
        </div>
      )}

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Name & Email Row */}
        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <label className="block text-white text-sm font-medium mb-2">
              <User className="w-4 h-4 inline mr-2" />
              Your Name *
            </label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
              placeholder="Enter your name"
              className="w-full px-4 py-3 rounded-xl bg-white/10 border border-white/20 text-white placeholder-gray-500 focus:outline-none focus:border-[#D4AF37] focus:ring-1 focus:ring-[#D4AF37] transition-all"
            />
          </div>
          <div>
            <label className="block text-white text-sm font-medium mb-2">
              <Mail className="w-4 h-4 inline mr-2" />
              Email Address *
            </label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
              placeholder="your@email.com"
              className="w-full px-4 py-3 rounded-xl bg-white/10 border border-white/20 text-white placeholder-gray-500 focus:outline-none focus:border-[#D4AF37] focus:ring-1 focus:ring-[#D4AF37] transition-all"
            />
          </div>
        </div>

        {/* Phone & Date Row */}
        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <label className="block text-white text-sm font-medium mb-2">
              <Phone className="w-4 h-4 inline mr-2" />
              Phone Number (Optional)
            </label>
            <input
              type="tel"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              placeholder="(555) 123-4567"
              className="w-full px-4 py-3 rounded-xl bg-white/10 border border-white/20 text-white placeholder-gray-500 focus:outline-none focus:border-[#D4AF37] focus:ring-1 focus:ring-[#D4AF37] transition-all"
            />
          </div>
          <div>
            <label className="block text-white text-sm font-medium mb-2">
              <Calendar className="w-4 h-4 inline mr-2" />
              Preferred Date *
            </label>
            <input
              type="date"
              name="preferredDate"
              value={formData.preferredDate}
              onChange={handleChange}
              required
              min={getMinDate()}
              className="w-full px-4 py-3 rounded-xl bg-white/10 border border-white/20 text-white placeholder-gray-500 focus:outline-none focus:border-[#D4AF37] focus:ring-1 focus:ring-[#D4AF37] transition-all [color-scheme:dark]"
            />
          </div>
        </div>

        {/* Guests & Intensity Row */}
        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <label className="block text-white text-sm font-medium mb-2">
              <Users className="w-4 h-4 inline mr-2" />
              Number of Guests *
            </label>
            <select
              name="numberOfGuests"
              value={formData.numberOfGuests}
              onChange={handleChange}
              required
              className="w-full px-4 py-3 rounded-xl bg-white/10 border border-white/20 text-white focus:outline-none focus:border-[#D4AF37] focus:ring-1 focus:ring-[#D4AF37] transition-all appearance-none cursor-pointer"
              style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='white'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'%3E%3C/path%3E%3C/svg%3E")`, backgroundRepeat: 'no-repeat', backgroundPosition: 'right 12px center', backgroundSize: '20px' }}
            >
              <option value="2" className="bg-[#2D1B4E]">2 guests (Couple)</option>
              <option value="3" className="bg-[#2D1B4E]">3 guests</option>
              <option value="4" className="bg-[#2D1B4E]">4 guests</option>
              <option value="5" className="bg-[#2D1B4E]">5 guests</option>
              <option value="6" className="bg-[#2D1B4E]">6+ guests (Group)</option>
            </select>
          </div>
          <div>
            <label className="block text-white text-sm font-medium mb-2">
              <Flame className="w-4 h-4 inline mr-2" />
              Intensity Level *
            </label>
            <select
              name="intensityLevel"
              value={formData.intensityLevel}
              onChange={handleChange}
              required
              className="w-full px-4 py-3 rounded-xl bg-white/10 border border-white/20 text-white focus:outline-none focus:border-[#D4AF37] focus:ring-1 focus:ring-[#D4AF37] transition-all appearance-none cursor-pointer"
              style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='white'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'%3E%3C/path%3E%3C/svg%3E")`, backgroundRepeat: 'no-repeat', backgroundPosition: 'right 12px center', backgroundSize: '20px' }}
            >
              <option value="mild" className="bg-[#2D1B4E]">Mild - Romantic & Sweet</option>
              <option value="spicy" className="bg-[#2D1B4E]">Spicy - Flirty & Adventurous</option>
              <option value="xxx" className="bg-[#2D1B4E]">XXX - Bold & Daring</option>
            </select>
          </div>
        </div>

        {/* Special Requests */}
        <div>
          <label className="block text-white text-sm font-medium mb-2">
            <Sparkles className="w-4 h-4 inline mr-2" />
            Special Requests or Preferences (Optional)
          </label>
          <textarea
            name="specialRequests"
            value={formData.specialRequests}
            onChange={handleChange}
            rows={3}
            placeholder="Tell us about any special occasions, dietary restrictions, accessibility needs, or specific preferences..."
            className="w-full px-4 py-3 rounded-xl bg-white/10 border border-white/20 text-white placeholder-gray-500 focus:outline-none focus:border-[#D4AF37] focus:ring-1 focus:ring-[#D4AF37] transition-all resize-none"
          />
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full py-4 rounded-xl bg-gradient-to-r from-[#D4AF37] to-amber-500 text-[#2D1B4E] font-bold text-lg hover:shadow-lg hover:shadow-amber-500/30 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          {isSubmitting ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              Submitting Request...
            </>
          ) : (
            <>
              <Send className="w-5 h-5" />
              Submit Booking Request
            </>
          )}
        </button>

        {/* Privacy Note */}
        <p className="text-gray-500 text-xs text-center">
          By submitting this form, you agree to be contacted regarding your booking request. 
          We respect your privacy and will never share your information.
        </p>
      </form>
    </div>
  );
};

export default BookingRequestForm;
