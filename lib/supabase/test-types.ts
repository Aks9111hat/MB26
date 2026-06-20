import { createBrowserClient } from '@supabase/ssr';
import type { Database } from './types';

const client = createBrowserClient<Database>('x', 'y');
const result = client.from('checkins').select('*');
type T = typeof result;