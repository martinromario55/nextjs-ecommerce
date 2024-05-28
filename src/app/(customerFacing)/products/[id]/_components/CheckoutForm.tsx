'use client'
import { userOrderExists } from '@/app/_actions/orders'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { formatCurrency } from '@/lib/formatters'
import {
  Elements,
  LinkAuthenticationElement,
  PaymentElement,
  useElements,
  useStripe,
} from '@stripe/react-stripe-js'
import { loadStripe } from '@stripe/stripe-js'
import Image from 'next/image'
import { FormEvent, useState } from 'react'

type CheckoutFormProps = {
  product: {
    id: string
    name: string
    description: string
    priceInCents: number
    imagePath: string
  }
  clientSecret: string
}

const stripePromise = loadStripe(
  process.env.NEXT_PUBLIC_STRIPE_PUBLIC_KEY as string
)

const CheckoutForm = ({ product, clientSecret }: CheckoutFormProps) => {
  return (
    <div className="max-w-5xl w-full mx-auto space-y-8">
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
        </div>
      </div>

      <Elements options={{ clientSecret }} stripe={stripePromise}>
        <StripeForm
          priceInCents={product.priceInCents}
          productId={product.id}
        />
      </Elements>
    </div>
  )
}

export default CheckoutForm

const StripeForm = ({
  priceInCents,
  productId,
}: {
  priceInCents: number
  productId: string
}) => {
  const stripe = useStripe()
  const elements = useElements()
  const [isLoading, setIsLoading] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string>()
  const [email, setEmail] = useState<string>()

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()

    if (!stripe || elements == null || email == null) return

    setIsLoading(true)

    // Check for existing order
    const orderExists = await userOrderExists
    (email, productId)

    if (orderExists) {
      setErrorMessage(
        'You have already purchased this product! Try downloading it from the My Orders page'
      )
      setIsLoading(false)
      return
    }

    // Confirm payment
    stripe
      .confirmPayment({
        elements,
        confirmParams: {
          return_url: `${process.env.NEXT_PUBLIC_SERVER_URL}/stripe/purchase-success`,
        },
      })
      .then(({ error }) => {
        if (error.type === 'card_error' || error.type === 'validation_error') {
          setErrorMessage(error.message)
        } else {
          setErrorMessage('An unkown error occurred!')
        }
      })
      .finally(() => setIsLoading(false))
  }

  return (
    <form onSubmit={handleSubmit}>
      <Card>
        <CardHeader>
          <CardTitle>Checkout</CardTitle>
          {errorMessage && (
            <CardDescription className="text-destructive">
              {errorMessage}
            </CardDescription>
          )}
        </CardHeader>
        <CardContent>
          <PaymentElement />
          <div className="mt-4">
            <LinkAuthenticationElement
              onChange={e => setEmail(e.value.email)}
            />
          </div>
        </CardContent>
        <CardFooter>
          <Button
            className="w-full"
            size={'lg'}
            disabled={!stripe || elements == null || isLoading}
          >
            {isLoading
              ? 'Purchasing...'
              : `Purchase - ${formatCurrency(priceInCents / 100)}`}
          </Button>
        </CardFooter>
      </Card>
    </form>
  )
}
