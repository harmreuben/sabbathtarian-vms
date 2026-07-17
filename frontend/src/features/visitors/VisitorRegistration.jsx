import { useForm } from 'react-hook-form';
import { useMutation } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { visitorsApi } from './api';

export default function VisitorRegistration() {
  const navigate = useNavigate();
  const { register, handleSubmit, formState: { errors } } = useForm();
  
  const mutation = useMutation({
    mutationFn: visitorsApi.register,
    onSuccess: (response) => {
      alert(`Visitor registered successfully! Reg Number: ${response.data.registration_number}`);
      navigate('/dashboard');
    },
    onError: (error) => {
      const errMsg = error.response?.data?.full_name?.[0] || 'Failed to register. Please check all required fields.';
      alert(errMsg);
    }
  });

  const onSubmit = (data) => {
    // Premium pattern: Convert empty strings to null for PostgreSQL/Django compatibility
    const payload = Object.fromEntries(
      Object.entries(data).map(([key, value]) => [key, value === '' ? null : value])
    );
    mutation.mutate(payload);
  };

  const inputClass = "mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white sm:text-sm";
  const labelClass = "block text-sm font-medium text-gray-700 dark:text-gray-300";

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
      <div className="mx-auto max-w-5xl bg-white shadow-lg rounded-xl dark:bg-gray-800 p-8">
        <div className="mb-8 border-b border-gray-200 pb-4 dark:border-gray-700">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Digital Visitor Book</h1>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">Fill in the details below to register a new visitor.</p>
        </div>
        
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
          
          {/* Section: Personal Information */}
          <div className="grid grid-cols-1 gap-y-6 gap-x-4 md:grid-cols-2 lg:grid-cols-3">
            <div className="lg:col-span-3">
              <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-200">Personal Information</h2>
            </div>
            
            <div>
              <label className={labelClass}>Full Name *</label>
              <input {...register('full_name', { required: 'Full Name is required' })} className={inputClass} />
              {errors.full_name && <p className="mt-1 text-xs text-red-600">{errors.full_name.message}</p>}
            </div>
            
            <div>
              <label className={labelClass}>Gender *</label>
              <select {...register('gender', { required: 'Gender is required' })} className={inputClass}>
                <option value="">Select Gender...</option>
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Other">Other</option>
              </select>
            </div>

            <div>
              <label className={labelClass}>Phone Number *</label>
              <input {...register('phone_number', { required: 'Phone Number is required' })} className={inputClass} />
            </div>

            <div>
              <label className={labelClass}>Comments *</label>
              <input {...register('comment', { required: 'comment is required' })} className={inputClass} />
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

          {/* Section: Visit Details */}
          <div className="grid grid-cols-1 gap-y-6 gap-x-4 md:grid-cols-2 lg:grid-cols-3 pt-6 border-t border-gray-200 dark:border-gray-700">
            <div className="lg:col-span-3">
              <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-200">Visit Details</h2>
            </div>

            <div>
              <label className={labelClass}>Visitor Type *</label>
              <select {...register('visitor_type', { required: true })} className={inputClass}>
                <option value="First Time">First Time</option>
                <option value="Returning">Returning</option>
              </select>
            </div>

            <div>
              <label className={labelClass}>Invited By (Name)</label>
              <input {...register('name_of_inviter')} className={inputClass} />
            </div>

            <div>
              <label className={labelClass}>Seat Number</label>
              <input {...register('seat_number')} className={inputClass} />
            </div>
          </div>

          {/* Section: Consents */}
          <div className="space-y-4 pt-6 border-t border-gray-200 dark:border-gray-700">
            <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-200">Communication Consents</h2>
            <div className="flex flex-col space-y-3">
              <label className="flex items-center space-x-3 text-sm text-gray-700 dark:text-gray-300">
                <input type="checkbox" {...register('consent_sms')} className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500" />
                <span>Consent to receive SMS notifications</span>
              </label>
              <label className="flex items-center space-x-3 text-sm text-gray-700 dark:text-gray-300">
                <input type="checkbox" {...register('consent_whatsapp')} className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500" />
                <span>Consent to receive WhatsApp messages</span>
              </label>
              <label className="flex items-center space-x-3 text-sm text-gray-700 dark:text-gray-300">
                <input type="checkbox" {...register('consent_email')} className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500" />
                <span>Consent to receive Email updates</span>
              </label>
            </div>
          </div>

          {/* Actions */}
          <div className="flex justify-end space-x-3 pt-6 border-t border-gray-200 dark:border-gray-700">
            <button
              type="button"
              onClick={() => navigate('/dashboard')}
              className="rounded-md border border-gray-300 bg-white py-2 px-4 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-200 dark:hover:bg-gray-700"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={mutation.isPending}
              className="inline-flex justify-center rounded-md border border-transparent bg-blue-600 py-2 px-4 text-sm font-medium text-white shadow-sm hover:bg-blue-700 disabled:bg-gray-400"
            >
              {mutation.isPending ? 'Registering...' : 'Register Visitor'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}