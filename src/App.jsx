import { useEffect, useState } from 'react'
import './App.css'

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

  const selectedProduct = products.find((item) => item.id === selectedProductId)

  const handleFileUpload = (event) => {
    const file = event.target.files?.[0]
    if (!file) return
    setUploadedFileName(file.name)
  }

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await fetch('/api/categories')
        if (!response.ok) throw new Error('分类接口不可用')
        const data = await response.json()
        setCategories(data.categories ?? ['全部'])
      } catch (_error) {
        setErrorMessage('分类接口暂时不可用，已使用默认分类。')
      }
    }

    fetchCategories()
  }, [])

  useEffect(() => {
    const fetchProducts = async () => {
      setIsLoadingProducts(true)
      setErrorMessage('')
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
        setErrorMessage('商品接口请求失败，请稍后重试。')
      } finally {
        setIsLoadingProducts(false)
      }
    }

    fetchProducts()
  }, [selectedCategory])

  useEffect(() => {
    if (!selectedProductId) return

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
        setErrorMessage('报价接口请求失败，请检查后端服务。')
      }
    }

    fetchQuote()
  }, [selectedProductId, quantity, sizeOption])

  const handleCheckout = async () => {
    if (!selectedProductId) return
    setIsSubmitting(true)
    setErrorMessage('')
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
      setErrorMessage('下单失败，请稍后重试。')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <main className="page">
      <header className="hero">
        <p className="hero-badge">竞品能力复刻 Demo</p>
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
