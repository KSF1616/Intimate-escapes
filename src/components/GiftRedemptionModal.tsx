import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { supabase } from '@/lib/supabase';
import { Gift, Sparkles, Check, AlertCircle, Heart, Clock, Calendar, Crown, Loader2, Map, Gamepad2, Trophy } from 'lucide-react';

interface GiftRedemptionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onRedeemed: (passType: string, expiresAt: string) => void;
  userEmail?: string;
  userId?: string;
  initialCode?: string;
}

interface GiftDetails {
  pass_type: string;
  pass_category: 'escape' | 'game' | 'legacy';
  passName: string;
  passDuration: string;
  sender_name: string;
  personalized_message: string;
  isExpired: boolean;
  isRedeemed: boolean;
  isPending: boolean;
  escapes_total?: number;
}

export default function GiftRedemptionModal({ 
  isOpen, 
  onClose, 
  onRedeemed,
  userEmail,
  userId,
  initialCode = ''
}: GiftRedemptionModalProps) {
  const [giftCode, setGiftCode] = useState(initialCode);
  const [step, setStep] = useState<'enter' | 'preview' | 'success'>('enter');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [giftDetails, setGiftDetails] = useState<GiftDetails | null>(null);
  const [redemptionResult, setRedemptionResult] = useState<{
    passName: string;
    expiresAt: string;
    senderName: string;
    message: string;
    escapesTotal?: number;
  } | null>(null);

  const getPassIcon = (passType: string) => {
    switch (passType) {
      case 'escape_1_3':
      case 'escape_4_6':
      case 'escape_7_10':
        return Map;
      case 'game_24h':
      case 'game_14d':
      case 'game_30d_free':
        return Gamepad2;
      case 'day': 
        return Clock;
      case 'weekend': 
        return Calendar;
      case 'annual': 
        return Crown;
      default: 
        return Gift;
    }
  };

  const getPassColor = (passType: string) => {
    switch (passType) {
      case 'escape_1_3':
        return 'from-pink-500 to-rose-500';
      case 'escape_4_6':
        return 'from-purple-500 to-pink-500';
      case 'escape_7_10':
        return 'from-amber-500 to-orange-500';
      case 'game_24h':
        return 'from-blue-500 to-cyan-500';
      case 'game_14d':
        return 'from-purple-500 to-pink-500';
      case 'game_30d_free':
        return 'from-green-500 to-emerald-500';
      case 'day': 
        return 'from-pink-500 to-rose-500';
      case 'weekend': 
        return 'from-purple-500 to-pink-500';
      case 'annual': 
        return 'from-amber-500 to-orange-500';
      default: 
        return 'from-pink-500 to-purple-500';
    }
  };

  const getPassName = (passType: string): string => {
    switch (passType) {
      case 'escape_1_3':
        return 'Starter Pack (1-3 Escapes)';
      case 'escape_4_6':
        return 'Explorer Pack (4-6 Escapes)';
      case 'escape_7_10':
        return 'Ultimate Pack (7-10 Escapes)';
      case 'game_24h':
        return '24-Hour Game Pass';
      case 'game_14d':
        return '14-Day Game Pass';
      case 'game_30d_free':
        return '30-Day Game Pass';
      case 'day':
        return '24-Hour Pass';
      case 'weekend':
        return 'Weekend Pass';
      case 'annual':
        return 'Annual Pass';
      default:
        return 'Adventure Pass';
    }
  };

  const formatGiftCode = (value: string) => {
    // Remove all non-alphanumeric characters
    const cleaned = value.toUpperCase().replace(/[^A-Z0-9]/g, '');
    
    // Format as GIFT-XXXX-XXXX-XXXX-XXXX
    let formatted = '';
    if (cleaned.startsWith('GIFT')) {
      formatted = 'GIFT-';
      const rest = cleaned.slice(4);
      for (let i = 0; i < rest.length && i < 16; i++) {
        if (i > 0 && i % 4 === 0) formatted += '-';
        formatted += rest[i];
      }
    } else {
      for (let i = 0; i < cleaned.length && i < 20; i++) {
        if (i === 4 || (i > 4 && (i - 4) % 4 === 0)) formatted += '-';
        formatted += cleaned[i];
      }
    }
    
    return formatted;
  };

  const handleCodeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatGiftCode(e.target.value);
    setGiftCode(formatted);
    setError(null);
  };

  const handleCheckCode = async () => {
    if (!giftCode || giftCode.length < 10) {
      setError('Please enter a valid gift code');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const { data, error: fnError } = await supabase.functions.invoke('gift-pass-system', {
        body: {
          action: 'check-gift-code',
          giftCode
        }
      });

      if (fnError) {
        throw new Error(fnError.message);
      }

      if (!data.success || !data.valid) {
        if (data.giftPass?.isExpired) {
          setError('This gift code has expired');
        } else if (data.giftPass?.isRedeemed) {
          setError('This gift has already been redeemed');
        } else if (data.giftPass?.isPending) {
          setError('This gift payment has not been completed yet');
        } else {
          setError(data.message || 'Invalid gift code');
        }
        return;
      }

      setGiftDetails({
        ...data.giftPass,
        passName: getPassName(data.giftPass.pass_type)
      });
      setStep('preview');
    } catch (err: any) {
      setError(err.message || 'Failed to verify gift code');
    } finally {
      setLoading(false);
    }
  };

  const handleRedeem = async () => {
    setLoading(true);
    setError(null);

    try {
      const { data, error: fnError } = await supabase.functions.invoke('gift-pass-system', {
        body: {
          action: 'redeem-gift',
          giftCode,
          userId: userId || userEmail,
          userEmail
        }
      });

      if (fnError || !data.success) {
        throw new Error(data?.error || fnError?.message || 'Failed to redeem gift');
      }

      setRedemptionResult({
        passName: data.passName || getPassName(data.passType),
        expiresAt: data.expiresAt,
        senderName: data.senderName,
        message: data.personalizedMessage,
        escapesTotal: data.escapesTotal
      });
      setStep('success');
      onRedeemed(data.passType, data.expiresAt);
    } catch (err: any) {
      setError(err.message || 'Failed to redeem gift');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setStep('enter');
    setGiftCode(initialCode);
    setGiftDetails(null);
    setRedemptionResult(null);
    setError(null);
    onClose();
  };

  const PassIcon = giftDetails ? getPassIcon(giftDetails.pass_type) : Gift;

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="bg-gray-900 border-gray-700 text-white max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl">
            <Gift className="w-6 h-6 text-pink-400" />
            {step === 'success' ? 'Gift Redeemed!' : 'Redeem a Gift'}
          </DialogTitle>
        </DialogHeader>

        {/* Step 1: Enter Code */}
        {step === 'enter' && (
          <div className="space-y-6">
            <div className="text-center">
              <div className="w-16 h-16 mx-auto rounded-full bg-gradient-to-br from-pink-500/20 to-purple-500/20 flex items-center justify-center mb-4">
                <Gift className="w-8 h-8 text-pink-400" />
              </div>
              <p className="text-gray-400 text-sm">
                Enter the gift code you received to unlock your adventure pass.
              </p>
            </div>

            <div className="space-y-2">
              <Input
                value={giftCode}
                onChange={handleCodeChange}
                placeholder="GIFT-XXXX-XXXX-XXXX-XXXX"
                className="bg-gray-800 border-gray-700 text-center text-lg font-mono tracking-wider"
                maxLength={24}
              />
              <p className="text-xs text-gray-500 text-center">
                The code was sent to you via email
              </p>
            </div>

            {error && (
              <div className="bg-red-500/20 border border-red-500/50 rounded-lg p-3 flex items-start gap-2">
                <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
                <p className="text-red-300 text-sm">{error}</p>
              </div>
            )}

            <Button
              onClick={handleCheckCode}
              disabled={loading || giftCode.length < 10}
              className="w-full bg-gradient-to-r from-pink-500 to-purple-500 hover:from-pink-600 hover:to-purple-600"
            >
              {loading ? (
                <span className="flex items-center gap-2">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Checking...
                </span>
              ) : (
                'Check Gift Code'
              )}
            </Button>
          </div>
        )}

        {/* Step 2: Preview Gift */}
        {step === 'preview' && giftDetails && (
          <div className="space-y-6">
            <div className={`p-6 rounded-xl bg-gradient-to-br ${getPassColor(giftDetails.pass_type)} text-white text-center`}>
              <PassIcon className="w-12 h-12 mx-auto mb-3" />
              <h3 className="text-2xl font-bold">{giftDetails.passName}</h3>
              <p className="opacity-90">{giftDetails.passDuration}</p>
              {giftDetails.escapes_total && (
                <div className="mt-2 inline-flex items-center gap-1 bg-white/20 px-3 py-1 rounded-full text-sm">
                  <Map className="w-4 h-4" />
                  {giftDetails.escapes_total} Escapes Included
                </div>
              )}
              {giftDetails.pass_type === 'escape_7_10' && (
                <div className="mt-2 inline-flex items-center gap-1 bg-green-500/30 px-3 py-1 rounded-full text-sm">
                  <Trophy className="w-4 h-4" />
                  + FREE 30-Day Game Access!
                </div>
              )}
            </div>

            <div className="bg-gray-800/50 rounded-xl p-4 space-y-3">
              <div className="flex items-center gap-2 text-gray-400">
                <Heart className="w-4 h-4 text-pink-400" />
                <span className="text-sm">From: <span className="text-white">{giftDetails.sender_name}</span></span>
              </div>
              
              {giftDetails.personalized_message && (
                <div className="bg-gray-800/50 rounded-lg p-3 border-l-4 border-pink-500">
                  <p className="text-sm text-gray-300 italic">"{giftDetails.personalized_message}"</p>
                </div>
              )}
            </div>

            {error && (
              <div className="bg-red-500/20 border border-red-500/50 rounded-lg p-3 flex items-start gap-2">
                <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
                <p className="text-red-300 text-sm">{error}</p>
              </div>
            )}

            <div className="flex gap-3">
              <Button
                variant="outline"
                onClick={() => setStep('enter')}
                className="flex-1"
              >
                Back
              </Button>
              <Button
                onClick={handleRedeem}
                disabled={loading}
                className="flex-1 bg-gradient-to-r from-pink-500 to-purple-500 hover:from-pink-600 hover:to-purple-600"
              >
                {loading ? (
                  <span className="flex items-center gap-2">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Redeeming...
                  </span>
                ) : (
                  <span className="flex items-center gap-2">
                    <Sparkles className="w-4 h-4" />
                    Redeem Gift
                  </span>
                )}
              </Button>
            </div>
          </div>
        )}

        {/* Step 3: Success */}
        {step === 'success' && redemptionResult && (
          <div className="text-center space-y-6 py-4">
            <div className="w-20 h-20 mx-auto rounded-full bg-gradient-to-br from-green-500 to-emerald-500 flex items-center justify-center">
              <Check className="w-10 h-10 text-white" />
            </div>

            <div>
              <h3 className="text-2xl font-bold mb-2">Congratulations!</h3>
              <p className="text-gray-400">
                Your <span className="text-pink-400">{redemptionResult.passName}</span> is now active!
              </p>
            </div>

            <div className="bg-gray-800/50 rounded-xl p-4 space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-400">Pass Type:</span>
                <span>{redemptionResult.passName}</span>
              </div>
              {redemptionResult.escapesTotal && (
                <div className="flex justify-between text-sm">
                  <span className="text-gray-400">Escapes Available:</span>
                  <span className="text-pink-400">{redemptionResult.escapesTotal}</span>
                </div>
              )}
              <div className="flex justify-between text-sm">
                <span className="text-gray-400">Valid Until:</span>
                <span className="text-green-400">
                  {new Date(redemptionResult.expiresAt).toLocaleDateString('en-US', {
                    weekday: 'short',
                    month: 'short',
                    day: 'numeric',
                    year: 'numeric',
                    hour: 'numeric',
                    minute: '2-digit'
                  })}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-400">Gift From:</span>
                <span>{redemptionResult.senderName}</span>
              </div>
            </div>

            {redemptionResult.message && (
              <div className="bg-gray-800/30 rounded-xl p-4 border-l-4 border-pink-500">
                <p className="text-sm text-gray-300 italic">"{redemptionResult.message}"</p>
                <p className="text-xs text-gray-500 mt-2">- {redemptionResult.senderName}</p>
              </div>
            )}

            <Button
              onClick={handleClose}
              className="w-full bg-gradient-to-r from-pink-500 to-purple-500 hover:from-pink-600 hover:to-purple-600"
            >
              <Sparkles className="w-4 h-4 mr-2" />
              Start Your Adventure
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
