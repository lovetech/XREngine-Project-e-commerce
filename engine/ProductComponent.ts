import { createMappedComponent } from "@xrengine/engine/src/ecs/functions/ComponentFunctions"

export type ProductType = {
  title: string
  description: string
  storeUrl: string
  value: string
  label: string
  media: any
}

export type ProductSelectedType = {
  value: number
  label: string
  media: {
    extendType: string
    filesize: number
    format: string
    mimeType: string
    url: string
  }
}

export const ProductProviders = ['shopify', 'woocommerce'] as const
export type ProductProvidersType = typeof ProductProviders[number]

export type ProductComponentType = {
  provider: ProductProvidersType
  products: Array<ProductType>
  domain: string
  token: string
  secret?: string
  productId: string
  productItems: Array<ProductSelectedType>
  productItemId: string
}

export const ProductComponent = createMappedComponent<ProductComponentType>('ProductComponent')
