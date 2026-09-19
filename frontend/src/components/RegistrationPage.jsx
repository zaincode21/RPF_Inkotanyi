import { useState } from "react";
import { BrandLogo } from "./BrandLogo";

function Field({ label, type, value, onChange, disabled }) {
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
        disabled={disabled}
        autoComplete="off"
      />
    </div>
  );
}

export function RegistrationPage({ onRegister, navigateTo }) {
  const [formData, setFormData] = useState({
    username: '', email: '', password: '', fullName: '', phone: ''
  });
  const [error, setError]     = useState('');
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    const { username, email, password, fullName, phone } = formData;
    if (!username || !email || !password || !fullName || !phone) {
      setError('All fields are required.'); return;
    }
    setLoading(true);
    try {
      await onRegister(formData);
      setSuccess(true);
      setTimeout(() => navigateTo('login'), 1600);
    } catch (err) {
      setError(err.message || 'Registration failed.');
    } finally {
      setLoading(false);
    }
  };

  const set = (field) => (val) => setFormData(p => ({ ...p, [field]: val }));

  return (
    <div className="auth-root">
      {/* ── Left panel ── */}
      <div className="auth-panel dot-grid--dark">
        <div className="flex-col">
          <div className="flex items-center gap-sm" style={{ marginBottom: '80px' }}>
            <BrandLogo size="lg" />
          </div>
          <h2 className="auth-panel__headline">
            Join<br /><em className="serif-accent">Inkotanyi.</em>
          </h2>
          <p className="auth-panel__sub">
            Register to become an FPR Inkotanyi member and serve Rwanda with Demokrasi, Ubumwe, and Amajyambere.
          </p>
        </div>
        <div className="flex-col">
          <p className="t-body t-light-muted">
            Already a member?
            <button className="form-toggle__btn" style={{ marginLeft: '8px', color: 'var(--white)', borderBottom: '1px solid rgba(255,255,255,0.3)' }} 
              onClick={() => navigateTo('login')}>
              Sign in
            </button>
          </p>
        </div>
      </div>

      {/* ── Right form ── */}
      <div className="auth-form-side dot-grid">
        <div className="auth-form-inner">
          <div className="eyebrow">Join Inkotanyi</div>
          <h1 className="t-heading-xl" style={{ marginBottom: '12px', fontSize: '48px' }}>
            Create your<br /><em className="serif-accent">membership</em>
          </h1>
          <p className="t-body" style={{ marginBottom: '48px', color: 'var(--text-faint)' }}>
            Submit your details. A party leader will approve your account before you can sign in.
          </p>

          {error   && <div className="alert alert--error">{error}</div>}
          {success && <div className="alert alert--success">Account created — redirecting you now.</div>}

          <form onSubmit={handleSubmit}>
            <div className="form-fields">
              <Field label="Username"     type="text"     value={formData.username} onChange={set('username')} disabled={success} />
              <Field label="Email"        type="email"    value={formData.email}    onChange={set('email')}    disabled={success} />
              <Field label="Password"     type="password" value={formData.password} onChange={set('password')} disabled={success} />
              <Field label="Full Name"    type="text"     value={formData.fullName} onChange={set('fullName')} disabled={success} />
              <Field label="Phone Number" type="tel"      value={formData.phone}    onChange={set('phone')}    disabled={success} />
            </div>

            <div className="form-actions" style={{ alignItems: 'center' }}>
              <button type="submit" className="btn btn--primary" disabled={success || loading} style={{ padding: '16px 48px' }}>
                <span>{loading ? 'Creating…' : 'Create Account'}</span>
              </button>
              <div className="t-body" style={{ fontSize: '13px', color: 'var(--text-muted)' }}>
                Have one? <button type="button" className="form-toggle__btn" style={{ color: 'var(--text-primary)', borderBottom: '1px solid var(--text-primary)' }} onClick={() => navigateTo('login')}>Sign in</button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}