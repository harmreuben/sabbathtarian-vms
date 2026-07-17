import { useState, useEffect, useRef } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Html5Qrcode } from 'html5-qrcode';
import { kioskApi } from './kioskApi';
import { Church, Camera, CheckCircle, AlertCircle, Loader2, UserX } from 'lucide-react';

export default function SelfCheckInKiosk() {
  const [serviceId, setServiceId] = useState('');
  const [scanning, setScanning] = useState(false);
  const [status, setStatus] = useState({ type: 'idle', message: '', visitor: null });
  const scannerRef = useRef(null);
  const resetTimerRef = useRef(null);

  const { data: servicesData } = useQuery({
    queryKey: ['kiosk-services'],
    queryFn: kioskApi.getServices,
  });

  const services = servicesData?.data?.results || [];
  // Compute active service to avoid setting state inside useEffect
  const activeService = serviceId || services[0]?.id || '';

  const handleScanSuccess = async (decodedText) => {
    // Prevent multiple triggers while processing
    await stopCamera();
    setStatus({ type: 'processing', message: 'Verifying...', visitor: null });

    if (!activeService) {
      setStatus({ type: 'error', message: 'No service selected. Please see reception.', visitor: null });
      scheduleReset();
      return;
    }

    try {
      const response = await kioskApi.scanAndCheckin({ code: decodedText, service: activeService });
      setStatus({ 
        type: 'success', 
        message: `Welcome to Church!`, 
        visitor: response.data 
      });
    } catch (error) {
      if (error.response?.status === 409) {
        setStatus({ type: 'warning', message: 'You are already checked in!', visitor: null });
      } else {
        setStatus({ type: 'error', message: 'QR Code not recognized. Please see reception.', visitor: null });
      }
    }
    scheduleReset();
  };

  const scheduleReset = () => {
    // Reset to scanning state after 4 seconds
    if (resetTimerRef.current) clearTimeout(resetTimerRef.current);
    resetTimerRef.current = setTimeout(() => {
      setStatus({ type: 'idle', message: '', visitor: null });
      startCamera();
    }, 4000);
  };

  const startCamera = async () => {
    setScanning(true);
    try {
      const html5Qrcode = new Html5Qrcode("kiosk-qr-reader");
      scannerRef.current = html5Qrcode;
      await html5Qrcode.start(
        { facingMode: "environment" },
        { fps: 10, qrbox: { width: 300, height: 300 } },
        handleScanSuccess,
        () => {}
      );
    } catch {
      setStatus({ type: 'error', message: 'Camera access denied. Check permissions.', visitor: null });
      setScanning(false);
    }
  };

  const stopCamera = async () => {
    if (scannerRef.current) {
      try {
        await scannerRef.current.stop();
        await scannerRef.current.clear();
      } catch {
        // Ignore errors if camera is already stopped
      } finally {
        scannerRef.current = null;
      }
    }
    setScanning(false);
  };

  useEffect(() => {
    if (activeService && status.type === 'idle') {
      startCamera();
    }
    
    return () => {
      stopCamera();
      if (resetTimerRef.current) clearTimeout(resetTimerRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeService, status.type]);

  return (
    <div className="fixed inset-0 z-50 bg-gray-950 flex flex-col items-center justify-center p-4 text-white overflow-hidden">
      
      {/* Header */}
      <div className="absolute top-0 left-0 right-0 p-6 flex justify-between items-center z-10">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-brand-600 rounded-lg">
            <Church className="h-6 w-6 text-white" />
          </div>
          <div>
            <h1 className="text-lg font-bold leading-none">Sabbathtarian VMS</h1>
            <p className="text-xs text-gray-400 mt-1">Self-Service Check-In</p>
          </div>
        </div>
        
        {/* Hidden/Small Service Selector for Kiosk Setup */}
        <select 
          value={activeService} 
          onChange={(e) => setServiceId(e.target.value)}
          className="bg-gray-800 border border-gray-700 text-white text-sm rounded-lg px-3 py-2 focus:ring-brand-500 focus:border-brand-500"
        >
          {services.map(service => (
            <option key={service.id} value={service.id}>{service.name}</option>
          ))}
        </select>
      </div>

      {/* Main Content Area */}
      <div className="relative w-full max-w-2xl h-full flex flex-col items-center justify-center">
        
        {/* Idle / Scanning State */}
        {status.type === 'idle' && (
          <div className="text-center w-full">
            <h2 className="text-4xl font-bold mb-2">Scan Your QR Code</h2>
            <p className="text-gray-400 mb-8 text-lg">Point your phone or badge at the camera below.</p>
            
            <div className="relative w-full max-w-md mx-auto">
              <div id="kiosk-qr-reader" className="w-full rounded-2xl overflow-hidden border-4 border-brand-600 shadow-2xl"></div>
              
              {!scanning && (
                <button 
                  onClick={startCamera}
                  className="absolute inset-0 flex flex-col items-center justify-center bg-gray-900/80 rounded-2xl text-white"
                >
                  <Camera className="h-16 w-16 mb-4 text-brand-500" />
                  <span className="text-lg font-medium">Tap to Enable Camera</span>
                </button>
              )}
            </div>
          </div>
        )}

        {/* Processing State */}
        {status.type === 'processing' && (
          <div className="text-center">
            <Loader2 className="h-24 w-24 animate-spin text-brand-500 mx-auto mb-6" />
            <h2 className="text-4xl font-bold">{status.message}</h2>
          </div>
        )}

        {/* Success State */}
        {status.type === 'success' && (
          <div className="text-center animate-in fade-in zoom-in duration-300">
            <div className="mx-auto h-32 w-32 bg-green-600 rounded-full flex items-center justify-center mb-6 shadow-lg shadow-green-600/50">
              <CheckCircle className="h-20 w-20 text-white" />
            </div>
            <h2 className="text-5xl font-extrabold mb-4">{status.message}</h2>
            <h3 className="text-3xl font-bold text-brand-400">{status.visitor?.visitor_name}</h3>
            <p className="text-xl text-gray-400 mt-4">Seat: {status.visitor?.seat_number || 'N/A'}</p>
          </div>
        )}

        {/* Warning (Duplicate) State */}
        {status.type === 'warning' && (
          <div className="text-center animate-in fade-in zoom-in duration-300">
            <div className="mx-auto h-32 w-32 bg-yellow-500 rounded-full flex items-center justify-center mb-6 shadow-lg shadow-yellow-500/50">
              <AlertCircle className="h-20 w-20 text-white" />
            </div>
            <h2 className="text-4xl font-bold mb-4">Already Checked In</h2>
            <p className="text-2xl text-gray-300">{status.message}</p>
            <p className="text-lg text-gray-500 mt-4">Please proceed to your seat.</p>
          </div>
        )}

        {/* Error State */}
        {status.type === 'error' && (
          <div className="text-center animate-in fade-in zoom-in duration-300">
            <div className="mx-auto h-32 w-32 bg-red-600 rounded-full flex items-center justify-center mb-6 shadow-lg shadow-red-600/50">
              <UserX className="h-20 w-20 text-white" />
            </div>
            <h2 className="text-4xl font-bold mb-4">Oops!</h2>
            <p className="text-2xl text-gray-300 max-w-md mx-auto">{status.message}</p>
          </div>
        )}

      </div>
    </div>
  );
}