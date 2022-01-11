
import { World } from '@xrengine/engine/src/ecs/classes/World'
import { defaultSpatialComponents } from '@xrengine/engine/src/scene/functions/registerPrefabs'
import { deserializeProduct, SCENE_COMPONENT_PRODUCT, SCENE_COMPONENT_PRODUCT_DEFAULT_VALUES, serializeProduct, updateProduct } from './engine/productFunctions'
import { isNode } from '@xrengine/engine/src/common/functions/getEnvironment'

export const product = 'e-commerce Product' as const

export default async (world: World) => {

  if(!isNode) {
    (await import('./editor/index')).default(world)
  }

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
