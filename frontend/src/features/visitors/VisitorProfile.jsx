import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { visitorsApi } from './api';

function ProfileSkeleton() {
  return (
    <div className="animate-pulse space-y-6">
      <div className="h-8 w-1/3 rounded bg-gray-300 dark:bg-gray-700"></div>
      <div className="h-4 w-1/2 rounded bg-gray-300 dark:bg-gray-700"></div>
      <div className="grid grid-cols-2 gap-6">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="h-16 rounded-lg bg-gray-300 dark:bg-gray-700"></div>
        ))}
      </div>
    </div>
  );
}

const InfoCard = ({ title, children }) => (
  <div className="rounded-lg border border-gray-200 bg-white p-6 dark:border-gray-700 dark:bg-gray-800">
    <h3 className="mb-4 text-sm font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">{title}</h3>
    <div className="space-y-3">{children}</div>
  </div>
);

const Field = ({ label, value }) => (
  <div>
    <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">{label}</dt>
    <dd className="mt-1 text-sm text-gray-900 dark:text-white">{value || '—'}</dd>
  </div>
);

export default function VisitorProfile() {
  const { id } = useParams();
  const navigate = useNavigate();

  const { data: visitor, isLoading, isError } = useQuery({
    queryKey: ['visitor', id],
    queryFn: () => visitorsApi.getVisitor(id),
    enabled: !!id,
  });

  if (isLoading) return <div className="p-8"><ProfileSkeleton /></div>;
  if (isError) return <div className="p-8 text-center text-red-500">Failed to load visitor profile.</div>;

  const v = visitor?.data;
  if (!v) return null;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <button 
          onClick={() => navigate('/visitors')}
          className="mb-6 inline-flex items-center text-sm font-medium text-blue-600 hover:text-blue-800 dark:text-blue-400"
        >
          <svg className="mr-1 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
          Back to Directory
        </button>

        <div className="mb-8 flex items-center space-x-6">
          <div className="flex h-20 w-20 items-center justify-center rounded-full bg-blue-100 text-3xl font-bold text-blue-600 dark:bg-blue-900 dark:text-blue-300">
            {v.full_name.charAt(0)}
          </div>
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">{v.full_name}</h1>
            <p className="mt-1 text-lg text-gray-500 dark:text-gray-400">{v.registration_number}</p>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <InfoCard title="Personal Details">
            <div className="grid grid-cols-2 gap-4">
              <Field label="Gender" value={v.gender} />
              <Field label="Age" value={v.age} />
              <Field label="Date of Birth" value={v.date_of_birth} />
              <Field label="Marital Status" value={v.marital_status} />
              <Field label="Occupation" value={v.occupation} />
              <Field label="National ID" value={v.national_id} />
            </div>
          </InfoCard>

          <InfoCard title="Contact Information">
            <div className="grid grid-cols-2 gap-4">
              <Field label="Phone Number" value={v.phone_number} />
              <Field label="WhatsApp" value={v.whatsapp_number} />
              <Field label="Email" value={v.email} />
              <Field label="Address" value={v.physical_address} />
            </div>
          </InfoCard>

          <InfoCard title="Location & Visit">
            <div className="grid grid-cols-2 gap-4">
              <Field label="County" value={v.county} />
              <Field label="Sub-County" value={v.sub_county} />
              <Field label="Visitor Type" value={v.visitor_type} />
              <Field label="Branch" value={v.branch_name} />
              <Field label="Service Attended" value={v.service_name} />
              <Field label="Invited By" value={v.name_of_inviter} />
            </div>
          </InfoCard>

          <InfoCard title="Additional Information">
            <div className="grid grid-cols-2 gap-4">
              <Field label="Emergency Contact" value={v.emergency_contact_name} />
              <Field label="Emergency Phone" value={v.emergency_contact_phone} />
              <Field label="Spouse Name" value={v.spouse_name} />
              <Field label="Registered By" value={v.registered_by_name} />
              <Field label="Registered On" value={new Date(v.created_at).toLocaleDateString()} />
            </div>
            {v.prayer_request && (
              <div className="mt-4 rounded-md bg-yellow-50 p-3 dark:bg-yellow-900/20">
                <dt className="text-sm font-medium text-yellow-800 dark:text-yellow-200">Prayer Request</dt>
                <dd className="mt-1 text-sm text-yellow-700 dark:text-yellow-300">{v.prayer_request}</dd>
              </div>
            )}
          </InfoCard>
        </div>
      </div>
    </div>
  );
}