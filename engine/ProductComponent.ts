import { createMappedComponent } from "@xrengine/engine/src/ecs/functions/ComponentFunctions"

export type ProductType = {
  title: string
  description: string
  storeUrl: string
  value: string
  label: string
  media: any
}

export type ProductProviders = 'shopify' | 'woocommerce'

export type ProductComponentType = {
  provider: ProductProviders
  extendType: string
  products: Array<ProductType>
  domain: string
  token: string
  secret?: string
  productId: string
  productItems: Array<any>
  productItemId: string
}

export const ProductComponent = createMappedComponent<ProductComponentType>('ProductComponent')
