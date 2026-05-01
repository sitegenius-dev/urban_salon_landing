export default function HeroSection({ settings = {} }) {
  const heroImage = settings.hero_image
    ? `${import.meta.env.VITE_BASE_URL}${settings.hero_image}`
    : '/images/Banner.jpeg';

  return (
    <section id="home" className="w-full" style={{ marginTop: '56px' }}>
      <div className="relative w-full" style={{ height: 'calc(100vw * 0.32)' }}>
        <img
          src={heroImage}
          alt="Professional Salon Service"
          className="w-full h-full object-cover object-center"
        />
      </div>
    </section>
  );
}