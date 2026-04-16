"use server"

import { sdk } from "@lib/config"
import { HttpTypes } from "@medusajs/types"
import { unstable_cache } from "next/cache"
import { getCacheOptions } from "./cookies"

export const retrieveCollection = async (id: string) => {
  const next = {
    ...(await getCacheOptions("collections")),
  }

  return sdk.client
    .fetch<{ collection: HttpTypes.StoreCollection }>(
      `/store/collections/${id}`,
      {
        next,
        cache: "force-cache",
      }
    )
    .then(({ collection }) => collection)
}

const getCachedCollections = unstable_cache(
  async (queryParams: Record<string, string>) =>
    sdk.client
      .fetch<{ collections: HttpTypes.StoreCollection[]; count: number }>(
        "/store/collections",
        { query: queryParams, cache: "force-cache" }
      )
      .then(({ collections }) => ({ collections, count: collections.length })),
  ["store-collections"],
  { revalidate: 3600, tags: ["collections"] }
)

export const listCollections = async (
  queryParams: Record<string, string> = {}
): Promise<{ collections: HttpTypes.StoreCollection[]; count: number }> => {
  queryParams.limit = queryParams.limit || "100"
  queryParams.offset = queryParams.offset || "0"

  try {
    const next = await getCacheOptions("collections")
    if (Object.keys(next).length > 0) {
      return sdk.client
        .fetch<{ collections: HttpTypes.StoreCollection[]; count: number }>(
          "/store/collections",
          { query: queryParams, next, cache: "force-cache" }
        )
        .then(({ collections }) => ({ collections, count: collections.length }))
    }
  } catch {}
  return getCachedCollections(queryParams)
}

export const getCollectionByHandle = async (
  handle: string
): Promise<HttpTypes.StoreCollection> => {
  const next = {
    ...(await getCacheOptions("collections")),
  }

  return sdk.client
    .fetch<HttpTypes.StoreCollectionListResponse>(`/store/collections`, {
      query: { handle, fields: "*products" },
      next,
      cache: "force-cache",
    })
    .then(({ collections }) => collections[0])
}
