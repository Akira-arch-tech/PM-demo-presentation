import express from 'express'
import cors from 'cors'
import { categories, products } from './data/products.js'

const app = express()
const port = 8787
const baseServiceFee = 8
const sizeFeeMap = {
  小号: 0,
  中号: 4,
  大号: 8,
}

app.use(cors())
app.use(express.json())

app.get('/api/health', (_req, res) => {
  res.json({ ok: true, service: 'fundamental-api' })
})

app.get('/api/categories', (_req, res) => {
  res.json({ categories })
})

app.get('/api/products', (req, res) => {
  const category = req.query.category
  if (!category || category === '全部') {
    res.json({ products })
    return
  }

  const filtered = products.filter((item) => item.category === category)
  res.json({ products: filtered })
})

app.post('/api/quote', (req, res) => {
  const { productId, quantity = 1, sizeOption = '中号' } = req.body ?? {}
  const product = products.find((item) => item.id === productId)

  if (!product) {
    res.status(404).json({ message: '商品不存在' })
    return
  }

  const safeQty = Math.max(1, Number(quantity) || 1)
  const sizeFee = sizeFeeMap[sizeOption] ?? sizeFeeMap['中号']
  const unitPrice = product.price + sizeFee
  const subtotal = unitPrice * safeQty
  const total = subtotal + baseServiceFee

  res.json({
    unitPrice,
    quantity: safeQty,
    subtotal,
    serviceFee: baseServiceFee,
    total,
  })
})

app.post('/api/orders', (req, res) => {
  const { productId, quantity = 1, sizeOption = '中号', customText = '' } = req.body ?? {}
  const product = products.find((item) => item.id === productId)

  if (!product) {
    res.status(404).json({ message: '商品不存在，无法创建订单' })
    return
  }

  const safeQty = Math.max(1, Number(quantity) || 1)
  const sizeFee = sizeFeeMap[sizeOption] ?? sizeFeeMap['中号']
  const unitPrice = product.price + sizeFee
  const subtotal = unitPrice * safeQty
  const total = subtotal + baseServiceFee

  const orderNo = `FDM-${Date.now()}`
  res.status(201).json({
    message: '订单已创建（模拟）',
    orderNo,
    total,
    eta: product.leadTime,
    snapshot: {
      productName: product.name,
      quantity: safeQty,
      sizeOption,
      customText,
    },
  })
})

app.listen(port, () => {
  console.log(`FUNDAMENTAL API listening on http://localhost:${port}`)
})
