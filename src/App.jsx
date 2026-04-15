import { useEffect, useMemo, useState } from 'react'
import './App.css'

const mockProducts = [
  {
    id: 'p-1',
    name: '亚克力钥匙扣（双面）',
    category: '亚克力',
    price: 39,
    discount: '50% OFF',
    leadTime: '3-5 天发货',
    material: '3.1mm 亚克力',
  },
  {
    id: 'p-2',
    name: '定制手机壳（iPhone/Android）',
    category: '手机壳',
    price: 59,
    discount: '35% OFF',
    leadTime: '4-6 天发货',
    material: 'TPU + 亚克力背板',
  },
  {
    id: 'p-3',
    name: '照片小夜灯（木底座）',
    category: '家居',
    price: 89,
    discount: '22% OFF',
    leadTime: '5-7 天发货',
    material: '木底座 + 透明板',
  },
  {
    id: 'p-4',
    name: '应援立牌（站立底座）',
    category: '应援周边',
    price: 49,
    discount: '40% OFF',
    leadTime: '3-5 天发货',
    material: '4mm 透明板',
  },
  {
    id: 'p-5',
    name: '彩色挂钩与链条套装',
    category: 'DIY 配件',
    price: 19,
    discount: '15% OFF',
    leadTime: '2-3 天发货',
    material: '合金电镀',
  },
]

const mockCategories = ['全部', ...new Set(mockProducts.map((item) => item.category))]
const sizeFeeMap = { 小号: 0, 中号: 4, 大号: 8 }
const serviceFee = 8

const computeQuote = (product, quantity, sizeOption) => {
  if (!product) return { unitPrice: 0, subtotal: 0, serviceFee: 0, total: 0 }
  const safeQty = Math.max(1, Number(quantity) || 1)
  const unitPrice = product.price + (sizeFeeMap[sizeOption] ?? sizeFeeMap['中号'])
  const subtotal = unitPrice * safeQty
  const total = subtotal + serviceFee
  return { unitPrice, subtotal, serviceFee, total }
}

function App() {
  const [categories, setCategories] = useState(['全部'])
  const [products, setProducts] = useState([])
  const [quote, setQuote] = useState({
    unitPrice: 0,
    subtotal: 0,
    serviceFee: 0,
    total: 0,
  })

  const [selectedCategory, setSelectedCategory] = useState('全部')
  const [selectedProductId, setSelectedProductId] = useState('')
  const [customText, setCustomText] = useState('FUN IS MENTAL')
  const [themeColor, setThemeColor] = useState('#6d4aff')
  const [sizeOption, setSizeOption] = useState('中号')
  const [quantity, setQuantity] = useState(1)
  const [uploadedFileName, setUploadedFileName] = useState('')
  const [isLoadingProducts, setIsLoadingProducts] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')
  const [useLocalMode, setUseLocalMode] = useState(false)

  const selectedProduct = products.find((item) => item.id === selectedProductId)
  const localFilteredProducts = useMemo(() => {
    if (selectedCategory === '全部') return mockProducts
    return mockProducts.filter((item) => item.category === selectedCategory)
  }, [selectedCategory])

  const handleFileUpload = (event) => {
    const file = event.target.files?.[0]
    if (!file) return
    setUploadedFileName(file.name)
  }

  useEffect(() => {
    const fetchCategories = async () => {
      if (useLocalMode) {
        setCategories(mockCategories)
        return
      }
      try {
        const response = await fetch('/api/categories')
        if (!response.ok) throw new Error('分类接口不可用')
        const data = await response.json()
        setCategories(data.categories ?? ['全部'])
      } catch (_error) {
        setUseLocalMode(true)
        setCategories(mockCategories)
        setErrorMessage('当前为线上静态演示模式：已自动切换本地数据。')
      }
    }

    fetchCategories()
  }, [useLocalMode])

  useEffect(() => {
    const fetchProducts = async () => {
      setIsLoadingProducts(true)
      if (useLocalMode) {
        setProducts(localFilteredProducts)
        setSelectedProductId((currentId) => {
          if (localFilteredProducts.some((item) => item.id === currentId)) return currentId
          return localFilteredProducts[0]?.id ?? ''
        })
        setIsLoadingProducts(false)
        return
      }
      try {
        const query = selectedCategory === '全部' ? '' : `?category=${encodeURIComponent(selectedCategory)}`
        const response = await fetch(`/api/products${query}`)
        if (!response.ok) throw new Error('商品接口不可用')
        const data = await response.json()
        const fetched = data.products ?? []
        setProducts(fetched)
        setSelectedProductId((currentId) => {
          if (fetched.some((item) => item.id === currentId)) return currentId
          return fetched[0]?.id ?? ''
        })
      } catch (_error) {
        setUseLocalMode(true)
        setProducts(localFilteredProducts)
        setSelectedProductId((currentId) => {
          if (localFilteredProducts.some((item) => item.id === currentId)) return currentId
          return localFilteredProducts[0]?.id ?? ''
        })
        setErrorMessage('接口不可达，已切换为本地演示数据。')
      } finally {
        setIsLoadingProducts(false)
      }
    }

    fetchProducts()
  }, [selectedCategory, useLocalMode, localFilteredProducts])

  useEffect(() => {
    if (!selectedProductId) return

    if (useLocalMode) {
      const localProduct = localFilteredProducts.find((item) => item.id === selectedProductId)
      setQuote(computeQuote(localProduct, quantity, sizeOption))
      return
    }

    const fetchQuote = async () => {
      try {
        const response = await fetch('/api/quote', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            productId: selectedProductId,
            quantity,
            sizeOption,
          }),
        })
        if (!response.ok) throw new Error('报价接口不可用')
        const data = await response.json()
        setQuote({
          unitPrice: data.unitPrice ?? 0,
          subtotal: data.subtotal ?? 0,
          serviceFee: data.serviceFee ?? 0,
          total: data.total ?? 0,
        })
      } catch (_error) {
        setUseLocalMode(true)
        const localProduct = localFilteredProducts.find((item) => item.id === selectedProductId)
        setQuote(computeQuote(localProduct, quantity, sizeOption))
        setErrorMessage('报价接口不可用，已切换演示模式继续体验。')
      }
    }

    fetchQuote()
  }, [selectedProductId, quantity, sizeOption, useLocalMode, localFilteredProducts])

  const handleCheckout = async () => {
    if (!selectedProductId) return
    setIsSubmitting(true)
    if (useLocalMode) {
      const localProduct = localFilteredProducts.find((item) => item.id === selectedProductId)
      const localQuote = computeQuote(localProduct, quantity, sizeOption)
      window.alert(
        `下单成功（本地演示模式）\n订单号：FDM-${Date.now()}\n金额：¥${localQuote.total}\n预计发货：${localProduct?.leadTime ?? '3-7 天'}`,
      )
      setIsSubmitting(false)
      return
    }
    try {
      const response = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          productId: selectedProductId,
          quantity,
          sizeOption,
          customText,
          themeColor,
          uploadedFileName,
        }),
      })
      if (!response.ok) throw new Error('下单接口不可用')
      const data = await response.json()
      window.alert(`下单成功（模拟）\n订单号：${data.orderNo}\n金额：¥${data.total}\n预计发货：${data.eta}`)
    } catch (_error) {
      const localProduct = localFilteredProducts.find((item) => item.id === selectedProductId)
      const localQuote = computeQuote(localProduct, quantity, sizeOption)
      setUseLocalMode(true)
      window.alert(
        `下单成功（本地演示模式）\n订单号：FDM-${Date.now()}\n金额：¥${localQuote.total}\n预计发货：${localProduct?.leadTime ?? '3-7 天'}`,
      )
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <main className="page">
      <header className="hero">
        <p className="hero-badge">竞品能力复刻 Demo</p>
        {useLocalMode && <p className="mode-badge">当前模式：线上静态演示（本地数据）</p>}
        <h1>FUNDAMENTAL 定制品设计工作台</h1>
        <p className="hero-subtitle">
          目标：把“选品 + 定制 + 报价 + 下单”串成一个可点击、可演示的产品流程。
        </p>
      </header>

      <section className="panel">
        <h2>1) 选择品类与商品</h2>
        <div className="category-row">
          {categories.map((category) => (
            <button
              key={category}
              className={category === selectedCategory ? 'chip chip-active' : 'chip'}
              onClick={() => {
                setSelectedCategory(category)
              }}
            >
              {category}
            </button>
          ))}
        </div>
        {isLoadingProducts && <p className="status-text">正在加载商品...</p>}
        {!isLoadingProducts && products.length === 0 && (
          <p className="status-text">当前分类暂无商品。</p>
        )}
        <div className="product-grid">
          {products.map((product) => (
            <button
              key={product.id}
              className={
                product.id === selectedProductId ? 'product-card active-card' : 'product-card'
              }
              onClick={() => setSelectedProductId(product.id)}
            >
              <p className="discount-tag">{product.discount}</p>
              <h3>{product.name}</h3>
              <p className="meta">{product.material}</p>
              <p className="price">¥{product.price}</p>
              <p className="meta">{product.leadTime}</p>
            </button>
          ))}
        </div>
      </section>

      <section className="panel studio-layout">
        <div className="designer">
          <h2>2) 设计定制内容</h2>
          <label className="field">
            文字内容
            <input
              value={customText}
              onChange={(event) => setCustomText(event.target.value)}
              placeholder="输入你要印在商品上的文字"
            />
          </label>

          <div className="inline-fields">
            <label className="field">
              主题色
              <input
                type="color"
                value={themeColor}
                onChange={(event) => setThemeColor(event.target.value)}
              />
            </label>
            <label className="field">
              尺寸
              <select
                value={sizeOption}
                onChange={(event) => setSizeOption(event.target.value)}
              >
                <option>小号</option>
                <option>中号</option>
                <option>大号</option>
              </select>
            </label>
          </div>

          <label className="field">
            上传图片素材
            <input type="file" accept="image/*" onChange={handleFileUpload} />
          </label>

          {uploadedFileName && (
            <p className="upload-hint">已选素材：{uploadedFileName}</p>
          )}
        </div>

        <div className="preview">
          <h2>3) 实时预览</h2>
          <div className="preview-card" style={{ borderColor: themeColor }}>
            <div className="preview-surface" style={{ backgroundColor: `${themeColor}22` }}>
              <p className="preview-product">{selectedProduct?.name}</p>
              <p className="preview-text" style={{ color: themeColor }}>
                {customText || '请填写定制文字'}
              </p>
              <p className="preview-meta">尺寸：{sizeOption}</p>
              <p className="preview-meta">
                素材：{uploadedFileName ? '已上传' : '未上传'}
              </p>
              <p className="preview-meta">
                报价单价：¥{quote.unitPrice}
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="panel order">
        <h2>4) 报价与下单模拟</h2>
        <div className="order-content">
          <label className="field qty">
            购买数量
            <input
              type="number"
              min="1"
              value={quantity}
              onChange={(event) => setQuantity(Math.max(1, Number(event.target.value) || 1))}
            />
          </label>

          <div className="price-box">
            <p>商品单价：¥{quote.unitPrice}</p>
            <p>小计：¥{quote.subtotal}</p>
            <p>服务费：¥{quote.serviceFee}</p>
            <p className="total">总计：¥{quote.total}</p>
          </div>

          <button
            className="checkout-btn"
            onClick={handleCheckout}
            disabled={!selectedProductId || isSubmitting}
          >
            {isSubmitting ? '提交中...' : '立即下单（Demo）'}
          </button>
        </div>
        {errorMessage && <p className="error-text">{errorMessage}</p>}
      </section>
    </main>
  )
}

export default App
