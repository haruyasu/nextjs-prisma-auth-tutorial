import { NextResponse } from 'next/server'
import getCurrentUser from '@/app/actions/getCurrentUser'
import prisma from '@/app/lib/prisma'

// プロフィール編集
export async function PATCH(request: Request) {
  try {
    // リクエストボディの取得
    const body = await request.json()
    const { name, image } = body

    // ログインユーザーの取得
    const currentUser = await getCurrentUser()

    // ログインしていない場合はエラー
    if (!currentUser?.id || !currentUser?.email) {
      return new NextResponse('認証していません', { status: 401 })
    }

    // ユーザーの編集
    const response = await prisma.user.update({
      where: {
        id: currentUser.id,
      },
      data: {
        name,
        image,
      },
    })

    return NextResponse.json(response)
  } catch (error) {
    console.log(error)
    return new NextResponse('Error', { status: 500 })
  }
}
