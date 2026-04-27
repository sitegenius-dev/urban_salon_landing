 
 export default function HeroSection() {
  return (
    <section id="home" className="w-full" style={{ marginTop: '56px' }}>
      {/* Banner Image — landscape ratio, full mobile width */}
      <div className="relative w-full" style={{ height: 'calc(100vw * 0.44)' }}>
        <img
          src="/images/Banner.jpeg"
          alt="Professional Salon Service"
          className="w-full h-full object-cover object-center"
        />
        {/* Caption bottom-left */}
        
      </div>
    </section>
  );
}