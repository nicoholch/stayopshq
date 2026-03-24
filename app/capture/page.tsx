'use client';

/**
 * /capture — Employee complaint logging app
 *
 * A single-screen form for staff to log a guest complaint in real time.
 * Designed to be completed in under 30 seconds.
 */

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import type { Department, ComplaintCategory, ComplaintSeverity, Guest } from '@/types';
import {
  ConciergeBell, Sparkles, UtensilsCrossed, Map, Dumbbell,
  Waves, Car, Leaf, Wrench, Check, AlertTriangle, CheckCircle2,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

const DEPARTMENTS: Department[] = [
  'Front Desk', 'Housekeeping', 'Food & Beverage',
  'Concierge', 'Spa & Fitness', 'Pool & Beach',
  'Valet & Transport', 'Maintenance',
];

const DEPT_ICON: Record<Department, LucideIcon> = {
  'Front Desk':        ConciergeBell,
  'Housekeeping':      Sparkles,
  'Food & Beverage':   UtensilsCrossed,
  'Concierge':         Map,
  'Spa & Fitness':     Dumbbell,
  'Pool & Beach':      Waves,
  'Valet & Transport': Car,
  'Activities':        Leaf,
  'Maintenance':       Wrench,
};

const CATEGORIES: ComplaintCategory[] = [
  'Room Condition', 'Cleanliness', 'Noise', 'Temperature / AC',
  'Maintenance', 'Staff Behavior', 'Food & Beverage', 'Wait Times', 'Billing', 'Other',
];

const SEVERITY_CONFIG: Record<ComplaintSeverity, { label: string; color: string; bg: string; border: string; description: string }> = {
  low:      { label: 'Low',      color: '#6B7280', bg: 'rgba(107,114,128,0.08)', border: '#9CA3AF', description: 'Minor inconvenience' },
  medium:   { label: 'Medium',   color: '#D97706', bg: 'rgba(217,119,6,0.08)',   border: '#F59E0B', description: 'Needs attention today' },
  high:     { label: 'High',     color: '#DC2626', bg: 'rgba(220,38,38,0.08)',   border: '#EF4444', description: 'Resolve within the hour' },
  critical: { label: 'Critical', color: '#7C3AED', bg: 'rgba(124,58,237,0.08)', border: '#8B5CF6', description: 'Immediate manager action' },
};

export default function CapturePage() {
  const [dept, setDept]               = useState<Department | null>(null);
  const [room, setRoom]               = useState('');
  const [selectedGuestId, setSelectedGuestId] = useState<string>('');
  const [activeGuests, setActiveGuests]       = useState<Guest[]>([]);
  const [category, setCategory]       = useState<ComplaintCategory | ''>('');
  const [description, setDescription] = useState('');
  const [severity, setSeverity]       = useState<ComplaintSeverity>('medium');
  const [saving, setSaving]           = useState(false);
  const [step, setStep]               = useState<'form' | 'success'>('form');

  const isValid = dept && category && description.trim().length > 0;

  // Fetch active guests so staff can link a complaint to a specific guest
  useEffect(() => {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL ?? '';
    const isDemo = !supabaseUrl || supabaseUrl === 'https://your-project.supabase.co';
    if (isDemo) return;

    const supabase = createClient();
    const today = new Date().toISOString().split('T')[0];

    supabase.auth.getUser().then(({ data: { user } }) => {
      if (!user) return;
      supabase.from('profiles').select('hotel_id').eq('id', user.id).single().then(({ data: profile }) => {
        if (!profile) return;
        supabase.from('guests')
          .select('*')
          .eq('hotel_id', profile.hotel_id)
          .gte('check_out', today)
          .order('check_out', { ascending: true })
          .then(({ data }) => { if (data) setActiveGuests(data as Guest[]); });
      });
    });
  }, []);

  // When a guest is selected, auto-fill their room number
  function handleGuestSelect(guestId: string) {
    setSelectedGuestId(guestId);
    if (guestId) {
      const guest = activeGuests.find(g => g.id === guestId);
      if (guest) setRoom(guest.room_number);
    }
  }

  async function submit() {
    if (!isValid) return;
    setSaving(true);

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL ?? '';
    const isDemo = !supabaseUrl || supabaseUrl === 'https://your-project.supabase.co';

    if (!isDemo) {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();

      if (user) {
        const { data: profile } = await supabase
          .from('profiles').select('hotel_id').eq('id', user.id).single();

        if (profile) {
          await supabase.from('complaints').insert({
            hotel_id:     profile.hotel_id,
            submitted_by: user.id,
            guest_id:     selectedGuestId || null,
            department:   dept,
            room_number:  room || null,
            category,
            description:  description.trim(),
            severity,
            status:       'open',
          });
        }
      }
    }

    setSaving(false);
    setStep('success');
  }

  function reset() {
    setDept(null); setRoom(''); setSelectedGuestId('');
    setCategory(''); setDescription(''); setSeverity('medium'); setStep('form');
  }

  return (
    <div style={{ minHeight: '100vh', background: 'var(--off-white)', paddingTop: 100 }}>
      <div style={{ maxWidth: 640, margin: '0 auto', padding: '0 24px 64px' }}>

        <div style={{ textAlign: 'center', marginBottom: 36 }}>
          <span style={{ display: 'inline-block', padding: '6px 16px', borderRadius: 999, fontSize: 12, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', background: 'rgba(201,168,76,0.15)', color: 'var(--gold-dark)', border: '1px solid rgba(201,168,76,0.3)', marginBottom: 12 }}>
            Employee App
          </span>
          <h1 style={{ fontSize: '1.8rem', fontWeight: 800 }}>Log a Guest Opportunity</h1>
          <p style={{ color: 'var(--text-muted)', fontSize: 14, marginTop: 8 }}>
            Record the issue immediately so management can act before the guest checks out.
          </p>
        </div>

        {step === 'form' && (
          <div style={{ background: 'white', borderRadius: 12, padding: 36, boxShadow: 'var(--shadow)', display: 'flex', flexDirection: 'column', gap: 28 }}>

            {/* Department */}
            <div>
              <label style={{ fontSize: 13, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--text-muted)', display: 'block', marginBottom: 12 }}>
                Department
              </label>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 10 }}>
                {DEPARTMENTS.map(d => (
                  <button key={d} onClick={() => setDept(d)} style={{
                    padding: '10px 6px', borderRadius: 8, textAlign: 'center', cursor: 'pointer',
                    border: `2px solid ${dept === d ? 'var(--gold)' : 'var(--border)'}`,
                    background: dept === d ? 'rgba(201,168,76,0.08)' : 'transparent',
                    fontSize: 12, fontWeight: 500,
                    color: dept === d ? 'var(--gold-dark)' : 'var(--text)',
                    transition: 'all 0.15s',
                  }}>
                    {(() => { const Icon = DEPT_ICON[d]; return <Icon size={20} strokeWidth={1.75} style={{ display: 'block', margin: '0 auto 4px' }} />; })()}
                    {d}
                  </button>
                ))}
              </div>
            </div>

            {/* Guest link + Room + Category */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              {/* Guest selector — only shown when guests exist in the system */}
              {activeGuests.length > 0 && (
                <div>
                  <label style={{ fontSize: 13, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--text-muted)', display: 'block', marginBottom: 8 }}>
                    Link to Guest <span style={{ fontWeight: 400, textTransform: 'none' }}>(recommended)</span>
                  </label>
                  <select
                    value={selectedGuestId}
                    onChange={e => handleGuestSelect(e.target.value)}
                    style={{ width: '100%', padding: '11px 14px', border: '2px solid var(--border)', borderRadius: 8, fontSize: 14, fontFamily: 'inherit', background: 'white', boxSizing: 'border-box' }}
                  >
                    <option value="">Select guest (optional)…</option>
                    {activeGuests.map(g => (
                      <option key={g.id} value={g.id}>
                        {g.name} — Room {g.room_number} (checks out {new Date(g.check_out).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })})
                      </option>
                    ))}
                  </select>
                  {selectedGuestId && (
                    <p style={{ fontSize: 11, color: 'var(--success)', marginTop: 5, fontWeight: 600 }}>
                      <Check size={11} strokeWidth={2.5} style={{ display: 'inline', marginRight: 4 }} />Guest opportunity will be linked to this guest's record and personalise their follow-up email.
                    </p>
                  )}
                </div>
              )}

              <div style={{ display: 'grid', gridTemplateColumns: '140px 1fr', gap: 16 }}>
                <div>
                  <label style={{ fontSize: 13, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--text-muted)', display: 'block', marginBottom: 8 }}>
                    Room <span style={{ fontWeight: 400, textTransform: 'none' }}>(opt.)</span>
                  </label>
                  <input
                    type="text"
                    value={room}
                    onChange={e => setRoom(e.target.value)}
                    placeholder="e.g. 412"
                    style={{ width: '100%', padding: '11px 14px', border: '2px solid var(--border)', borderRadius: 8, fontSize: 14, fontFamily: 'inherit', boxSizing: 'border-box' }}
                  />
                </div>
                <div>
                  <label style={{ fontSize: 13, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--text-muted)', display: 'block', marginBottom: 8 }}>
                    Category
                  </label>
                  <select
                    value={category}
                    onChange={e => setCategory(e.target.value as ComplaintCategory)}
                    style={{ width: '100%', padding: '11px 14px', border: '2px solid var(--border)', borderRadius: 8, fontSize: 14, fontFamily: 'inherit', background: 'white', boxSizing: 'border-box' }}
                  >
                    <option value="">Select category…</option>
                    {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
              </div>
            </div>

            {/* Description */}
            <div>
              <label style={{ fontSize: 13, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--text-muted)', display: 'block', marginBottom: 8 }}>
                What did the guest report?
              </label>
              <textarea
                value={description}
                onChange={e => setDescription(e.target.value)}
                placeholder="Describe the guest opportunity in the guest's own words. Be specific — this goes directly to the manager."
                rows={4}
                style={{ width: '100%', padding: '13px 16px', border: '2px solid var(--border)', borderRadius: 8, fontSize: 14, fontFamily: 'inherit', resize: 'vertical', boxSizing: 'border-box' }}
              />
            </div>

            {/* Severity */}
            <div>
              <label style={{ fontSize: 13, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--text-muted)', display: 'block', marginBottom: 12 }}>
                Severity
              </label>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 10 }}>
                {(Object.entries(SEVERITY_CONFIG) as [ComplaintSeverity, typeof SEVERITY_CONFIG[ComplaintSeverity]][]).map(([key, cfg]) => (
                  <button key={key} onClick={() => setSeverity(key)} style={{
                    padding: '12px 8px', borderRadius: 8, cursor: 'pointer', textAlign: 'center',
                    border: `2px solid ${severity === key ? cfg.border : 'var(--border)'}`,
                    background: severity === key ? cfg.bg : 'transparent',
                    transition: 'all 0.15s',
                  }}>
                    <div style={{ fontSize: 13, fontWeight: 700, color: severity === key ? cfg.color : 'var(--text)' }}>{cfg.label}</div>
                    <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 3 }}>{cfg.description}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Submit */}
            <button
              onClick={submit}
              disabled={!isValid || saving}
              style={{
                padding: '15px', background: 'var(--gold)', color: 'var(--navy)',
                border: 'none', borderRadius: 8, fontWeight: 700, fontSize: 15,
                cursor: isValid && !saving ? 'pointer' : 'not-allowed',
                opacity: isValid && !saving ? 1 : 0.45,
                transition: 'opacity 0.2s',
              }}
            >
              {saving ? 'Logging guest opportunity…' : <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}><AlertTriangle size={16} strokeWidth={2} />Log Guest Opportunity</span>}
            </button>
          </div>
        )}

        {/* ── Success ── */}
        {step === 'success' && (
          <div style={{ background: 'white', borderRadius: 12, padding: 60, boxShadow: 'var(--shadow)', textAlign: 'center' }}>
            <div style={{ width: 72, height: 72, borderRadius: '50%', background: 'rgba(16,185,129,0.1)', display: 'grid', placeItems: 'center', margin: '0 auto 20px' }}>
              <CheckCircle2 size={36} color="#10B981" strokeWidth={1.75} />
            </div>
            <h2 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: 10 }}>Guest Opportunity Logged</h2>
            <p style={{ color: 'var(--text-muted)', marginBottom: 32, maxWidth: 340, margin: '0 auto 32px' }}>
              Management has been notified. The guest opportunity is now visible on the live dashboard.
            </p>
            <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
              <button onClick={reset} style={{ padding: '14px 28px', background: 'var(--gold)', color: 'var(--navy)', border: 'none', borderRadius: 8, fontWeight: 700, cursor: 'pointer' }}>
                Log Another
              </button>
              <a href="/dashboard" style={{ padding: '14px 28px', border: '2px solid var(--gold)', color: 'var(--gold-dark)', borderRadius: 8, fontWeight: 700, textDecoration: 'none', display: 'inline-block' }}>
                View Dashboard →
              </a>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
