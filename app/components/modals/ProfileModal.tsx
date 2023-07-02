'use client'

import { useEffect, useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import { FieldValues, SubmitHandler, useForm } from 'react-hook-form'
import { toast } from 'react-hot-toast'
import { User } from '@prisma/client'
import { zodResolver } from '@hookform/resolvers/zod'

import useProfileModal from '@/app/hooks/useProfileModal'
import Modal from '@/app/components/modals/Modal'
import Input from '@/app/components/input/Input'
import ImageUpload from '@/app/components/input/ImageUpload'
import axios from 'axios'
import * as z from 'zod'

// ステップの定義
enum STEPS {
  CONTENT = 0,
  IMAGE = 1,
}

// 入力データの検証ルールを定義
const schema = z.object({
  name: z.string().min(2, { message: '2文字以上入力する必要があります。' }),
  image: z.string().optional(),
})

type ProfileModalProps = {
  currentUser: User | null
}

// プロフィールモーダル
const ProfileModal: React.FC<ProfileModalProps> = ({ currentUser }) => {
  const router = useRouter()
  const profileModal = useProfileModal()
  const [loading, setLoading] = useState(false)
  const [step, setStep] = useState(STEPS.CONTENT)

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
    reset,
  } = useForm<FieldValues>({
    // 入力値の検証
    resolver: zodResolver(schema),
  })

  // 画像の監視
  const image = watch('image')

  // カスタム値の設定
  const setCustomValue = (id: string, value: string) => {
    setValue(id, value, {
      shouldDirty: true,
      shouldTouch: true,
      shouldValidate: true,
    })
  }

  // 初期値設定
  useEffect(() => {
    if (currentUser) {
      reset({
        name: currentUser.name,
        image: currentUser.image || '',
      })
    }
  }, [currentUser, reset])

  // 戻る
  const onBack = () => {
    setStep((value) => value - 1)
  }

  // 次へ
  const onNext = () => {
    setStep((value) => value + 1)
  }

  // メインボタンのラベル
  const primaryLabel = useMemo(() => {
    if (step === STEPS.IMAGE) {
      return '編集'
    }

    return '次へ'
  }, [step])

  // サブボタンのラベル
  const secondaryLabel = useMemo(() => {
    if (step === STEPS.CONTENT) {
      return undefined
    }

    return '戻る'
  }, [step])

  // 送信
  const onSubmit: SubmitHandler<FieldValues> = async (data) => {
    // 最後のステップ以外は次へ
    if (step !== STEPS.IMAGE) {
      return onNext()
    }

    setLoading(true)

    try {
      // プロフィール編集
      const res = await axios.patch('/api/profile', data)

      if (res.status === 200) {
        toast.success('プロフィールを変更しました!')
        setStep(STEPS.CONTENT)
        profileModal.onClose()
        router.refresh()
      }
    } catch (error) {
      toast.error('エラーが発生しました。' + error)
      return
    } finally {
      setLoading(false)
    }
  }

  // モーダルの内容
  const getBodyContent = (): React.ReactElement => {
    if (step === STEPS.IMAGE) {
      return (
        <div>
          <ImageUpload onChange={(value) => setCustomValue('image', value)} value={image} />
        </div>
      )
    }

    return (
      <div>
        <Input
          id="name"
          label="名前"
          type="text"
          disabled={loading}
          register={register}
          errors={errors}
          required
        />
      </div>
    )
  }

  return (
    <Modal
      disabled={loading}
      isOpen={profileModal.isOpen}
      title="プロフィール"
      primaryLabel={primaryLabel}
      onSubmit={handleSubmit(onSubmit)}
      secondaryLabel={secondaryLabel}
      secondaryAction={step === STEPS.CONTENT ? undefined : onBack}
      onClose={() => {
        profileModal.onClose()
        setStep(STEPS.CONTENT)
      }}
      body={getBodyContent()}
    />
  )
}

export default ProfileModal
