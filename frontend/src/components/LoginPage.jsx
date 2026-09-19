import { useState } from "react";
import { BrandLogo } from "./BrandLogo";

function Field({ label, type, value, onChange }) {
  const [focused, setFocused] = useState(false);
  return (
    <div className={`field ${focused ? 'is-focused' : ''} ${value ? 'has-value' : ''}`}>
      <label className="field__label">{label}</label>
      <input
        className="field__input"
        type={type}
        value={value}
        onChange={e => onChange(e.target.value)}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        autoComplete="off"
      />
    </div>
  );
}

export function LoginPage({ onLogin, navigateTo }) {
  const [email, setEmail]       = useState('');
  const [password, setPassword] = useState('');
  const [error, setError]       = useState('');
  const [loading, setLoading]   = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (!email || !password) { setError('Please fill in all fields.'); return; }
    setLoading(true);
    const success = await onLogin(email, password);
    setLoading(false);
    if (!success) setError('Invalid email or password.');
  };

  return (
    <div className="auth-root">
      {/* ── Left panel ── */}
      <div className="auth-panel dot-grid--dark">
        <div className="flex-col">
          <div className="flex items-center gap-sm" style={{ marginBottom: '80px' }}>
            <BrandLogo size="lg" />
          </div>
          <h2 className="auth-panel__headline">
            Welcome<br />back,<br /><em className="serif-accent">Inkotanyi.</em>
          </h2>
          <p className="auth-panel__sub">
            Sign in to the FPR Inkotanyi member portal.
          </p>
        </div>
        <div className="flex-col">
          <p className="t-body t-light-muted">
            New here?
            <button className="form-toggle__btn" style={{ marginLeft: '8px', color: 'var(--white)', borderBottom: '1px solid rgba(255,255,255,0.3)' }} 
              onClick={() => navigateTo('register')}>
              Create an account
            </button>
          </p>
        </div>
      </div>

      {/* ── Right form ── */}
      <div className="auth-form-side dot-grid">
        <div className="auth-form-inner">
          <div className="eyebrow">Member access</div>
          <h1 className="t-heading-xl" style={{ marginBottom: '12px', fontSize: '48px' }}>
            Sign <em className="serif-accent">in</em>
          </h1>
          <p className="t-body" style={{ marginBottom: '48px', color: 'var(--text-faint)' }}>
            Use your approved Inkotanyi account email and password.
          </p>

          {error && (
            <div className="alert alert--error">
              <svg className="alert__icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
              </svg>
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div className="form-fields">
              <Field label="Email Address" type="email"    value={email}    onChange={setEmail} />
              <Field label="Password"      type="password" value={password} onChange={setPassword} />
            </div>

            <div className="form-forgot">
              <button type="button" className="form-forgot__btn" onClick={() => navigateTo('forgot-password')}>
                Forgot password?
              </button>
            </div>

            <div className="form-actions">
              <button type="submit" className="btn btn--primary" disabled={loading} style={{ padding: '16px 48px' }}>
                <span>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="10 17 15 12 10 7"/><line x1="15" y1="12" x2="3" y2="12"/>
                  </svg>
                  {loading ? 'Signing in…' : 'Sign In'}
                </span>
              </button>
              <button type="button" className="form-toggle__btn" onClick={() => navigateTo('home')}>
                ← Back to Home
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}