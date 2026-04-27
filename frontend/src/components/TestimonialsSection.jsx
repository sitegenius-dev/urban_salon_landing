 export default function TestimonialsSection() {
  const testimonials = [
    {
      name: "Rahul",
      text: "Great service",
      image: "https://i.pravatar.cc/100?img=1",
    },
    {
      name: "Amit",
      text: "Very professional",
      image: "https://i.pravatar.cc/100?img=2",
    },
    {
      name: "Sneha",
      text: "Loved the experience",
      image: "https://i.pravatar.cc/100?img=3",
    },
  ];

  return (
    <section className="bg-[#f5f5f5] py-16 px-6">
      <div className="max-w-6xl mx-auto">

        <h2 className="text-2xl font-bold mb-8">Testimonials</h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">

          {testimonials.map((item, i) => (
            <div key={i} className="bg-white p-8 border">

              <h3 className="text-lg font-semibold mb-4">“Quote”</h3>

              <div className="flex items-center gap-4">
                <img src={item.image} className="w-10 h-10 rounded-full" />

                <div>
                  <p className="font-semibold">{item.name}</p>
                  <p className="text-gray-500 text-sm">{item.text}</p>
                </div>
              </div>

            </div>
          ))}

        </div>
      </div>
    </section>
  );
}