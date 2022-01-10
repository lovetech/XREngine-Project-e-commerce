import InputGroup from '@xrengine/editor/src/components/inputs/InputGroup'
import SelectInput from '@xrengine/editor/src/components/inputs/SelectInput'
import StringInput from '@xrengine/editor/src/components/inputs/StringInput'
import NodeEditor from '@xrengine/editor/src/components/properties/NodeEditor'
import React, { Fragment } from 'react'
import { useTranslation } from 'react-i18next'
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart'
import { EditorComponentType, updateProperty } from '@xrengine/editor/src/components/properties/Util'
import VideoNodeEditor from '@xrengine/editor/src/components/properties/VideoNodeEditor'
import ModelNodeEditor from '@xrengine/editor/src/components/properties/ModelNodeEditor'
import ImageNodeEditor from '@xrengine/editor/src/components/properties/ImageNodeEditor'
import { getComponent } from '@xrengine/engine/src/ecs/functions/ComponentFunctions'
import { ProductComponent } from '../engine/ProductComponent'

export const ProductNodeEditor: EditorComponentType = (props) => {
  const { t } = useTranslation()

  const productComponent = getComponent(props.node.entity, ProductComponent)

  const renderPropertiesFields = () => {
    switch (productComponent.extendType) {
      case 'model': return ModelNodeEditor(props)
      case 'video': return VideoNodeEditor(props)
      case 'image': return ImageNodeEditor(props)
      default: return
    }
  }

  return (
    <NodeEditor description={t('editor:properties.product.description')} {...props}>
      <InputGroup name="Product Domain" label={"Product Domain"}>
        <StringInput value={productComponent.domain} onChange={updateProperty(ProductComponent, 'productDomain')} />
      </InputGroup>
      <InputGroup name="Product Access Token or Key" label={"Product Access Token or Key"}>
        <StringInput value={productComponent.token} onChange={updateProperty(ProductComponent, 'productToken')} />
      </InputGroup>
      <InputGroup name="Product Secret" label={"Product Secret"}>
        <StringInput value={productComponent.token} onChange={updateProperty(ProductComponent, 'productToken')} />
      </InputGroup>
      {productComponent.products && productComponent.products.length > 0 && (
        <InputGroup name="Product Products" label={"Product Products"}>
          <SelectInput options={productComponent.products} value={productComponent.productId} onChange={updateProperty(ProductComponent, 'productProductId')} />
        </InputGroup>
      )}
      {productComponent.productItems && productComponent.productItems.length > 0 && (
        <InputGroup name="Product Items" label={"Product Items"}>
          <SelectInput
            options={productComponent.productItems}
            value={productComponent.productItemId}
            onChange={updateProperty(ProductComponent, 'productProductItemId')}
          />
        </InputGroup>
      )}
      <Fragment>
        {renderPropertiesFields()}
      </Fragment>
    </NodeEditor>
  )
}

ProductNodeEditor.iconComponent = ShoppingCartIcon

export default ProductNodeEditor
