/**
 * Late Payment Penalty & Status Engine
 * Computes overdue penalties and instalment lifecycle states.
 */

export interface PenaltyConfig {
  type: 'FLAT' | 'PERCENTAGE';
  value: number; // paise for flat (e.g. 5000 = ₹50), or percentage (e.g. 2.0 = 2%)
}

export function calculateLatePenalty(
  overdueInstalmentTotalPaise: number,
  config: PenaltyConfig,
  daysOverdue: number
): number {
  if (daysOverdue <= 0) return 0;

  if (config.type === 'FLAT') {
    return config.value;
  }

  // Percentage penalty on overdue instalment
  return Math.round(overdueInstalmentTotalPaise * (config.value / 100));
}

export function determineInstalmentStatus(
  dueDate: Date,
  isPaid: boolean,
  now: Date = new Date(),
  graceDays: number = 3
): 'UPCOMING' | 'DUE' | 'OVERDUE' | 'PAID' {
  if (isPaid) return 'PAID';

  const diffMs = now.getTime() - dueDate.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays < 0) {
    return 'UPCOMING';
  } else if (diffDays <= graceDays) {
    return 'DUE';
  } else {
    return 'OVERDUE';
  }
}
