import React from 'react';
import { Link } from 'react-router-dom';
import { Calendar, ArrowRight, BookOpen, Clock } from 'lucide-react';
import { Breadcrumbs } from '../components/common/Breadcrumbs';
import { AnimatedText } from '../components/common/AnimatedText';
import { ScrollReveal } from '../components/common/ScrollReveal';

export const BlogPage: React.FC = () => {
  const posts = [
    {
      title: 'Commercial Office Space in Sector 62, Noida: Complete Corporate Guide',
      excerpt: 'Why Sector 62 remains the institutional tech capital of Noida. An analysis of major landmarks including I-Thum, Noida One, Corenthum, and Stellar IT Park.',
      readTime: '6 min read',
      date: 'March 2026',
      category: 'Office Market',
      image: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=800&q=80'
    },
    {
      title: 'Leasing Warehouses in Sector 83 & Greater Noida: Critical Checks for Logistics',
      excerpt: 'Understanding key operational requirements: clear ceiling heights, truck turning radiuses, hydraulic dock levelers, and power backup sanctions.',
      readTime: '8 min read',
      date: 'February 2026',
      category: 'Warehousing & 3PL',
      image: 'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?auto=format&fit=crop&w=800&q=80'
    },
    {
      title: 'Commercial Real Estate Trends Along the Noida-Greater Noida Expressway',
      excerpt: 'Grade-A towers, LEED certified business campuses, and metro connectivity driving IT/ITES relocations along the high-growth corporate corridor.',
      readTime: '5 min read',
      date: 'February 2026',
      category: 'Market Trends',
      image: 'https://images.unsplash.com/photo-1577495508048-b635879837f1?auto=format&fit=crop&w=800&q=80'
    },
    {
      title: 'Understanding Bare Shell vs. Fully Furnished Commercial Leases in NCR',
      excerpt: 'Cost-benefit breakdown for business tenants: capital expenditures, fit-out rent-free periods, and lock-in covenants.',
      readTime: '7 min read',
      date: 'January 2026',
      category: 'Lease Advisory',
      image: 'https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=800&q=80'
    }
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-12">
      <Breadcrumbs
        items={[
          { label: 'Market Insights & Guides' }
        ]}
      />

      <div className="text-center max-w-2xl mx-auto space-y-3">
        <ScrollReveal variant="fade-up">
          <span className="text-xs font-bold uppercase tracking-wider text-brand-600 dark:text-brand-400">
            Commercial Insights
          </span>
        </ScrollReveal>
        <AnimatedText as="h1" type="hero" className="text-3xl sm:text-5xl font-extrabold text-slate-900 dark:text-white font-['Outfit']">
          Commercial Real Estate Guides
        </AnimatedText>
        <AnimatedText as="p" type="subtitle" delay={0.2} className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
          In-depth market research, leasing guidelines, and micro-market analyses for Noida and Delhi NCR.
        </AnimatedText>
      </div>

      <ScrollReveal variant="stagger" stagger={0.12}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {posts.map((post, idx) => (
            <div
              key={idx}
              className="scroll-reveal-item will-change-transform card-hover-lift glass-card rounded-3xl overflow-hidden border border-slate-200/90 dark:border-slate-800 bg-white/70 dark:bg-[#0B132B]/75 flex flex-col group transition-all"
            >
              <div className="relative aspect-[16/9] overflow-hidden bg-slate-100 dark:bg-slate-800">
                <img
                  src={post.image}
                  alt={post.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute top-3 left-3">
                  <span className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-brand-600 text-white shadow-md">
                    {post.category}
                  </span>
                </div>
              </div>

              <div className="p-6 flex-1 flex flex-col justify-between space-y-4">
                <div className="space-y-2">
                  <div className="flex items-center gap-3 text-xs text-slate-400">
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5" />
                      {post.date}
                    </span>
                    <span>•</span>
                    <span className="flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5" />
                      {post.readTime}
                    </span>
                  </div>

                  <h3 className="text-xl font-bold text-slate-900 dark:text-white font-['Outfit'] group-hover:text-brand-600 dark:group-hover:text-brand-400 transition-colors">
                    {post.title}
                  </h3>
                  <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed line-clamp-3">
                    {post.excerpt}
                  </p>
                </div>

                <div className="pt-4 border-t border-slate-100 dark:border-slate-800">
                  <Link
                    to="/tell-us-requirement"
                    className="inline-flex items-center gap-1.5 text-xs font-semibold text-brand-600 dark:text-brand-400 hover:gap-2 transition-all"
                  >
                    <span>Discuss Your Space With an Advisor</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      </ScrollReveal>
    </div>
  );
};
