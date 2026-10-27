import React, { useState } from 'react';
import { Eye, EyeOff, AlertCircle, CheckCircle2 } from 'lucide-react';
import { IngressLogo } from './IngressLogo';

interface LoginPageProps {
  onLoginSuccess: (user: { staffId: string; name: string; role: string }) => void;
  theme: 'light' | 'dark';
  onToggleTheme: () => void;
}

export const LoginPage: React.FC<LoginPageProps> = ({ 
  onLoginSuccess,
}) => {
  const [staffId, setStaffId] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [rememberMe, setRememberMe] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isSuccess, setIsSuccess] = useState<boolean>(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    const trimmedStaffId = staffId.trim();
    const trimmedPassword = password.trim();

    if (!trimmedStaffId || !trimmedPassword) {
      setErrorMsg('Please enter both Staff ID and Password to continue.');
      return;
    }

    setIsLoading(true);

    // Validate credentials: Admin01 / Ingcorp@123
    setTimeout(() => {
      if (
        trimmedStaffId.toLowerCase() === 'admin01' && 
        trimmedPassword === 'Ingcorp@123'
      ) {
        setIsSuccess(true);
        const userData = {
          staffId: 'Admin01',
          name: 'System Administrator',
          role: 'HQ General Manager (ADD)',
          loginAt: new Date().toISOString()
        };

        if (rememberMe) {
          localStorage.setItem('ingress_auth_user', JSON.stringify(userData));
        } else {
          sessionStorage.setItem('ingress_auth_user', JSON.stringify(userData));
        }

        setTimeout(() => {
          onLoginSuccess({
            staffId: 'Admin01',
            name: 'System Administrator',
            role: 'HQ General Manager (ADD)'
          });
        }, 500);
      } else {
        setIsLoading(false);
        setErrorMsg('These credentials do not match our records. Please try again.');
      }
    }, 450);
  };

  return (
    <div className="min-h-screen h-screen flex overflow-hidden font-sans antialiased bg-gray-50 text-gray-900">
      {/* Left Column: Brand Showcase (Hidden on Mobile, 50% width on Desktop) */}
      <div className="hidden lg:flex lg:w-1/2 relative bg-[#1c1d21] text-white flex-shrink-0">
        {/* Subtle Corporate Radial Gradients */}
        <div 
          className="absolute inset-0 opacity-40 pointer-events-none"
          style={{
            backgroundImage: 'radial-gradient(circle at 25% 20%, #8f043b66 0, transparent 45%), radial-gradient(circle at 80% 70%, #b6b6b822 0, transparent 50%)'
          }}
        />

        {/* Content Container */}
        <div className="relative z-10 flex flex-col justify-between p-12 w-full">
          {/* Top Logo & Division Header */}
          <div className="flex items-center gap-3">
            <IngressLogo className="h-8 w-auto shrink-0 shadow-sm" alt="Ingress Corporation Berhad" />
            <span className="leading-tight">
              <span className="block text-sm font-semibold text-white">ADD Dealership Sales Dashboard</span>
              <span className="block text-[11px] text-gray-400">IIT Group</span>
            </span>
          </div>

          {/* Main Hero Dealership Copy */}
          <div className="space-y-6 max-w-lg">
            <h1 className="text-4xl xl:text-5xl font-bold leading-tight tracking-tight text-white">
              Dealership Performance &amp; Sales Intelligence Dashboard.
            </h1>
            <p className="text-lg text-gray-300 leading-relaxed">
              Real-time monitoring of vehicle bookings, cancellations, conversion funnels, and inventory stock across all authorized dealership branches.
            </p>
            <div className="flex flex-wrap items-center gap-y-3 gap-x-6 pt-4 text-sm font-medium text-gray-300">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full" style={{ backgroundColor: '#8f043b' }} />
                <span>Bookings &amp; Registrations</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-400" />
                <span>Conversion Funnel</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-cyan-400" />
                <span>Bank LOU Approval</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-amber-400" />
                <span>Stock &amp; Inventory</span>
              </div>
            </div>
          </div>

          {/* Footer Copyright matching dashboard page */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 text-xs text-gray-400 font-mono">
            <span>@ 2026 INGRESS CORPORATION BERHAD. Dealership Dashboard for ADD.</span>
            <span className="text-gray-500">Security Encrypted</span>
          </div>
        </div>

        {/* Ambient Blur Orbs */}
        <div 
          className="absolute top-0 right-0 w-96 h-96 rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl pointer-events-none opacity-20"
          style={{ backgroundColor: '#8f043b' }}
        />
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-white/5 rounded-full translate-y-1/2 -translate-x-1/2 blur-3xl pointer-events-none" />
      </div>

      {/* Right Column: Sign In Form (Full width on mobile, 50% on desktop) */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 sm:p-8 bg-gray-50 overflow-y-auto">
        <div className="w-full max-w-md">
          {/* Mobile Top Branding */}
          <div className="lg:hidden mb-8 flex items-center justify-center gap-3">
            <span className="flex items-center rounded bg-[#1c1d21] px-2.5 py-1.5 shrink-0 shadow-sm">
              <IngressLogo className="h-6 w-auto" alt="Ingress Corporation Berhad" />
            </span>
            <span className="text-sm font-semibold text-gray-900">ADD Dealership Sales Dashboard</span>
          </div>

          {/* Clean White Card */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
            {/* Form Header */}
            <div className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900">Welcome back</h2>
              <p className="mt-1 text-sm text-gray-500">Sign in to your account to continue.</p>
            </div>

            {/* Error Message */}
            {errorMsg && (
              <div className="mb-6 p-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm flex items-start gap-2.5">
                <AlertCircle className="w-4 h-4 text-red-500 flex-shrink-0 mt-0.5" />
                <span className="leading-snug">{errorMsg}</span>
              </div>
            )}

            {/* Sign In Form */}
            <form onSubmit={handleSubmit} className="space-y-5" noValidate>
              {/* Staff ID Input */}
              <div>
                <label 
                  htmlFor="staffId" 
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Staff ID
                </label>
                <input
                  id="staffId"
                  name="staffId"
                  type="text"
                  value={staffId}
                  onChange={(e) => setStaffId(e.target.value)}
                  placeholder="Enter your staff id"
                  autoFocus
                  autoComplete="username"
                  required
                  className="block w-full rounded-md border-0 px-3 h-10 bg-white text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-inset sm:text-sm transition-shadow"
                  style={{
                    ['--tw-ring-focus' as any]: '#8f043b'
                  }}
                  onFocus={(e) => {
                    e.currentTarget.style.boxShadow = '0 0 0 2px #8f043b';
                  }}
                  onBlur={(e) => {
                    e.currentTarget.style.boxShadow = '';
                  }}
                />
              </div>

              {/* Password Input */}
              <div>
                <label 
                  htmlFor="password" 
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Password
                </label>
                <div className="relative">
                  <input
                    id="password"
                    name="password"
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    autoComplete="current-password"
                    required
                    className="block w-full rounded-md border-0 px-3 pr-10 h-10 bg-white text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-inset sm:text-sm transition-shadow"
                    onFocus={(e) => {
                      e.currentTarget.style.boxShadow = '0 0 0 2px #8f043b';
                    }}
                    onBlur={(e) => {
                      e.currentTarget.style.boxShadow = '';
                    }}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600 cursor-pointer"
                    title={showPassword ? 'Hide password' : 'Show password'}
                  >
                    {showPassword ? (
                      <EyeOff className="w-4 h-4" />
                    ) : (
                      <Eye className="w-4 h-4" />
                    )}
                  </button>
                </div>
              </div>

              {/* Remember Me */}
              <div className="flex items-center justify-between">
                <label htmlFor="remember" className="inline-flex items-center gap-2 text-sm text-gray-600 cursor-pointer select-none">
                  <input
                    id="remember"
                    name="remember"
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="rounded border-gray-300 text-[#8f043b] focus:ring-[#8f043b] cursor-pointer"
                    style={{ accentColor: '#8f043b' }}
                  />
                  <span>Remember me</span>
                </label>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isLoading || isSuccess}
                className="w-full inline-flex justify-center items-center gap-2 px-4 py-2.5 text-white text-sm font-semibold rounded-md transition focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-60 cursor-pointer shadow-sm"
                style={{ 
                  backgroundColor: '#8f043b'
                }}
                onMouseEnter={(e) => {
                  if (!isLoading && !isSuccess) {
                    e.currentTarget.style.backgroundColor = '#780331';
                  }
                }}
                onMouseLeave={(e) => {
                  if (!isLoading && !isSuccess) {
                    e.currentTarget.style.backgroundColor = '#8f043b';
                  }
                }}
              >
                {isLoading ? (
                  <span className="flex items-center gap-2">
                    <svg className="animate-spin h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    <span>Signing in…</span>
                  </span>
                ) : isSuccess ? (
                  <span className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-white" />
                    <span>Access Granted</span>
                  </span>
                ) : (
                  <span>Sign in</span>
                )}
              </button>
            </form>
          </div>

          {/* Mobile Footer matching dashboard page */}
          <div className="mt-6 text-center text-xs font-mono text-gray-500 lg:hidden space-y-1">
            <p>@ 2026 INGRESS CORPORATION BERHAD. Dealership Dashboard for ADD.</p>
            <p className="text-gray-400 text-[11px]">Security Encrypted</p>
          </div>
        </div>
      </div>
    </div>
  );
};
