import { Button } from '@/components/ui/button'
import db from '@/db/db'
import { formatCurrency } from '@/lib/formatters'
import Image from 'next/image'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import React from 'react'
import Stripe from 'stripe'

const stripe = new Stripe(process.env.STRIPE_SECRETE_KEY as string)

const SuccessPage = async ({
  searchParams,
}: {
  searchParams: { payment_intent: string }
}) => {
  // Get transaction details from params
  const paymentIntent = await stripe.paymentIntents.retrieve(
    searchParams.payment_intent
  )

  if (paymentIntent.metadata.productId == null) return notFound()

  // Find product using transaction details productId
  const product = await db.product.findUnique({
    where: { id: paymentIntent.metadata.productId },
  })

  if (product == null) return notFound()

  // check if purchase succeeded
  const isSuccess = paymentIntent.status === 'succeeded'
  //   const isSuccess = false

  return (
    <div className="max-w-5xl w-full mx-auto space-y-8">
      <h1
        className={
          isSuccess
            ? 'text-4xl font-bold text-emerald-500'
            : 'text-4xl font-bold text-red-500'
        }
      >
        {isSuccess ? 'Purchase Successful!' : 'Error'}
      </h1>
      <div className="flex gap-4 items-center">
        <div className="aspect-video flex-shrink-0 w-1/3 relative">
          <Image
            src={product.imagePath}
            fill
            alt={product.name}
            className="object-cover"
          />
        </div>
        <div className="">
          <div className="text-lg">
            {formatCurrency(product.priceInCents / 100)}
          </div>
          <h2 className="text-wxl font-bold">{product.name}</h2>
          <div className="line-clamp-3 text-muted-foreground">
            {product.description}
          </div>
          <Button className="mt-4" size={'lg'} asChild>
            {isSuccess ? (
              <a
                href={`/products/download/${await createDownloadVerification(
                  product.id
                )}`}
              >
                Download
              </a>
            ) : (
              <Link href={`/products/${product.id}/purchase`}>Try Again!</Link>
            )}
          </Button>
        </div>
      </div>
    </div>
  )
}

export default SuccessPage

const createDownloadVerification = async (productId: string) => {
  // return verification that expires in 24 hours
  return (
    await db.downloadVerification.create({
      data: {
        productId,
        expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
      },
    })
  ).id
}
