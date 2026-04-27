import { Star, Smile, Award, BadgeCheck, Sparkles } from "lucide-react";

const data = [
  { icon: Star, text: "5+ YEARS EXPERIENCE" },
  { icon: Smile, text: "2000+ HAPPY CLIENTS" },
  { icon: Award, text: "PREMIUM PRODUCTS USED" },
  { icon: BadgeCheck, text: "EXPERT STYLISTS" },
  { icon: Sparkles, text: "CLEAN & HYGIENIC SPACE" },
];

export default function HighlightsSection() {
  return (
    <section className="bg-black py-16 px-6">
      <div className="max-w-5xl mx-auto">

        <div className="flex flex-col gap-6">
          {data.map((item, i) => {
            const Icon = item.icon;
            return (
              <div key={i} className="flex items-center gap-6">
                
                {/* Icon */}
                <Icon className="text-white w-6 h-6 shrink-0" />

                {/* Text */}
                <p className="text-white text-[20px] sm:text-[28px] md:text-[36px] font-semibold tracking-wide uppercase">
                  {item.text}
                </p>

              </div>
            );
          })}
        </div>

      </div>
    </section>
  );
}