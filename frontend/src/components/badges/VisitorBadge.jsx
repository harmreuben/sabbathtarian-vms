import { createPortal } from 'react-dom';
import { QRCodeCanvas } from 'qrcode.react';

export default function VisitorBadge({ visitor }) {
  if (!visitor) return null;

  const printRoot = document.getElementById('print-root');
  if (!printRoot) return null;

  const today = new Date().toLocaleDateString();

  return createPortal(
    <div className="badge-container">
      <div className="badge-header">
        Sabbathtarian Church of Elohim
      </div>
      
      <div className="badge-body">
        <div className="badge-qr">
          <QRCodeCanvas 
            value={visitor.qr_code_hash} 
            size={80}
            level="M"
          />
        </div>
        <div className="badge-info">
          <h3>{visitor.full_name}</h3>
          <p>{visitor.registration_number}</p>
          <p>{visitor.visitor_type}</p>
        </div>
      </div>

      <div className="badge-footer" style={{ fontSize: '8pt', textAlign: 'center' }}>
        Date: {today} | Seat: {visitor.seat_number || 'N/A'}
      </div>
    </div>,
    printRoot
  );
}