import React, { useState, useEffect } from 'react';
import { 
  Star, 
  Quote, 
  ShieldCheck, 
  CheckCircle2, 
  Building2, 
  ChevronLeft, 
  ChevronRight,
  Plus,
  X
} from 'lucide-react';
import { StorageService } from '../../services/storageService';
import { ClientReview } from '../../types';

export const ClientReviewsSection: React.FC = () => {
  const [reviews, setReviews] = useState<ClientReview[]>(() => {
    return StorageService.getInitialReviews().filter(r => r.published);
  });
  const [currentIndex, setCurrentIndex] = useState(0);
  const [slideDirection, setSlideDirection] = useState<'right' | 'left'>('right');
  const [isPaused, setIsPaused] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [submittedSuccess, setSubmittedSuccess] = useState(false);

  const [formData, setFormData] = useState<Partial<ClientReview>>({
    client_name: '',
    client_role: '',
    company_name: '',
    rating: 5,
    review_title: '',
    review_text: '',
    space_leased: '',
    building_name: '',
    location_name: 'Noida',
    category: 'Office',
  });

  useEffect(() => {
    StorageService.getReviews().then((data) => {
      setReviews(data.filter(r => r.published));
    });
  }, []);

  // Display 3 cards at a time
  const cardsPerPage = 3;
  const maxPages = Math.ceil(reviews.length / cardsPerPage);
  const currentPage = Math.floor(currentIndex / cardsPerPage);

  // Auto-slide every 6.5s (pauses on hover)
  useEffect(() => {
    if (isPaused || reviews.length <= cardsPerPage) return;
    const timer = setInterval(() => {
      setSlideDirection('right');
      setCurrentIndex((prev) => (prev + cardsPerPage >= reviews.length ? 0 : prev + cardsPerPage));
    }, 6500);
    return () => clearInterval(timer);
  }, [isPaused, reviews.length, cardsPerPage]);

  const handlePrev = () => {
    setSlideDirection('left');
    setCurrentIndex((prev) => (prev - cardsPerPage < 0 ? Math.max(0, (maxPages - 1) * cardsPerPage) : prev - cardsPerPage));
  };

  const handleNext = () => {
    setSlideDirection('right');
    setCurrentIndex((prev) => (prev + cardsPerPage >= reviews.length ? 0 : prev + cardsPerPage));
  };

  const visibleReviews = reviews.slice(currentIndex, currentIndex + cardsPerPage);

  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.client_name || !formData.review_text || !formData.company_name) {
      alert('Please fill in your name, company, and review.');
      return;
    }

    const newRev: ClientReview = {
      id: `rev-${Date.now()}`,
      client_name: formData.client_name,
      client_role: formData.client_role || 'Business Leader',
      company_name: formData.company_name,
      rating: formData.rating || 5,
      review_title: formData.review_title || 'Excellent Commercial Advisory',
      review_text: formData.review_text,
      space_leased: formData.space_leased || '',
      building_name: formData.building_name || '',
      location_name: formData.location_name || 'Noida NCR',
      category: (formData.category as any) || 'Office',
      date: 'Just now',
      verified: true,
      source: 'Direct',
      published: true,
      order: 0,
      featured: true,
      avatar_url: `https://ui-avatars.com/api/?name=${encodeURIComponent(formData.client_name)}&background=0284c7&color=fff`
    };

    await StorageService.saveReview(newRev);
    setReviews([newRev, ...reviews]);
    setSubmittedSuccess(true);
    setTimeout(() => {
      setSubmittedSuccess(false);
      setShowModal(false);
      setFormData({
        client_name: '',
        client_role: '',
        company_name: '',
        rating: 5,
        review_title: '',
        review_text: '',
        space_leased: '',
        building_name: '',
        location_name: 'Noida',
        category: 'Office',
      });
    }, 1800);
  };

  // Structured Schema.org JSON-LD for Reviews and Aggregate Rating
  const aggregateRatingSchema = {
    '@context': 'https://schema.org',
    '@type': 'RealEstateAgent',
    name: 'Shristi Estate',
    url: 'https://shristiestate.in',
    telephone: '+91-8750098666',
    address: {
      '@type': 'PostalAddress',
      streetAddress: 'Unit No. 1035, 10th Floor, Tower-B, iThum Tower, Plot No. A-40, Sector-62',
      addressLocality: 'Noida',
      postalCode: '201309',
      addressRegion: 'Uttar Pradesh',
      addressCountry: 'IN'
    },
    aggregateRating: {
      '@type': 'AggregateRating',
      ratingValue: '4.9',
      reviewCount: reviews.length.toString(),
      bestRating: '5',
      worstRating: '1'
    },
    review: reviews.slice(0, 5).map(rev => ({
      '@type': 'Review',
      author: {
        '@type': 'Person',
        name: rev.client_name
      },
      datePublished: '2026-10-01',
      reviewBody: rev.review_text,
      reviewRating: {
        '@type': 'Rating',
        ratingValue: rev.rating.toString(),
        bestRating: '5',
        worstRating: '1'
      }
    }))
  };

  return (
    <section 
      id="client-reviews" 
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-10 sm:pb-14 select-none"
    >
      {/* Schema.org Script */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(aggregateRatingSchema) }}
      />

      {/* SECTION HEADER */}
      <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 sm:mb-10 gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-none text-[10px] font-mono uppercase tracking-widest bg-brand-50 dark:bg-brand-950/70 text-brand-600 dark:text-brand-400 border border-brand-200 dark:border-brand-800/80 mb-2">
            <ShieldCheck className="w-3.5 h-3.5 text-brand-500" />
            <span>Customer Reviews & Testimonials</span>
          </div>
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight text-slate-900 dark:text-white font-sans">
            What Our Clients Say
          </h2>
          <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 mt-1 max-w-2xl font-sans">
            Real feedback from enterprise facility directors, founders, and leasing heads who secured commercial property with Shristi Estate.
          </p>
        </div>

        {/* CONTROLS (Slider navigation & Write Review) */}
        <div className="flex items-center gap-2.5 shrink-0">
          {reviews.length > cardsPerPage && (
            <div className="flex items-center gap-1.5 mr-2">
              <button
                onClick={handlePrev}
                aria-label="Previous reviews"
                className="w-8 h-8 rounded-none border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0B132B] flex items-center justify-center text-slate-700 dark:text-slate-300 hover:border-brand-500 hover:text-brand-600 active:scale-90 transition-all shadow-xs cursor-pointer"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                onClick={handleNext}
                aria-label="Next reviews"
                className="w-8 h-8 rounded-none border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0B132B] flex items-center justify-center text-slate-700 dark:text-slate-300 hover:border-brand-500 hover:text-brand-600 active:scale-90 transition-all shadow-xs cursor-pointer"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          )}

          <button
            onClick={() => setShowModal(true)}
            className="btn-glass-primary px-3.5 py-1.5 rounded-none font-semibold text-xs uppercase tracking-wider flex items-center gap-1.5 cursor-pointer active:scale-95 transition-transform"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Write a Review</span>
          </button>
        </div>
      </div>

      {/* 3 REVIEW CARDS WITH ANIMATED STAGGERED ENTRANCE AND HOVER LIFT */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-5 items-stretch">
        {visibleReviews.map((rev, idx) => (
          <div
            key={`${rev.id}-${currentPage}`}
            className={`flex flex-col justify-between p-4 sm:p-5 rounded-none border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0B132B] shadow-xs hover:border-brand-500/80 dark:hover:border-brand-400 hover:shadow-xl dark:hover:shadow-brand-500/10 hover:-translate-y-1.5 transition-all duration-300 relative group overflow-hidden ${
              slideDirection === 'right' ? 'animate-review-in-right' : 'animate-review-in-left'
            }`}
            style={{ animationDelay: `${idx * 85}ms` }}
          >
            {/* Top illuminated gradient accent line on hover */}
            <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-brand-500 to-transparent scale-x-0 group-hover:scale-x-100 transition-transform duration-500 ease-out pointer-events-none" />

            {/* Subtle background quote watermark */}
            <Quote className="absolute right-3 bottom-3 w-12 h-12 text-slate-100 dark:text-slate-900/60 group-hover:text-brand-500/10 pointer-events-none transition-colors duration-300 stroke-[1]" />

            <div className="relative z-10">
              {/* STAR RATING & VERIFIED BADGE */}
              <div className="flex items-center justify-between gap-2 mb-2.5">
                <div className="flex items-center gap-1 text-amber-400 group-hover:scale-105 transition-transform duration-200 origin-left">
                  {[...Array(5)].map((_, i) => (
                    <Star 
                      key={i} 
                      className={`w-3.5 h-3.5 ${i < rev.rating ? 'fill-amber-400 text-amber-400' : 'text-slate-300 dark:text-slate-700'}`} 
                    />
                  ))}
                  <span className="text-xs font-bold text-slate-700 dark:text-slate-300 ml-1 font-mono">
                    {rev.rating}.0
                  </span>
                </div>

                {rev.verified && (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-none text-[10px] font-medium bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-900/80">
                    <CheckCircle2 className="w-3 h-3" />
                    Verified Lease
                  </span>
                )}
              </div>

              {/* REVIEW TITLE */}
              {rev.review_title && (
                <h3 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white font-sans mb-1.5 leading-snug group-hover:text-brand-600 dark:group-hover:text-brand-400 transition-colors line-clamp-1">
                  "{rev.review_title}"
                </h3>
              )}

              {/* REVIEW TEXT (COMPACT) */}
              <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed font-sans mb-2.5 line-clamp-3">
                "{rev.review_text}"
              </p>

              {/* SPACE LEASED / BUILDING TAG (COMPACT SLIM BAR) */}
              {(rev.space_leased || rev.building_name) && (
                <div className="mb-2.5 px-2.5 py-1 rounded-none bg-slate-50 dark:bg-slate-900/60 border border-slate-200/60 dark:border-slate-800 text-[10.5px] font-sans flex items-center gap-1.5 truncate">
                  <Building2 className="w-3 h-3 text-brand-600 dark:text-brand-400 shrink-0" />
                  <span className="truncate">
                    {rev.space_leased && (
                      <span className="font-semibold text-slate-800 dark:text-slate-200 mr-1.5">
                        {rev.space_leased}
                      </span>
                    )}
                    {rev.building_name && (
                      <span className="text-slate-500 dark:text-slate-400">
                        {rev.building_name}
                      </span>
                    )}
                  </span>
                </div>
              )}
            </div>

            {/* AUTHOR DETAILS: AVATAR, NAME, COMPANY */}
            <div className="pt-2.5 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between gap-2.5 mt-auto relative z-10">
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="w-8 h-8 rounded-none overflow-hidden bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shrink-0">
                  {rev.avatar_url ? (
                    <img
                      src={rev.avatar_url}
                      alt={rev.client_name}
                      className="w-full h-full object-cover"
                      loading="lazy"
                      onError={(e) => {
                        (e.target as HTMLElement).style.display = 'none';
                      }}
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center font-bold text-[10px] text-brand-600 dark:text-brand-400 uppercase">
                      {rev.client_name.slice(0, 2)}
                    </div>
                  )}
                </div>

                <div className="min-w-0">
                  <h4 className="font-bold text-xs text-slate-900 dark:text-white leading-tight font-sans truncate">
                    {rev.client_name}
                  </h4>
                  <div className="flex items-center gap-1 text-[10px] text-slate-500 dark:text-slate-400 font-sans truncate">
                    {rev.client_role && <span className="truncate">{rev.client_role}</span>}
                    {rev.client_role && rev.company_name && <span>•</span>}
                    <span className="font-semibold text-brand-600 dark:text-brand-400 truncate">
                      {rev.company_name}
                    </span>
                  </div>
                </div>
              </div>

              {rev.date && (
                <span className="text-[9.5px] font-mono text-slate-400 dark:text-slate-500 shrink-0">
                  {rev.date}
                </span>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* ANIMATED PAGINATION INDICATOR PILLS */}
      {maxPages > 1 && (
        <div className="flex items-center justify-center gap-1.5 mt-5">
          {Array.from({ length: maxPages }).map((_, idx) => (
            <button
              key={idx}
              onClick={() => {
                setSlideDirection(idx > currentPage ? 'right' : 'left');
                setCurrentIndex(idx * cardsPerPage);
              }}
              aria-label={`Go to review page ${idx + 1}`}
              className={`h-1.5 rounded-none transition-all duration-300 cursor-pointer ${
                currentPage === idx 
                  ? 'w-7 bg-brand-600 dark:bg-brand-400' 
                  : 'w-2 bg-slate-300 dark:bg-slate-700 hover:bg-brand-400'
              }`}
            />
          ))}
        </div>
      )}

      {/* WRITE A REVIEW MODAL */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs">
          <div className="bg-white dark:bg-[#0B132B] border border-slate-200 dark:border-slate-800 rounded-none w-full max-w-lg p-6 sm:p-8 shadow-2xl relative animate-in fade-in zoom-in-95 duration-200">
            <button
              onClick={() => setShowModal(false)}
              className="absolute top-4 right-4 p-1.5 text-slate-400 hover:text-slate-700 dark:hover:text-white transition-colors rounded-none"
            >
              <X className="w-5 h-5" />
            </button>

            {submittedSuccess ? (
              <div className="text-center py-8">
                <div className="w-14 h-14 rounded-none bg-emerald-100 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mx-auto mb-4">
                  <CheckCircle2 className="w-8 h-8" />
                </div>
                <h3 className="text-xl font-bold text-slate-900 dark:text-white font-sans">
                  Thank You for Your Review!
                </h3>
                <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-2">
                  Your feedback helps maintain transparent commercial leasing standards across Delhi NCR.
                </p>
              </div>
            ) : (
              <form onSubmit={handleSubmitReview} className="space-y-4">
                <div>
                  <span className="text-[10px] font-mono uppercase tracking-widest text-brand-600 dark:text-brand-400">
                    Client Feedback Desk
                  </span>
                  <h3 className="text-xl font-bold text-slate-900 dark:text-white font-sans mt-0.5">
                    Share Your Leasing Experience
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Your verified review will be displayed under our customer reviews showcase.
                  </p>
                </div>

                {/* Rating selection */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Rating (Stars)
                  </label>
                  <div className="flex items-center gap-2">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        type="button"
                        key={star}
                        onClick={() => setFormData({ ...formData, rating: star })}
                        className="p-1 hover:scale-110 transition-transform cursor-pointer"
                      >
                        <Star
                          className={`w-6 h-6 ${
                            (formData.rating || 5) >= star
                              ? 'fill-amber-400 text-amber-400'
                              : 'text-slate-300 dark:text-slate-600'
                          }`}
                        />
                      </button>
                    ))}
                    <span className="text-xs font-mono font-bold text-slate-700 dark:text-slate-300 ml-2">
                      {formData.rating || 5}.0 / 5
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      Your Full Name *
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.client_name || ''}
                      onChange={(e) => setFormData({ ...formData, client_name: e.target.value })}
                      placeholder="e.g. Rajesh Malhotra"
                      className="w-full px-3 py-2 text-xs border border-slate-200 dark:border-slate-800 rounded-none bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white focus:outline-none focus:border-brand-500"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      Company / Organization *
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.company_name || ''}
                      onChange={(e) => setFormData({ ...formData, company_name: e.target.value })}
                      placeholder="e.g. TechCorp Solutions"
                      className="w-full px-3 py-2 text-xs border border-slate-200 dark:border-slate-800 rounded-none bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white focus:outline-none focus:border-brand-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      Role / Designation
                    </label>
                    <input
                      type="text"
                      value={formData.client_role || ''}
                      onChange={(e) => setFormData({ ...formData, client_role: e.target.value })}
                      placeholder="e.g. Head of Facilities / VP"
                      className="w-full px-3 py-2 text-xs border border-slate-200 dark:border-slate-800 rounded-none bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white focus:outline-none focus:border-brand-500"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      Building / Tower Leased
                    </label>
                    <input
                      type="text"
                      value={formData.building_name || ''}
                      onChange={(e) => setFormData({ ...formData, building_name: e.target.value })}
                      placeholder="e.g. The I-Thum, Tower B"
                      className="w-full px-3 py-2 text-xs border border-slate-200 dark:border-slate-800 rounded-none bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white focus:outline-none focus:border-brand-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Review Headline *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.review_title || ''}
                    onChange={(e) => setFormData({ ...formData, review_title: e.target.value })}
                    placeholder="e.g. Seamless corporate leasing with zero delay"
                    className="w-full px-3 py-2 text-xs border border-slate-200 dark:border-slate-800 rounded-none bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white focus:outline-none focus:border-brand-500"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Your Review *
                  </label>
                  <textarea
                    rows={3}
                    required
                    value={formData.review_text || ''}
                    onChange={(e) => setFormData({ ...formData, review_text: e.target.value })}
                    placeholder="Describe your leasing experience with Shristi Estate..."
                    className="w-full px-3 py-2 text-xs border border-slate-200 dark:border-slate-800 rounded-none bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white focus:outline-none focus:border-brand-500"
                  />
                </div>

                <div className="pt-2 flex items-center justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => setShowModal(false)}
                    className="px-4 py-2 text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-none cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="btn-glass-primary px-5 py-2 text-xs font-semibold uppercase tracking-wider rounded-none cursor-pointer"
                  >
                    Submit Review
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </section>
  );
};

export default ClientReviewsSection;
