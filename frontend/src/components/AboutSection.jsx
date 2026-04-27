 export default function AboutSection() {
  return (
    <section id="about" className="bg-[#f5f5f5] py-16 px-6">
      <div className="max-w-5xl mx-auto">

        {/* About */}
        <h2 className="text-2xl font-semibold text-gray-900 mb-3">
          About
        </h2>

        <p className="text-gray-700 text-[16px] leading-relaxed max-w-3xl">
          Urban Company delivers professional grooming, beauty, and wellness
          services at home across Pune. With trained experts and a focus on
          hygiene and quality, we offer everything from haircare to complete
          makeovers easy, reliable, and right at your doorstep.
        </p>

        {/* Contact */}
        <h2 className="text-2xl font-semibold text-gray-900 mt-10 mb-3">
          Contact
        </h2>

        <ul className="text-gray-800 text-[16px] space-y-2 list-disc pl-5">
          <li>
            <span className="font-semibold">Owner:</span> Rahul Rathod
          </li>
          <li>
            <span className="font-semibold">Phone / WhatsApp:</span> +91 XXXXX XXXXX
          </li>
          <li>
            <span className="font-semibold">Location:</span> Koregaon Park, Pune, Maharashtra
          </li>
          <li>
            <span className="font-semibold">Open Hours:</span> Monday – Sunday | 10:00 AM – 9:00 PM
          </li>
        </ul>

      </div>
    </section>
  );
}