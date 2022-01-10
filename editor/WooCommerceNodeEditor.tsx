import React, { Fragment } from 'react'
import { useTranslation } from 'react-i18next'
import InputGroup from '@xrengine/editor/src/components/inputs/InputGroup'
import SelectInput from '@xrengine/editor/src/components/inputs/SelectInput'
import StringInput from '@xrengine/editor/src/components/inputs/StringInput'
import NodeEditor from '@xrengine/editor/src/components/properties/NodeEditor'
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart'
import { EditorComponentType, updateProperty } from '@xrengine/editor/src/components/properties/Util'
import ModelNodeEditor from '@xrengine/editor/src/components/properties/ModelNodeEditor'
import { getComponent } from '@xrengine/engine/src/ecs/functions/ComponentFunctions'
import ImageNodeEditor from '@xrengine/editor/src/components/properties/ImageNodeEditor'
import VideoNodeEditor from '@xrengine/editor/src/components/properties/VideoNodeEditor'

export const WooCommerceNodeEditor: EditorComponentType = (props) => {
  const { t } = useTranslation()

  const woocommerceComponent = getComponent(props.node.entity, WooCommerceComponent)

  //creating model ui controls
  const renderPropertiesFields = () => {
    switch (woocommerceComponent.extendType) {
      case 'model': return ModelNodeEditor(props)
      case 'video': return VideoNodeEditor(props)
      case 'image': return ImageNodeEditor(props)
      default: return
    }
  }

  return (
    <NodeEditor description={t('editor:properties.woocommerce.description')} {...props}>
      <InputGroup name="WooCommerce Domain" label={t('editor:properties.woocommerce.lbl-domain')}>
        <StringInput value={woocommerceComponent.wooCommerceDomain} onChange={updateProperty(null, 'wooCommerceDomain')} />
      </InputGroup>
      <InputGroup name="WooCommerce Consumer Key" label={t('editor:properties.woocommerce.lbl-consumerKey')}>
        <StringInput value={woocommerceComponent.wooCommerceConsumerKey} onChange={updateProperty(null, 'wooCommerceConsumerKey')} />
      </InputGroup>
      <InputGroup name="WooCommerce Consumer Secret" label={t('editor:properties.woocommerce.lbl-consumerSecret')}>
        <StringInput value={woocommerceComponent.wooCommerceConsumerSecret} onChange={updateProperty(null, 'wooCommerceConsumerSecret')} />
      </InputGroup>
      {woocommerceComponent.wooCommerceProducts && woocommerceComponent.wooCommerceProducts.length > 0 && (
        <InputGroup name="WooCommerce Products" label={t('editor:properties.woocommerce.lbl-products')}>
          <SelectInput
            options={woocommerceComponent.wooCommerceProducts}
            value={woocommerceComponent.wooCommerceProductId}
            onChange={updateProperty(null, 'wooCommerceProductId')}
          />
        </InputGroup>
      )}
      {woocommerceComponent.wooCommerceProductItems && woocommerceComponent.wooCommerceProductItems.length > 0 && (
        <InputGroup name="WooCommerce Product Items" label={t('editor:properties.woocommerce.lbl-productItems')}>
          <SelectInput
            options={woocommerceComponent.wooCommerceProductItems}
            value={woocommerceComponent.wooCommerceProductItemId}
            onChange={updateProperty(null, 'wooCommerceProductItemId')}
          />
        </InputGroup>
      )}
      <Fragment>
        {renderPropertiesFields()}
      </Fragment>
    </NodeEditor>
  )
}

WooCommerceNodeEditor.iconComponent = ShoppingCartIcon

export default WooCommerceNodeEditor
