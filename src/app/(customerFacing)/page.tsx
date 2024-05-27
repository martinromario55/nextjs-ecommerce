import ProductCard, { ProductCardSkeleton } from '@/components/ProductCard'
import { Button } from '@/components/ui/button'
import db from '@/db/db'
import { Product } from '@prisma/client'
import { ArrowRight } from 'lucide-react'
import Link from 'next/link'
import React, { Suspense } from 'react'

const getMostPopularProducts = async () => {
  //   await slowDownFunction(2000)
  return db.product.findMany({
    where: { isAvailableForPurchase: true },
    orderBy: { orders: { _count: 'desc' } },
    take: 6,
  })
}

const getNewestProducts = async () => {
  //   await slowDownFunction(2000)
  return db.product.findMany({
    where: { isAvailableForPurchase: true },
    orderBy: { createdAt: 'desc' },
    take: 6,
  })
}

// slowDownFunction
// const slowDownFunction = (duration: number) => {
//   return new Promise(resolve => setTimeout(resolve, duration))
// }

const HomePage = () => {
  return (
    <main className="space-y-12">
      <ProductGridSection
        productsFetcher={getMostPopularProducts}
        title="Most Popular"
      />
      <ProductGridSection productsFetcher={getNewestProducts} title="Newest" />
    </main>
  )
}

export default HomePage

type ProductGridSectionProps = {
  productsFetcher: () => Promise<Product[]>
  title: string
}

const ProductGridSection = ({
  productsFetcher,
  title,
}: ProductGridSectionProps) => {
  return (
    <div className="space-y-4">
      <div className="flex gap-4">
        <h2 className="text-3xl font-bold">{title}</h2>

        <Button variant={'outline'} asChild>
          <Link href={'/products'} className="space-x-2">
            <span>View All</span>
            <ArrowRight className="size-4" />
          </Link>
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <Suspense
          fallback={
            <>
              <ProductCardSkeleton />
              <ProductCardSkeleton />
              <ProductCardSkeleton />
            </>
          }
        >
          <ProductSuspense productsFetcher={productsFetcher} />
        </Suspense>
      </div>
    </div>
  )
}

const ProductSuspense = async ({
  productsFetcher,
}: {
  productsFetcher: () => Promise<Product[]>
}) => {
  return (await productsFetcher()).map(product => (
    <ProductCard key={product.id} {...product} />
  ))
}
