import { ComponentJson } from '@xrengine/common/src/interfaces/SceneInterface'
import { ComponentDeserializeFunction, ComponentSerializeFunction, ComponentUpdateFunction } from '@xrengine/engine/src/common/constants/PrefabFunctionType'
import { Engine } from '@xrengine/engine/src/ecs/classes/Engine'
import { Entity } from '@xrengine/engine/src/ecs/classes/Entity'
import { addComponent, ComponentType, getComponent, hasComponent, removeComponent } from '@xrengine/engine/src/ecs/functions/ComponentFunctions'
import { EntityNodeComponent } from '@xrengine/engine/src/scene/components/EntityNodeComponent'
import { ProductComponent, ProductComponentType, ProductProvidersType, ProductSelectedType, ProductType } from './ProductComponent'
import { InteractableComponent } from '@xrengine/engine/src/interaction/components/InteractableComponent'
import { getShopifyData } from './getShopifyData'
import { ImageComponent } from '@xrengine/engine/src/scene/components/ImageComponent'
import { VideoComponent } from '@xrengine/engine/src/scene/components/VideoComponent'
import { ModelComponent } from '@xrengine/engine/src/scene/components/ModelComponent'
import { deserializeImage, SCENE_COMPONENT_IMAGE, SCENE_COMPONENT_IMAGE_DEFAULT_VALUES } from '@xrengine/engine/src/scene/functions/loaders/ImageFunctions'
import { deserializeVideo, SCENE_COMPONENT_VIDEO, SCENE_COMPONENT_VIDEO_DEFAULT_VALUES } from '@xrengine/engine/src/scene/functions/loaders/VideoFunctions'
import { deserializeModel, SCENE_COMPONENT_MODEL, SCENE_COMPONENT_MODEL_DEFAULT_VALUE } from '@xrengine/engine/src/scene/functions/loaders/ModelFunctions'
import { Object3DComponent } from '@xrengine/engine/src/scene/components/Object3DComponent'

export const SCENE_COMPONENT_PRODUCT = 'e-commerce-product'
export const SCENE_COMPONENT_PRODUCT_DEFAULT_VALUES = {
  provider: '',
  domain: '',
  products: [],
  token: '',
  productId: '',
  productItems: [],
  productItemId: ''
}

const providers = {
  'shopify': getShopifyData,
  'woocommerce': getShopifyData
} as Record<ProductProvidersType, (entity: Entity) => Promise<ProductType[]>>

export const deserializeProduct: ComponentDeserializeFunction = (entity: Entity, json: ComponentJson<ProductComponentType>) => {
  const component = addComponent(entity, ProductComponent, { ...SCENE_COMPONENT_PRODUCT_DEFAULT_VALUES, ...json.props })

  if (Engine.isEditor) {
    getComponent(entity, EntityNodeComponent)?.components.push(SCENE_COMPONENT_PRODUCT)
    providers[component.provider](entity).then(products => {
      component.products = products
      updateProductId(entity, component.productId)
      updateProductItemId(entity, component.productItemId)
    })
  }

}

export const updateProduct: ComponentUpdateFunction = async (entity: Entity, properties: ProductComponentType) => {
  if (Engine.isEditor) {
    const component = getComponent(entity, ProductComponent)
    console.log('updateProduct', properties, component)

    switch (Object.keys(properties)[0] as keyof ProductComponentType) {
      case 'productId': return updateProductId(entity, properties.productId)
      case 'productItemId': return updateProductItemId(entity, properties.productItemId)
      case 'domain':
      case 'token':
      case 'secret': return providers[component.provider](entity).then(products => component.products = products)
    }
  }
}

export const updateProductId = (entity: Entity, productId: string) => {
  const component = getComponent(entity, ProductComponent)
  let modelCount = 0
  let videoCount = 0
  let imageCount = 0
  const interactableComponent = getComponent(entity, InteractableComponent)
  initInteractive(interactableComponent)
  component.productItems = []

  if (component.products && component.products.length != 0) {
    const filtered = component.products.filter((product) => product.value == productId)
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


export const updateProductItemId = (entity: Entity, productItemId: string) => {
  const component = getComponent(entity, ProductComponent)
  const nodeComponents = getComponent(entity, EntityNodeComponent).components
  const item = component.productItems[productItemId] as ProductSelectedType

  if (hasComponent(entity, ImageComponent)) {
    if(item.media.extendType === 'image') return
    removeComponent(entity, ImageComponent)
    nodeComponents.splice(nodeComponents.indexOf(SCENE_COMPONENT_IMAGE), 1)
  }
  if (hasComponent(entity, VideoComponent)) {
    if(item.media.extendType === 'video') return
    removeComponent(entity, VideoComponent)
    nodeComponents.splice(nodeComponents.indexOf(SCENE_COMPONENT_VIDEO), 1)
  }
  if (hasComponent(entity, ModelComponent)) {
    if(item.media.extendType === 'model') return
    removeComponent(entity, ModelComponent)
    nodeComponents.splice(nodeComponents.indexOf(SCENE_COMPONENT_MODEL), 1)
  }
  if (hasComponent(entity, Object3DComponent)) removeComponent(entity, Object3DComponent)

  if (component.productItems.length) {
    switch (item.media.extendType) {
      case 'model':
        return deserializeModel(entity, {
          name: item.label,
          props: {
            ...SCENE_COMPONENT_MODEL_DEFAULT_VALUE,
            src: item.media.url
          }
        })
      case 'image':
        return deserializeImage(entity, {
          name: item.label,
          props: {
            ...SCENE_COMPONENT_IMAGE_DEFAULT_VALUES,
            imageSource: item.media.url
          }
        })
      case 'video':
        return deserializeVideo(entity, {
          name: item.label,
          props: {
            ...SCENE_COMPONENT_VIDEO_DEFAULT_VALUES,
            videoSource: item.media.url
          }
        })
    }
  }
}

export const serializeProduct: ComponentSerializeFunction = (entity) => {
  const component = getComponent(entity, ProductComponent)
  return {
    name: SCENE_COMPONENT_PRODUCT,
    props: {
      provider: component.provider,
      domain: component.domain,
      productId: component.productId,
      productItemId: component.productItemId,
      token: component.token
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