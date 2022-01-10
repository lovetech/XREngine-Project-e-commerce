import { createMappedComponent } from "@xrengine/engine/src/ecs/functions/ComponentFunctions"

type ProductType = {
  title: string
  description: string
  storeUrl: string
  value: string
  label: string
  media: any
}

export type ShopifyComponentType = {
  extendType: string
  shopifyProducts: Array<ProductType>
  shopifyDomain: string
  shopifyToken: string
  shopifyProductId: string
  shopifyProductItems: Array<any>
  shopifyProductItemId: string
}

export const ShopifyComponent = createMappedComponent<ShopifyComponentType>('ShopifyComponent')
