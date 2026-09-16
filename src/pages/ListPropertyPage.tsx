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
  FileImage
} from 'lucide-react';
import { StorageService } from '../services/storageService';
import { Breadcrumbs } from '../components/common/Breadcrumbs';
import { handleOverviewPaste } from '../utils/textFormat';

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
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    setUploadError('');
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const fileList = Array.from(files);
    fileList.forEach(file => {
      if (!file.type.startsWith('image/')) {
        setUploadError('Please select valid image files (PNG, JPG, WebP).');
        return;
      }
      if (file.size > 10 * 1024 * 1024) {
        setUploadError('One or more images exceed 10MB limit.');
        return;
      }

      const reader = new FileReader();
      reader.onload = () => {
        if (typeof reader.result === 'string') {
          setImages(prev => [...prev, reader.result as string]);
        }
      };
      reader.readAsDataURL(file);
    });

    e.target.value = '';
  };

  const handleAddUrl = (e: React.FormEvent) => {
    e.preventDefault();
    if (!imageUrlInput.trim()) return;
    setImages(prev => [...prev, imageUrlInput.trim()]);
    setImageUrlInput('');
  };

  const handleRemoveImage = (index: number) => {
    setImages(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!formData.ownerName.trim()) return setError('Please enter owner/representative name.');
    if (!formData.phone.trim() || formData.phone.length < 10) return setError('Please enter a valid mobile number.');
    if (!formData.size.trim()) return setError('Please enter property floor size.');
    if (!formData.expectedPrice.trim()) return setError('Please enter expected price or rent.');
    if (!formData.consent) return setError('Please accept authorization consent.');

    setLoading(true);

    try {
      await StorageService.createLead({
        lead_type: 'list_property',
        name: formData.ownerName,
        email: formData.email || 'owner@shristiestate.in',
        phone: formData.phone,
        preferred_contact_method: formData.preferredContact as any,
        message: `Owner property listing: ${formData.size} ${formData.category} in ${formData.buildingName || formData.locationName}. Expected: ${formData.expectedPrice}. Details: ${formData.description}. Attached: ${images.length} photos.`,
        list_property_details: {
          property_category: formData.category,
          expected_price: formData.expectedPrice,
          area: formData.size,
          address: formData.address,
          images: images,
        },
        images: images,
        source_page: '/list-your-property',
        lead_source: 'website',
      });
      setSubmitted(true);
    } catch (err) {
      setError('Error submitting property. Please reach our advisory desk directly.');
    } finally {
      setLoading(false);
    }
  };

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
          <div className="text-center py-12 space-y-4">
            <div className="w-16 h-16 rounded-full bg-emerald-500/10 text-emerald-500 flex items-center justify-center mx-auto mb-4 border border-emerald-500/20">
              <CheckCircle2 className="w-9 h-9" />
            </div>
            <h2 className="text-3xl font-extrabold text-slate-900 dark:text-white font-['Outfit']">
              Listing Submitted for Verification
            </h2>
            <p className="text-sm text-slate-600 dark:text-slate-300 max-w-lg mx-auto leading-relaxed">
              Thank you, <strong>{formData.ownerName}</strong>. Your commercial property has been recorded. Our team will verify building registry documents, take high-resolution floor photos if needed, and connect you with qualified corporate tenants/buyers.
            </p>
            <div className="pt-6">
              <Link to="/" className="btn-glass-primary px-6 py-2.5 rounded-xl text-sm font-semibold inline-block">
                Return to Homepage
              </Link>
            </div>
          </div>
        ) : (
          <div>
            <div className="mb-8">
              <span className="text-xs font-bold uppercase tracking-wider text-brand-600 dark:text-brand-400">
                Landlord & Asset Owner Portal
              </span>
              <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white font-['Outfit'] mt-1">
                List Your Commercial Property
              </h1>
              <p className="text-sm text-slate-600 dark:text-slate-300 mt-1">
                Connect with vetted corporate tenants, MNCs, and commercial investors across Noida and Delhi-NCR.
              </p>
            </div>

            {error && (
              <div className="mb-6 p-4 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-600 dark:text-rose-400 text-xs font-semibold">
                {error}
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
                    onChange={(e) => setFormData({ ...formData, ownerName: e.target.value })}
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
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
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
                    onChange={(e) => setFormData({ ...formData, size: e.target.value })}
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
                    onChange={(e) => setFormData({ ...formData, locationName: e.target.value })}
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
                    onChange={(e) => setFormData({ ...formData, expectedPrice: e.target.value })}
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
                  rows={5}
                  placeholder="e.g. 5th floor, 24 workstations, 2 director cabins, 100% power backup, 2 covered car parkings..."
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  onPaste={(e) => handleOverviewPaste(e, (val) => setFormData({ ...formData, description: val }), formData.description)}
                  className="glass-input overview-input w-full px-3.5 py-2.5 rounded-xl text-sm"
                />
              </div>

              {/* IMAGE UPLOADING SECTION WITH TABS */}
              <div className="p-5 rounded-2xl border border-slate-200/90 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-900/60 space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-brand-500/10 text-brand-600 dark:text-brand-400 flex items-center justify-center">
                      <ImageIcon className="w-4 h-4" />
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                        Property Photos & Media Upload
                      </h3>
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
                  <div className="p-2.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-600 text-xs font-medium">
                    {uploadError}
                  </div>
                )}

                {/* Tab 1: Device Upload Drag & Drop Area */}
                {imageUploadTab === 'device' ? (
                  <label className="border-2 border-dashed border-slate-300 dark:border-slate-700 hover:border-brand-500 dark:hover:border-brand-400 rounded-2xl p-6 flex flex-col items-center justify-center cursor-pointer transition-colors bg-white/40 dark:bg-slate-900/40 hover:bg-brand-50/30 dark:hover:bg-brand-950/20 group">
                    <input
                      type="file"
                      multiple
                      accept="image/png,image/jpeg,image/webp,image/jpg"
                      onChange={handleFileUpload}
                      className="hidden"
                    />
                    <div className="w-12 h-12 rounded-2xl bg-brand-500/10 group-hover:scale-110 text-brand-600 dark:text-brand-400 flex items-center justify-center transition-transform mb-2">
                      <UploadCloud className="w-6 h-6" />
                    </div>
                    <p className="text-xs font-bold text-slate-800 dark:text-slate-200">
                      Click to choose photos or drag & drop files here
                    </p>
                    <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-0.5">
                      Supports JPG, PNG, WebP up to 10MB each. High-res images increase tenant inquiries by 3x.
                    </p>
                  </label>
                ) : (
                  /* Tab 2: Paste Image URL / Drive Link */
                  <div className="flex gap-2">
                    <input
                      type="url"
                      placeholder="Paste image link (e.g. https://images.unsplash.com/... or cloud photo URL)"
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
                <label htmlFor="list-consent" className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                  I confirm that I am the owner / authorized channel partner for this commercial asset and authorize Shristi Estate to present this unit to qualified commercial prospects.
                </label>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="btn-glass-primary w-full py-3.5 rounded-xl font-bold text-sm flex items-center justify-center gap-2"
              >
                {loading ? (
                  <span>Submitting Listing...</span>
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
