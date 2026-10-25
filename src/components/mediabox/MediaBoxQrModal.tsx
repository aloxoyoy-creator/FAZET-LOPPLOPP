import React from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { QrCode, X, ExternalLink, Copy, Check } from 'lucide-react';
import { Button } from '@schoolhub/ui';
import { useTranslation } from '@/context/LanguageContext';

interface MediaBoxQrModalProps {
  showQrModal: boolean;
  roomCode: string | null;
  remoteUrl: string;
  copiedLink: boolean;
  onClose: () => void;
  onCopyLink: () => void;
}

export const MediaBoxQrModal: React.FC<MediaBoxQrModalProps> = ({
  showQrModal,
  roomCode,
  remoteUrl,
  copiedLink,
  onClose,
  onCopyLink,
}) => {
  const { t } = useTranslation();

  if (!showQrModal || !roomCode) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex flex-col items-center justify-center p-4 animate-in fade-in duration-200">
      <div
        className="relative bg-card border border-border rounded-2xl p-6 flex flex-col items-center gap-4 max-w-sm w-full shadow-2xl overflow-hidden"
        style={{
          clipPath:
            'polygon(0 0, calc(100% - 16px) 0, 100% 16px, 100% 100%, 16px 100%, 0 calc(100% - 16px))',
        }}
      >
        <div className="w-full h-1 bg-muted rounded-full overflow-hidden">
          <div className="h-full bg-primary animate-[shrink_30s_linear_forwards] w-full origin-left" />
        </div>
        <Button
          variant="ghost"
          size="icon"
          onClick={onClose}
          className="absolute top-3 right-3 text-muted-foreground hover:text-foreground h-8 w-8 cursor-pointer"
        >
          <X className="w-5 h-5" />
        </Button>

        <div className="flex items-center gap-2 text-primary font-bold text-base uppercase tracking-wider">
          <QrCode className="w-5 h-5" />
          <span>{t('mediaBox.scanToRemote')}</span>
        </div>

        <div className="p-3 bg-white rounded-xl shadow-lg">
          <QRCodeSVG value={remoteUrl} size={180} level="H" includeMargin={false} />
        </div>

        <div className="text-center">
          <p className="text-xs text-muted-foreground">{t('mediaBox.enterPinCode')}</p>
          <p className="font-mono text-2xl font-extrabold tracking-[0.25em] text-primary mt-0.5">
            {roomCode}
          </p>
        </div>

        <div className="flex flex-col w-full gap-2 mt-1">
          <a
            href={remoteUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full py-2 px-3 bg-primary hover:bg-primary/90 text-primary-foreground font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-1.5 transition-colors"
            style={{
              clipPath:
                'polygon(0 0, calc(100% - 8px) 0, 100% 8px, 100% 100%, 8px 100%, 0 calc(100% - 8px))',
            }}
          >
            <span>{t('mediaBox.openRemoteNewTab')}</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </a>

          <Button
            variant="outline"
            chamfer="dual"
            onClick={onCopyLink}
            className="w-full py-2 px-3 text-xs font-semibold flex items-center justify-center gap-1.5 cursor-pointer"
          >
            {copiedLink ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-400" />
                <span className="text-emerald-400">{t('mediaBox.linkCopied')}</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5" />
                <span>{t('mediaBox.copyRemoteLink')}</span>
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
};
