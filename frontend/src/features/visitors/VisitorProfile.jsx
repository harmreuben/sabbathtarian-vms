import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation } from '@tanstack/react-query';
import { visitorsApi } from './api';
import { useAuth } from '../../hooks/useAuth';
import { QRCodeCanvas } from 'qrcode.react';
import VisitorBadge from '../../components/badges/VisitorBadge';
import { ArrowLeft, Download, Printer, RefreshCw, ShieldAlert, Loader2 } from 'lucide-react';

export default function VisitorProfile() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const { data, isLoading } = useQuery({
    queryKey: ['visitor', id],
    queryFn: () => visitorsApi.getVisitor(id),
  });

  const regenerateMutation = useMutation({
    mutationFn: () => visitorsApi.regenerateQR(id),
    onSuccess: () => {
      alert('QR Code regenerated successfully!');
      window.location.reload();
    },
    onError: () => alert('Failed to regenerate QR code.')
  });

  if (isLoading) return <div className="flex justify-center p-10"><Loader2 className="animate-spin h-8 w-8 text-brand-500" /></div>;

  const visitor = data?.data;
  if (!visitor) return <div className="text-center p-10 text-gray-500">Visitor not found.</div>;

  const downloadQR = () => {
    const canvas = document.getElementById('profile-qr-canvas');
    if (canvas) {
      const pngUrl = canvas.toDataURL('image/png').replace('image/png', 'image/octet-stream');
      const downloadLink = document.createElement('a');
      downloadLink.href = pngUrl;
      downloadLink.download = `${visitor.registration_number}_QR.png`;
      document.body.appendChild(downloadLink);
      downloadLink.click();
      document.body.removeChild(downloadLink);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <button onClick={() => navigate('/visitors')} className="inline-flex items-center text-sm text-gray-500 dark:text-gray-400 hover:text-brand-600 dark:hover:text-brand-400 transition-colors">
          <ArrowLeft className="h-4 w-4 mr-1" /> Back to Directory
        </button>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Visitor Profile</h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Column: QR & Badges */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-white dark:bg-gray-900 rounded-xl shadow-premium border border-gray-100 dark:border-gray-800 p-6 text-center">
            <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-4">Visitor QR Code</h3>
            <div className="flex justify-center p-4 bg-gray-50 dark:bg-gray-800 rounded-xl mb-4">
              <QRCodeCanvas 
                id="profile-qr-canvas"
                value={visitor.qr_code_hash} 
                size={160}
                level="H"
                includeMargin={true}
              />
            </div>
            
            <div className="grid grid-cols-2 gap-2 mb-4">
              <button onClick={downloadQR} className="flex items-center justify-center py-2 px-3 border border-gray-300 dark:border-gray-700 rounded-lg text-xs font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                <Download className="h-3 w-3 mr-1" /> Download
              </button>
              <button onClick={() => window.print()} className="flex items-center justify-center py-2 px-3 border border-transparent rounded-lg text-xs font-medium text-white bg-brand-600 hover:bg-brand-700 transition-colors">
                <Printer className="h-3 w-3 mr-1" /> Print Badge
              </button>
            </div>

            {/* Admin Only: Regenerate QR */}
            {user?.role === 'ADMIN' && (
              <div className="pt-4 border-t border-gray-100 dark:border-gray-800">
                <button 
                  onClick={() => {
                    if (window.confirm('Are you sure? This will invalidate the old QR code immediately.')) {
                      regenerateMutation.mutate();
                    }
                  }}
                  disabled={regenerateMutation.isPending}
                  className="w-full flex items-center justify-center py-2 px-3 border border-red-200 text-red-700 dark:border-red-900/50 dark:text-red-400 rounded-lg text-xs font-medium hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                >
                  {regenerateMutation.isPending ? <Loader2 className="animate-spin h-3 w-3 mr-1" /> : <RefreshCw className="h-3 w-3 mr-1" />}
                  Regenerate QR Code
                </button>
                <p className="text-xs text-gray-400 mt-2 flex items-center justify-center"><ShieldAlert className="h-3 w-3 mr-1" /> Admin only. Invalidates old code.</p>
              </div>
            )}
            
            {/* Render hidden print badge */}
            <VisitorBadge visitor={visitor} />
          </div>
        </div>

        {/* Right Column: Details */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Personal Info */}
          <div className="bg-white dark:bg-gray-900 rounded-xl shadow-premium border border-gray-100 dark:border-gray-800 p-6">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Personal Information</h2>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-xs text-gray-500 dark:text-gray-400">Full Name</p>
                <p className="text-sm font-medium text-gray-900 dark:text-white">{visitor.full_name}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500 dark:text-gray-400">Registration Number</p>
                <p className="text-sm font-mono font-medium text-brand-600 dark:text-brand-400">{visitor.registration_number}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500 dark:text-gray-400">Gender</p>
                <p className="text-sm text-gray-900 dark:text-white">{visitor.gender}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500 dark:text-gray-400">Phone Number</p>
                <p className="text-sm text-gray-900 dark:text-white">{visitor.phone_number}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500 dark:text-gray-400">Email</p>
                <p className="text-sm text-gray-900 dark:text-white">{visitor.email || 'N/A'}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500 dark:text-gray-400">Occupation</p>
                <p className="text-sm text-gray-900 dark:text-white">{visitor.occupation || 'N/A'}</p>
              </div>
            </div>
          </div>

          {/* Visit Info */}
          <div className="bg-white dark:bg-gray-900 rounded-xl shadow-premium border border-gray-100 dark:border-gray-800 p-6">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Visit Details</h2>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-xs text-gray-500 dark:text-gray-400">Visitor Type</p>
                <p className="text-sm text-gray-900 dark:text-white">{visitor.visitor_type}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500 dark:text-gray-400">Seat Number</p>
                <p className="text-sm text-gray-900 dark:text-white">{visitor.seat_number || 'N/A'}</p>
              </div>
              <div className="col-span-2">
                <p className="text-xs text-gray-500 dark:text-gray-400">Invited By</p>
                <p className="text-sm text-gray-900 dark:text-white">{visitor.name_of_inviter || 'N/A'}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}