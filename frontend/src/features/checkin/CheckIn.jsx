import { useState, useEffect, useRef } from 'react';
import { useMutation, useQuery } from '@tanstack/react-query';
import { Html5Qrcode } from 'html5-qrcode';
import { checkinApi } from './api';
import { Search, Camera, CameraOff, CheckCircle, AlertCircle, Loader2, UserCheck, X } from 'lucide-react';

export default function CheckIn() {
  const [serviceId, setServiceId] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [scanning, setScanning] = useState(false);
  const [previewVisitor, setPreviewVisitor] = useState(null);
  const [message, setMessage] = useState(null);
  const scannerRef = useRef(null);

  const { data: servicesData } = useQuery({
    queryKey: ['services'],
    queryFn: checkinApi.getServices,
  });

  // 1. Handle Search / USB Scanner Input
  const handleSearchSubmit = async (e) => {
    e.preventDefault();
    if (!searchQuery) return;
    setMessage(null);
    
    try {
      const res = await checkinApi.searchVisitor(searchQuery);
      if (res.data.length > 0) {
        setPreviewVisitor(res.data[0]); // Show first result
      } else {
        setMessage({ type: 'error', text: 'No visitor found with that details.' });
      }
      setSearchQuery('');
    } catch {
      setMessage({ type: 'error', text: 'Search failed. Try again.' });
    }
  };

  // 2. Handle Camera Scan Success
  const onScanSuccess = async (decodedText) => {
    // Camera found a QR code. Stop camera and fetch visitor.
    stopCamera();
    try {
      const res = await checkinApi.searchVisitor(decodedText);
      if (res.data.length > 0) {
        setPreviewVisitor(res.data[0]);
      } else {
        setMessage({ type: 'error', text: 'QR Code not recognized.' });
      }
    } catch {
      setMessage({ type: 'error', text: 'Failed to validate QR code.' });
    }
  };

  // 3. Camera Controls
  const startCamera = async () => {
    setScanning(true);
    setMessage(null);
    try {
      const html5Qrcode = new Html5Qrcode("qr-reader");
      scannerRef.current = html5Qrcode;
      await html5Qrcode.start(
        { facingMode: "environment" }, // Use back camera
        { fps: 10, qrbox: { width: 250, height: 250 } },
        onScanSuccess,
        () => {} // Ignore minor decode errors silently
      );
    } catch {
      setMessage({ type: 'error', text: 'Camera access denied or not available.' });
      setScanning(false);
    }
  };

    const stopCamera = async () => {
    if (scannerRef.current) {
      try {
        await scannerRef.current.stop();
        await scannerRef.current.clear();
      } catch {  // <-- MAKE SURE THERE IS NO 'e' IN PARENTHESES
        // Ignore errors if camera is already stopped
      } finally {
        scannerRef.current = null;
      }
    }
    setScanning(false);
  };

  useEffect(() => {
    return () => {
      stopCamera(); // Cleanup camera on unmount
    };
  }, []);

  // 4. Confirm Check-In Mutation
  const checkinMutation = useMutation({
    mutationFn: () => checkinApi.scan({ code: previewVisitor.qr_code_hash, service: serviceId }),
    onSuccess: (response) => {
      setMessage({ type: 'success', text: `Welcome, ${response.data.visitor_name}! Check-in successful.` });
      setPreviewVisitor(null);
    },
    onError: (error) => {
      const errMsg = error.response?.data?.error || error.response?.data?.warning || 'Check-in failed.';
      const type = error.response?.status === 409 ? 'warning' : 'error';
      setMessage({ type, text: errMsg });
      setPreviewVisitor(null);
    }
  });

  const services = servicesData?.data?.results || [];

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="text-center">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Visitor Check-In</h1>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">Scan QR code, search by name, or use USB scanner.</p>
      </div>

      {/* Status Message */}
      {message && (
        <div className={`p-4 rounded-xl flex items-center gap-3 text-sm font-medium border ${
          message.type === 'success' ? 'bg-green-50 text-green-700 border-green-100 dark:bg-green-900/20 dark:text-green-400 dark:border-green-900/30' : 
          message.type === 'warning' ? 'bg-yellow-50 text-yellow-700 border-yellow-100 dark:bg-yellow-900/20 dark:text-yellow-400 dark:border-yellow-900/30' : 
          'bg-red-50 text-red-700 border-red-100 dark:bg-red-900/20 dark:text-red-400 dark:border-red-900/30'
        }`}>
          {message.type === 'success' ? <CheckCircle className="h-5 w-5" /> : <AlertCircle className="h-5 w-5" />}
          {message.text}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Left Column: Search & USB Input */}
        <div className="bg-white dark:bg-gray-900 p-6 rounded-2xl shadow-premium border border-gray-100 dark:border-gray-800 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Select Service</label>
            <select 
              required 
              value={serviceId} 
              onChange={(e) => setServiceId(e.target.value)}
              className="block w-full rounded-lg border-gray-300 dark:border-gray-700 dark:bg-gray-800 dark:text-white shadow-sm focus:border-brand-500 focus:ring-brand-500 sm:text-sm py-2.5 px-3"
            >
              <option value="">Select Service...</option>
              {services.map(service => (
                <option key={service.id} value={service.id}>{service.name}</option>
              ))}
            </select>
          </div>

          <form onSubmit={handleSearchSubmit}>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Search / USB Scanner</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-5 w-5 text-gray-400" />
              </div>
              <input 
                type="text" 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                autoFocus
                placeholder="Name, Phone, or Reg Number..."
                className="block w-full pl-10 pr-4 py-3 rounded-lg border-gray-300 dark:border-gray-700 dark:bg-gray-800 dark:text-white shadow-sm focus:border-brand-500 focus:ring-brand-500 sm:text-sm"
              />
            </div>
            <button type="submit" className="hidden">Submit</button>
          </form>
          <p className="text-xs text-gray-400">USB scanners will automatically press enter.</p>
        </div>

        {/* Right Column: Camera Scanner */}
        <div className="bg-white dark:bg-gray-900 p-6 rounded-2xl shadow-premium border border-gray-100 dark:border-gray-800 flex flex-col items-center justify-center">
          {!scanning ? (
            <button 
              onClick={startCamera}
              className="flex flex-col items-center justify-center h-full text-gray-500 dark:text-gray-400 hover:text-brand-600 dark:hover:text-brand-400 transition-colors"
            >
              <Camera className="h-12 w-12 mb-2" />
              <span className="text-sm font-medium">Start Camera Scan</span>
            </button>
          ) : (
            <div className="w-full text-center">
              <div id="qr-reader" className="w-full max-w-sm mx-auto rounded-lg overflow-hidden border-2 border-brand-500"></div>
              <button 
                onClick={stopCamera}
                className="mt-4 flex items-center justify-center mx-auto py-2 px-4 border border-gray-300 dark:border-gray-700 rounded-lg text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
              >
                <CameraOff className="h-4 w-4 mr-2" /> Stop Camera
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Preview Modal (The Human Check) */}
      {previewVisitor && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-premium-lg p-8 max-w-md w-full text-center">
            <div className="flex justify-end -mt-4 -mr-4">
              <button onClick={() => setPreviewVisitor(null)} className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200">
                <X className="h-5 w-5" />
              </button>
            </div>
            
            <div className="mx-auto h-24 w-24 bg-brand-100 dark:bg-brand-900/30 rounded-full flex items-center justify-center mb-4">
              <UserCheck className="h-12 w-12 text-brand-600 dark:text-brand-400" />
            </div>
            
            <h3 className="text-2xl font-bold text-gray-900 dark:text-white">{previewVisitor.full_name}</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              {previewVisitor.registration_number} | {previewVisitor.visitor_type}
            </p>
            
            <div className="mt-2 inline-block px-3 py-1 bg-gray-100 dark:bg-gray-800 rounded-full text-xs font-medium text-gray-600 dark:text-gray-300">
              {previewVisitor.gender} | {previewVisitor.county || 'Unknown County'}
            </div>

            {!serviceId ? (
              <p className="mt-6 text-sm text-red-600">Please select a service before checking in.</p>
            ) : (
              <button 
                onClick={() => checkinMutation.mutate()}
                disabled={checkinMutation.isPending}
                className="mt-6 w-full flex justify-center items-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-base font-medium text-white bg-green-600 hover:bg-green-700 disabled:bg-gray-400 transition-colors"
              >
                {checkinMutation.isPending ? (
                  <>
                    <Loader2 className="animate-spin h-5 w-5 mr-2" /> Checking in...
                  </>
                ) : (
                  <>
                    <CheckCircle className="h-5 w-5 mr-2" /> Confirm Check-In
                  </>
                )}
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}