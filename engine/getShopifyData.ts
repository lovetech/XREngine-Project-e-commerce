import { Entity } from "@xrengine/engine/src/ecs/classes/Entity"
import { getComponent } from "@xrengine/engine/src/ecs/functions/ComponentFunctions"
import { InteractableComponent } from "@xrengine/engine/src/interaction/components/InteractableComponent"
import { ProductComponent, ProductType } from "./ProductComponent"
import { initInteractive } from "./productFunctions"
import axios from 'axios'

export const getShopifyData = async (entity: Entity): Promise<ProductType[]> => {

  const component = getComponent(entity, ProductComponent)
  if (!component.domain || component.domain == '' || !component.token || component.token == '') return []
  try {
    const res = await axios.post(
      `${component.domain}/api/2021-07/graphql.json`,
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
      { headers: { 'X-Shopify-Storefront-Access-Token': component.token, 'Content-Type': 'application/json' } }
    )
    if (!res || !res.data) return []
    const productData: any = res.data
    if (productData.data && productData.data.products && productData.data.products.edges) {
      const products: ProductType[] = []
      for (const edgeProduct of productData.data.products.edges) {
        //TODO: interact data
        const response = await axios.post(
          `${component.domain}/api/2021-07/graphql.json`,
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
          { headers: { 'X-Shopify-Storefront-Access-Token': component.token, 'Content-Type': 'application/json' } }
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
            products.push({
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
      return products
    }
  } catch (error) {
    console.error(error)
  }
  return []
}