import { useEffect, useState } from 'react';
import api from '../../api/axios';
import Navbar from '../../components/Navbar';
import HeroSection from '../../components/HeroSection';
import BookingForm from '../../components/BookingForm';
import BookingTracker from '../../components/BookingTracker';
import ServicesSection from '../../components/ServicesSection';
import AboutSection from '../../components/AboutSection';
// import ContactSection from '../../components/ContactSection';
import Footer from '../../components/Footer';
import { MessageCircle } from 'lucide-react';
import HighlightsSection from '../../components/HighlightsSection';
import TestimonialsSection from '../../components/TestimonialCard';

export default function LandingPage() {
  const [content,  setContent]  = useState({});
  const [services, setServices] = useState([]);
  const [staff,    setStaff]    = useState([]);
  const [settings, setSettings] = useState({});
  const [loading,  setLoading]  = useState(true);

  useEffect(() => {
    const fetchAll = async () => {
      try {
        // Fetch all data in parallel using the correct backend APIs
        const [contentRes, servicesRes, staffRes, settingsRes] = await Promise.allSettled([
          api.get('/site-content/public'),       // GET /api/site-content/public
          api.get('/services'),                  // GET /api/services  (public active services)
          api.get('/staff'),                     // GET /api/staff     (public active staff)
          api.get('/settings/public'),           // GET /api/settings/public
        ]);

        if (contentRes.status  === 'fulfilled') setContent(contentRes.value.data);
        if (servicesRes.status === 'fulfilled') setServices(servicesRes.value.data.services || []);
        if (staffRes.status    === 'fulfilled') setStaff(staffRes.value.data.staff || []);
        if (settingsRes.status === 'fulfilled') setSettings(settingsRes.value.data || {});
      } catch (err) {
        console.error('Failed to load content', err);
      } finally {
        setLoading(false);
      }
    };
    fetchAll();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center">
        <div className="text-center">
          <div className="spinner mx-auto mb-4" />
          <p className="text-gray-500 text-sm">Loading...</p>
        </div>
      </div>
    );
  }

  const waNumber = (content?.contact?.whatsapp || content?.contact?.phone || '').replace(/\D/g, '');

  return (
    <div className="min-h-screen">
      <Navbar salonName={settings.service_name} />
      <HeroSection hero={content.hero} settings={settings} />
      <BookingForm services={services} staff={staff} />
      <BookingTracker />
      <ServicesSection services={services} />
      <AboutSection about={content.about} />
      <HighlightsSection highlights={content.highlights} />
      <TestimonialsSection testimonials={content.testimonials} />
      {/* <ContactSection contact={content.contact} settings={settings} /> */}
      <Footer contact={content.contact} salonName={settings.service_name} />

     
       
    </div>
  );
}
