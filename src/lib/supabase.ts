import { createClient } from "@supabase/supabase-js";

import { env, assertServerEnv } from "@/lib/env";

const orderImageSignedUrlExpiresInSeconds = 60 * 60 * 24 * 7;

export function createSupabaseAdminClient() {
  assertServerEnv(env.hasSupabase, "Supabase is not configured.");

  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
      },
    },
  );
}

export function getGalleryPublicUrl(path: string) {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL) {
    return path;
  }

  return `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/${env.galleryBucket}/${path}`;
}

export async function createOrderImageSignedUrl(path: string) {
  const supabase = createSupabaseAdminClient();
  const { data, error } = await supabase.storage
    .from(env.orderBucket)
    .createSignedUrl(path, orderImageSignedUrlExpiresInSeconds);

  if (error) {
    throw error;
  }

  return data.signedUrl;
}
