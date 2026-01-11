import { useEffect, useRef } from 'react';
import { supabase } from '../utils/supabase';

export function useRealtime<T>(
  table: string,
  onUpdate: () => void,
  filter?: { column: string; value: any }
) {
  const onUpdateRef = useRef(onUpdate);

  // Keep ref up to date with latest callback
  useEffect(() => {
    onUpdateRef.current = onUpdate;
  }, [onUpdate]);

  useEffect(() => {
    let mounted = true;
    const channel = supabase.channel(`realtime-${table}-${Date.now()}`);
    
    channel
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: table,
          ...(filter && { filter: `${filter.column}=eq.${filter.value}` }),
        },
        () => {
          // Only call callback if component is still mounted
          if (mounted) {
            // Use setTimeout to prevent state updates during render
            setTimeout(() => {
              if (mounted) {
                onUpdateRef.current();
              }
            }, 0);
          }
        }
      )
      .subscribe();

    return () => {
      mounted = false;
      supabase.removeChannel(channel);
    };
  }, [table, filter?.column, filter?.value]);
}
