"use server"

import { sdk } from "@lib/config"
import medusaError from "@lib/util/medusa-error"
import { HttpTypes } from "@medusajs/types"
import { unstable_cache } from "next/cache"
import { getCacheOptions } from "./cookies"

const _fetchRegions = async () =>
  sdk.client
    .fetch<{ regions: HttpTypes.StoreRegion[] }>(`/store/regions`, {
      method: "GET",
      cache: "force-cache",
    })
    .then(({ regions }) => regions)
    .catch(medusaError)

const getCachedRegions = unstable_cache(_fetchRegions, ["store-regions"], {
  revalidate: 3600,
  tags: ["regions"],
})

export const listRegions = async () => {
  try {
    const next = await getCacheOptions("regions")
    if (Object.keys(next).length > 0) {
      // Per-user cache tag present (logged-in user with cache id) — bypass shared cache
      return sdk.client
        .fetch<{ regions: HttpTypes.StoreRegion[] }>(`/store/regions`, {
          method: "GET",
          next,
          cache: "force-cache",
        })
        .then(({ regions }) => regions)
        .catch(medusaError)
    }
  } catch {}
  return getCachedRegions()
}

export const retrieveRegion = async (id: string) => {
  const next = {
    ...(await getCacheOptions(["regions", id].join("-"))),
  }

  return sdk.client
    .fetch<{ region: HttpTypes.StoreRegion }>(`/store/regions/${id}`, {
      method: "GET",
      next,
      cache: "force-cache",
    })
    .then(({ region }) => region)
    .catch(medusaError)
}

const regionMap = new Map<string, HttpTypes.StoreRegion>()

export const getRegion = async (countryCode: string) => {
  try {
    if (regionMap.has(countryCode)) {
      return regionMap.get(countryCode)
    }

    const regions = await listRegions()

    if (!regions) {
      return null
    }

    regions.forEach((region) => {
      region.countries?.forEach((c) => {
        regionMap.set(c?.iso_2 ?? "", region)
      })
    })

    const region = countryCode
      ? regionMap.get(countryCode)
      : regionMap.get("us")

    return region
  } catch (e: any) {
    return null
  }
}
