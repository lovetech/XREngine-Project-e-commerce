import { Entity } from "@xrengine/engine/src/ecs/classes/Entity"
import { getComponent } from "@xrengine/engine/src/ecs/functions/ComponentFunctions"
import { InteractableComponent } from "@xrengine/engine/src/interaction/components/InteractableComponent"
import { ProductComponent } from "./ProductComponent"
import { initInteractive } from "./productFunctions"
import axios from 'axios'
import OAuth from 'oauth-1.0a'
import CryptoJS from 'crypto-js'

export const makeRequest = async (url, ck, cs, method = 'GET') => {
  //@ts-ignore
  const oauth = OAuth({
    consumer: {
      key: ck,
      secret: cs
    },
    signature_method: 'HMAC-SHA1',
    hash_function: function (base_string, key) {
      return CryptoJS.enc.Base64.stringify(CryptoJS.HmacSHA1(base_string, key))
    }
  })
  const requestData = {
    url,
    method
  }
  const response = await axios.get(requestData.url, { params: oauth.authorize(requestData) })
  return response
}

export const getWoocommerceData = async (entity: Entity) => {
  const component = getComponent(entity, ProductComponent)
  if (
    !component.domain ||
    component.domain == '' ||
    !component.token ||
    component.token == '' ||
    !component.secret ||
    component.secret == ''
  )
    return
  try {
    const res = await makeRequest(
      component.domain + '/wp-json/wc/v3/products',
      component.token,
      component.secret
    )
    if (!res || !res.data) return
    const productData: any = res.data

    const interactableComponent = getComponent(entity, InteractableComponent)
    initInteractive(interactableComponent)

    component.products = []
    component.productItems = []
    component.productItemId = ''
    var urlRegex = /(https?:\/\/[^\s]+)/g
    if (productData && productData.length > 0) {
      productData.forEach((product) => {
        const sourceData: any[] = []
        var urls = product.description.match(urlRegex)
        urls.forEach((url) => {
          let extendType = ''
          let path = ''
          let type = ''
          if (url.match(/\.(jpeg|jpg|gif|png)/) != null) {
            const format = url.match(/\.(jpeg|jpg|gif|png)/)[0]
            type = url.match(/\.(jpeg|jpg|gif|png)/)[1]
            extendType = 'image'
            path = `${url.split(format)[0]}${format}`
          } else if (url.match(/\.(mp4|mkv|avi|mov|flv|wmv)/) != null) {
            const format = url.match(/\.(mp4|mkv|avi|mov|flv|wmv)/)[0]
            type = url.match(/\.(mp4|mkv|avi|mov|flv|wmv)/)[1]
            extendType = 'video'
            path = `${url.split(format)[0]}${format}`
          } else if (url.match(/\.(glb|glft|fbx|obj)/) != null) {
            const format = url.match(/\.(glb|glft|fbx|obj)/)[0]
            type = url.match(/\.(glb|glft|fbx|obj)/)[1]
            extendType = 'model'
            path = `${url.split(format)[0]}${format}`
          }
          if (extendType) {
            const filtered = sourceData.filter((data) => data.url == path)
            if (filtered.length == 0) {
              sourceData.push({
                url: path,
                format: type,
                extendType
              })
            }
          }
        })
        component.products.push({
          title: product.name,
          description: product.short_description.replace(/(<([^>]+)>)/gi, ''),
          storeUrl: product.permalink,
          value: product.id,
          label: product.name,
          media: sourceData
        })
      })
    }

    // CommandManager.instance.emitEvent(EditorEvents.OBJECTS_CHANGED, [this])
    // CommandManager.instance.emitEvent(EditorEvents.SELECTION_CHANGED)
  } catch (error) {
    component.products = []
    console.error(error)
  }
}