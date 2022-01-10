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
import { ShopifyComponent } from '../engine/ShopifyComponent'

export const ShopifyNodeEditor: EditorComponentType = (props) => {
  const { t } = useTranslation()

  const shopifyComponent = getComponent(props.node.entity, ShopifyComponent)

  const renderPropertiesFields = () => {
    switch (shopifyComponent.extendType) {
      case 'model': return ModelNodeEditor(props)
      case 'video': return VideoNodeEditor(props)
      case 'image': return ImageNodeEditor(props)
      default: return
    }
  }

  return (
    <NodeEditor description={t('editor:properties.shopify.description')} {...props}>
      <InputGroup name="Shopify Domain" label={t('editor:properties.shopify.lbl-shopifyDomain')}>
        <StringInput value={shopifyComponent.shopifyDomain} onChange={updateProperty(ShopifyComponent, 'shopifyDomain')} />
      </InputGroup>
      <InputGroup name="Shopify Acess Token" label={t('editor:properties.shopify.lbl-shopifyAccessToken')}>
        <StringInput value={shopifyComponent.shopifyToken} onChange={updateProperty(ShopifyComponent, 'shopifyToken')} />
      </InputGroup>
      {shopifyComponent.shopifyProducts && shopifyComponent.shopifyProducts.length > 0 && (
        <InputGroup name="Shopify Products" label={t('editor:properties.shopify.lbl-shopifyProducts')}>
          <SelectInput options={shopifyComponent.shopifyProducts} value={shopifyComponent.shopifyProductId} onChange={updateProperty(ShopifyComponent, 'shopifyProductId')} />
        </InputGroup>
      )}
      {shopifyComponent.shopifyProductItems && shopifyComponent.shopifyProductItems.length > 0 && (
        <InputGroup name="Shopify Media" label={t('editor:properties.shopify.lbl-shopifyProductItems')}>
          <SelectInput
            options={shopifyComponent.shopifyProductItems}
            value={shopifyComponent.shopifyProductItemId}
            onChange={updateProperty(ShopifyComponent, 'shopifyProductItemId')}
          />
        </InputGroup>
      )}
      <Fragment>
        {renderPropertiesFields()}
      </Fragment>
    </NodeEditor>
  )
}

ShopifyNodeEditor.iconComponent = ShoppingCartIcon

export default ShopifyNodeEditor
