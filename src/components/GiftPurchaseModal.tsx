import React, { useState } from 'react';
import { loadStripe } from '@stripe/stripe-js';
import { Elements, PaymentElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { supabase } from '@/lib/supabase';
import { Gift, Heart, Sparkles, Clock, Calendar, Crown, Check, ArrowLeft, ArrowRight, Mail, User, MessageSquare, Map, Gamepad2, Trophy, Star } from 'lucide-react';

const stripePromise = loadStripe('pk_live_51OJhJBHdGQpsHqInIzu7c6PzGPSH0yImD4xfpofvxvFZs0VFhPRXZCyEgYkkhOtBOXFWvssYASs851mflwQvjnrl00T6DbUwWZ', {
  stripeAccount: 'acct_1Sle9dHc165viLYv'
});

interface GiftPurchaseModalProps {
  isOpen: boolean;
  onClose: () => void;
  userEmail?: string;
  userName?: string;
}

type PassCategory = 'escape' | 'game';

interface PassOption {
  id: string;
  name: string;
  price: number;
  duration: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  color: string;
  popular?: boolean;
  bestValue?: boolean;
  bonus?: string;
  category: PassCategory;
}

const escapePassOptions: PassOption[] = [
  {
    id: 'escape_1_3',
    name: 'Starter Pack',
    price: 20,
    duration: '1-3 Escapes',
    description: 'Perfect for trying out first adventures',
    icon: Map,
    color: 'from-pink-500 to-rose-500',
    category: 'escape'
  },
  {
    id: 'escape_4_6',
    name: 'Explorer Pack',
    price: 40,
    duration: '4-6 Escapes',
    description: 'Great for couples ready to dive deeper',
    icon: Sparkles,
    color: 'from-purple-500 to-pink-500',
    popular: true,
    category: 'escape'
  },
  {
    id: 'escape_7_10',
    name: 'Ultimate Pack',
    price: 60,
    duration: '7-10 Escapes',
    description: 'All escapes + 10th FREE + Free games!',
    icon: Crown,
    color: 'from-amber-500 to-orange-500',
    bestValue: true,
    bonus: 'Includes FREE 30-day games!',
    category: 'escape'
  }
];

const gamePassOptions: PassOption[] = [
  {
    id: 'game_24h',
    name: '24-Hour Game Pass',
    price: 10,
    duration: '24 hours',
    description: 'Perfect for a game night',
    icon: Clock,
    color: 'from-blue-500 to-cyan-500',
    category: 'game'
  },
  {
    id: 'game_14d',
    name: '14-Day Game Pass',
    price: 20,
    duration: '14 days',
    description: 'Extended access to all games',
    icon: Calendar,
    color: 'from-purple-500 to-pink-500',
    popular: true,
    category: 'game'
  }
];

const allPassOptions = [...escapePassOptions, ...gamePassOptions];

// Payment Form Component
function GiftPaymentForm({ 
  onSuccess, 
  onBack,
  giftCode 
}: { 
  onSuccess: () => void; 
  onBack: () => void;
  giftCode: string;
}) {
  const stripe = useStripe();
  const elements = useElements();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!stripe || !elements) return;

    setLoading(true);
    setError(null);

    try {
      const { error: paymentError, paymentIntent } = await stripe.confirmPayment({
        elements,
        confirmParams: {
          return_url: window.location.origin,
        },
        redirect: 'if_required',
      });

      if (paymentError) {
        setError(paymentError.message || 'Payment failed');
        setLoading(false);
        return;
      }

      if (paymentIntent?.status === 'succeeded') {
        // Confirm the gift payment
        await supabase.functions.invoke('gift-pass-system', {
          body: { 
            action: 'confirm-gift-payment',
            giftCode,
            paymentIntentId: paymentIntent.id
          }
        });

        // Send notification email
        await supabase.functions.invoke('gift-pass-system', {
          body: { 
            action: 'send-gift-notification',
            giftCode
          }
        });

        onSuccess();
      }
    } catch (err: any) {
      setError(err.message || 'Payment failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="bg-gray-800/50 rounded-xl p-4">
        <PaymentElement options={{ layout: 'tabs' }} />
      </div>

      {error && (
        <div className="bg-red-500/20 border border-red-500/50 rounded-lg p-3 text-red-300 text-sm">
          {error}
        </div>
      )}

      <div className="flex gap-3">
        <Button
          type="button"
          variant="outline"
          onClick={onBack}
          className="flex-1"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back
        </Button>
        <Button
          type="submit"
          disabled={!stripe || loading}
          className="flex-1 bg-gradient-to-r from-pink-500 to-purple-500 hover:from-pink-600 hover:to-purple-600"
        >
          {loading ? (
            <span className="flex items-center gap-2">
              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              Processing...
            </span>
          ) : (
            <span className="flex items-center gap-2">
              <Gift className="w-4 h-4" />
              Send Gift
            </span>
          )}
        </Button>
      </div>
    </form>
  );
}

export default function GiftPurchaseModal({ isOpen, onClose, userEmail, userName }: GiftPurchaseModalProps) {
  const [step, setStep] = useState<'category' | 'select' | 'details' | 'payment' | 'success'>('category');
  const [selectedCategory, setSelectedCategory] = useState<PassCategory | null>(null);
  const [selectedPass, setSelectedPass] = useState<string | null>(null);
  const [recipientEmail, setRecipientEmail] = useState('');
  const [recipientName, setRecipientName] = useState('');
  const [personalizedMessage, setPersonalizedMessage] = useState('');
  const [senderName, setSenderName] = useState(userName || '');
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [giftCode, setGiftCode] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const currentPassOptions = selectedCategory === 'escape' ? escapePassOptions : gamePassOptions;
  const selectedPassDetails = allPassOptions.find(p => p.id === selectedPass);

  const handleSelectCategory = (category: PassCategory) => {
    setSelectedCategory(category);
    setStep('select');
  };

  const handleContinueToDetails = () => {
    if (selectedPass) {
      setStep('details');
    }
  };

  const handleContinueToPayment = async () => {
    if (!recipientEmail || !senderName) {
      setError('Please fill in all required fields');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const { data, error: fnError } = await supabase.functions.invoke('gift-pass-system', {
        body: {
          action: 'create-gift-payment',
          senderId: userEmail || 'anonymous',
          senderEmail: userEmail || 'anonymous@gift.com',
          senderName,
          recipientEmail,
          recipientName,
          personalizedMessage,
          passType: selectedPass,
          passCategory: selectedCategory
        }
      });

      if (fnError || data?.error) {
        throw new Error(data?.error || fnError?.message || 'Failed to create gift');
      }

      setClientSecret(data.clientSecret);
      setGiftCode(data.giftCode);
      setStep('payment');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handlePaymentSuccess = () => {
    setStep('success');
  };

  const handleClose = () => {
    setStep('category');
    setSelectedCategory(null);
    setSelectedPass(null);
    setRecipientEmail('');
    setRecipientName('');
    setPersonalizedMessage('');
    setClientSecret(null);
    setGiftCode('');
    setError(null);
    onClose();
  };

  const handleBack = () => {
    if (step === 'select') {
      setStep('category');
      setSelectedCategory(null);
      setSelectedPass(null);
    } else if (step === 'details') {
      setStep('select');
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="bg-gray-900 border-gray-700 text-white max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl">
            <Gift className="w-6 h-6 text-pink-400" />
            {step === 'success' ? 'Gift Sent!' : 'Gift a Pass'}
          </DialogTitle>
        </DialogHeader>

        {/* Step 0: Select Category */}
        {step === 'category' && (
          <div className="space-y-4">
            <p className="text-gray-400 text-sm">
              Choose what type of pass you'd like to gift to a special couple.
            </p>

            <div className="space-y-3">
              <button
                onClick={() => handleSelectCategory('escape')}
                className="w-full p-5 rounded-xl border-2 border-gray-700 bg-gray-800/50 hover:border-pink-500 hover:bg-pink-500/10 transition-all text-left"
              >
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-pink-500 to-rose-500 flex items-center justify-center flex-shrink-0">
                    <Map className="w-7 h-7 text-white" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-bold text-lg">Escape Adventures</h3>
                    <p className="text-sm text-gray-400 mt-1">Gift romantic escape adventures</p>
                    <div className="flex items-center gap-2 mt-2">
                      <span className="text-xs bg-pink-500/20 text-pink-400 px-2 py-0.5 rounded-full">$20 - $60</span>
                      <span className="text-xs text-gray-500">30 days access</span>
                    </div>
                  </div>
                  <ArrowRight className="w-5 h-5 text-gray-500" />
                </div>
              </button>

              <button
                onClick={() => handleSelectCategory('game')}
                className="w-full p-5 rounded-xl border-2 border-gray-700 bg-gray-800/50 hover:border-purple-500 hover:bg-purple-500/10 transition-all text-left"
              >
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center flex-shrink-0">
                    <Gamepad2 className="w-7 h-7 text-white" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-bold text-lg">Game Passes</h3>
                    <p className="text-sm text-gray-400 mt-1">Gift access to intimate games</p>
                    <div className="flex items-center gap-2 mt-2">
                      <span className="text-xs bg-purple-500/20 text-purple-400 px-2 py-0.5 rounded-full">$10 - $20</span>
                      <span className="text-xs text-gray-500">24h - 14 days</span>
                    </div>
                  </div>
                  <ArrowRight className="w-5 h-5 text-gray-500" />
                </div>
              </button>
            </div>
          </div>
        )}

        {/* Step 1: Select Pass */}
        {step === 'select' && (
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-sm text-gray-400">
              <button onClick={handleBack} className="hover:text-white transition-colors">
                <ArrowLeft className="w-4 h-4" />
              </button>
              <span>
                {selectedCategory === 'escape' ? 'Escape Adventures' : 'Game Passes'}
              </span>
            </div>

            <div className="space-y-3">
              {currentPassOptions.map((pass) => {
                const Icon = pass.icon;
                return (
                  <button
                    key={pass.id}
                    onClick={() => setSelectedPass(pass.id)}
                    className={`w-full p-4 rounded-xl border-2 transition-all text-left relative ${
                      selectedPass === pass.id
                        ? 'border-pink-500 bg-pink-500/10'
                        : 'border-gray-700 bg-gray-800/50 hover:border-gray-600'
                    }`}
                  >
                    {pass.popular && (
                      <span className="absolute -top-2 right-4 bg-gradient-to-r from-pink-500 to-purple-500 text-white text-xs px-2 py-0.5 rounded-full">
                        Popular
                      </span>
                    )}
                    {pass.bestValue && (
                      <span className="absolute -top-2 right-4 bg-gradient-to-r from-amber-500 to-orange-500 text-white text-xs px-2 py-0.5 rounded-full">
                        Best Value
                      </span>
                    )}
                    <div className="flex items-start gap-3">
                      <div className={`w-10 h-10 rounded-lg bg-gradient-to-br ${pass.color} flex items-center justify-center flex-shrink-0`}>
                        <Icon className="w-5 h-5 text-white" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <h3 className="font-semibold">{pass.name}</h3>
                          <span className="text-lg font-bold text-pink-400">${pass.price}</span>
                        </div>
                        <p className="text-sm text-gray-400 mt-1">{pass.description}</p>
                        <p className="text-xs text-gray-500 mt-1">{pass.duration}</p>
                        {pass.bonus && (
                          <div className="flex items-center gap-1 mt-2 text-xs text-amber-400">
                            <Trophy className="w-3 h-3" />
                            <span>{pass.bonus}</span>
                          </div>
                        )}
                      </div>
                      {selectedPass === pass.id && (
                        <div className="w-6 h-6 rounded-full bg-pink-500 flex items-center justify-center flex-shrink-0">
                          <Check className="w-4 h-4 text-white" />
                        </div>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>

            <Button
              onClick={handleContinueToDetails}
              disabled={!selectedPass}
              className="w-full bg-gradient-to-r from-pink-500 to-purple-500 hover:from-pink-600 hover:to-purple-600"
            >
              Continue
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </div>
        )}

        {/* Step 2: Recipient Details */}
        {step === 'details' && (
          <div className="space-y-4">
            {selectedPassDetails && (
              <div className={`p-4 rounded-xl bg-gradient-to-br ${selectedPassDetails.color} bg-opacity-20`}>
                <div className="flex items-center gap-3">
                  <selectedPassDetails.icon className="w-8 h-8 text-white" />
                  <div>
                    <h3 className="font-semibold">{selectedPassDetails.name}</h3>
                    <p className="text-sm opacity-80">${selectedPassDetails.price} • {selectedPassDetails.duration}</p>
                  </div>
                </div>
              </div>
            )}

            <div className="space-y-4">
              <div>
                <Label className="text-gray-300 flex items-center gap-2">
                  <User className="w-4 h-4" />
                  Your Name *
                </Label>
                <Input
                  value={senderName}
                  onChange={(e) => setSenderName(e.target.value)}
                  placeholder="Enter your name"
                  className="mt-1 bg-gray-800 border-gray-700"
                />
              </div>

              <div>
                <Label className="text-gray-300 flex items-center gap-2">
                  <Mail className="w-4 h-4" />
                  Recipient's Email *
                </Label>
                <Input
                  type="email"
                  value={recipientEmail}
                  onChange={(e) => setRecipientEmail(e.target.value)}
                  placeholder="couple@example.com"
                  className="mt-1 bg-gray-800 border-gray-700"
                />
              </div>

              <div>
                <Label className="text-gray-300 flex items-center gap-2">
                  <User className="w-4 h-4" />
                  Recipient's Name (optional)
                </Label>
                <Input
                  value={recipientName}
                  onChange={(e) => setRecipientName(e.target.value)}
                  placeholder="Their name"
                  className="mt-1 bg-gray-800 border-gray-700"
                />
              </div>

              <div>
                <Label className="text-gray-300 flex items-center gap-2">
                  <MessageSquare className="w-4 h-4" />
                  Personal Message (optional)
                </Label>
                <Textarea
                  value={personalizedMessage}
                  onChange={(e) => setPersonalizedMessage(e.target.value)}
                  placeholder="Add a heartfelt message to accompany your gift..."
                  className="mt-1 bg-gray-800 border-gray-700 min-h-[100px]"
                  maxLength={500}
                />
                <p className="text-xs text-gray-500 mt-1">{personalizedMessage.length}/500 characters</p>
              </div>
            </div>

            {error && (
              <div className="bg-red-500/20 border border-red-500/50 rounded-lg p-3 text-red-300 text-sm">
                {error}
              </div>
            )}

            <div className="flex gap-3">
              <Button
                variant="outline"
                onClick={() => setStep('select')}
                className="flex-1"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back
              </Button>
              <Button
                onClick={handleContinueToPayment}
                disabled={loading || !recipientEmail || !senderName}
                className="flex-1 bg-gradient-to-r from-pink-500 to-purple-500 hover:from-pink-600 hover:to-purple-600"
              >
                {loading ? (
                  <span className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Loading...
                  </span>
                ) : (
                  <>
                    Continue to Payment
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </>
                )}
              </Button>
            </div>
          </div>
        )}

        {/* Step 3: Payment */}
        {step === 'payment' && clientSecret && (
          <div className="space-y-4">
            <div className="bg-gray-800/50 rounded-xl p-4 space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-400">Gift:</span>
                <span>{selectedPassDetails?.name}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-400">To:</span>
                <span>{recipientEmail}</span>
              </div>
              <div className="flex justify-between text-sm font-semibold border-t border-gray-700 pt-2 mt-2">
                <span>Total:</span>
                <span className="text-pink-400">${selectedPassDetails?.price}</span>
              </div>
            </div>

            <Elements 
              stripe={stripePromise} 
              options={{ 
                clientSecret,
                appearance: {
                  theme: 'night',
                  variables: {
                    colorPrimary: '#ec4899',
                    colorBackground: '#1f2937',
                    colorText: '#ffffff',
                    colorDanger: '#ef4444',
                    fontFamily: 'system-ui, sans-serif',
                    borderRadius: '8px'
                  }
                }
              }}
            >
              <GiftPaymentForm 
                onSuccess={handlePaymentSuccess}
                onBack={() => setStep('details')}
                giftCode={giftCode}
              />
            </Elements>
          </div>
        )}

        {/* Step 4: Success */}
        {step === 'success' && (
          <div className="text-center space-y-6 py-4">
            <div className="w-20 h-20 mx-auto rounded-full bg-gradient-to-br from-pink-500 to-purple-500 flex items-center justify-center">
              <Sparkles className="w-10 h-10 text-white" />
            </div>

            <div>
              <h3 className="text-2xl font-bold mb-2">Gift Sent Successfully!</h3>
              <p className="text-gray-400">
                Your gift has been sent to <span className="text-pink-400">{recipientEmail}</span>
              </p>
            </div>

            <div className="bg-gray-800/50 rounded-xl p-4 space-y-3">
              <div className="flex items-center justify-center gap-2 text-gray-400">
                <Gift className="w-5 h-5" />
                <span>Gift Code</span>
              </div>
              <p className="text-2xl font-mono font-bold text-pink-400 tracking-wider">
                {giftCode}
              </p>
              <p className="text-xs text-gray-500">
                The recipient will receive an email with this code and redemption instructions.
              </p>
            </div>

            {personalizedMessage && (
              <div className="bg-gray-800/30 rounded-xl p-4 border-l-4 border-pink-500">
                <p className="text-sm text-gray-300 italic">"{personalizedMessage}"</p>
                <p className="text-xs text-gray-500 mt-2">- {senderName}</p>
              </div>
            )}

            <Button
              onClick={handleClose}
              className="w-full bg-gradient-to-r from-pink-500 to-purple-500 hover:from-pink-600 hover:to-purple-600"
            >
              <Heart className="w-4 h-4 mr-2" />
              Done
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
