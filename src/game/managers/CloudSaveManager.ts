import { supabase } from '@/integrations/supabase/client';
import { SaveData, loadSave, writeSave } from './SaveManager';

export async function loadCloudSaveForCurrentUser(): Promise<SaveData | null> {
  const { data: { session } } = await supabase.auth.getSession();
  const user = session?.user;
  if (!user) return null;

  const { data, error } = await supabase
    .from('player_saves')
    .select('save_data')
    .eq('user_id', user.id)
    .maybeSingle();

  if (error) {
    console.error('Cloud save load failed:', error);
    return null;
  }

  if (!data?.save_data) return null;
  return data.save_data as SaveData;
}

export async function saveCloudForCurrentUser(saveData?: SaveData): Promise<void> {
  const { data: { session } } = await supabase.auth.getSession();
  const user = session?.user;
  if (!user) return;

  const payload = saveData || loadSave();
  const { error } = await supabase
    .from('player_saves')
    .upsert({ user_id: user.id, save_data: payload, updated_at: new Date().toISOString() });

  if (error) {
    console.error('Cloud save write failed:', error);
    return;
  }

  writeSave(payload);
}
