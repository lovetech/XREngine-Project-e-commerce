import { ComponentJson } from '@xrengine/common/src/interfaces/SceneInterface'
import { ComponentDeserializeFunction, ComponentSerializeFunction, ComponentUpdateFunction } from '@xrengine/engine/src/common/constants/PrefabFunctionType'
import { Engine } from '@xrengine/engine/src/ecs/classes/Engine'
import { Entity } from '@xrengine/engine/src/ecs/classes/Entity'
import { addComponent, ComponentType, getComponent } from '@xrengine/engine/src/ecs/functions/ComponentFunctions'
import { EntityNodeComponent } from '@xrengine/engine/src/scene/components/EntityNodeComponent'
import { ShopifyComponent, ShopifyComponentType } from './ShopifyComponent'
import axios from 'axios'
import { InteractableComponent } from '@xrengine/engine/src/interaction/components/InteractableComponent'

export const SCENE_COMPONENT_SHOPIFY = 'shopify'
export const SCENE_COMPONENT_SHOPIFY_DEFAULT_VALUES = {
  shopifyDomain: '',
  shopifyProducts: [],
  shopifyToken: '',
  shopifyProductId: '',
  shopifyProductItems: [],
  shopifyProductItemId: '',
  extendType: ''
}

export const deserializeShopify: ComponentDeserializeFunction = (entity: Entity, json: ComponentJson<ShopifyComponentType>) => {
  addComponent(entity, ShopifyComponent, { ...json.props })

  if (Engine.isEditor) getComponent(entity, EntityNodeComponent)?.components.push(SCENE_COMPONENT_SHOPIFY)

}

export const updateShopify: ComponentUpdateFunction = async (entity: Entity, properties: ShopifyComponentType) => {
  if(Engine.isEditor) {
    switch(Object.keys(properties)[0] as keyof ShopifyComponentType) {
      case 'shopifyProductId': return updateShopifyProductId(entity, properties.shopifyProductId)
      case 'shopifyDomain': return getShopifyProduction(entity)
      case 'shopifyToken': return getShopifyProduction(entity)
    }
  }
}

export const updateShopifyProductId = (entity: Entity, shopifyProductId: string) => {
  const component = getComponent(entity, ShopifyComponent)

  component.shopifyProductItems = []
  let modelCount = 0
  let videoCount = 0
  let imageCount = 0
  const interactableComponent = getComponent(entity, InteractableComponent)
  initInteractive(interactableComponent)
  component.shopifyProductItemId = ''

  if (component.shopifyProducts && component.shopifyProducts.length != 0) {
    const filtered = component.shopifyProducts.filter((product) => product.value == value)
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
          component.shopifyProductItems.push({
            value: index,
            label,
            media
          })
        })
      }
    }
  }
}

export const serializeShopify: ComponentSerializeFunction = (entity) => {
  const component = getComponent(entity, ShopifyComponent)
  return {
    name: SCENE_COMPONENT_SHOPIFY,
    props: {
      shopifyProducts: component.shopifyProducts,
      shopifyDomain: component.shopifyDomain,
      shopifyToken: component.shopifyToken,
      shopifyProductId: component.shopifyProductId,
      shopifyProductItemId: component.shopifyProductItemId,
      shopifyProductItems: component.shopifyProductItems,
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

export const getShopifyProduction = async (entity: Entity) => {
  const component = getComponent(entity, ShopifyComponent)
  if (!component.shopifyDomain || component.shopifyDomain == '' || !component.shopifyToken || component.shopifyToken == '') return
  try {
    const res = await axios.post(
      `${component.shopifyDomain}/api/2021-07/graphql.json`,
      {
        query: `
          query {
            products(first: 250) {
              edges {
                node {
                  id
                  title
                  description
                  onlineStoreUrl 
                }
              }
            }
          }
      `
      },
      { headers: { 'X-Shopify-Storefront-Access-Token': component.shopifyToken, 'Content-Type': 'application/json' } }
    )
    if (!res || !res.data) return

    const interactableComponent = getComponent(entity, InteractableComponent)
    initInteractive(interactableComponent)

    const productData: any = res.data
    component.shopifyProducts = []
    component.shopifyProductItems = []
    if (productData.data && productData.data.products && productData.data.products.edges) {
      for (const edgeProduct of productData.data.products.edges) {
        //TODO: interact data
        const response = await axios.post(
          `${component.shopifyDomain}/api/2021-07/graphql.json`,
          {
            query: `
              query {
                node(id: "${edgeProduct.node.id}") {
                  ...on Product {
                    id
                      media(first: 250) {
                      edges {
                        node {
                          mediaContentType
                          alt
                          ...mediaFieldsByType
                        }
                      }
                    }
                  }
                }
              }
              
              fragment mediaFieldsByType on Media {
                ...on ExternalVideo {
                  id
                  host
                  embeddedUrl
                }
                ...on MediaImage {
                  image {
                    originalSrc
                  }
                }
                ...on Model3d {
                  sources {
                    url
                    mimeType
                    format
                    filesize
                  }
                }
                ...on Video {
                  sources {
                    url
                    mimeType
                    format
                    height
                    width
                  }
                }
              }
              
          `
          },
          { headers: { 'X-Shopify-Storefront-Access-Token': component.shopifyToken, 'Content-Type': 'application/json' } }
        )
        if (response && response.data) {
          const mediaData: any = response.data
          if (mediaData.data && mediaData.data.node && mediaData.data.node.media && mediaData.data.node.media.edges) {
            const sourceData: any[] = []
            for (const edgeMedia of mediaData.data.node.media.edges) {
              if (edgeMedia.node && edgeMedia.node.sources && edgeMedia.node.sources[0]) {
                let sourceValue = edgeMedia.node.sources[0]
                if (sourceValue.format == 'glb') {
                  //3d model
                  sourceValue.extendType = 'model'
                } else {
                  sourceValue.extendType = 'video'
                }
                sourceData.push(sourceValue)
              } else if (edgeMedia.node.image && edgeMedia.node.image.originalSrc) {
                sourceData.push({
                  url: edgeMedia.node.image.originalSrc,
                  mimeType: 'image/png',
                  format: 'png',
                  extendType: 'image'
                })
              }
            }
            component.shopifyProducts.push({
              title: edgeProduct.node.title,
              description: edgeProduct.node.description,
              storeUrl: edgeProduct.node.onlineStoreUrl,
              value: edgeProduct.node.id,
              label: edgeProduct.node.title,
              media: sourceData
            })
          }
        }
      }
      // CommandManager.instance.emitEvent(EditorEvents.OBJECTS_CHANGED, [component])
      // CommandManager.instance.emitEvent(EditorEvents.SELECTION_CHANGED)
    }
  } catch (error) {
    component.shopifyProducts = []
    console.error(error)
  }
}