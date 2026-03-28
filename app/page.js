'use client';
import Link from 'next/link';
import { useState, useEffect } from 'react';
import { FiHeart, FiCalendar, FiFileText, FiActivity, FiShield, FiUsers, FiPhone, FiMail, FiMapPin, FiChevronRight, FiCheck, FiMenu, FiX, FiStar } from 'react-icons/fi';
import { departmentAPI } from '../lib/api';

const stats = [
  { number: '500+', label: 'Doctors', icon: FiUsers },
  { number: '10,000+', label: 'Patients Served', icon: FiHeart },
  { number: '15+', label: 'Departments', icon: FiFileText },
  { number: '24/7', label: 'Emergency Care', icon: FiActivity },
];

const features = [
  { icon: FiCalendar, title: 'Easy Appointment Booking', desc: 'Book appointments with your preferred doctor in seconds. View real-time availability and get instant confirmation.', color: 'bg-blue-50 text-blue-600' },
  { icon: FiFileText, title: 'Digital Medical Records', desc: 'Access your complete medical history, lab results, and prescriptions from anywhere, anytime securely.', color: 'bg-teal-50 text-teal-600' },
  { icon: FiActivity, title: 'Health Monitoring', desc: 'Track your vital signs, BMI, blood glucose and get visual trends with interactive charts.', color: 'bg-purple-50 text-purple-600' },
  { icon: FiShield, title: 'Secure & Private', desc: 'Bank-level encryption keeps your medical data safe. HIPAA-compliant with role-based access control.', color: 'bg-emerald-50 text-emerald-600' },
  { icon: FiHeart, title: 'Medication Reminders', desc: 'Never miss a dose. Set up personalized medication schedules and track your adherence over time.', color: 'bg-rose-50 text-rose-600' },
  { icon: FiUsers, title: 'Multi-Role Access', desc: 'Tailored dashboards for patients, doctors, and administrators with appropriate access controls.', color: 'bg-amber-50 text-amber-600' },
];

const testimonials = [
  { name: 'Fatima Begum', role: 'Patient', text: 'This system has completely transformed how I manage my health. Booking appointments is so easy now!', rating: 5 },
  { name: 'Dr. Rahman Ahmed', role: 'Cardiologist', text: 'The doctor dashboard is incredibly intuitive. I can access all patient information quickly.', rating: 5 },
  { name: 'Mohammad Karim', role: 'Patient', text: 'I love how I can track my medications and get reminders. My health has improved significantly.', rating: 5 },
];

export default function LandingPage() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [departments, setDepartments] = useState([]);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    departmentAPI.getDepartments().then(r => setDepartments(r.data.data?.slice(0, 8) || [])).catch(() => {});
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div className="min-h-screen bg-white">
      {/* Navbar */}
      <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${scrolled ? 'bg-white shadow-md' : 'bg-transparent'}`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-2">
              <div className="w-9 h-9 bg-primary-600 rounded-lg flex items-center justify-center">
                <FiHeart className="text-white text-lg" />
              </div>
              <div>
                <span className="text-lg font-bold text-gray-900">HealthCare</span>
                <span className="text-xs text-gray-500 block leading-none">Chattagram</span>
              </div>
            </div>
            <div className="hidden md:flex items-center gap-8">
              <a href="#features" className="text-gray-600 hover:text-primary-600 text-sm font-medium transition-colors">Features</a>
              <a href="#departments" className="text-gray-600 hover:text-primary-600 text-sm font-medium transition-colors">Departments</a>
              <a href="#about" className="text-gray-600 hover:text-primary-600 text-sm font-medium transition-colors">About</a>
              <a href="#contact" className="text-gray-600 hover:text-primary-600 text-sm font-medium transition-colors">Contact</a>
              <Link href="/login" className="btn-secondary text-sm py-2">Login</Link>
              <Link href="/register" className="btn-primary text-sm py-2">Get Started</Link>
            </div>
            <button onClick={() => setMenuOpen(!menuOpen)} className="md:hidden p-2 rounded-lg text-gray-600 hover:bg-gray-100">
              {menuOpen ? <FiX size={20} /> : <FiMenu size={20} />}
            </button>
          </div>
        </div>
        {menuOpen && (
          <div className="md:hidden bg-white border-t px-4 py-4 space-y-3">
            {['features', 'departments', 'about', 'contact'].map(s => (
              <a key={s} href={`#${s}`} onClick={() => setMenuOpen(false)} className="block text-gray-700 font-medium capitalize hover:text-primary-600">{s}</a>
            ))}
            <div className="flex gap-3 pt-2">
              <Link href="/login" className="btn-secondary text-sm flex-1 text-center">Login</Link>
              <Link href="/register" className="btn-primary text-sm flex-1 text-center">Register</Link>
            </div>
          </div>
        )}
      </nav>

      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center bg-gradient-to-br from-primary-900 via-primary-800 to-teal-700 overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-20 left-10 w-72 h-72 bg-white rounded-full blur-3xl" />
          <div className="absolute bottom-20 right-10 w-96 h-96 bg-teal-300 rounded-full blur-3xl" />
        </div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 grid lg:grid-cols-2 gap-12 items-center">
          <div className="text-white">
            <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur px-4 py-2 rounded-full text-sm mb-6">
              <FiMapPin size={14} />
              <span>Chattagram, Bangladesh</span>
            </div>
            <h1 className="text-5xl lg:text-6xl font-extrabold leading-tight mb-6">
              Your Health,<br />
              <span className="text-teal-300">Our Priority</span>
            </h1>
            <p className="text-xl text-blue-100 mb-8 leading-relaxed">
              A comprehensive healthcare management system connecting patients, doctors and administrators. 
              Book appointments, track health metrics, and manage medical records — all in one place.
            </p>
            <div className="flex flex-wrap gap-4">
              <Link href="/register" className="btn-primary bg-white text-primary-700 hover:bg-gray-100 text-base px-8 py-3">
                Register as Patient <FiChevronRight />
              </Link>
              <Link href="/login" className="inline-flex items-center gap-2 px-8 py-3 border-2 border-white/40 text-white rounded-lg hover:bg-white/10 transition-all font-medium">
                Doctor Login <FiChevronRight />
              </Link>
            </div>
            <div className="flex items-center gap-2 mt-6 text-blue-200 text-sm">
              <FiCheck className="text-teal-300" />
              <span>Free registration · No credit card required · Secure & private</span>
            </div>
          </div>
          <div className="hidden lg:grid grid-cols-2 gap-4">
            {[
              { label: 'Active Patients', value: '10,247', icon: '👥', color: 'bg-white/10' },
              { label: 'Appointments Today', value: '184', icon: '📅', color: 'bg-teal-500/20' },
              { label: 'Expert Doctors', value: '500+', icon: '👨‍⚕️', color: 'bg-white/10' },
              { label: 'Health Records', value: '50K+', icon: '📋', color: 'bg-teal-500/20' },
            ].map((item, i) => (
              <div key={i} className={`${item.color} backdrop-blur border border-white/20 rounded-2xl p-5 text-white`}>
                <div className="text-3xl mb-2">{item.icon}</div>
                <div className="text-2xl font-bold">{item.value}</div>
                <div className="text-blue-200 text-sm">{item.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="bg-white py-12 border-y border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
            {stats.map((stat, i) => (
              <div key={i} className="text-center">
                <div className="text-4xl font-extrabold text-primary-600 mb-1">{stat.number}</div>
                <div className="text-gray-500 text-sm font-medium">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Everything You Need for Better Health</h2>
            <p className="text-xl text-gray-500 max-w-2xl mx-auto">Our platform provides comprehensive tools to manage your health journey from anywhere.</p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((f, i) => (
              <div key={i} className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-all group">
                <div className={`w-12 h-12 ${f.color} rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                  <f.icon size={22} />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">{f.title}</h3>
                <p className="text-gray-500 text-sm leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Departments */}
      <section id="departments" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Our Medical Departments</h2>
            <p className="text-xl text-gray-500">Specialized care across all major medical disciplines</p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {(departments.length ? departments : [
              { name: 'Cardiology', icon: '❤️' },
              { name: 'Neurology', icon: '🧠' },
              { name: 'Orthopedics', icon: '🦴' },
              { name: 'Pediatrics', icon: '👶' },
              { name: 'General Medicine', icon: '🩺' },
              { name: 'Dermatology', icon: '🔬' },
              { name: 'Gynecology', icon: '🌸' },
              { name: 'Ophthalmology', icon: '👁️' },
            ]).map((dept, i) => (
              <div key={i} className="group bg-gray-50 hover:bg-primary-50 rounded-xl p-5 text-center cursor-pointer transition-all border border-transparent hover:border-primary-200">
                <div className="text-3xl mb-3">{dept.icon || '🏥'}</div>
                <div className="text-sm font-semibold text-gray-800 group-hover:text-primary-700">{dept.name}</div>
                {dept.doctors && <div className="text-xs text-gray-400 mt-1">{dept.doctors.length} doctors</div>}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section id="about" className="py-20 bg-gradient-to-br from-primary-50 to-teal-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">How It Works</h2>
            <p className="text-xl text-gray-500">Get started in three simple steps</p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              { step: '01', title: 'Create Account', desc: 'Register as a patient and complete your health profile with your medical history.', icon: '📝' },
              { step: '02', title: 'Book Appointment', desc: 'Browse doctors, check availability and book an appointment in seconds.', icon: '📅' },
              { step: '03', title: 'Manage Your Health', desc: 'Track vitals, medications, view lab results and prescriptions all in one dashboard.', icon: '📊' },
            ].map((item, i) => (
              <div key={i} className="relative text-center">
                <div className="w-16 h-16 bg-primary-600 rounded-2xl flex items-center justify-center text-2xl mx-auto mb-4 shadow-lg">{item.icon}</div>
                <div className="text-5xl font-extrabold text-primary-100 absolute top-0 left-1/2 -translate-x-1/2 -z-10 leading-none">{item.step}</div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">{item.title}</h3>
                <p className="text-gray-500">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">What Our Users Say</h2>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {testimonials.map((t, i) => (
              <div key={i} className="bg-gray-50 rounded-2xl p-6 border border-gray-100">
                <div className="flex gap-1 mb-4">
                  {[...Array(t.rating)].map((_, j) => <FiStar key={j} className="text-amber-400 fill-amber-400" size={14} />)}
                </div>
                <p className="text-gray-600 mb-4 italic">"{t.text}"</p>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center text-primary-700 font-bold text-sm">
                    {t.name.charAt(0)}
                  </div>
                  <div>
                    <div className="font-semibold text-gray-900 text-sm">{t.name}</div>
                    <div className="text-gray-500 text-xs">{t.role}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 bg-gradient-to-r from-primary-700 to-teal-600">
        <div className="max-w-4xl mx-auto px-4 text-center text-white">
          <h2 className="text-4xl font-bold mb-4">Ready to Take Control of Your Health?</h2>
          <p className="text-xl text-blue-100 mb-8">Join thousands of patients in Chattagram who trust our platform for their healthcare needs.</p>
          <div className="flex flex-wrap gap-4 justify-center">
            <Link href="/register" className="btn-primary bg-white text-primary-700 hover:bg-gray-100 text-base px-10 py-3">
              Register Free Today
            </Link>
            <Link href="/login" className="inline-flex items-center gap-2 px-10 py-3 border-2 border-white/40 text-white rounded-lg hover:bg-white/10 transition-all font-medium">
              Sign In
            </Link>
          </div>
        </div>
      </section>

      {/* Contact */}
      <section id="contact" className="py-16 bg-gray-900 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-8">
            <div className="md:col-span-2">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-9 h-9 bg-primary-600 rounded-lg flex items-center justify-center">
                  <FiHeart className="text-white" />
                </div>
                <span className="text-xl font-bold">HealthCare System</span>
              </div>
              <p className="text-gray-400 mb-4">Comprehensive healthcare management for patients and doctors in Chattagram, Bangladesh.</p>
              <div className="space-y-2 text-gray-400 text-sm">
                <div className="flex items-center gap-2"><FiMapPin size={14} /> Agrabad, Chattagram, Bangladesh</div>
                <div className="flex items-center gap-2"><FiPhone size={14} /> +880 1404-233001</div>
                <div className="flex items-center gap-2"><FiMail size={14} /> info@healthcare-ctg.com</div>
              </div>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Quick Links</h4>
              <ul className="space-y-2 text-gray-400 text-sm">
                <li><Link href="/login" className="hover:text-white transition-colors">Patient Login</Link></li>
                <li><Link href="/register" className="hover:text-white transition-colors">Register</Link></li>
                <li><a href="#features" className="hover:text-white transition-colors">Features</a></li>
                <li><a href="#departments" className="hover:text-white transition-colors">Departments</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Services</h4>
              <ul className="space-y-2 text-gray-400 text-sm">
                <li>Appointment Booking</li>
                <li>Medical Records</li>
                <li>Lab Results</li>
                <li>Health Monitoring</li>
                <li>Medication Tracking</li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-500 text-sm">
            © 2026 HealthCare System, Chattagram. All rights reserved. Built with ❤️ in Bangladesh.
          </div>
        </div>
      </section>
    </div>
  );
}
