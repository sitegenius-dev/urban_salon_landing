 import { useEffect, useState } from 'react';
import api from '../../api/axios';
import Navbar from '../../components/Navbar';
import HeroSection from '../../components/HeroSection';
import BookingForm from '../../components/BookingForm';
import BookingTracker from '../../components/BookingTracker';
import ServicesSection from '../../components/ServicesSection';
import AboutSection from '../../components/AboutSection';
import Footer from '../../components/Footer';
import HighlightsSection from '../../components/HighlightsSection';
import TestimonialsSection from '../../components/TestimonialCard';

export default function LandingPage() {
  const [content, setContent] = useState({});
  const [services, setServices] = useState([]);
  const [staff, setStaff] = useState([]);
  const [settings, setSettings] = useState({});
  const [loading, setLoading] = useState(true);

  // Cart state
  const [cartIds, setCartIds] = useState([]);
  const [checkoutOpen, setCheckoutOpen] = useState(false);

  const addToCart = (id) => {
    setCartIds(prev => prev.includes(id) ? prev : [...prev, id]);
  };

  const removeFromCart = (id) => {
    setCartIds(prev => {
      const updated = prev.filter(x => x !== id);
      // If cart becomes empty, close checkout sheet
      if (updated.length === 0) setCheckoutOpen(false);
      return updated;
    });
  };

  const handleProceedToBook = () => {
    setCheckoutOpen(true);
  };

  useEffect(() => {
    const fetchAll = async () => {
      try {
        const [contentRes, servicesRes, staffRes, settingsRes] = await Promise.allSettled([
          api.get('/site-content/public'),
          api.get('/services'),
          api.get('/staff'),
          api.get('/settings/public'),
        ]);
        if (contentRes.status === 'fulfilled') setContent(contentRes.value.data);
        if (servicesRes.status === 'fulfilled') setServices(servicesRes.value.data.services || []);
        if (staffRes.status === 'fulfilled') setStaff(staffRes.value.data.staff || []);
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
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="spinner mx-auto mb-4" />
          <p className="text-gray-400 text-sm">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      <Navbar salonName={settings.service_name} />
      <HeroSection hero={content.hero} settings={settings} />

      <ServicesSection
        services={services}
        selectedIds={cartIds}
        onAdd={addToCart}
        onRemove={removeFromCart}
        onProceedToBook={handleProceedToBook}
      />

      {/* UC-style bottom sheet checkout */}
      <BookingForm
        services={services}
        staff={staff}
        preSelectedIds={cartIds}
        onRemoveFromCart={removeFromCart}
        isOpen={checkoutOpen}
        onClose={() => setCheckoutOpen(false)}
      />

      <BookingTracker />
      <AboutSection about={content.about} settings={settings} />
      <HighlightsSection highlights={content.highlights} />
      <TestimonialsSection testimonials={content.testimonials} />
      <Footer contact={content.contact} salonName={settings.service_name} />
    </div>
  );
}