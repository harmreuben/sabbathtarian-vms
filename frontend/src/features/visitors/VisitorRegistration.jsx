import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useMutation } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { QRCodeCanvas } from 'qrcode.react';
import { visitorsApi } from './api';
import VisitorBadge from '../../components/badges/VisitorBadge';
import { User, MapPin, Calendar, MessageSquare, Download, Printer, X, CheckCircle } from 'lucide-react';

export default function VisitorRegistration() {
  const navigate = useNavigate();
  const { register, handleSubmit, formState: { errors } } = useForm();
  const [registeredVisitor, setRegisteredVisitor] = useState(null);
  
  const mutation = useMutation({
    mutationFn: visitorsApi.register,
    onSuccess: (response) => {
      setRegisteredVisitor(response.data);
    },
    onError: (error) => {
      const errMsg = error.response?.data?.full_name?.[0] || 'Failed to register. Please check all required fields.';
      alert(errMsg);
    }
  });

  const onSubmit = (data) => {
    const payload = Object.fromEntries(
      Object.entries(data).map(([key, value]) => [key, value === '' ? null : value])
    );
    mutation.mutate(payload);
  };

  const downloadQR = () => {
    const canvas = document.getElementById('qr-canvas');
    if (canvas) {
      const pngUrl = canvas.toDataURL('image/png').replace('image/png', 'image/octet-stream');
      const downloadLink = document.createElement('a');
      downloadLink.href = pngUrl;
      downloadLink.download = `${registeredVisitor.registration_number}_QR.png`;
      document.body.appendChild(downloadLink);
      downloadLink.click();
      document.body.removeChild(downloadLink);
    }
  };

  const inputClass = "mt-1 block w-full rounded-lg border-gray-300 dark:border-gray-700 dark:bg-gray-800 dark:text-white shadow-sm focus:border-brand-500 focus:ring-brand-500 sm:text-sm py-2.5";
  const labelClass = "block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5";
  const cardClass = "bg-white dark:bg-gray-900 rounded-xl shadow-premium border border-gray-100 dark:border-gray-800 p-6";
  const sectionTitleClass = "flex items-center gap-2 text-lg font-semibold text-gray-900 dark:text-white mb-4 pb-2 border-b border-gray-100 dark:border-gray-800";

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Digital Visitor Book</h1>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Register a new visitor to the church.</p>
      </div>
      
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        
        {/* Personal Info Card */}
        <div className={cardClass}>
          <h2 className={sectionTitleClass}>
            <User className="h-5 w-5 text-brand-600" /> Personal Information
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-4 gap-y-4">
            <div className="lg:col-span-2">
              <label className={labelClass}>Full Name *</label>
              <input {...register('full_name', { required: 'Full Name is required' })} className={inputClass} />
              {errors.full_name && <p className="mt-1 text-xs text-red-600">{errors.full_name.message}</p>}
            </div>
            <div>
              <label className={labelClass}>Gender *</label>
              <select {...register('gender', { required: true })} className={inputClass}>
                <option value="">Select...</option>
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Other">Other</option>
              </select>
            </div>
            <div>
              <label className={labelClass}>Date of Birth</label>
              <input type="date" {...register('date_of_birth')} className={inputClass} />
            </div>
            <div>
              <label className={labelClass}>Phone Number *</label>
              <input {...register('phone_number', { required: 'Phone Number is required' })} className={inputClass} />
            </div>
            <div>
              <label className={labelClass}>Email</label>
              <input type="email" {...register('email')} className={inputClass} />
            </div>
            <div>
              <label className={labelClass}>Occupation</label>
              <input {...register('occupation')} className={inputClass} />
            </div>
          </div>
        </div>

        {/* Location Info Card */}
        <div className={cardClass}>
          <h2 className={sectionTitleClass}>
            <MapPin className="h-5 w-5 text-brand-600" /> Location & Address
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-4 gap-y-4">
            <div>
              <label className={labelClass}>County</label>
              <input {...register('county')} className={inputClass} />
            </div>
            <div>
              <label className={labelClass}>Sub County</label>
              <input {...register('sub_county')} className={inputClass} />
            </div>
            <div>
              <label className={labelClass}>Village/Estate</label>
              <input {...register('village')} className={inputClass} />
            </div>
            <div className="lg:col-span-3">
              <label className={labelClass}>Physical Address</label>
              <input {...register('physical_address')} className={inputClass} />
            </div>
          </div>
        </div>

        {/* Visit Details Card */}
        <div className={cardClass}>
          <h2 className={sectionTitleClass}>
            <Calendar className="h-5 w-5 text-brand-600" /> Visit Details
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-4 gap-y-4">
            <div>
              <label className={labelClass}>Visitor Type *</label>
              <select {...register('visitor_type', { required: true })} className={inputClass}>
                <option value="First Time">First Time</option>
                <option value="Returning">Returning</option>
              </select>
            </div>
            <div>
              <label className={labelClass}>Seat Number</label>
              <input {...register('seat_number')} className={inputClass} />
            </div>
            <div className="lg:col-span-2">
              <label className={labelClass}>Invited By (Name)</label>
              <input {...register('name_of_inviter')} className={inputClass} />
            </div>
          </div>
        </div>

        {/* Consents Card */}
        <div className={cardClass}>
          <h2 className={sectionTitleClass}>
            <MessageSquare className="h-5 w-5 text-brand-600" /> Communication Consents
          </h2>
          <div className="space-y-3">
            <label className="flex items-center space-x-3 cursor-pointer">
              <input type="checkbox" {...register('consent_sms')} className="h-4 w-4 rounded border-gray-300 text-brand-600 focus:ring-brand-500" />
              <span className="text-sm text-gray-700 dark:text-gray-300">Consent to receive SMS notifications</span>
            </label>
            <label className="flex items-center space-x-3 cursor-pointer">
              <input type="checkbox" {...register('consent_whatsapp')} className="h-4 w-4 rounded border-gray-300 text-brand-600 focus:ring-brand-500" />
              <span className="text-sm text-gray-700 dark:text-gray-300">Consent to receive WhatsApp messages</span>
            </label>
            <label className="flex items-center space-x-3 cursor-pointer">
              <input type="checkbox" {...register('consent_email')} className="h-4 w-4 rounded border-gray-300 text-brand-600 focus:ring-brand-500" />
              <span className="text-sm text-gray-700 dark:text-gray-300">Consent to receive Email updates</span>
            </label>
          </div>
        </div>

        {/* Actions */}
        <div className="flex justify-end space-x-3 pt-2">
          <button
            type="button"
            onClick={() => navigate('/dashboard')}
            className="px-4 py-2.5 border border-gray-300 dark:border-gray-700 rounded-lg text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={mutation.isPending}
            className="inline-flex justify-center py-2.5 px-6 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-brand-600 hover:bg-brand-700 disabled:bg-brand-400 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-500"
          >
            {mutation.isPending ? 'Registering...' : 'Register Visitor'}
          </button>
        </div>
      </form>

      {/* QR Success Modal */}
      {registeredVisitor && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-premium-lg p-8 max-w-md w-full text-center">
            <div className="flex justify-end -mt-4 -mr-4">
              <button onClick={() => navigate('/visitors')} className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200">
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="mx-auto h-12 w-12 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mb-4">
              <CheckCircle className="h-6 w-6 text-green-600 dark:text-green-400" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 dark:text-white">Registration Successful!</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              Reg Number: <span className="font-mono font-bold text-brand-600">{registeredVisitor.registration_number}</span>
            </p>
            
            <div className="my-6 flex justify-center p-4 bg-gray-50 dark:bg-gray-800 rounded-xl">
              <QRCodeCanvas 
                id="qr-canvas"
                value={registeredVisitor.qr_code_hash} 
                size={180}
                level="H" 
                includeMargin={true}
              />
            </div>

            {/* Render the hidden print badge */}
            <VisitorBadge visitor={registeredVisitor} />

            <div className="grid grid-cols-2 gap-3">
              <button 
                onClick={downloadQR}
                className="flex items-center justify-center py-2.5 px-4 border border-gray-300 dark:border-gray-700 rounded-lg text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
              >
                <Download className="h-4 w-4 mr-2" /> Download QR
              </button>
              <button 
                onClick={() => window.print()}
                className="flex items-center justify-center py-2.5 px-4 border border-transparent rounded-lg text-sm font-medium text-white bg-brand-600 hover:bg-brand-700 transition-colors"
              >
                <Printer className="h-4 w-4 mr-2" /> Print Badge
              </button>
            </div>
            
            <button 
              onClick={() => { setRegisteredVisitor(null); window.location.reload(); }}
              className="mt-4 w-full text-sm text-gray-500 dark:text-gray-400 hover:text-brand-600 dark:hover:text-brand-400 transition-colors"
            >
              Register Another Visitor
            </button>
          </div>
        </div>
      )}
    </div>
  );
}