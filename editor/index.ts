import { EntityNodeEditor, prefabIcons } from '@xrengine/editor/src/functions/PrefabEditors'
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart'
import ProductNodeEditor from './ProductNodeEditor'
import { product } from '../worldInjection'
import { World } from '@xrengine/engine/src/ecs/classes/World'
import { SCENE_COMPONENT_PRODUCT } from '../engine/productFunctions'

EntityNodeEditor[SCENE_COMPONENT_PRODUCT] = ProductNodeEditor
prefabIcons[product] = ShoppingCartIcon

export default async (world: World) => {

}