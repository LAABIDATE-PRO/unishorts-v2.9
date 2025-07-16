import { supabase } from '@/integrations/supabase/client';

export const logEvent = async (action: string, details: Record<string, any>) => {
  try {
    const { error } = await supabase.functions.invoke('log-event', {
      body: { action, details },
    });
    if (error) {
      console.error('Failed to log event:', error);
    }
  } catch (e) {
    console.error('Error invoking log-event function:', e);
  }
};