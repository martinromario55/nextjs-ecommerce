import {
  Body,
  Container,
  Head,
  Heading,
  Hr,
  Html,
  Preview,
  Tailwind,
} from '@react-email/components'
import React from 'react'
import { OrderInformation } from './components/OrderInformation'

type OrderHistoryEmailProps = {
  orders: {
    id: string
    pricePaidInCents: number
    createdAt: Date
    downloadVerificationId: string
    product: {
      name: string
      imagePath: string
      description: string
    }
  }[]
}

OrderHistoryEmail.PreviewProps = {
  orders: [
    {
      id: crypto.randomUUID(),
      createdAt: new Date(),
      pricePaidInCents: 10000,
      downloadVerificationId: crypto.randomUUID(),
      product: {
        name: 'Product name',
        description: 'Some description',
        imagePath: '/products/624b3fe9-e57d-4469-80a8-2f7c27a4f6e7-3.jpg',
      },
    },
    {
      id: crypto.randomUUID(),
      createdAt: new Date(),
      pricePaidInCents: 2000,
      downloadVerificationId: crypto.randomUUID(),
      product: {
        name: 'Product name 2',
        description: 'Some other desc',
        imagePath: '/products/1ce8130e-cf01-4fda-b136-846d62277c5c-2.jpg',
      },
    },
  ],
} satisfies OrderHistoryEmailProps

export default function OrderHistoryEmail({ orders }: OrderHistoryEmailProps) {
  return (
    <Html>
      <Preview>Order History & Downloads</Preview>
      <Tailwind>
        <Head />
        <Body className="font-sans bg-white">
          <Container className="max-w-xl">
            <Heading>Order History</Heading>
            {orders.map((order, index) => (
              <React.Fragment key={order.id}>
                <OrderInformation
                  order={order}
                  product={order.product}
                  downloadVerificationId={order.downloadVerificationId}
                />
                {index < orders.length - 1 && <Hr />}
              </React.Fragment>
            ))}
          </Container>
        </Body>
      </Tailwind>
    </Html>
  )
}
