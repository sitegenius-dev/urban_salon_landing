 import { MapPin, Phone, Clock, User } from 'lucide-react';

export default function AboutSection({ about, settings }) {
   const imageUrl = settings?.about_image
  ? `${import.meta.env.VITE_BASE_URL}${settings.about_image}`
  : about?.imageUrl
    ? `${import.meta.env.VITE_BASE_URL}${about.imageUrl}`
    : null;

  const ownerName   = settings?.owner_name       || '';
  const phone       = settings?.contact_phone    || settings?.contact_whatsapp || '';
  const whatsapp    = settings?.contact_whatsapp || settings?.contact_phone    || '';
  const address     = settings?.contact_address  || '';
  const openTime    = settings?.salon_opening_time  || '09:00';
  const closeTime   = settings?.salon_closing_time  || '20:00';
  const description = about?.description         || '';
  const heading     = about?.heading             || 'About Us';

  const contacts = [
    ownerName && { icon: User,   label: 'Owner',        value: ownerName },
    phone     && { icon: Phone,  label: 'Phone / WhatsApp', value: phone },
    address   && { icon: MapPin, label: 'Location',     value: address },
    {             icon: Clock,   label: 'Open Hours',   value: `Mon – Sun | ${openTime} – ${closeTime}` },
  ].filter(Boolean);

  return (
    <section id="about" className="bg-[#f0f0f0] py-16 px-4">
      <div className="max-w-5xl mx-auto">

        {/* ── Top: Text left, Image right ── */}
        <div className="flex flex-col md:flex-row gap-10 items-center mb-14">

          {/* Left — text */}
          <div className="flex-1">
            {/* Eyebrow */}
            <div className="flex items-center gap-2 mb-4">
              <span className="block w-8 h-[2px] bg-gray-900 rounded-full" />
              <span className="text-xs font-bold uppercase tracking-widest text-gray-400">Our Story</span>
            </div>

            <h2 className="text-3xl md:text-4xl font-black text-gray-900 leading-tight mb-5">
              {heading}
            </h2>

            <p className="text-gray-500 text-[15px] leading-relaxed">
              {description || 'Professional grooming and beauty services delivered right at your doorstep. With trained experts and a focus on hygiene and quality, we offer everything from haircare to complete makeovers — easy, reliable, and convenient.'}
            </p>

           
            
          </div>

          {/* Right — image */}
          <div className="flex-shrink-0 w-full md:w-[340px]">
            {imageUrl ? (
              <div className="relative">
                {/* Decorative offset border */}
                <div className="absolute -bottom-3 -right-3 w-full h-full rounded-2xl border-2 border-gray-200" />
                <img
                  src={imageUrl}
                  alt={heading}
                  className="relative w-full h-64 md:h-80 object-cover rounded-2xl shadow-md"
                />
              </div>
            ) : (
              /* Placeholder when no image set */
              <div className="relative">
                <div className="absolute -bottom-3 -right-3 w-full h-full rounded-2xl border-2 border-gray-200" />
                <div className="relative w-full h-64 md:h-80 rounded-2xl bg-gray-100 flex flex-col items-center justify-center text-gray-300">
                  <div className="text-5xl mb-2">✂️</div>
                  <p className="text-xs font-medium">Add image from admin panel</p>
                </div>
              </div>
            )}
          </div>
        </div>

        

      

      </div>
    </section>
  );
}