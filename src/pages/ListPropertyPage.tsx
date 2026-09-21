import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  Building2, 
  CheckCircle2, 
  Send, 
  ShieldCheck, 
  ArrowRight, 
  UploadCloud, 
  Image as ImageIcon, 
  Plus, 
  Trash2, 
  X, 
  Link2,
  Phone,
  MessageSquare,
  AlertCircle,
  RefreshCw,
  Loader2,
  Sparkles
} from 'lucide-react';
import { StorageService } from '../services/storageService';
import { Breadcrumbs } from '../components/common/Breadcrumbs';
import { handleOverviewPaste } from '../utils/textFormat';

// Client-side image compressor: scales down high-res photos to prevent memory lag & storage quota issues
const compressImage = (file: File, maxWidth = 1280, quality = 0.75): Promise<string> => {
  return new Promise((resolve) => {
    if (!file.type.startsWith('image/')) {
      resolve('');
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        let width = img.width;
        let height = img.height;
        if (width > maxWidth || height > maxWidth) {
          if (width > height) {
            height = Math.round((height * maxWidth) / width);
            width = maxWidth;
          } else {
            width = Math.round((width * maxWidth) / height);
            height = maxWidth;
          }
        }
        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(img, 0, 0, width, height);
          resolve(canvas.toDataURL('image/jpeg', quality));
        } else {
          resolve((e.target?.result as string) || '');
        }
      };
      img.onerror = () => resolve((e.target?.result as string) || '');
      img.src = (e.target?.result as string) || '';
    };
    reader.onerror = () => resolve('');
    reader.readAsDataURL(file);
  });
};

export const ListPropertyPage: React.FC = () => {
  const [formData, setFormData] = useState({
    ownerName: '',
    phone: '',
    email: '',
    category: 'office-space',
    listingType: 'Rent',
    buildingName: '',
    locationName: 'Sector 62, Noida',
    address: '',
    size: '',
    expectedPrice: '',
    description: '',
    preferredContact: 'phone',
    consent: true,
  });

  const [images, setImages] = useState<string[]>([]);
  const [imageUploadTab, setImageUploadTab] = useState<'device' | 'url'>('device');
  const [imageUrlInput, setImageUrlInput] = useState('');
  const [uploadError, setUploadError] = useState('');
  const [isProcessingImages, setIsProcessingImages] = useState(false);
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    setUploadError('');
    const files = e.target.files;
    if (!files || files.length === 0) return;

    if (images.length + files.length > 8) {
      setUploadError('Maximum 8 photos allowed. You can paste more via image URLs.');
      return;
    }

    setIsProcessingImages(true);
    try {
      const fileList = Array.from(files);
      const compressedList: string[] = [];

      for (const file of fileList) {
        if (!file.type.startsWith('image/')) {
          setUploadError('Please select valid image files (PNG, JPG, WebP).');
          continue;
        }
        if (file.size > 15 * 1024 * 1024) {
          setUploadError('One or more images exceed 15MB limit.');
          continue;
        }

        const compressed = await compressImage(file, 1280, 0.75);
        if (compressed) {
          compressedList.push(compressed);
        }
      }

      if (compressedList.length > 0) {
        setImages(prev => [...prev, ...compressedList]);
      }
    } catch (err) {
      console.warn('Image optimization error:', err);
      setUploadError('Failed to process one or more images.');
    } finally {
      setIsProcessingImages(false);
      e.target.value = '';
    }
  };

  const handleAddUrl = (e: React.FormEvent) => {
    e.preventDefault();
    if (!imageUrlInput.trim()) return;
    if (images.length >= 8) {
      setUploadError('Maximum 8 photos reached.');
      return;
    }
    setImages(prev => [...prev, imageUrlInput.trim()]);
    setImageUrlInput('');
    setUploadError('');
  };

  const handleRemoveImage = (index: number) => {
    setImages(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    const cleanName = formData.ownerName.trim();
    const cleanPhone = formData.phone.trim().replace(/[\s-]/g, '');
    const cleanSize = formData.size.trim();
    const cleanPrice = formData.expectedPrice.trim();

    if (!cleanName) return setError('Please enter owner or representative name.');
    if (!cleanPhone || cleanPhone.length < 10) return setError('Please enter a valid 10-digit mobile number.');
    if (!cleanSize) return setError('Please enter property floor area/size.');
    if (!cleanPrice) return setError('Please enter expected rent or sale price.');
    if (!formData.consent) return setError('Please accept the owner authorization consent.');

    setLoading(true);

    try {
      await StorageService.createLead({
        lead_type: 'list_property',
        name: cleanName,
        email: formData.email.trim() || 'owner@shristiestate.in',
        phone: cleanPhone,
        preferred_contact_method: formData.preferredContact as any,
        message: `Owner property listing: ${cleanSize} ${formData.category} (${formData.listingType}) in ${formData.buildingName ? formData.buildingName + ', ' : ''}${formData.locationName}. Expected: ${cleanPrice}. Details: ${formData.description.trim() || 'No additional details'}. Photos attached: ${images.length}.`,
        list_property_details: {
          property_category: formData.category,
          expected_price: cleanPrice,
          area: cleanSize,
          address: formData.address.trim(),
          images: images,
        },
        images: images,
        source_page: '/list-your-property',
        lead_source: 'website',
      });
      setSubmitted(true);
    } catch (err: any) {
      console.error('List property submit error:', err);
      setError(
        'Submission failed due to a temporary network issue. Please connect with our advisory desk directly via WhatsApp or phone.'
      );
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      ownerName: '',
      phone: '',
      email: '',
      category: 'office-space',
      listingType: 'Rent',
      buildingName: '',
      locationName: 'Sector 62, Noida',
      address: '',
      size: '',
      expectedPrice: '',
      description: '',
      preferredContact: 'phone',
      consent: true,
    });
    setImages([]);
    setSubmitted(false);
    setError('');
  };

  const whatsappMessage = encodeURIComponent(
    `Hello Shristi Estate Team, I want to list my commercial property:\n` +
    `• Owner: ${formData.ownerName}\n` +
    `• Phone: ${formData.phone}\n` +
    `• Type: ${formData.category} (${formData.listingType})\n` +
    `• Location: ${formData.buildingName ? formData.buildingName + ', ' : ''}${formData.locationName}\n` +
    `• Size: ${formData.size}\n` +
    `• Expected: ${formData.expectedPrice}`
  );

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      <Breadcrumbs
        items={[
          { label: 'Owners & Landlords', path: '/properties' },
          { label: 'List Your Commercial Property' }
        ]}
      />

      <div className="glass-card rounded-3xl p-6 sm:p-10 border border-slate-200/90 dark:border-slate-800 bg-white/80 dark:bg-[#0B132B]/85 shadow-2xl">
        {submitted ? (
          <div className="text-center py-10 space-y-6">
            <div className="w-16 h-16 rounded-full bg-emerald-500/10 text-emerald-500 flex items-center justify-center mx-auto border border-emerald-500/20 shadow-lg">
              <CheckCircle2 className="w-9 h-9" />
            </div>

            <div className="space-y-2">
              <h2 className="text-3xl font-extrabold text-slate-900 dark:text-white font-['Outfit']">
                Listing Submitted for Verification
              </h2>
              <p className="text-sm text-slate-600 dark:text-slate-300 max-w-lg mx-auto leading-relaxed">
                Thank you, <strong>{formData.ownerName}</strong>. Your commercial property at{' '}
                <strong>{formData.buildingName || formData.locationName}</strong> has been registered with our advisory team.
              </p>
            </div>

            {/* Quick Summary Card */}
            <div className="max-w-md mx-auto p-4 rounded-2xl bg-slate-50 dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 text-left text-xs space-y-2">
              <div className="flex justify-between py-1 border-b border-slate-200/60 dark:border-slate-800">
                <span className="text-slate-500 dark:text-slate-400">Category & Type:</span>
                <span className="font-semibold text-slate-900 dark:text-white capitalize">{formData.category.replace(/-/g, ' ')} ({formData.listingType})</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-200/60 dark:border-slate-800">
                <span className="text-slate-500 dark:text-slate-400">Floor Size:</span>
                <span className="font-semibold text-slate-900 dark:text-white">{formData.size}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-200/60 dark:border-slate-800">
                <span className="text-slate-500 dark:text-slate-400">Expected Pricing:</span>
                <span className="font-semibold text-emerald-600 dark:text-emerald-400">{formData.expectedPrice}</span>
              </div>
              <div className="flex justify-between py-1">
                <span className="text-slate-500 dark:text-slate-400">Photos Attached:</span>
                <span className="font-semibold text-slate-900 dark:text-white">{images.length} photos</span>
              </div>
            </div>

            {/* Attached Photos Gallery on Success Card */}
            {images.length > 0 && (
              <div className="max-w-md mx-auto p-4 rounded-2xl bg-slate-50 dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 space-y-2">
                <div className="flex items-center justify-between text-xs font-semibold text-slate-700 dark:text-slate-300">
                  <span className="flex items-center gap-1.5">
                    <ImageIcon className="w-3.5 h-3.5 text-brand-600 dark:text-brand-400" />
                    Uploaded Property Photos ({images.length})
                  </span>
                  <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-bold bg-emerald-500/10 px-2 py-0.5 rounded-full">
                    Saved in Record
                  </span>
                </div>
                <div className="grid grid-cols-3 sm:grid-cols-4 gap-2 pt-1">
                  {images.map((img, idx) => (
                    <div
                      key={idx}
                      className="aspect-video rounded-xl overflow-hidden border border-slate-200 dark:border-slate-700 bg-slate-100 dark:bg-slate-800 shadow-sm relative group"
                    >
                      <img src={img} alt={`Uploaded ${idx + 1}`} className="w-full h-full object-cover" />
                      {idx === 0 && (
                        <span className="absolute bottom-1 left-1 px-1 rounded bg-brand-600 text-white text-[8px] font-bold uppercase">
                          Cover
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* CTAs */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
              <a
                href={`https://wa.me/918750098666?text=${whatsappMessage}`}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full sm:w-auto px-6 py-3 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white flex items-center justify-center gap-2 shadow-lg transition-all"
              >
                <MessageSquare className="w-4 h-4" />
                <span>Notify Team on WhatsApp</span>
              </a>
              <button
                type="button"
                onClick={resetForm}
                className="w-full sm:w-auto px-6 py-3 rounded-xl text-xs font-bold border border-slate-300 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 transition-all"
              >
                List Another Property
              </button>
              <Link
                to="/properties"
                className="w-full sm:w-auto px-6 py-3 rounded-xl text-xs font-bold btn-glass-primary flex items-center justify-center gap-1.5"
              >
                <span>Browse Inventory</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        ) : (
          <div>
            <div className="mb-8">
              <span className="text-xs font-bold uppercase tracking-wider text-brand-600 dark:text-brand-400 flex items-center gap-1.5">
                <Building2 className="w-3.5 h-3.5" />
                Landlord & Asset Owner Portal
              </span>
              <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white font-['Outfit'] mt-1">
                List Your Commercial Property
              </h1>
              <p className="text-sm text-slate-600 dark:text-slate-300 mt-1">
                Connect with vetted corporate tenants, MNCs, and commercial investors across Noida and Delhi-NCR.
              </p>
            </div>

            {/* Actionable Error Alert */}
            {error && (
              <div className="mb-6 p-4 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-700 dark:text-rose-300 text-xs space-y-3 animate-in fade-in duration-300">
                <div className="flex items-start gap-2.5">
                  <AlertCircle className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
                  <div className="flex-1">
                    <p className="font-semibold">{error}</p>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                      Our commercial team is directly reachable for immediate listing assistance:
                    </p>
                  </div>
                </div>
                <div className="flex flex-wrap items-center gap-2 pt-1 border-t border-rose-500/20">
                  <a
                    href={`https://wa.me/918750098666?text=${whatsappMessage}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-3.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-[11px] flex items-center gap-1.5 shadow"
                  >
                    <MessageSquare className="w-3 h-3" />
                    <span>Send via WhatsApp (+91 87500 98666)</span>
                  </a>
                  <a
                    href="tel:+918750098666"
                    className="px-3.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-900 text-white font-semibold text-[11px] flex items-center gap-1.5"
                  >
                    <Phone className="w-3 h-3" />
                    <span>Call Advisory Desk (+91 87500 98666)</span>
                  </a>
                  <button
                    type="button"
                    onClick={() => setError('')}
                    className="px-3 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white text-[11px] font-medium"
                  >
                    Dismiss
                  </button>
                </div>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Owner Info */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                    Owner / Representative Name *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Full Name"
                    value={formData.ownerName}
                    onChange={(e) => {
                      setFormData({ ...formData, ownerName: e.target.value });
                      if (error) setError('');
                    }}
                    className="glass-input w-full px-3.5 py-2.5 rounded-xl text-sm"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                    Mobile Number *
                  </label>
                  <input
                    type="tel"
                    required
                    placeholder="10-digit mobile"
                    value={formData.phone}
                    onChange={(e) => {
                      setFormData({ ...formData, phone: e.target.value });
                      if (error) setError('');
                    }}
                    className="glass-input w-full px-3.5 py-2.5 rounded-xl text-sm"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                    Email Address
                  </label>
                  <input
                    type="email"
                    placeholder="email@domain.com"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="glass-input w-full px-3.5 py-2.5 rounded-xl text-sm"
                  />
                </div>
              </div>

              {/* Property Details */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                    Property Category
                  </label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="glass-input w-full px-3.5 py-2.5 rounded-xl text-sm"
                  >
                    <option value="office-space">Office Space</option>
                    <option value="it-business-parks">IT Park Office</option>
                    <option value="warehouses">Warehouse / Shed</option>
                    <option value="factory-industrial">Factory / Industrial Plot</option>
                    <option value="land">Commercial Land</option>
                    <option value="shops-retail">Retail Shop / Showroom</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                    Listing Intent
                  </label>
                  <select
                    value={formData.listingType}
                    onChange={(e) => setFormData({ ...formData, listingType: e.target.value })}
                    className="glass-input w-full px-3.5 py-2.5 rounded-xl text-sm"
                  >
                    <option value="Rent">For Rent</option>
                    <option value="Lease">Corporate Lease</option>
                    <option value="Sale">For Sale</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                    Floor Area (Super / Carpet) *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. 2,150 sq.ft"
                    value={formData.size}
                    onChange={(e) => {
                      setFormData({ ...formData, size: e.target.value });
                      if (error) setError('');
                    }}
                    className="glass-input w-full px-3.5 py-2.5 rounded-xl text-sm"
                  />
                </div>
              </div>

              {/* Building, Location & Expected Rate */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                    Building / Project Name
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. I-Thum, Noida One, Independent"
                    value={formData.buildingName}
                    onChange={(e) => setFormData({ ...formData, buildingName: e.target.value })}
                    className="glass-input w-full px-3.5 py-2.5 rounded-xl text-sm"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                    Location / Sector *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Sector 62, Sector 63, Expressway"
                    value={formData.locationName}
                    onChange={(e) => {
                      setFormData({ ...formData, locationName: e.target.value });
                      if (error) setError('');
                    }}
                    className="glass-input w-full px-3.5 py-2.5 rounded-xl text-sm"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                    Expected Rent / Price *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. ₹60/sq.ft or ₹2.5 Cr"
                    value={formData.expectedPrice}
                    onChange={(e) => {
                      setFormData({ ...formData, expectedPrice: e.target.value });
                      if (error) setError('');
                    }}
                    className="glass-input w-full px-3.5 py-2.5 rounded-xl text-sm"
                  />
                </div>
              </div>

              {/* Description */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                  Property Description, Furnishing, Power & Amenities
                </label>
                <textarea
                  rows={4}
                  placeholder="e.g. 5th floor, 24 workstations, 2 director cabins, 100% power backup, 2 covered car parkings..."
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  onPaste={(e) => handleOverviewPaste(e, (val) => setFormData({ ...formData, description: val }), formData.description)}
                  className="glass-input overview-input w-full px-3.5 py-2.5 rounded-xl text-sm"
                />
              </div>

              {/* IMAGE UPLOADING SECTION WITH TABS & OPTIMIZATION */}
              <div className="p-5 rounded-2xl border border-slate-200/90 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-900/60 space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-brand-500/10 text-brand-600 dark:text-brand-400 flex items-center justify-center">
                      <ImageIcon className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                          Property Photos & Media Upload
                        </h3>
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-brand-500/10 text-brand-600 dark:text-brand-400">
                          {images.length}/8 Max
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400">
                        Upload unit interior, workstations, cabins, facade, or floor plans.
                      </p>
                    </div>
                  </div>

                  {/* Mode Tabs */}
                  <div className="flex items-center p-1 rounded-xl bg-slate-200/80 dark:bg-slate-800/80 self-start sm:self-auto">
                    <button
                      type="button"
                      onClick={() => setImageUploadTab('device')}
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                        imageUploadTab === 'device'
                          ? 'bg-white dark:bg-slate-900 text-brand-600 dark:text-brand-400 shadow-sm'
                          : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                      }`}
                    >
                      <UploadCloud className="w-3.5 h-3.5" />
                      <span>Upload Files</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setImageUploadTab('url')}
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                        imageUploadTab === 'url'
                          ? 'bg-white dark:bg-slate-900 text-brand-600 dark:text-brand-400 shadow-sm'
                          : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                      }`}
                    >
                      <Link2 className="w-3.5 h-3.5" />
                      <span>Paste Image URL</span>
                    </button>
                  </div>
                </div>

                {uploadError && (
                  <div className="p-2.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-600 dark:text-rose-400 text-xs font-medium">
                    {uploadError}
                  </div>
                )}

                {/* Tab 1: Device Upload Drag & Drop Area */}
                {imageUploadTab === 'device' ? (
                  <label className="border-2 border-dashed border-slate-300 dark:border-slate-700 hover:border-brand-500 dark:hover:border-brand-400 rounded-2xl p-6 flex flex-col items-center justify-center cursor-pointer transition-colors bg-white/40 dark:bg-slate-900/40 hover:bg-brand-50/30 dark:hover:bg-brand-950/20 group relative">
                    <input
                      type="file"
                      multiple
                      accept="image/png,image/jpeg,image/webp,image/jpg"
                      onChange={handleFileUpload}
                      disabled={isProcessingImages || images.length >= 8}
                      className="hidden"
                    />
                    {isProcessingImages ? (
                      <div className="flex flex-col items-center py-2 space-y-2">
                        <Loader2 className="w-7 h-7 text-brand-600 dark:text-brand-400 animate-spin" />
                        <p className="text-xs font-bold text-slate-800 dark:text-slate-200">
                          Optimizing photos for instant high-res upload...
                        </p>
                      </div>
                    ) : (
                      <>
                        <div className="w-12 h-12 rounded-2xl bg-brand-500/10 group-hover:scale-110 text-brand-600 dark:text-brand-400 flex items-center justify-center transition-transform mb-2">
                          <UploadCloud className="w-6 h-6" />
                        </div>
                        <p className="text-xs font-bold text-slate-800 dark:text-slate-200">
                          Click to choose photos or drag & drop files here
                        </p>
                        <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-0.5">
                          Supports JPG, PNG, WebP up to 15MB each (automatically compressed for fast loading).
                        </p>
                      </>
                    )}
                  </label>
                ) : (
                  /* Tab 2: Paste Image URL / Cloud Photo Link */
                  <div className="flex gap-2">
                    <input
                      type="url"
                      placeholder="Paste image link (e.g. https://images.unsplash.com/... or Google Drive URL)"
                      value={imageUrlInput}
                      onChange={(e) => setImageUrlInput(e.target.value)}
                      className="glass-input flex-1 px-3.5 py-2.5 rounded-xl text-sm"
                    />
                    <button
                      type="button"
                      onClick={handleAddUrl}
                      className="btn-glass-primary px-4 py-2.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 shrink-0"
                    >
                      <Plus className="w-4 h-4" />
                      <span>Add Photo</span>
                    </button>
                  </div>
                )}

                {/* Uploaded Images Preview Gallery */}
                {images.length > 0 && (
                  <div className="space-y-2 pt-2">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-semibold text-slate-700 dark:text-slate-300">
                        Attached Photos ({images.length})
                      </span>
                      <button
                        type="button"
                        onClick={() => setImages([])}
                        className="text-rose-500 hover:text-rose-600 text-[11px] font-medium"
                      >
                        Clear All
                      </button>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-5 gap-3">
                      {images.map((img, idx) => (
                        <div
                          key={idx}
                          className="group relative rounded-xl overflow-hidden aspect-video border border-slate-200 dark:border-slate-700 bg-slate-100 dark:bg-slate-800 shadow-sm"
                        >
                          <img
                            src={img}
                            alt={`Upload ${idx + 1}`}
                            className="w-full h-full object-cover"
                          />
                          {idx === 0 && (
                            <span className="absolute top-1.5 left-1.5 px-1.5 py-0.5 rounded bg-brand-600 text-white text-[9px] font-bold uppercase tracking-wider shadow">
                              Cover
                            </span>
                          )}
                          <button
                            type="button"
                            onClick={() => handleRemoveImage(idx)}
                            className="absolute top-1.5 right-1.5 p-1 rounded-lg bg-rose-600/90 text-white opacity-0 group-hover:opacity-100 transition-opacity hover:bg-rose-700 shadow"
                            title="Remove photo"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Consent */}
              <div className="flex items-start gap-2.5">
                <input
                  type="checkbox"
                  id="list-consent"
                  checked={formData.consent}
                  onChange={(e) => setFormData({ ...formData, consent: e.target.checked })}
                  className="mt-1 rounded text-brand-600 focus:ring-brand-500"
                />
                <label htmlFor="list-consent" className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed cursor-pointer select-none">
                  I confirm that I am the owner / authorized channel partner for this commercial asset and authorize Shristi Estate to present this unit to qualified corporate prospects.
                </label>
              </div>

              <button
                type="submit"
                disabled={loading || isProcessingImages}
                className="btn-glass-primary w-full py-3.5 rounded-xl font-bold text-sm flex items-center justify-center gap-2"
              >
                {loading ? (
                  <span className="flex items-center gap-2">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Submitting Listing...
                  </span>
                ) : (
                  <>
                    <UploadCloud className="w-4 h-4" />
                    <span>Submit Property for Listing</span>
                  </>
                )}
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
};
