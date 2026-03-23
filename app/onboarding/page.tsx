'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import {
  Zap, Target, BedDouble, UtensilsCrossed, TrendingUp, Star, Heart,
  ConciergeBell, Sparkles, Map, Dumbbell, Waves, Car, Leaf, Wrench, Check, PartyPopper,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

// ── Types ─────────────────────────────────────────────────────────────────────
type Step = 'hotel' | 'goals' | 'departments' | 'done';

const PROPERTY_TYPES = ['Resort', 'Boutique Hotel', 'Business Hotel', 'Spa & Wellness', 'Beach Resort', 'City Hotel', 'Lodge'];

const GOALS: { id: string; Icon: LucideIcon; label: string; desc: string }[] = [
  { id: 'service',    Icon: Target,         label: 'Improve Service Quality',   desc: 'Track staff responsiveness and guest satisfaction across all touchpoints.' },
  { id: 'rooms',      Icon: BedDouble,      label: 'Elevate Room Experience',   desc: 'Monitor cleanliness, comfort, and maintenance response times.' },
  { id: 'dining',     Icon: UtensilsCrossed,label: 'Enhance Food & Beverage',   desc: 'Track meal quality, service speed, and dietary accommodation.' },
  { id: 'conversion', Icon: TrendingUp,     label: 'Increase Feedback Volume',  desc: 'Capture more responses — target 30%+ conversion vs the industry 10%.' },
  { id: 'reputation', Icon: Star,           label: 'Protect Online Reputation', desc: 'Catch negative experiences before they become public reviews.' },
  { id: 'retention',  Icon: Heart,          label: 'Drive Guest Retention',     desc: 'Identify what brings guests back and double down on it.' },
];

const DEPARTMENTS: { id: string; Icon: LucideIcon }[] = [
  { id: 'Front Desk',        Icon: ConciergeBell },
  { id: 'Housekeeping',      Icon: Sparkles },
  { id: 'Food & Beverage',   Icon: UtensilsCrossed },
  { id: 'Concierge',         Icon: Map },
  { id: 'Spa & Fitness',     Icon: Dumbbell },
  { id: 'Pool & Beach',      Icon: Waves },
  { id: 'Valet & Transport', Icon: Car },
  { id: 'Activities',        Icon: Leaf },
  { id: 'Maintenance',       Icon: Wrench },
];

const STEPS: Step[] = ['hotel', 'goals', 'departments', 'done'];
const STEP_LABELS = ['Property', 'Goals', 'Departments', 'Launch'];

// ── Component ──────────────────────────────────────────────────────────────────
export default function OnboardingPage() {
  const router = useRouter();
  const supabase = createClient();

  const [step, setStep] = useState<Step>('hotel');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  // Hotel details
  const [hotelName, setHotelName] = useState('');
  const [propertyType, setPropertyType] = useState('');
  const [slug, setSlug] = useState('');
  const [publicPage, setPublicPage] = useState(true);

  // Goals
  const [selectedGoals, setSelectedGoals] = useState<string[]>([]);

  // Departments
  const [selectedDepts, setSelectedDepts] = useState<string[]>([
    'Front Desk', 'Housekeeping', 'Food & Beverage',
  ]);

  // Auto-generate slug from hotel name
  function handleNameChange(name: string) {
    setHotelName(name);
    setSlug(name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, ''));
  }

  function toggleGoal(id: string) {
    setSelectedGoals(prev =>
      prev.includes(id) ? prev.filter(g => g !== id) : [...prev, id]
    );
  }

  function toggleDept(id: string) {
    setSelectedDepts(prev =>
      prev.includes(id) ? prev.filter(d => d !== id) : [...prev, id]
    );
  }

  async function finish() {
    setSaving(true);
    setError('');
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { router.push('/login'); return; }

      // Create hotel
      const { data: hotel, error: hotelErr } = await supabase
        .from('hotels')
        .insert({
          name: hotelName,
          slug,
          plan: 'starter',
          public_page_enabled: publicPage,
        })
        .select()
        .single();

      if (hotelErr) throw new Error(hotelErr.message);

      // Create manager profile
      const { error: profileErr } = await supabase
        .from('profiles')
        .insert({
          id: user.id,
          hotel_id: hotel.id,
          full_name: user.email?.split('@')[0] ?? 'Manager',
          role: 'manager',
        });

      if (profileErr) throw new Error(profileErr.message);

      setStep('done');
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Something went wrong. Please try again.');
    } finally {
      setSaving(false);
    }
  }

  const stepIndex = STEPS.indexOf(step);
  const progress = ((stepIndex) / (STEPS.length - 1)) * 100;

  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #0D1B2A 0%, #162436 100%)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '24px 24px 48px' }}>

      {/* Logo */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, fontWeight: 800, fontSize: '1.3rem', color: 'white', marginBottom: 40 }}>
        <span style={{ width: 36, height: 36, background: '#C9A84C', borderRadius: 8, display: 'grid', placeItems: 'center' }}><Zap size={18} color="#0D1B2A" strokeWidth={2.5} /></span>
        PulseStay
      </div>

      {/* Step progress */}
      {step !== 'done' && (
        <div style={{ width: '100%', maxWidth: 560, marginBottom: 32 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 10 }}>
            {STEP_LABELS.map((label, i) => (
              <div key={label} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}>
                <div style={{ width: 28, height: 28, borderRadius: '50%', display: 'grid', placeItems: 'center', fontSize: 12, fontWeight: 700, background: i <= stepIndex ? '#C9A84C' : 'rgba(255,255,255,0.1)', color: i <= stepIndex ? '#0D1B2A' : 'rgba(255,255,255,0.3)', transition: 'all 0.3s' }}>
                  {i < stepIndex ? <Check size={13} strokeWidth={2.5} /> : i + 1}
                </div>
                <span style={{ fontSize: 11, color: i <= stepIndex ? 'rgba(255,255,255,0.7)' : 'rgba(255,255,255,0.25)', fontWeight: 600 }}>{label}</span>
              </div>
            ))}
          </div>
          <div style={{ height: 3, background: 'rgba(255,255,255,0.08)', borderRadius: 2 }}>
            <div style={{ height: '100%', background: '#C9A84C', borderRadius: 2, width: `${progress}%`, transition: 'width 0.4s ease' }} />
          </div>
        </div>
      )}

      {/* Card */}
      <div style={{ width: '100%', maxWidth: 560, background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 16, padding: 40 }}>

        {error && (
          <div style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', borderRadius: 8, padding: '12px 16px', color: '#EF4444', fontSize: 13, marginBottom: 24 }}>
            {error}
          </div>
        )}

        {/* ── Step 1: Hotel details ── */}
        {step === 'hotel' && (
          <div>
            <h2 style={{ color: 'white', fontSize: '1.5rem', fontWeight: 800, marginBottom: 8 }}>Tell us about your property</h2>
            <p style={{ color: 'rgba(255,255,255,0.45)', fontSize: 14, marginBottom: 32 }}>This sets up your hotel account and your public-facing sentiment page URL.</p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
              <div>
                <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: 'rgba(255,255,255,0.6)', marginBottom: 8 }}>Hotel / Resort Name</label>
                <input
                  type="text" value={hotelName} onChange={e => handleNameChange(e.target.value)}
                  placeholder="The Grand Pelican Resort"
                  style={{ width: '100%', padding: '13px 14px', background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.12)', borderRadius: 8, color: 'white', fontSize: 15, fontFamily: 'inherit', outline: 'none' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: 'rgba(255,255,255,0.6)', marginBottom: 8 }}>Property Type</label>
                <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                  {PROPERTY_TYPES.map(t => (
                    <button key={t} onClick={() => setPropertyType(t)} style={{ padding: '8px 14px', borderRadius: 8, border: `1px solid ${propertyType === t ? '#C9A84C' : 'rgba(255,255,255,0.12)'}`, background: propertyType === t ? 'rgba(201,168,76,0.15)' : 'transparent', color: propertyType === t ? '#C9A84C' : 'rgba(255,255,255,0.5)', fontSize: 13, cursor: 'pointer', transition: 'all 0.2s' }}>
                      {t}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: 'rgba(255,255,255,0.6)', marginBottom: 8 }}>
                  Your Public Sentiment Page URL
                </label>
                <div style={{ display: 'flex', alignItems: 'center', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8, overflow: 'hidden' }}>
                  <span style={{ padding: '13px 12px', fontSize: 13, color: 'rgba(255,255,255,0.3)', borderRight: '1px solid rgba(255,255,255,0.08)', whiteSpace: 'nowrap', flexShrink: 0 }}>pulsestay.com/</span>
                  <input
                    type="text" value={slug} onChange={e => setSlug(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ''))}
                    placeholder="grand-pelican-resort"
                    style={{ flex: 1, padding: '13px 12px', background: 'transparent', border: 'none', color: 'white', fontSize: 13, fontFamily: 'inherit', outline: 'none' }}
                  />
                </div>
                <p style={{ fontSize: 11, color: 'rgba(255,255,255,0.25)', marginTop: 6 }}>This is where potential guests can see your live satisfaction scores.</p>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px', background: 'rgba(255,255,255,0.04)', borderRadius: 10, border: '1px solid rgba(255,255,255,0.08)' }}>
                <div>
                  <div style={{ fontSize: 14, fontWeight: 600, color: 'white' }}>Enable public sentiment page</div>
                  <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.35)', marginTop: 2 }}>Show live scores to potential guests — your best marketing tool</div>
                </div>
                <button onClick={() => setPublicPage(p => !p)} style={{ width: 44, height: 24, borderRadius: 12, border: 'none', cursor: 'pointer', background: publicPage ? '#C9A84C' : 'rgba(255,255,255,0.15)', position: 'relative', transition: 'background 0.2s', flexShrink: 0 }}>
                  <span style={{ position: 'absolute', top: 3, left: publicPage ? 23 : 3, width: 18, height: 18, borderRadius: '50%', background: 'white', transition: 'left 0.2s' }} />
                </button>
              </div>
            </div>

            <button
              onClick={() => setStep('goals')}
              disabled={!hotelName.trim() || !slug.trim()}
              style={{ marginTop: 32, width: '100%', padding: 15, background: '#C9A84C', color: '#0D1B2A', border: 'none', borderRadius: 8, fontWeight: 700, fontSize: 15, cursor: hotelName && slug ? 'pointer' : 'not-allowed', opacity: hotelName && slug ? 1 : 0.4 }}
            >
              Continue →
            </button>
          </div>
        )}

        {/* ── Step 2: Goals ── */}
        {step === 'goals' && (
          <div>
            <h2 style={{ color: 'white', fontSize: '1.5rem', fontWeight: 800, marginBottom: 8 }}>What are your top priorities?</h2>
            <p style={{ color: 'rgba(255,255,255,0.45)', fontSize: 14, marginBottom: 32 }}>Select up to 3. PulseStay will tailor questions and insights around these goals.</p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {GOALS.map(g => {
                const selected = selectedGoals.includes(g.id);
                const maxed = selectedGoals.length >= 3 && !selected;
                return (
                  <button key={g.id} onClick={() => !maxed && toggleGoal(g.id)} style={{ padding: '16px', borderRadius: 10, border: `1px solid ${selected ? '#C9A84C' : 'rgba(255,255,255,0.08)'}`, background: selected ? 'rgba(201,168,76,0.12)' : 'rgba(255,255,255,0.03)', cursor: maxed ? 'not-allowed' : 'pointer', opacity: maxed ? 0.4 : 1, textAlign: 'left', display: 'flex', alignItems: 'center', gap: 14, transition: 'all 0.2s' }}>
                    <span style={{ width: 36, height: 36, borderRadius: 8, background: selected ? 'rgba(201,168,76,0.2)' : 'rgba(255,255,255,0.07)', display: 'grid', placeItems: 'center', flexShrink: 0 }}><g.Icon size={18} color={selected ? '#C9A84C' : 'rgba(255,255,255,0.5)'} strokeWidth={1.75} /></span>
                    <div>
                      <div style={{ fontWeight: 700, fontSize: 14, color: selected ? '#C9A84C' : 'white' }}>{g.label}</div>
                      <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.4)', marginTop: 2 }}>{g.desc}</div>
                    </div>
                    {selected && <Check size={16} color="#C9A84C" strokeWidth={2.5} style={{ marginLeft: 'auto', flexShrink: 0 }} />}
                  </button>
                );
              })}
            </div>
            <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.25)', marginTop: 12 }}>{selectedGoals.length}/3 selected</p>

            <div style={{ display: 'flex', gap: 12, marginTop: 32 }}>
              <button onClick={() => setStep('hotel')} style={{ padding: '14px 24px', background: 'transparent', border: '1px solid rgba(255,255,255,0.15)', color: 'rgba(255,255,255,0.5)', borderRadius: 8, cursor: 'pointer', fontWeight: 600, fontSize: 14 }}>← Back</button>
              <button onClick={() => setStep('departments')} disabled={selectedGoals.length === 0} style={{ flex: 1, padding: 15, background: '#C9A84C', color: '#0D1B2A', border: 'none', borderRadius: 8, fontWeight: 700, fontSize: 15, cursor: selectedGoals.length > 0 ? 'pointer' : 'not-allowed', opacity: selectedGoals.length > 0 ? 1 : 0.4 }}>
                Continue →
              </button>
            </div>
          </div>
        )}

        {/* ── Step 3: Departments ── */}
        {step === 'departments' && (
          <div>
            <h2 style={{ color: 'white', fontSize: '1.5rem', fontWeight: 800, marginBottom: 8 }}>Which departments will use PulseStay?</h2>
            <p style={{ color: 'rgba(255,255,255,0.45)', fontSize: 14, marginBottom: 32 }}>Select all that apply. You can add or remove departments at any time.</p>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10 }}>
              {DEPARTMENTS.map(d => {
                const selected = selectedDepts.includes(d.id);
                return (
                  <button key={d.id} onClick={() => toggleDept(d.id)} style={{ padding: '16px 10px', borderRadius: 10, border: `1px solid ${selected ? '#C9A84C' : 'rgba(255,255,255,0.08)'}`, background: selected ? 'rgba(201,168,76,0.12)' : 'rgba(255,255,255,0.03)', cursor: 'pointer', textAlign: 'center', transition: 'all 0.2s', position: 'relative' }}>
                    {selected && <Check size={13} color="#C9A84C" strokeWidth={2.5} style={{ position: 'absolute', top: 8, right: 8 }} />}
                    <div style={{ display: 'grid', placeItems: 'center', marginBottom: 8 }}><d.Icon size={22} color={selected ? '#C9A84C' : 'rgba(255,255,255,0.5)'} strokeWidth={1.75} /></div>
                    <div style={{ fontSize: 12, fontWeight: 600, color: selected ? '#C9A84C' : 'rgba(255,255,255,0.6)', lineHeight: 1.3 }}>{d.id}</div>
                  </button>
                );
              })}
            </div>
            <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.25)', marginTop: 12 }}>{selectedDepts.length} department{selectedDepts.length !== 1 ? 's' : ''} selected</p>

            <div style={{ display: 'flex', gap: 12, marginTop: 32 }}>
              <button onClick={() => setStep('goals')} style={{ padding: '14px 24px', background: 'transparent', border: '1px solid rgba(255,255,255,0.15)', color: 'rgba(255,255,255,0.5)', borderRadius: 8, cursor: 'pointer', fontWeight: 600, fontSize: 14 }}>← Back</button>
              <button
                onClick={finish}
                disabled={saving || selectedDepts.length === 0}
                style={{ flex: 1, padding: 15, background: '#C9A84C', color: '#0D1B2A', border: 'none', borderRadius: 8, fontWeight: 700, fontSize: 15, cursor: saving ? 'not-allowed' : 'pointer', opacity: saving || selectedDepts.length === 0 ? 0.7 : 1 }}
              >
                {saving ? 'Setting up your account…' : 'Launch PulseStay →'}
              </button>
            </div>
          </div>
        )}

        {/* ── Step 4: Done ── */}
        {step === 'done' && (
          <div style={{ textAlign: 'center', padding: '20px 0' }}>
            <div style={{ width: 80, height: 80, borderRadius: '50%', background: 'rgba(201,168,76,0.15)', display: 'grid', placeItems: 'center', margin: '0 auto 20px' }}>
              <PartyPopper size={36} color="#C9A84C" strokeWidth={1.75} />
            </div>
            <h2 style={{ color: 'white', fontSize: '1.8rem', fontWeight: 800, marginBottom: 12 }}>You're all set!</h2>
            <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: 15, marginBottom: 8 }}>
              <strong style={{ color: 'white' }}>{hotelName}</strong> is live on PulseStay.
            </p>
            <p style={{ color: 'rgba(255,255,255,0.35)', fontSize: 14, marginBottom: 40 }}>
              Your 14-day free trial has started. No card required.
            </p>

            {/* Summary */}
            <div style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 12, padding: 24, marginBottom: 32, textAlign: 'left' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13 }}>
                  <span style={{ color: 'rgba(255,255,255,0.4)' }}>Property</span>
                  <span style={{ color: 'white', fontWeight: 600 }}>{hotelName}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13 }}>
                  <span style={{ color: 'rgba(255,255,255,0.4)' }}>Public page</span>
                  <span style={{ color: '#C9A84C', fontWeight: 600 }}>pulsestay.com/{slug}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13 }}>
                  <span style={{ color: 'rgba(255,255,255,0.4)' }}>Goals</span>
                  <span style={{ color: 'white', fontWeight: 600 }}>{selectedGoals.length} selected</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13 }}>
                  <span style={{ color: 'rgba(255,255,255,0.4)' }}>Departments</span>
                  <span style={{ color: 'white', fontWeight: 600 }}>{selectedDepts.length} active</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13 }}>
                  <span style={{ color: 'rgba(255,255,255,0.4)' }}>Plan</span>
                  <span style={{ color: '#10B981', fontWeight: 600 }}>Starter — 14-day trial ✓</span>
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <button
                onClick={() => router.push('/dashboard')}
                style={{ width: '100%', padding: 16, background: '#C9A84C', color: '#0D1B2A', border: 'none', borderRadius: 8, fontWeight: 700, fontSize: 15, cursor: 'pointer' }}
              >
                Go to Dashboard →
              </button>
              <button
                onClick={() => router.push('/capture')}
                style={{ width: '100%', padding: 14, background: 'transparent', border: '1px solid rgba(255,255,255,0.15)', color: 'rgba(255,255,255,0.6)', borderRadius: 8, fontWeight: 600, fontSize: 14, cursor: 'pointer' }}
              >
                Try the Employee App
              </button>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
