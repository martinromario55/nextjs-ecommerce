import db from '@/db/db'
import { notFound } from 'next/navigation'
import Stripe from 'stripe'
import CheckoutForm from '../_components/CheckoutForm'

const stripe = new Stripe(process.env.STRIPE_SECRETE_KEY as string)

const PurchasePage = async ({ params: { id } }: { params: { id: string } }) => {
  const product = await db.product.findUnique({
    where: { id },
  })

  if (product == null) return notFound()

  // Stripe create transaction
  const paymentIntent = await stripe.paymentIntents.create({
    amount: product.priceInCents,
    currency: 'usd',
    metadata: { productId: product.id },
  })

  //   Check if payment process is valid
  if (paymentIntent.client_secret == null) {
    throw Error('Stripe failed to create payment intent')
  }

  return (
    <CheckoutForm
      product={product}
      clientSecret={paymentIntent.client_secret}
    />
  )
}

export default PurchasePage
