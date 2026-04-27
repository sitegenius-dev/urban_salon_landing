import { Phone, MessageCircle, MapPin } from 'lucide-react';

export default function ContactSection({ contact }) {
  const heading     = contact?.heading     || 'Get In Touch';
  const phone       = contact?.phone       || '';
  const whatsapp    = contact?.whatsapp    || phone;
  const address     = contact?.address     || 'Koregaon Park, Pune, Maharashtra';
  const email       = contact?.email       || '';
  const hours       = contact?.workingHours || '9am – 9pm, Mon – Sun';
  const owner       = contact?.owner       || '';
  const mapEmbed    = contact?.mapEmbed    || '';

  const waNumber = whatsapp.replace(/\D/g, '');

  return (
    <section id="contact" className="py-20 bg-gray-50 px-4">
      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-12">
          <p className="text-gold text-xs font-bold tracking-[0.3em] uppercase mb-2">Reach Us</p>
          <h2 className="text-3xl sm:text-4xl font-black text-gray-900">{heading}</h2>
        </div>

        {/* Info cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 mb-10">
          {phone && (
            <a href={`tel:${phone}`}
              className="bg-white rounded-2xl p-6 text-center shadow-sm hover:shadow-md transition-shadow border border-gray-100 hover:border-gold/30 group">
              <div className="w-12 h-12 rounded-full bg-blue-50 flex items-center justify-center mx-auto mb-3 group-hover:bg-blue-100 transition-colors">
                <Phone size={22} className="text-blue-500" />
              </div>
              <div className="font-bold text-gray-900 mb-1">Call Us</div>
              <div className="text-sm text-blue-500">{phone}</div>
            </a>
          )}

          {whatsapp && (
            <a href={`https://wa.me/${waNumber}`} target="_blank" rel="noreferrer"
              className="bg-white rounded-2xl p-6 text-center shadow-sm hover:shadow-md transition-shadow border border-gray-100 hover:border-green-300 group">
              <div className="w-12 h-12 rounded-full bg-green-50 flex items-center justify-center mx-auto mb-3 group-hover:bg-green-100 transition-colors">
                <MessageCircle size={22} className="text-green-500" />
              </div>
              <div className="font-bold text-gray-900 mb-1">WhatsApp</div>
              <div className="text-sm text-green-500">Chat with us</div>
            </a>
          )}

          <div className="bg-white rounded-2xl p-6 text-center shadow-sm border border-gray-100">
            <div className="w-12 h-12 rounded-full bg-red-50 flex items-center justify-center mx-auto mb-3">
              <MapPin size={22} className="text-red-500" />
            </div>
            <div className="font-bold text-gray-900 mb-1">Location</div>
            <div className="text-sm text-gray-500">{address}</div>
          </div>
        </div>

        {/* Detail block */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <h3 className="font-black text-gray-900 text-lg mb-4">Contact Details</h3>
          <ul className="space-y-3 text-sm text-gray-600">
            {owner && <li>• <strong>Owner:</strong> {owner}</li>}
            {phone && (
              <li>• <strong>Phone / WhatsApp:</strong>{' '}
                <a href={`tel:${phone}`} className="text-blue-500 hover:underline">{phone}</a>
              </li>
            )}
            {whatsapp && (
              <li>• <strong>Place / WhatsApp:</strong>{' '}
                <a href={`https://wa.me/${waNumber}`} target="_blank" rel="noreferrer"
                  className="text-green-500 hover:underline">Chat on WhatsApp</a>
              </li>
            )}
            {address && <li>• <strong>Location:</strong> {address}</li>}
            {email  && <li>• <strong>Email:</strong> <a href={`mailto:${email}`} className="text-blue-500 hover:underline">{email}</a></li>}
            {hours  && <li>• <strong>Expert Hours:</strong> {hours}</li>}
          </ul>
        </div>

        {mapEmbed && (
          <div className="mt-6 rounded-2xl overflow-hidden shadow-sm border border-gray-100">
            <iframe src={mapEmbed} title="Location Map" width="100%" height="300"
              style={{ border: 0 }} allowFullScreen loading="lazy"
              referrerPolicy="no-referrer-when-downgrade" />
          </div>
        )}
      </div>
    </section>
  );
}
