import 'server-only';
import { z } from 'zod';
import type { PoolClient } from 'pg';

export interface EnterpriseBadgeInfo {
  isEnterpriseModernist: boolean;
  slug: string | null;
  listingUrl: string | null;
  studioName?: string;
  accreditationLevel?: 'Mudra Certified' | 'Master Stylist' | 'Salon Founder';
}

const EnterpriseSlugSchema = z.string().trim().toLowerCase().regex(/^[a-z0-9][a-z0-9-]{2,62}$/);

/**
 * Validates and bridges matrimonial profiles with the federation /salon-hub registry.
 */
export function resolveSalonHubEnterprise(
  vocation: string,
  salonHubSlug: string | null | undefined
): EnterpriseBadgeInfo {
  if (vocation !== 'wellness_artisan' || !salonHubSlug) {
    return {
      isEnterpriseModernist: false,
      slug: null,
      listingUrl: null,
    };
  }

  const parsed = EnterpriseSlugSchema.safeParse(salonHubSlug);
  if (!parsed.success) {
    return {
      isEnterpriseModernist: false,
      slug: null,
      listingUrl: null,
    };
  }

  const cleanSlug = parsed.data;
  return {
    isEnterpriseModernist: true,
    slug: cleanSlug,
    listingUrl: `/salon-hub/${cleanSlug}`,
    accreditationLevel: 'Salon Founder',
  };
}

/**
 * Attaches enterprise modernization badge details to a candidate profile record.
 */
export async function verifyEnterpriseModernistStatus(
  tx: PoolClient,
  profileId: string
): Promise<EnterpriseBadgeInfo> {
  const { rows } = await tx.query(
    `SELECT vocation::text AS vocation, salon_hub_slug
       FROM matrimony_shared.profiles
      WHERE id = $1`,
    [profileId]
  );

  if (rows.length === 0) {
    return { isEnterpriseModernist: false, slug: null, listingUrl: null };
  }

  return resolveSalonHubEnterprise(rows[0].vocation, rows[0].salon_hub_slug);
}
