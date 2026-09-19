import { Twitter, Facebook, Instagram, Linkedin, Mail, Phone, MapPin } from 'lucide-react';
import { BrandLogo } from './BrandLogo';

export function Footer() {
  const currentYear = new Date().getFullYear();

  const footerLinks = {
    organization: [
      { label: 'About Us', href: '#' },
      { label: 'Our Team', href: '#' },
      { label: 'Careers', href: '#' },
      { label: 'Press', href: '#' },
    ],
    policies: [
      { label: 'Education', href: '#policy' },
      { label: 'Healthcare', href: '#policy' },
      { label: 'Economy', href: '#policy' },
      { label: 'Environment', href: '#policy' },
    ],
    getInvolved: [
      { label: 'Join Us', href: '#' },
      { label: 'Volunteer', href: '#' },
      { label: 'Donate', href: '#' },
      { label: 'Events', href: '#' },
    ],
  };

  const socialLinks = [
    { icon: Twitter, href: '#', label: 'Twitter' },
    { icon: Facebook, href: '#', label: 'Facebook' },
    { icon: Instagram, href: '#', label: 'Instagram' },
    { icon: Linkedin, href: '#', label: 'LinkedIn' },
  ];

  return (
    <footer id="contact" className="footer">
      <div className="footer__top">
        {/* Brand Column */}
        <div className="footer__brand-col">
          <div className="footer__brand-name">
            <BrandLogo size="lg" />
          </div>
          <p className="footer__brand-desc">
            Member portal of FPR Inkotanyi — uniting members for national progress, accountability, and service to Rwanda.
          </p>

          {/* Social Links */}
          <div className="flex gap-md" style={{ marginTop: '24px' }}>
            {socialLinks.map((social, idx) => (
              <a
                key={idx}
                href={social.href}
                aria-label={social.label}
                className="btn btn--pill"
                style={{ padding: '8px' }}
              >
                <social.icon className="w-4 h-4" />
              </a>
            ))}
          </div>
        </div>

        {/* Organization Links */}
        <div>
          <h4 className="footer__col-title">Organization</h4>
          <ul className="footer__links">
            {footerLinks.organization.map((link, idx) => (
              <li key={idx}>
                <a href={link.href} className="footer__link">{link.label}</a>
              </li>
            ))}
          </ul>
        </div>

        {/* Policies Links */}
        <div>
          <h4 className="footer__col-title">Policies</h4>
          <ul className="footer__links">
            {footerLinks.policies.map((link, idx) => (
              <li key={idx}>
                <a href={link.href} className="footer__link">{link.label}</a>
              </li>
            ))}
          </ul>
        </div>

        {/* Contact Information */}
        <div>
          <h4 className="footer__col-title">Get In Touch</h4>
          <ul className="footer__links">
            <li className="flex items-start gap-sm">
              <MapPin className="w-4 h-4 mt-1 flex-shrink-0 t-light-faint" />
              <span className="footer__link">Kimihurura, Kigali, Rwanda</span>
            </li>
            <li className="flex items-center gap-sm">
              <Phone className="w-4 h-4 flex-shrink-0 t-light-faint" />
              <span className="footer__link">+250 788 305 764</span>
            </li>
            <li className="flex items-center gap-sm">
              <Mail className="w-4 h-4 flex-shrink-0 t-light-faint" />
              <span className="footer__link">info@rpfinkotanyi.rw</span>
            </li>
          </ul>
        </div>
      </div>

      <div className="footer__bottom">
        <p className="footer__copy">
          © {currentYear} FPR Inkotanyi. <em>Demokrasi · Ubumwe · Amajyambere.</em>
        </p>
        <div className="flex gap-lg">
          <a href="#" className="footer__link" style={{ fontSize: '11.5px' }}>Privacy Policy</a>
          <a href="#" className="footer__link" style={{ fontSize: '11.5px' }}>Terms of Service</a>
          <a href="#" className="footer__link" style={{ fontSize: '11.5px' }}>Cookie Policy</a>
        </div>
      </div>
    </footer>
  );
}
