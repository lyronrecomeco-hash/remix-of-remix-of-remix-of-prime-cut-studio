import { useEffect } from 'react';
import React from 'react';
import { ReadyTemplatesTab } from './tabs/ReadyTemplatesTab';

interface AffiliateProspectingProps {
  affiliateId: string;
  onSubHeaderChange?: (header: React.ReactNode | null) => void;
}

export const AffiliateProspecting = ({ affiliateId, onSubHeaderChange }: AffiliateProspectingProps) => {
  // We want this screen to be 100% clean (no tabs/header), showing only the ready templates cards.
  useEffect(() => {
    if (!onSubHeaderChange) return;

    // Signal parent to hide the desktop header for a clean gallery screen
    onSubHeaderChange(<div data-hide-desktop-header />);

    return () => {
      onSubHeaderChange(null);
    };
  }, [onSubHeaderChange]);

  return (
    <div>
      <ReadyTemplatesTab affiliateId={affiliateId} />
    </div>
  );
};

export default AffiliateProspecting;

