export const products = [
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

export const categories = ['全部', ...new Set(products.map((item) => item.category))]
