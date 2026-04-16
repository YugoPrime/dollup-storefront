import { sdk } from "@lib/config"
import { HttpTypes } from "@medusajs/types"
import { unstable_cache } from "next/cache"
import { getCacheOptions } from "./cookies"

const getCachedCategories = unstable_cache(
  async (limit: number) =>
    sdk.client
      .fetch<{ product_categories: HttpTypes.StoreProductCategory[] }>(
        "/store/product-categories",
        {
          query: {
            fields:
              "*category_children, *products, *parent_category, *parent_category.parent_category",
            limit,
          },
          cache: "force-cache",
        }
      )
      .then(({ product_categories }) => product_categories),
  ["store-categories"],
  { revalidate: 3600, tags: ["categories"] }
)

export const listCategories = async (query?: Record<string, any>) => {
  const limit = query?.limit || 100

  if (!query || Object.keys(query).length === 0 || (Object.keys(query).length === 1 && query.limit)) {
    return getCachedCategories(limit)
  }

  const next = {
    ...(await getCacheOptions("categories")),
  }

  return sdk.client
    .fetch<{ product_categories: HttpTypes.StoreProductCategory[] }>(
      "/store/product-categories",
      {
        query: {
          fields:
            "*category_children, *products, *parent_category, *parent_category.parent_category",
          limit,
          ...query,
        },
        next,
        cache: "force-cache",
      }
    )
    .then(({ product_categories }) => product_categories)
}

export const getCategoryByHandle = async (categoryHandle: string[]) => {
  const handle = `${categoryHandle.join("/")}`

  const next = {
    ...(await getCacheOptions("categories")),
  }

  return sdk.client
    .fetch<HttpTypes.StoreProductCategoryListResponse>(
      `/store/product-categories`,
      {
        query: {
          fields: "*category_children, *products",
          handle,
        },
        next,
        cache: "force-cache",
      }
    )
    .then(({ product_categories }) => product_categories[0])
}
