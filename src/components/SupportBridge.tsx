import { useState, useEffect } from 'react';
import { supabase, SupportResource } from '../lib/supabase';
import { Phone, Globe, MapPin, Clock, Shield, Heart, Scale, AlertCircle } from 'lucide-react';

export function SupportBridge() {
  const [resources, setResources] = useState<SupportResource[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  useEffect(() => {
    loadResources();
  }, []);

  const loadResources = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('support_resources')
      .select('*')
      .order('category', { ascending: true });

    if (!error && data) {
      setResources(data);
    }
    setLoading(false);
  };

  const categories = [
    { value: 'all', label: 'All Resources', icon: Shield },
    { value: 'emergency', label: 'Emergency', icon: AlertCircle },
    { value: 'police', label: 'Police & Cyber Crime', icon: Shield },
    { value: 'medical', label: 'Medical Care', icon: Heart },
    { value: 'counseling', label: 'Counseling & Support', icon: Heart },
    { value: 'legal', label: 'Legal Aid', icon: Scale },
  ];

  const filteredResources =
    selectedCategory === 'all'
      ? resources
      : resources.filter((r) => r.category === selectedCategory);

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'emergency':
        return <AlertCircle size={20} className="text-red-600" />;
      case 'police':
        return <Shield size={20} className="text-blue-600" />;
      case 'medical':
        return <Heart size={20} className="text-pink-600" />;
      case 'counseling':
        return <Heart size={20} className="text-purple-600" />;
      case 'legal':
        return <Scale size={20} className="text-emerald-600" />;
      default:
        return <Shield size={20} className="text-slate-600" />;
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'emergency':
        return 'bg-red-100 text-red-700 border-red-300';
      case 'police':
        return 'bg-blue-100 text-blue-700 border-blue-300';
      case 'medical':
        return 'bg-pink-100 text-pink-700 border-pink-300';
      case 'counseling':
        return 'bg-purple-100 text-purple-700 border-purple-300';
      case 'legal':
        return 'bg-emerald-100 text-emerald-700 border-emerald-300';
      default:
        return 'bg-slate-100 text-slate-700 border-slate-300';
    }
  };

  return (
    <div>
      <div className="bg-gradient-to-r from-emerald-600 to-teal-600 rounded-2xl shadow-lg p-8 mb-8 text-white">
        <h1 className="text-3xl font-bold mb-3">SupportBridge</h1>
        <p className="text-emerald-50 text-lg mb-6">
          Connect with verified help services instantly. You're not alone in this journey.
        </p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white bg-opacity-20 backdrop-blur rounded-lg p-4">
            <p className="text-3xl font-bold mb-1">{resources.length}</p>
            <p className="text-emerald-50 text-sm">Verified Resources</p>
          </div>
          <div className="bg-white bg-opacity-20 backdrop-blur rounded-lg p-4">
            <p className="text-3xl font-bold mb-1">
              {resources.filter((r) => r.available_24_7).length}
            </p>
            <p className="text-emerald-50 text-sm">Available 24/7</p>
          </div>
          <div className="bg-white bg-opacity-20 backdrop-blur rounded-lg p-4">
            <p className="text-3xl font-bold mb-1">Instant</p>
            <p className="text-emerald-50 text-sm">Connection Time</p>
          </div>
        </div>
      </div>

      <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
        {categories.map((cat) => {
          const Icon = cat.icon;
          return (
            <button
              key={cat.value}
              onClick={() => setSelectedCategory(cat.value)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium whitespace-nowrap transition-all ${
                selectedCategory === cat.value
                  ? 'bg-emerald-600 text-white shadow-md'
                  : 'bg-white text-slate-700 border border-slate-200 hover:border-emerald-300'
              }`}
            >
              <Icon size={18} />
              {cat.label}
            </button>
          );
        })}
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600"></div>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {filteredResources.map((resource) => (
            <div
              key={resource.id}
              className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 hover:shadow-md transition-shadow"
            >
              <div className="flex items-start gap-4 mb-4">
                <div className="w-12 h-12 bg-slate-100 rounded-lg flex items-center justify-center flex-shrink-0">
                  {getCategoryIcon(resource.category)}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <h3 className="text-lg font-semibold text-slate-900">{resource.name}</h3>
                    {resource.verified && (
                      <span className="inline-flex items-center gap-1 px-2 py-1 bg-emerald-100 text-emerald-700 rounded text-xs font-medium">
                        Verified
                      </span>
                    )}
                  </div>

                  <span
                    className={`inline-block px-3 py-1 rounded-full text-xs font-medium border ${getCategoryColor(
                      resource.category
                    )}`}
                  >
                    {resource.category}
                  </span>
                </div>
              </div>

              <p className="text-slate-600 text-sm mb-4">{resource.description}</p>

              <div className="space-y-2 mb-4">
                {resource.phone && (
                  <div className="flex items-center gap-2 text-sm">
                    <Phone size={16} className="text-slate-400" />
                    <a
                      href={`tel:${resource.phone}`}
                      className="text-emerald-600 hover:text-emerald-700 font-medium"
                    >
                      {resource.phone}
                    </a>
                  </div>
                )}

                {resource.website && (
                  <div className="flex items-center gap-2 text-sm">
                    <Globe size={16} className="text-slate-400" />
                    <a
                      href={resource.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-emerald-600 hover:text-emerald-700 font-medium truncate"
                    >
                      Visit Website
                    </a>
                  </div>
                )}

                {resource.location && (
                  <div className="flex items-center gap-2 text-sm">
                    <MapPin size={16} className="text-slate-400" />
                    <span className="text-slate-600">{resource.location}</span>
                  </div>
                )}

                {resource.available_24_7 && (
                  <div className="flex items-center gap-2 text-sm">
                    <Clock size={16} className="text-slate-400" />
                    <span className="text-slate-600 font-medium">Available 24/7</span>
                  </div>
                )}
              </div>

              {resource.phone && (
                <a
                  href={`tel:${resource.phone}`}
                  className="block w-full text-center bg-emerald-600 hover:bg-emerald-700 text-white font-semibold py-3 rounded-lg transition-colors"
                >
                  Call Now
                </a>
              )}
            </div>
          ))}
        </div>
      )}

      {filteredResources.length === 0 && !loading && (
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-12 text-center">
          <p className="text-slate-600">No resources found in this category.</p>
        </div>
      )}
    </div>
  );
}
