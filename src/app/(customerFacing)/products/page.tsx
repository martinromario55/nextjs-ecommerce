import ProductCard, { ProductCardSkeleton } from '@/components/ProductCard'
import db from '@/db/db'
import React, { Suspense } from 'react'

const getProducts = () => {
  return db.product.findMany({
    where: { isAvailableForPurchase: true },
    orderBy: { name: 'asc' },
  })
}

const ProductsPage = () => {
  return (
    <div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <Suspense
          fallback={
            <>
              <ProductCardSkeleton />
              <ProductCardSkeleton />
              <ProductCardSkeleton />
              <ProductCardSkeleton />
              <ProductCardSkeleton />
              <ProductCardSkeleton />
            </>
          }
        >
          <ProductSuspense />
        </Suspense>
      </div>
    </div>
  )
}

export default ProductsPage

const ProductSuspense = async () => {
  const products = await getProducts()

  return products.map(product => <ProductCard key={product.id} {...product} />)
}
