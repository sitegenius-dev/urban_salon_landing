import { Link } from 'react-router-dom';
import AdminLayout from '../../components/AdminLayout';
import { Image, Scissors, FileText, Phone } from 'lucide-react';

const cms_sections = [
  {
    to: '/developer/hero',
    icon: Image,
    title: 'Hero Section',
    desc: 'Update banner title, subtitle, description and background image URL.',
    color: '#D4AF37',
  },
  {
    to: '/developer/services',
    icon: Scissors,
    title: 'Services CMS',
    desc: 'Add, edit or delete salon services with categories and pricing.',
    color: '#4f8ef7',
  },
  {
    to: '/developer/about',
    icon: FileText,
    title: 'About Section',
    desc: 'Manage the about text, highlights and salon story.',
    color: '#00cc88',
  },
  {
    to: '/developer/contact',
    icon: Phone,
    title: 'Contact Section',
    desc: 'Update phone, WhatsApp, address and working hours.',
    color: '#ff8800',
  },
];

export default function DeveloperDashboard() {
  return (
    <AdminLayout panel="developer">
      <div className="space-y-6">
        <div>
          <h1 className="text-white font-black text-xl">Content Management System</h1>
          <p className="text-gray-500 text-sm mt-1">Control all website content from here.</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          {cms_sections.map(({ to, icon: Icon, title, desc, color }) => (
            <Link key={to} to={to}
              className="bg-[#111] border border-white/10 rounded-2xl p-6 hover:border-white/20 transition-all group hover:shadow-lg">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0"
                  style={{ background: color + '22' }}>
                  <Icon size={22} style={{ color }} />
                </div>
                <div>
                  <h3 className="text-white font-bold mb-1 group-hover:text-gold transition-colors">{title}</h3>
                  <p className="text-gray-500 text-sm leading-relaxed">{desc}</p>
                </div>
              </div>
              <div className="mt-4 text-xs font-semibold flex items-center gap-1" style={{ color }}>
                Edit section →
              </div>
            </Link>
          ))}
        </div>

        <div className="bg-[#111] border border-yellow-900/40 rounded-xl p-4 text-sm text-yellow-600">
          <strong className="text-yellow-500">Note:</strong> Changes here update live website content immediately.
          Always preview the site after making changes.
        </div>
      </div>
    </AdminLayout>
  );
}
