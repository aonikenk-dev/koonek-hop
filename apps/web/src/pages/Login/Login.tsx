import { useState, type FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { clsx } from 'clsx';
import { Eye, EyeOff, LogIn, Building2, AlertCircle } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useApp } from '@/contexts/AppContext';
import { organization } from '@/data/config/organization';
import { KoonekIsotipo } from '@/components/ui/KoonekLogo';
import Input from '@/components/ui/Input';
import Button from '@/components/ui/Button';

// Terrain polyline decoration, from the brand manual's cover/hero sections.
function TerrainSVG() {
  return (
    <svg
      className="absolute bottom-0 left-0 right-0 w-full"
      viewBox="0 0 1440 120"
      preserveAspectRatio="none"
      style={{ height: 120, opacity: 0.07 }}
    >
      <polyline
        points="0,100 180,74 360,90 540,50 720,67 900,33 1080,53 1260,20 1440,37 1440,120 0,120"
        fill="none"
        stroke="#3D6B4F"
        strokeWidth="1.2"
      />
      <polyline
        points="0,110 200,97 400,105 600,85 800,99 1000,77 1200,92 1440,70 1440,120 0,120"
        fill="none"
        stroke="#7BAFC4"
        strokeWidth="1.2"
      />
    </svg>
  );
}

function GridBg() {
  return (
    <div
      className="absolute inset-0 pointer-events-none"
      style={{
        backgroundImage: 'radial-gradient(circle, rgba(61,107,79,0.5) 1px, transparent 1px)',
        backgroundSize: '28px 28px',
        maskImage: 'radial-gradient(ellipse 80% 80% at 50% 50%, black 20%, transparent 100%)',
      }}
    />
  );
}

export default function Login() {
  const { login } = useAuth();
  const { t } = useApp();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    const result = await login(email, password);
    setLoading(false);
    if (result.ok) {
      navigate('/dashboard', { replace: true });
    } else {
      setError(t('login.error'));
    }
  };

  return (
    <div className="flex h-screen overflow-hidden">
      {/* Left panel: brand */}
      <div
        className="hidden lg:flex flex-col justify-between relative overflow-hidden w-[44%] shrink-0 px-12 py-10"
        style={{ background: '#0D0F12' }}
      >
        <GridBg />

        <div className="absolute inset-0 pointer-events-none">
          <div
            className="absolute"
            style={{
              width: '60%',
              height: '50%',
              top: '30%',
              left: '20%',
              background: 'radial-gradient(ellipse, rgba(61,107,79,0.10) 0%, transparent 70%)',
            }}
          />
          <div
            className="absolute"
            style={{
              width: '40%',
              height: '35%',
              top: '5%',
              right: '0%',
              background: 'radial-gradient(ellipse, rgba(123,175,196,0.08) 0%, transparent 70%)',
            }}
          />
        </div>

        <div className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-1/3 opacity-[0.04] pointer-events-none">
          <KoonekIsotipo size={320} variant="dark" />
        </div>

        <div className="relative z-10 flex items-center gap-3">
          <KoonekIsotipo size={36} variant="dark" />
          <div>
            <p className="font-display font-bold text-xl text-white tracking-tight leading-none">
              Koonek<span className="ml-1 font-mono font-light text-glacier">HOP</span>
            </p>
            <p className="font-mono font-light text-2xs tracking-[.08em] uppercase text-white/30 mt-1">
              AI-powered Healthcare Operations Platform
            </p>
          </div>
        </div>

        <div className="relative z-10 space-y-6">
          <div>
            <h1
              className="font-display font-bold text-white leading-none tracking-tight"
              style={{ fontSize: 'clamp(36px, 4vw, 52px)' }}
            >
              {t('login.heroTitle1')}
              <br />
              {t('login.heroTitle2')}
              <br />
              {t('login.heroTitle3')}
            </h1>
            <p className="font-mono font-light text-2xs tracking-[.18em] uppercase text-white/30 mt-1">
              {t('login.heroTagline')}
            </p>
            <p className="font-mono text-sm text-white/40 mt-5 leading-relaxed max-w-xs">
              {t('login.heroDescription')}
            </p>
          </div>
        </div>

        <div className="relative z-10">
          <TerrainSVG />
          <p className="font-mono text-2xs text-white/25 tracking-widest uppercase">
            {t('login.poweredBy')} aonikenk.dev
          </p>
        </div>
      </div>

      {/* Right panel: form */}
      <div className="flex-1 flex items-center justify-center bg-bg px-6 py-10 overflow-y-auto">
        <div className="w-full max-w-sm">
          <div className="flex lg:hidden items-center gap-3 mb-10">
            <KoonekIsotipo size={32} variant="light" />
            <span className="font-display font-bold text-xl text-text tracking-tight">
              Koonek<span className="ml-1 font-mono font-light text-moss">HOP</span>
            </span>
          </div>

          <div className="flex items-center gap-2 mb-8">
            <div className="flex items-center gap-1.5 px-2.5 py-1.5 rounded border border-border bg-surface">
              {organization.logoUrl ? (
                <img src={organization.logoUrl} alt={organization.name} className="w-8 object-contain" />
              ) : (
                <Building2 size={12} className="text-muted" />
              )}
              <div className="flex flex-col">
                <span className="font-mono text-xs text-text">{organization.name}</span>
                <span className="text-2xs font-mono text-muted tracking-wide">{organization.specialty}</span>
              </div>
            </div>
          </div>

          <h2 className="font-display font-bold text-2xl text-text tracking-tight leading-tight mb-1">
            {t('login.heading')}
          </h2>
          <p className="font-mono text-sm text-muted mb-8">{t('login.subheading')}</p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              type="email"
              label={t('login.email')}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder={t('login.emailPlaceholder')}
              required
              invalid={Boolean(error)}
            />

            <div className="space-y-1.5">
              <label className="text-2xs font-mono text-muted uppercase tracking-wide">
                {t('login.password')}
              </label>
              <div className="relative">
                <Input
                  type={showPw ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  className="pr-10"
                  invalid={Boolean(error)}
                />
                <button
                  type="button"
                  onClick={() => setShowPw((v) => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted hover:text-text transition-colors"
                  tabIndex={-1}
                >
                  {showPw ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
            </div>

            {error && (
              <div className="flex items-center gap-2 px-3 py-2.5 rounded border border-sienna/30 bg-sienna/5">
                <AlertCircle size={14} className="text-sienna shrink-0" />
                <p className="text-xs text-sienna font-mono">{error}</p>
              </div>
            )}

            <Button
              type="submit"
              disabled={loading}
              className={clsx('w-full justify-center py-2.5 text-sm gap-2 mt-2', loading && 'opacity-60 cursor-not-allowed')}
            >
              {loading ? (
                <span className="animate-pulse">{t('login.submitting')}</span>
              ) : (
                <>
                  <LogIn size={15} /> {t('login.submit')}
                </>
              )}
            </Button>
          </form>

          <div className="mt-8 p-4 rounded border border-dashed border-border bg-surface">
            <p className="text-2xs text-muted uppercase tracking-wide mb-2 font-mono">{t('login.demoHint')}</p>
            <div className="space-y-1">
              <p className="text-xs font-mono text-text">
                <span className="text-muted">{t('login.demoEmailLabel')}</span>admin@koonek.app
              </p>
              <p className="text-xs font-mono text-text">
                <span className="text-muted">{t('login.demoPasswordLabel')}</span>koonek2026
              </p>
            </div>
          </div>

          <p className="mt-8 text-center font-mono text-2xs text-muted tracking-wide">
            {t('login.poweredBy')} <span className="text-sienna">aonikenk.dev</span>
          </p>
        </div>
      </div>
    </div>
  );
}
