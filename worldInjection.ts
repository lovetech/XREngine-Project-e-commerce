import { EntityNodeEditor, prefabIcons } from '@xrengine/editor/src/managers/NodeManager'
import { World } from '@xrengine/engine/src/ecs/classes/World'
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart'
import { defaultSpatialComponents } from '@xrengine/engine/src/scene/functions/registerPrefabs'
import { deserializeProduct, SCENE_COMPONENT_PRODUCT, SCENE_COMPONENT_PRODUCT_DEFAULT_VALUES, serializeProduct, updateProduct } from './engine/productFunctions'
import ProductNodeEditor from './editor/ProductNodeEditor'

const product = 'e-commerce Product' as const

EntityNodeEditor[product] = ProductNodeEditor
prefabIcons[product] = ShoppingCartIcon

export default async (world: World) => {

  world.scenePrefabRegistry.set(product, [
    ...defaultSpatialComponents,
    { name: SCENE_COMPONENT_PRODUCT, props: SCENE_COMPONENT_PRODUCT_DEFAULT_VALUES }
  ])

  world.sceneLoadingRegistry.set(SCENE_COMPONENT_PRODUCT, {
    deserialize: deserializeProduct,
    serialize: serializeProduct,
    update: updateProduct
  })
}
