//  export default function HeroSection({ settings = {} }) {
//   const BASE = import.meta.env.VITE_BASE_URL || '';

//   const desktopImage = settings.hero_image
//     ? `${BASE}${settings.hero_image}`
//     : '/images/Banner.jpeg';

//   const mobileImage = settings.hero_mobile_image
//     ? `${BASE}${settings.hero_mobile_image}`
//     : desktopImage;

//   return (
//     <section id="home" className="w-full" style={{ marginTop: '56px' }}>

//       {/* ── MOBILE: vertical/portrait image ── only on screens < 768px */}
//       <div
//         className="block md:hidden w-full"
//         style={{ height: '100vw' }}
//       >
//         <img
//           src={mobileImage}
//           alt="Professional Salon Service"
//           className="w-full h-full object-cover object-center"
//         />
//       </div>

//       {/* ── DESKTOP: landscape image ── only on screens >= 768px */}
//       <div
//         className="hidden md:block relative w-full"
//         style={{ height: 'calc(100vw * 0.32)' }}
//       >
//         <img
//           src={desktopImage}
//           alt="Professional Salon Service"
//           className="w-full h-full object-cover object-center"
//         />
//       </div>

//     </section>
//   );
// }
export default function HeroSection({ settings = {} }) {
  const BASE = import.meta.env.VITE_BASE_URL || '';

  const desktopImage = settings.hero_image
    ? `${BASE}${settings.hero_image}`
    : '/images/Banner.jpeg';

  const mobileImage = settings.hero_mobile_image
    ? `${BASE}${settings.hero_mobile_image}`
    : desktopImage;

  return (
    <section id="home" className="w-full" style={{ marginTop: '56px' }}>

      {/* ── MOBILE ── */}
      <div className="block md:hidden w-full">
        <picture>
          <source
            srcSet={mobileImage.replace(/\.(jpg|jpeg|png)$/i, '.webp')}
            type="image/webp"
          />
          <img
            src={mobileImage}
            alt="Professional Salon Service"
            className="w-full h-auto block"
            fetchpriority="high"
            decoding="async"
          />
        </picture>
      </div>

      {/* ── DESKTOP ── */}
      <div className="hidden md:block relative w-full">
        <picture>
          <source
            srcSet={desktopImage.replace(/\.(jpg|jpeg|png)$/i, '.webp')}
            type="image/webp"
          />
          <img
            src={desktopImage}
            alt="Professional Salon Service"
            className="w-full h-auto block"
            fetchpriority="high"
            decoding="async"
          />
        </picture>
      </div>

    </section>
  );
}