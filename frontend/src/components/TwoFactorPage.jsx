import { useState } from 'react';
import { motion } from 'framer-motion';
import { Shield, ArrowLeft, Mail } from 'lucide-react';
import { ImageWithFallback } from './figma/ImageWithFallback';
import { toast } from 'sonner';
import { api } from '../lib/api';

export function TwoFactorPage({ email, onVerify, navigateTo }) {
  const [code, setCode] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!code || code.length !== 6) {
      toast.error('Please enter a valid 6-digit code');
      return;
    }

    setIsLoading(true);
    try {
      const result = await api.verify2FA(email, code);
      if (result.success) {
        onVerify(result.data);
        toast.success('Login successful!');
      } else {
        toast.error(result.message || 'Invalid code');
      }
    } catch (error) {
      toast.error(error.message || 'Verification failed');
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendCode = async () => {
    try {
      await api.resend2FA(email);
      toast.success('New code sent to your email');
    } catch (error) {
      toast.error('Failed to resend code');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#F4F4F4] to-[#D6EEF8] flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl overflow-hidden w-full max-w-4xl">
        <div className="flex flex-col md:flex-row">
          {/* Left Side - Image */}
          <div className="md:w-1/2 relative h-64 md:h-auto">
            <ImageWithFallback
              src="/hero-inkotanyi.png"
              alt="Two Factor Authentication"
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-br from-[#1E2426]/85 to-[#2990CB]/80"></div>
            <div className="absolute inset-0 flex items-center justify-center p-8">
              <div className="text-center text-white">
                <Shield className="w-16 h-16 mx-auto mb-4" />
                <h1 className="text-3xl md:text-4xl font-bold mb-4">Secure Login</h1>
                <p className="text-lg opacity-90">
                  Two-factor authentication keeps your account safe.
                </p>
              </div>
            </div>
          </div>

          {/* Right Side - Form */}
          <div className="md:w-1/2 p-8 md:p-12">
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
            >
              <button
                onClick={() => navigateTo('login')}
                className="flex items-center gap-2 text-gray-600 hover:text-gray-800 mb-6 transition-colors"
              >
                <ArrowLeft className="w-4 h-4" />
                Back to Login
              </button>

              <h2 className="text-2xl font-bold text-gray-900 mb-2">Enter Verification Code</h2>
              <p className="text-gray-600 mb-8">
                We've sent a 6-digit code to <strong>{email}</strong>. 
                Enter it below to complete your login.
              </p>

              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Verification Code
                  </label>
                  <input
                    type="text"
                    value={code}
                    onChange={(e) => setCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-700 focus:border-transparent text-center text-2xl tracking-widest"
                    placeholder="000000"
                    maxLength={6}
                    required
                  />
                  <p className="text-sm text-gray-500 mt-2">
                    Enter the 6-digit code from your email
                  </p>
                </div>

                <button
                  type="submit"
                  disabled={isLoading || code.length !== 6}
                  className="w-full bg-[#E21526] hover:bg-[#C01020] text-white py-3 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {isLoading ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      Verifying...
                    </>
                  ) : (
                    <>
                      <Shield className="w-4 h-4" />
                      Verify & Login
                    </>
                  )}
                </button>

                <div className="text-center">
                  <button
                    type="button"
                    onClick={handleResendCode}
                    className="text-[#2DA5DE] hover:text-[#2990CB] text-sm font-medium flex items-center gap-1 mx-auto"
                  >
                    <Mail className="w-4 h-4" />
                    Resend Code
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
}