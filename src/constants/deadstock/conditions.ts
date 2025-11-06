// Dead Stock Condition Mapping
// Frontend displays French, Backend expects English enum values

export const CONDITION_MAPPING = {
  // French (Display) -> English (API)
  'NEW': 'NEW',
  'USED': 'USED',
  'REFURBISHED': 'REFURBISHED',
  'DAMAGED': 'DAMAGED',
  'OUT_OF_ORDER': 'OUT_OF_ORDER',
} as const;

export const CONDITION_LABELS: Record<keyof typeof CONDITION_MAPPING, string> = {
  'NEW': 'NEUF',
  'USED': 'UTILISÉ',
  'REFURBISHED': 'RECONDITIONNÉ',
  'DAMAGED': 'ENDOMMAGÉ',
  'OUT_OF_ORDER': 'HORS SERVICE',
} as const;

// Helper to get French label from English value
export const getConditionLabel = (value: string): string => {
  return CONDITION_LABELS[value as keyof typeof CONDITION_LABELS] || value;
};

// Helper to get English value from French label (for backwards compatibility if needed)
export const getConditionValue = (label: string): string => {
  const entry = Object.entries(CONDITION_LABELS).find(([_, l]) => l === label);
  return entry ? entry[0] : label;
};

// Array of conditions for Select components
export const CONDITION_OPTIONS = Object.entries(CONDITION_LABELS).map(([value, label]) => ({
  value,
  label,
}));
