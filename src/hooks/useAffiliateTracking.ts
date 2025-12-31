import { useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';

const AFFILIATE_COOKIE_NAME = 'genesis_affiliate_ref';
const COOKIE_EXPIRY_DAYS = 30;

export const useAffiliateTracking = () => {
  const [searchParams] = useSearchParams();

  useEffect(() => {
    const refCode = searchParams.get('ref');
    
    if (refCode) {
      // Set cookie with 30 day expiry
      const expiryDate = new Date();
      expiryDate.setDate(expiryDate.getDate() + COOKIE_EXPIRY_DAYS);
      
      document.cookie = `${AFFILIATE_COOKIE_NAME}=${refCode}; expires=${expiryDate.toUTCString()}; path=/; SameSite=Lax`;
      
      console.log('Affiliate tracking: Set ref code', refCode);
    }
  }, [searchParams]);
};

export const getAffiliateRefCode = (): string | null => {
  const cookies = document.cookie.split(';');
  
  for (const cookie of cookies) {
    const [name, value] = cookie.trim().split('=');
    if (name === AFFILIATE_COOKIE_NAME) {
      return value;
    }
  }
  
  return null;
};

export const clearAffiliateRefCode = () => {
  document.cookie = `${AFFILIATE_COOKIE_NAME}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;
};

export default useAffiliateTracking;
