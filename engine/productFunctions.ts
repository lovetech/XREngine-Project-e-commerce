import { ComponentJson } from '@xrengine/common/src/interfaces/SceneInterface'
import { ComponentDeserializeFunction, ComponentSerializeFunction, ComponentUpdateFunction } from '@xrengine/engine/src/common/constants/PrefabFunctionType'
import { Engine } from '@xrengine/engine/src/ecs/classes/Engine'
import { Entity } from '@xrengine/engine/src/ecs/classes/Entity'
import { addComponent, ComponentType, getComponent } from '@xrengine/engine/src/ecs/functions/ComponentFunctions'
import { EntityNodeComponent } from '@xrengine/engine/src/scene/components/EntityNodeComponent'
import { ProductComponent, ProductComponentType, ProductProviders } from './ProductComponent'
import { InteractableComponent } from '@xrengine/engine/src/interaction/components/InteractableComponent'
import { getShopifyData } from './getShopifyData'

export const SCENE_COMPONENT_PRODUCT = 'e-commerce-product'
export const SCENE_COMPONENT_PRODUCT_DEFAULT_VALUES = {
  provider: '',
  domain: '',
  products: [],
  token: '',
  productId: '',
  productItems: [],
  productItemId: '',
  extendType: ''
}

const providers = {
  'shopify': getShopifyData,
  'woocommerce': getShopifyData
} as Record<ProductProviders, (entity: Entity) => void>

export const deserializeProduct: ComponentDeserializeFunction = (entity: Entity, json: ComponentJson<ProductComponentType>) => {
  addComponent(entity, ProductComponent, { ...json.props })

  if (Engine.isEditor) getComponent(entity, EntityNodeComponent)?.components.push(SCENE_COMPONENT_PRODUCT)

}

export const updateProduct: ComponentUpdateFunction = async (entity: Entity, properties: ProductComponentType) => {
  if(Engine.isEditor) {
    const component = getComponent(entity, ProductComponent)
    
    switch(Object.keys(properties)[0] as keyof ProductComponentType) {
      case 'productId': return updateProductId(entity, properties.productId)
      case 'domain': 
      case 'token': return providers[component.provider](entity)
    }
  }
}

export const updateProductId = (entity: Entity, shopifyProductId: string) => {
  const component = getComponent(entity, ProductComponent)

  component.productItems = []
  let modelCount = 0
  let videoCount = 0
  let imageCount = 0
  const interactableComponent = getComponent(entity, InteractableComponent)
  initInteractive(interactableComponent)
  component.productItemId = ''

  if (component.products && component.products.length != 0) {
    const filtered = component.products.filter((product) => product.value == shopifyProductId)
    if (filtered && filtered.length != 0) {
      if (filtered[0] && filtered[0].media) {
        interactableComponent.interactionName = filtered[0].title
        interactableComponent.interactionText = filtered[0].title
        interactableComponent.interactionDescription = filtered[0].description
        if (filtered[0].storeUrl) interactableComponent.interactionUrls.push(filtered[0].storeUrl)

        filtered[0].media.forEach((media, index) => {
          let label = media.extendType.replace(/\b\w/g, (l) => l.toUpperCase())
          if (media.extendType == 'model') {
            modelCount++
            label += ` ${modelCount}`
            interactableComponent.interactionModels.push(media.url)
          } else if (media.extendType == 'video') {
            videoCount++
            label += ` ${videoCount}`
            interactableComponent.interactionVideos.push(media.url)
          } else {
            imageCount++
            label += ` ${imageCount}`
            interactableComponent.interactionImages.push(media.url)
          }
          component.productItems.push({
            value: index,
            label,
            media
          })
        })
      }
    }
  }
}

export const serializeProduct: ComponentSerializeFunction = (entity) => {
  const component = getComponent(entity, ProductComponent)
  return {
    name: SCENE_COMPONENT_PRODUCT,
    props: {
      provider: component.provider,
      products: component.products,
      domain: component.domain,
      token: component.token,
      productId: component.productId,
      productItemId: component.productItemId,
      productItems: component.productItems,
      extendType: component.extendType,
    }
  }
}

export const initInteractive = (interactableComponent: ComponentType<typeof InteractableComponent>) => {
  interactableComponent.interactable = false
  interactableComponent.interactionType = 'infoBox'
  interactableComponent.interactionText = ''
  interactableComponent.interactionThemeIndex = 0
  interactableComponent.interactionName = ''
  interactableComponent.interactionDescription = ''
  interactableComponent.interactionImages = []
  interactableComponent.interactionVideos = []
  interactableComponent.interactionUrls = []
  interactableComponent.interactionModels = []
}