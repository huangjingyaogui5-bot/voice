import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm';

const supabaseUrl = 'https://ivsogzwizgfdmxlszugk.supabase.co';
const supabaseKey = 'sb_publishable_kjJ8DZlKSCPOrMKLqCE8NA_RHSbkNcT';

export const supabase = createClient(supabaseUrl, supabaseKey);

/**
 *  投稿データを取得する(自分が今日投稿しているかチェックするロジック等で使用)
 */
export const fetchTodaysPosts = async () => {
    const { data, error } = await supabase
    .from('voice_posts')
    .select('*')
    .order('created_at', { ascending: false });

    if (error) throw error;
    return data;
};