import { MessageCircle } from "lucide-react";

export default function Footer() {
  return (
    <footer className="bg-black text-white py-12 px-6">
      <div className="max-w-6xl mx-auto flex justify-between items-center">

        {/* Contact */}
        <div className="text-sm">
          <h3 className="font-semibold mb-3">Contact Us</h3>
          <p className="text-gray-300 leading-relaxed">
            phone no: +91 XXXXX XXXXX <br />
            Driver: Rahul Verma <br />
            Koregaon Park, Pune, Maharashtra
          </p>

          <p className="mt-4 font-semibold">Available</p>
        </div>

        {/* Quick Links */}
        <div className="text-sm">
          <h3 className="font-semibold mb-3">Quick Links</h3>
          <ul className="text-gray-300 space-y-1">
            <li>• Book</li>
            <li>• About Service</li>
            <li>• Contact</li>
          </ul>

          <p className="mt-4">[ Book ]</p>
        </div>

        {/* WhatsApp */}
        <div className="flex items-center justify-center">
          <div className="w-20 h-20 bg-green-500 rounded-full flex items-center justify-center">
            <MessageCircle size={32} className="text-white" />
          </div>
        </div>

      </div>
    </footer>
  );
}