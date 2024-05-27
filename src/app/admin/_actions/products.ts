'use server'
import { z } from 'zod'
import fs from 'fs/promises'
import db from '@/db/db'
import { notFound, redirect } from 'next/navigation'

const fileSchema = z.instanceof(File, { message: 'Required' })
const imageSchema = fileSchema.refine(
  file => file.size === 0 || file.type.startsWith('image/')
)

const addSchema = z.object({
  name: z.string().min(1),
  description: z.string().min(1),
  priceInCents: z.coerce.number().int().min(1),
  file: fileSchema.refine(file => file.size > 0, 'Required'),
  image: imageSchema.refine(file => file.size > 0, 'Required'),
})

const editSchema = addSchema.extend({
  file: fileSchema.optional(),
  image: imageSchema.optional(),
})

export const addProduct = async (prevState: unknown, formData: FormData) => {
  //   console.log(formData)
  const result = addSchema.safeParse(Object.fromEntries(formData.entries()))

  // Check if all fields are valid
  if (!result.success) {
    return result.error.formErrors.fieldErrors
  }

  const data = result.data

  // format file input
  await fs.mkdir('products', { recursive: true })
  const filePath = `products/${crypto.randomUUID()}-${data.file.name}`
  await fs.writeFile(filePath, Buffer.from(await data.file.arrayBuffer()))

  // format image input
  await fs.mkdir('public/products', { recursive: true })
  const imagePath = `/products/${crypto.randomUUID()}-${data.image.name}`
  await fs.writeFile(
    `public${imagePath}`,
    Buffer.from(await data.image.arrayBuffer())
  )

  await db.product.create({
    data: {
      isAvailableForPurchase: false,
      name: data.name,
      description: data.description,
      priceInCents: data.priceInCents,
      imagePath,
      filePath,
    },
  })

  redirect('/admin/products')
}

export const UpdateProduct = async (
  id: string,
  prevState: unknown,
  formData: FormData
) => {
  //   console.log(formData)
  const result = editSchema.safeParse(Object.fromEntries(formData.entries()))

  // Check if all fields are valid
  if (!result.success) {
    return result.error.formErrors.fieldErrors
  }

  const data = result.data

  //   Find product by id
  const product = await db.product.findUnique({
    where: { id },
  })

  if (product == null) return notFound()

  // Update Filepath if new input data is provided
  let filePath = product.filePath
  if (data.file != null && data.file.size > 0) {
    // remove existing file
    await fs.unlink(product.filePath)

    // format new file input
    filePath = `products/${crypto.randomUUID()}-${data.file.name}`
    await fs.writeFile(filePath, Buffer.from(await data.file.arrayBuffer()))
  }

  //   Upate Imagepath if new input data is provided
  let imagePath = product.imagePath
  if (data.image != null && data.image.size > 0) {
    // remove existing image
    await fs.unlink(`public${product.imagePath}`)

    // format image input
    imagePath = `/products/${crypto.randomUUID()}-${data.image.name}`
    await fs.writeFile(
      `public${imagePath}`,
      Buffer.from(await data.image.arrayBuffer())
    )
  }

  await db.product.update({
    where: { id },
    data: {
      name: data.name,
      description: data.description,
      priceInCents: data.priceInCents,
      imagePath,
      filePath,
    },
  })

  redirect('/admin/products')
}

export const toggleProductAvailability = async (
  id: string,
  isAvailableForPurchase: boolean
) => {
  await db.product.update({
    where: { id },
    data: { isAvailableForPurchase },
  })
}

export const deleteProduct = async (id: string) => {
  const product = await db.product.delete({
    where: { id },
  })

  if (product == null) return notFound()

  // delete files
  await fs.unlink(product.filePath)
  await fs.unlink(`public${product.imagePath}`)
}
