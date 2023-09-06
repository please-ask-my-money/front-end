'use client'

import React, { useEffect, useRef, useState } from 'react'
import type { NextPage } from 'next'
import { useForm } from 'react-hook-form'
import { toast } from 'react-hot-toast'
import { CompatClient, Stomp } from '@stomp/stompjs'
import SockJS from 'sockjs-client'
import { useParams, useRouter, useSearchParams } from 'next/navigation'
import { useMutation, useQuery } from '@tanstack/react-query'
import { ApiError } from 'next/dist/server/api-utils'

import Layout from '@/app/components/template/main/layout/Layout'
import Message from '@/app/components/atom/Message'
import InputField from '@/app/components/atom/InputField'
import { getCookie } from '@/app/libs/client/utils/cookie'
import { AUTH_TOKEN } from '@/app/libs/client/constants/store/common'
import { CHAT } from '@/app/libs/client/reactQuery/queryKey/chat'
import getQueryClient from '@/app/libs/client/reactQuery/getQueryClient'

import { groupChatUserInfo } from '@/app/apis/domain/chat/chanel'
import { convertedName, deleteChat } from '@/app/apis/domain/chat/chat'

interface MessageForm {
  message: string
}

const dummyData = [
  { message: '미친놈을 보면 짓는 개', reversed: false },
  { message: '테스트테스트 테스트', reversed: true },
  { message: '왈왈', reversed: false },
]

const ChatDetail: NextPage = () => {
  const params = useParams()
  const searchParams = useSearchParams()
  const router = useRouter()
  const query = getQueryClient()
  const client = useRef<CompatClient>()
  const scrollRef = useRef<HTMLDivElement>(null)
  const accessToken = getCookie(AUTH_TOKEN.접근)
  const [chatMessageList, setChatMessageList] = useState<MessageForm[]>([])

  const title = searchParams.get('title')

  const { register, handleSubmit, reset } = useForm<MessageForm>({ mode: 'onSubmit' })

  // 채팅 참여자 정보
  const { data: { data: userInfo } = {} } = useQuery([CHAT.참여자조회], () => groupChatUserInfo(params.id), {
    enabled: !!params,
  })

  // 채팅방 제목 변경
  const { mutate: mutateName } = useMutation(convertedName, {
    onSuccess: () => {
      query.invalidateQueries([CHAT.조회])
    },
    onError: (error: ApiError) => {
      toast.error(error.message)
    },
  })

  // 채팅방 종료
  const { mutate: mutateDelete } = useMutation(deleteChat, {
    onSuccess: () => {
      query.invalidateQueries([CHAT.조회])
      query.invalidateQueries([CHAT.참여자조회])
      toast.success('채팅방이 종료되었습니다.')
      router.push('/chats')
    },
    onError: (error: ApiError) => {
      toast.error(error.message)
    },
  })

  // 양방향 연결
  const onConnect = (roomId: string) => {
    client.current = Stomp.over(() => {
      const sockjs = new SockJS(`${process.env.NEXT_PUBLIC_API_URL}/ws-endpoint`)
      return sockjs
    })

    client.current!.connect(
      {
        Authorization: `Bearer ${accessToken}`,
      },
      () => {
        client.current!.subscribe(
          `/topic/chat/${roomId}`,
          message => {
            console.log('message:', message)
            const newMessage = JSON.parse(message.body)
            setChatMessageList(prevMessages => [...prevMessages, newMessage])
          },
          { Authorization: `Bearer ${accessToken}` }
        )
      }
    )
  }

  // 전송
  const onSend = (data: MessageForm) => {
    if (!data) return

    client.current?.send(`/ws/chat/${params.id}`, {}, JSON.stringify(data))
    reset()
  }

  useEffect(() => {
    onConnect(params.id)
  }, [])

  useEffect(() => {
    scrollRef.current?.scrollIntoView()
  }, [chatMessageList])

  return (
    <Layout canGoBack title={title!}>
      <div className='mt-8 space-y-4 py-10 pb-16'>
        {dummyData.map(data => {
          return <Message key={data.message} message={data.message} reversed={data.reversed} />
        })}
        <div ref={scrollRef} />
        <form onSubmit={handleSubmit(onSend)} className='fixed inset-x-4 bottom-20 bg-white py-2'>
          <div className='relative mx-auto flex w-full  max-w-md items-center'>
            <InputField
              type={'text'}
              register={register('message', {
                required: true,
              })}
              className='w-full !rounded-full border-gray-300 pr-12 shadow-sm focus:border-[#33CC99] focus:outline-none focus:ring-[#33CC99]'
            />
            <div className='absolute inset-y-0 right-0 flex py-1.5 pr-1.5'>
              <button className='flex items-center rounded-full bg-[#33CC99] px-3 text-sm text-white hover:bg-[#32D7A0] focus:ring-2 focus:ring-[#33CC99] focus:ring-offset-2'>
                &rarr;
              </button>
            </div>
          </div>
        </form>
      </div>
    </Layout>
  )
}

export default ChatDetail
