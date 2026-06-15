import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/useAuthStore';
import { ArrowRight, BookOpen, Users, TreeDeciduous } from 'lucide-react';

const API_URL = 'http://localhost:8000/api';

interface SiteSetting {
  hero_title: string;
  hero_subtitle: string;
  hero_image_url: string;
  about_content: string;
  feature1_title: string;
  feature1_desc: string;
  feature2_title: string;
  feature2_desc: string;
  feature3_title: string;
  feature3_desc: string;
  footer_text: string;
  primary_color: string;
}

export const LandingPage: React.FC = () => {
  const [settings, setSettings] = useState<SiteSetting | null>(null);
  const navigate = useNavigate();
  const isAuthenticated = useAuthStore(state => state.isAuthenticated);

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const res = await fetch(`${API_URL}/settings/landing`);
        if (res.ok) {
          const data = await res.json();
          setSettings(data);
        }
      } catch (error) {
        console.error('Failed to fetch landing settings', error);
      }
    };
    fetchSettings();
  }, []);

  const handleCTA = () => {
    if (isAuthenticated) {
      navigate('/tree');
    } else {
      navigate('/login');
    }
  };

  if (!settings) {
    return <div className="min-h-screen flex items-center justify-center bg-gray-50">Đang tải...</div>;
  }

  return (
    <div className="min-h-screen bg-stone-50 font-sans text-stone-900">
      {/* Hero Section */}
      <section 
        className="relative h-screen flex items-center justify-center text-center px-4"
        style={{
          backgroundImage: `url(${settings.hero_image_url})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundAttachment: 'fixed'
        }}
      >
        <div className="absolute inset-0 bg-black/60" /> {/* Dark overlay */}
        
        <div className="relative z-10 max-w-4xl mx-auto flex flex-col items-center">
          <div 
            className="w-20 h-20 rounded-full flex items-center justify-center mb-6 backdrop-blur-sm border"
            style={{ backgroundColor: `${settings.primary_color}33`, borderColor: `${settings.primary_color}4D` }}
          >
            <TreeDeciduous className="w-10 h-10" style={{ color: settings.primary_color }} />
          </div>
          <h1 className="text-5xl md:text-7xl font-sans font-bold text-white mb-6 tracking-tight drop-shadow-lg uppercase">
            {settings.hero_title}
          </h1>
          <p className="text-xl md:text-2xl text-stone-200 mb-10 max-w-2xl font-light italic">
            "{settings.hero_subtitle}"
          </p>
          <button 
            onClick={handleCTA}
            className="group relative inline-flex items-center justify-center px-8 py-4 font-bold text-white transition-all duration-200 font-sans rounded-full hover:brightness-110 focus:outline-none focus:ring-2 focus:ring-offset-2 shadow-xl overflow-hidden"
            style={{ backgroundColor: settings.primary_color, '--tw-ring-color': settings.primary_color } as React.CSSProperties}
          >
            <span className="relative z-10 flex items-center space-x-2">
              <span>{isAuthenticated ? 'ĐI TỚI PHẢ ĐỒ' : 'TRA CỨU GIA PHẢ'}</span>
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </span>
          </button>
        </div>
        
        {/* Scroll indicator */}
        <div className="absolute bottom-10 left-1/2 transform -translate-x-1/2 animate-bounce">
          <div className="w-1 h-12 rounded-full" style={{ background: `linear-gradient(to bottom, transparent, ${settings.primary_color}80, ${settings.primary_color})` }}></div>
        </div>
      </section>

      {/* About Section */}
      <section className="py-24 px-6 md:px-12 max-w-5xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-sans font-bold text-stone-800 mb-4 uppercase tracking-widest">Nguồn Cội</h2>
          <div className="w-24 h-1 mx-auto rounded-full" style={{ backgroundColor: settings.primary_color }}></div>
        </div>
        
        <div className="max-w-3xl mx-auto text-center mb-16 prose prose-lg prose-stone font-sans leading-relaxed text-stone-700">
          {/* Split by newlines to render paragraphs */}
          {settings.about_content.split('\n').map((paragraph, index) => (
            <p key={index} className="mb-6">{paragraph}</p>
          ))}
        </div>
        
        <div className="grid md:grid-cols-3 gap-8 items-stretch">
          <div className="bg-white p-8 rounded-2xl shadow-sm border border-stone-200 hover:shadow-md transition-shadow hover:border-gray-300">
            <div className="w-14 h-14 bg-gray-100 rounded-full flex items-center justify-center mb-6 mx-auto md:mx-0">
              <BookOpen className="w-7 h-7" style={{ color: settings.primary_color }} />
            </div>
            <h3 className="text-xl font-bold font-sans mb-3 text-center md:text-left">{settings.feature1_title}</h3>
            <p className="text-stone-600 text-center md:text-left">{settings.feature1_desc}</p>
          </div>
          
          <div className="bg-white p-8 rounded-2xl shadow-sm border border-stone-200 hover:shadow-md transition-shadow hover:border-gray-300">
            <div className="w-14 h-14 bg-gray-100 rounded-full flex items-center justify-center mb-6 mx-auto md:mx-0">
              <Users className="w-7 h-7" style={{ color: settings.primary_color }} />
            </div>
            <h3 className="text-xl font-bold font-sans mb-3 text-center md:text-left">{settings.feature2_title}</h3>
            <p className="text-stone-600 text-center md:text-left">{settings.feature2_desc}</p>
          </div>

          <div className="bg-white p-8 rounded-2xl shadow-sm border border-stone-200 hover:shadow-md transition-shadow hover:border-gray-300">
            <div className="w-14 h-14 bg-gray-100 rounded-full flex items-center justify-center mb-6 mx-auto md:mx-0">
              <TreeDeciduous className="w-7 h-7" style={{ color: settings.primary_color }} />
            </div>
            <h3 className="text-xl font-bold font-sans mb-3 text-center md:text-left">{settings.feature3_title}</h3>
            <p className="text-stone-600 text-center md:text-left">{settings.feature3_desc}</p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-stone-900 text-stone-400 py-12 text-center border-t-4" style={{ borderColor: settings.primary_color }}>
        <p className="font-sans mb-2">&copy; {new Date().getFullYear()} - {settings.footer_text}</p>
        <p className="text-sm">Xây dựng để kết nối các thế hệ mai sau.</p>
      </footer>
    </div>
  );
};
