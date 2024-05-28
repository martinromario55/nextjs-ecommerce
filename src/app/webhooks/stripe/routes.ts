import db from '@/db/db'
import { NextRequest, NextResponse } from 'next/server'
import { Resend } from 'resend'
import Stripe from 'stripe'

const stripe = new Stripe(process.env.STRIPE_SECRETE_KEY as string)

const resend = new Resend(process.env.RESEND_API_KEY)

export async function POST(req: NextRequest) {
  const event = await stripe.webhooks.constructEvent(
    await req.text(),
    req.headers.get('stripe-signature') as string,
    process.env.STRIPE_WEBHOOK_SECRET as string
  )

  if (event.type === 'charge.succeeded') {
    const charge = event.data.object
    const productId = charge.metadata.productId
    const email = charge.billing_details.email
    const pricePaidInCents = charge.amount

    // Find product in the database
    const product = await db.product.findUnique({ where: { id: productId } })

    if (product == null || email == null) {
      return new NextResponse('Bad Request', { status: 400 })
    }
    console.log('We get here')
    // Create a new user order
    const userFields = {
      email,
      orders: { create: { productId, pricePaidInCents } },
    }

    const {
      orders: [order],
    } = await db.user.upsert({
      where: { email },
      create: userFields,
      update: userFields,
      select: { orders: { orderBy: { createdAt: 'desc' }, take: 1 } },
    })

    // Send receipt via email
    const downloadVerification = await db.downloadVerification.create({
      data: {
        productId,
        expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
      },
    })

    await resend.emails.send({
      from: `Support <${process.env.SENDER_EMAIL}>`,
      to: email,
      subject: 'Order Confirmation',
      html: '<h1>Payment was successful</h1>',
    })
  }

  return new NextResponse('hi')
}
