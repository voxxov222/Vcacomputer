import React, { useState } from 'react';
import { LiveCameraScanner } from './LiveCameraScanner';
import { VaultGrid } from './VaultGrid';
import { AuthModal } from '../auth/AuthModal';
import { useAuth } from '../../context/AuthContext';
import { VaultCard } from '../../lib/firebase';

interface VcaScannerAppProps {
  initialView?: 'scanner' | 'vault';
  onInspect3D?: (card: VaultCard) => void;
  onBackToPortal?: () => void;
}

export const VcaScannerApp: React.FC<VcaScannerAppProps> = ({
  initialView = 'scanner',
  onInspect3D,
  onBackToPortal
}) => {
  const [currentView, setCurrentView] = useState<'scanner' | 'vault'>(initialView);
  const { isAuthModalOpen, closeAuthModal } = useAuth();

  return (
    <div className="w-full min-h-screen bg-[#040711] text-slate-100 font-sans">
      {currentView === 'scanner' ? (
        <LiveCameraScanner
          onClose={() => {
            if (onBackToPortal) onBackToPortal();
            else setCurrentView('vault');
          }}
          onOpenVault={() => setCurrentView('vault')}
        />
      ) : (
        <VaultGrid
          onOpenScanner={() => setCurrentView('scanner')}
          onInspect3D={onInspect3D}
        />
      )}

      {/* Global Auth Modal for Firebase Google / Email Authentication */}
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={closeAuthModal}
      />
    </div>
  );
};
