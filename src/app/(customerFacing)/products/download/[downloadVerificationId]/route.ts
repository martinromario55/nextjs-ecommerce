import fs from 'fs/promises'
import db from '@/db/db'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(
  req: NextRequest,
  {
    params: { downloadVerificationId },
  }: { params: { downloadVerificationId: string } }
) {
  const data = await db.downloadVerification.findUnique({
    where: { id: downloadVerificationId, expiresAt: { gt: new Date() } },
    select: { product: { select: { filePath: true, name: true } } },
  })

  //   Check if download time has expired
  if (data == null) {
    return NextResponse.redirect(new URL('/products/download/expired', req.url))
  }

  //   download product
  const { size } = await fs.stat(data.product.filePath)
  const file = await fs.readFile(data.product.filePath)
  const extension = data.product.filePath.split('.').pop()

  return new NextResponse(file, {
    headers: {
      'Content-Length': size.toString(),
      'Content-Disposition': `attachment; filename="${data.product.name}.${extension}"`,
    },
  })

  // return new NextResponse('Hi')
}
