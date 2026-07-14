export type CustomRugFieldType = 'text' | 'email' | 'tel' | 'select' | 'textarea';
export type CustomRugFieldSection = 'contact' | 'project' | 'preferences';
export type CustomRugFieldWidth = 'full' | 'half';

export interface CustomRugFormField {
  id: string;
  key: string;
  label: string;
  type: CustomRugFieldType;
  required: boolean;
  enabled: boolean;
  placeholder?: string;
  /** Comma or newline separated in admin; stored as string[] */
  options?: string[];
  section: CustomRugFieldSection;
  width: CustomRugFieldWidth;
  /** name / email cannot be deleted */
  locked?: boolean;
}

export const CUSTOM_RUG_KNOWN_KEYS = [
  'name',
  'email',
  'phone',
  'room_type',
  'dimensions',
  'material',
  'color_preferences',
  'budget_range',
  'notes',
] as const;

export const DEFAULT_CUSTOM_RUG_FORM_FIELDS: CustomRugFormField[] = [
  {
    id: 'name',
    key: 'name',
    label: 'Full Name',
    type: 'text',
    required: true,
    enabled: true,
    placeholder: 'Your full name',
    section: 'contact',
    width: 'half',
    locked: true,
  },
  {
    id: 'email',
    key: 'email',
    label: 'Email',
    type: 'email',
    required: true,
    enabled: true,
    placeholder: 'you@example.com',
    section: 'contact',
    width: 'half',
    locked: true,
  },
  {
    id: 'phone',
    key: 'phone',
    label: 'Phone',
    type: 'tel',
    required: false,
    enabled: true,
    placeholder: '+91 98765 43210',
    section: 'contact',
    width: 'full',
  },
  {
    id: 'room_type',
    key: 'room_type',
    label: 'Room Type',
    type: 'select',
    required: false,
    enabled: true,
    section: 'project',
    width: 'half',
    options: [
      'Living Room',
      'Bedroom',
      'Dining Room',
      'Office / Study',
      'Hallway / Entry',
      'Hotel / Commercial',
      'Other',
    ],
  },
  {
    id: 'dimensions',
    key: 'dimensions',
    label: 'Desired Dimensions',
    type: 'text',
    required: false,
    enabled: true,
    placeholder: 'e.g. 8×10 ft or 240×300 cm',
    section: 'project',
    width: 'half',
  },
  {
    id: 'material',
    key: 'material',
    label: 'Preferred Material',
    type: 'select',
    required: false,
    enabled: true,
    section: 'preferences',
    width: 'full',
    options: [
      'New Zealand Wool',
      'Silk & Wool Blend',
      'Pure Silk',
      'Hand-Spun Wool',
      'Open to Recommendation',
    ],
  },
  {
    id: 'color_preferences',
    key: 'color_preferences',
    label: 'Color Preferences',
    type: 'text',
    required: false,
    enabled: true,
    placeholder: 'e.g. Warm neutrals, ivory & gold accents',
    section: 'preferences',
    width: 'full',
  },
  {
    id: 'budget_range',
    key: 'budget_range',
    label: 'Budget Range',
    type: 'select',
    required: false,
    enabled: true,
    section: 'preferences',
    width: 'full',
    options: [
      '$1,000 – $3,000',
      '$3,000 – $5,000',
      '$5,000 – $10,000',
      '$10,000+',
    ],
  },
  {
    id: 'notes',
    key: 'notes',
    label: 'Additional Notes',
    type: 'textarea',
    required: false,
    enabled: true,
    placeholder: 'Pattern ideas, inspiration links, timeline, or any special requests...',
    section: 'preferences',
    width: 'full',
  },
];

export function normalizeCustomRugFields(raw: unknown): CustomRugFormField[] {
  if (!Array.isArray(raw) || raw.length === 0) {
    return DEFAULT_CUSTOM_RUG_FORM_FIELDS;
  }

  return raw
    .filter((item): item is Record<string, unknown> => !!item && typeof item === 'object')
    .map((item, index) => {
      const key = String(item.key || `field_${index}`).trim().replace(/\s+/g, '_').toLowerCase() || `field_${index}`;
      const locked = key === 'name' || key === 'email' || Boolean(item.locked);
      let options: string[] | undefined;
      if (Array.isArray(item.options)) {
        options = item.options.map((o) => String(o).trim()).filter(Boolean);
      } else if (typeof item.options === 'string') {
        options = item.options
          .split(/[\n,]/)
          .map((o) => o.trim())
          .filter(Boolean);
      }

      const type = (['text', 'email', 'tel', 'select', 'textarea'].includes(String(item.type))
        ? String(item.type)
        : 'text') as CustomRugFieldType;

      const section = (['contact', 'project', 'preferences'].includes(String(item.section))
        ? String(item.section)
        : 'preferences') as CustomRugFieldSection;

      return {
        id: String(item.id || key),
        key,
        label: String(item.label || key),
        type,
        required: locked ? true : Boolean(item.required),
        enabled: item.enabled === false ? false : true,
        placeholder: item.placeholder ? String(item.placeholder) : '',
        options,
        section,
        width: item.width === 'half' ? 'half' : 'full',
        locked,
      };
    });
}

export function slugifyFieldKey(label: string): string {
  return label
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '_')
    .replace(/^_|_$/g, '')
    .slice(0, 40) || `field_${Date.now().toString(36)}`;
}
