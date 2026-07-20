import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import SupportLayout from '@/components/SupportLayout';
import { contentApi } from '@/lib/api';
import { getSupportIcon } from '@/lib/supportIcons';

const FALLBACK_ROOMS = [
  { room_name: 'Living Room', icon: 'sofa', sizes: ['5×8 ft', '8×10 ft', '9×12 ft', '10×14 ft'], tip: 'Front legs of seating on the rug; leave 8–12" of floor showing at walls.' },
  { room_name: 'Bedroom', icon: 'bed', sizes: ['5×8 ft', '6×9 ft', '8×10 ft'], tip: 'Rug extends beyond the bed on both sides and at the foot for a balanced look.' },
  { room_name: 'Dining Room', icon: 'utensils', sizes: ['8×10 ft', '9×12 ft'], tip: 'Chairs should remain on the rug when pulled out from the table.' },
  { room_name: 'Hallway / Entry', icon: 'sofa', sizes: ['2×8 ft', '2×10 ft', '3×12 ft'], tip: 'Runners should leave equal floor space on both sides of the hallway.' },
];

const FALLBACK_CHART = [
  { size_ft: '4×6 ft', size_cm: '122 × 183 cm', best_for: 'Small accent, bedside, entry' },
  { size_ft: '5×8 ft', size_cm: '152 × 244 cm', best_for: 'Bedroom, small living area' },
  { size_ft: '6×9 ft', size_cm: '183 × 274 cm', best_for: 'Bedroom, medium living room' },
  { size_ft: '8×10 ft', size_cm: '244 × 305 cm', best_for: 'Living room, dining room' },
  { size_ft: '9×12 ft', size_cm: '274 × 366 cm', best_for: 'Large living room, open plan' },
  { size_ft: '10×14 ft', size_cm: '305 × 427 cm', best_for: 'Grand living spaces, estates' },
];

const FALLBACK_STEPS = [
  "Measure your room's length and width.",
  'Leave 12–18 inches of bare floor between the rug edge and walls.',
  'For furniture grouping, ensure all key pieces fit on the rug.',
  'When in doubt, size up — a larger rug often looks more luxurious.',
];

export default function SizeGuidePage() {
  const { data } = useQuery({
    queryKey: ['support', 'size-guide'],
    queryFn: () => contentApi.sizeGuide().then((r) => r.data.data),
  });

  const meta = data?.meta ?? {};
  const rooms = data?.rooms?.length ? data.rooms : FALLBACK_ROOMS;
  const chart = data?.chart?.length ? data.chart : FALLBACK_CHART;
  const measureSteps = data?.measure_steps?.length ? data.measure_steps : FALLBACK_STEPS;

  return (
    <SupportLayout
      active="size-guide"
      title={meta.title ?? 'Rug Size Guide'}
      subtitle={meta.subtitle ?? 'Choose dimensions that anchor your space and complement your furniture layout.'}
      seoTitle="Size Guide"
      seoDescription="MECCIO RUGS rug size guide — recommended dimensions for living rooms, bedrooms, dining rooms, and hallways."
    >
      <div className="space-y-6 sm:space-y-8 md:space-y-10">
        <div className="grid sm:grid-cols-2 gap-3 sm:gap-4">
          {rooms.map((room: { id?: number; room_name: string; icon: string; sizes: string[]; tip: string }) => {
            const Icon = getSupportIcon(room.icon);
            return (
              <div key={room.id ?? room.room_name} className="p-4 sm:p-6 bg-white border border-sand/40 hover:border-gold/30 transition-colors">
                <div className="flex items-center gap-3 mb-3 sm:mb-4">
                  <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-ivory flex items-center justify-center shrink-0">
                    <Icon size={16} className="text-gold-dark" />
                  </div>
                  <h3 className="font-display text-lg sm:text-xl">{room.room_name}</h3>
                </div>
                <div className="flex flex-wrap gap-1.5 sm:gap-2 mb-3 sm:mb-4">
                  {room.sizes.map((s) => (
                    <span key={s} className="px-2 sm:px-2.5 py-1 text-[10px] sm:text-xs bg-ivory border border-sand/30 text-charcoal">
                      {s}
                    </span>
                  ))}
                </div>
                <p className="text-xs sm:text-sm text-stone leading-relaxed">{room.tip}</p>
              </div>
            );
          })}
        </div>

        <div id="size-guide">
          <h2 className="font-display text-xl sm:text-2xl text-charcoal mb-4 sm:mb-6">Size Reference Chart</h2>
          <div className="overflow-x-auto border border-sand/40 bg-white -mx-1 sm:mx-0">
            <table className="w-full text-xs sm:text-sm min-w-[480px]">
              <thead>
                <tr className="bg-ivory border-b border-sand/40">
                  <th className="text-left p-3 sm:p-4 font-medium text-charcoal">Size (ft)</th>
                  <th className="text-left p-3 sm:p-4 font-medium text-charcoal">Size (cm)</th>
                  <th className="text-left p-3 sm:p-4 font-medium text-charcoal">Best For</th>
                </tr>
              </thead>
              <tbody>
                {chart.map((row: { size_ft: string; size_cm: string; best_for: string }, i: number) => (
                  <tr key={row.size_ft} className={i < chart.length - 1 ? 'border-b border-sand/20' : ''}>
                    <td className="p-3 sm:p-4 font-medium text-charcoal whitespace-nowrap">{row.size_ft}</td>
                    <td className="p-3 sm:p-4 text-stone whitespace-nowrap">{row.size_cm}</td>
                    <td className="p-3 sm:p-4 text-stone">{row.best_for}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-4 sm:gap-6">
          <div className="p-4 sm:p-6 bg-ivory border border-sand/40">
            <h3 className="font-display text-base sm:text-lg mb-3">How to Measure</h3>
            <ol className="space-y-2 text-xs sm:text-sm text-stone leading-relaxed list-decimal list-inside">
              {measureSteps.map((step: string) => (
                <li key={step}>{step}</li>
              ))}
            </ol>
          </div>
          <div className="p-4 sm:p-6 bg-charcoal text-cream">
            <h3 className="font-display text-base sm:text-lg mb-3">{meta.custom_title ?? 'Custom Sizes'}</h3>
            <p className="text-xs sm:text-sm text-cream/75 leading-relaxed mb-4">
              {meta.custom_desc ?? 'Need an exact dimension for your project? Our bespoke program creates rugs tailored to your space — down to the centimeter.'}
            </p>
            <Link to="/custom-rugs" className="btn-gold text-xs w-full sm:w-auto text-center inline-block">
              Commission a Custom Rug
            </Link>
          </div>
        </div>
      </div>
    </SupportLayout>
  );
}
