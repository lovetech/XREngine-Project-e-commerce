import { EntityNodeEditor, prefabIcons } from '@xrengine/editor/src/managers/NodeManager'
import { World } from '@xrengine/engine/src/ecs/classes/World'
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart'
import { defaultSpatialComponents } from '@xrengine/engine/src/scene/functions/registerPrefabs'
import { deserializeShopify, SCENE_COMPONENT_SHOPIFY, SCENE_COMPONENT_SHOPIFY_DEFAULT_VALUES, serializeShopify, updateShopify } from './engine/shopifyFunctions'
import ShopifyNodeEditor from './editor/ShopifyNodeEditor'

const shopify = 'Shopify' as const

EntityNodeEditor[shopify] = ShopifyNodeEditor
prefabIcons[shopify] = ShoppingCartIcon

export default async (world: World) => {

  world.scenePrefabRegistry.set(shopify, [
    ...defaultSpatialComponents,
    { name: SCENE_COMPONENT_SHOPIFY, props: SCENE_COMPONENT_SHOPIFY_DEFAULT_VALUES }
  ])

  world.sceneLoadingRegistry.set(SCENE_COMPONENT_SHOPIFY, {
    deserialize: deserializeShopify,
    serialize: serializeShopify,
    update: updateShopify
  })
}
