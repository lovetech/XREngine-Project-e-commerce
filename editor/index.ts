import { EntityNodeEditor, prefabIcons } from '@xrengine/editor/src/managers/NodeManager'
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart'
import ProductNodeEditor from './ProductNodeEditor'
import { product } from '../worldInjection'
import { World } from '@xrengine/engine/src/ecs/classes/World'

EntityNodeEditor[product] = ProductNodeEditor
prefabIcons[product] = ShoppingCartIcon

export default async (world: World) => {

}