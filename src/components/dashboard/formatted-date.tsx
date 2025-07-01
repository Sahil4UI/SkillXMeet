'use client';

import { useState, useEffect } from 'react';
import { Skeleton } from '@/components/ui/skeleton';

export function FormattedDate({ date, options }: { date: string, options: Intl.DateTimeFormatOptions }) {
  const [formatted, setFormatted] = useState('');
  
  useEffect(() => {
    // The date string from the `meetings` array (e.g., '2024-08-15') is treated as UTC.
    // By creating the date object and then formatting it, we ensure consistency.
    const d = new Date(date);
    setFormatted(d.toLocaleDateString('en-US', options));
  }, [date, options]);

  // Render a placeholder on the server and initial client render to prevent mismatch
  if (!formatted) {
    return <Skeleton className="h-4 w-32" />;
  }

  return <span>{formatted}</span>;
}
