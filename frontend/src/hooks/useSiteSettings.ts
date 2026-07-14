import { useQuery } from '@tanstack/react-query';
import { contentApi } from '@/lib/api';

export type SiteSettings = Record<string, string>;

export function useSiteSettings() {
  return useQuery<SiteSettings>({
    queryKey: ['site-settings'],
    queryFn: async () => {
      try {
        const response = await contentApi.settings();
        return response.data?.data ?? {};
      } catch {
        return {};
      }
    },
    staleTime: 5 * 60 * 1000,
  });
}

export function parseSettingJson<T>(value: string | undefined, fallback: T): T {
  if (!value) return fallback;

  try {
    return JSON.parse(value) as T;
  } catch {
    return fallback;
  }
}
