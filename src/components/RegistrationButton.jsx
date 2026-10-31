import { ArrowUpRight } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { registrationUrl } from '../data/siteContent.js';

export default function RegistrationButton({className='',children}){
  const {t}=useTranslation('shell');
  return <a href={registrationUrl} target="_blank" rel="noopener noreferrer" className={`button registration-button ${className}`}>
    {children||t('register')}<ArrowUpRight size={19} aria-hidden="true"/><span className="sr-only"> ({t('external')})</span>
  </a>;
}
