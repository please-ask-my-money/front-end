'use client'

import React, { useCallback, useEffect } from 'react'
import { useSearchParams } from 'next/navigation'

import BackHeader from '@/app/components/template/main/header/BackHeader'
import { CRUD } from '@/app/libs/client/constants/code'

const WarehouseEdit = () => {
  const searchParam = useSearchParams()
  const editState = searchParam.get('CRUD')
  // const getEditStatus = useCallback(() => {
  //   const editState = searchParam.get('CRUD')
  //   const seqState = searchParam.get('seq')
  //   const edit = (editState === CRUD.수정 && seqState !== '') || false
  //   return { edit }
  // }, [])
  //
  // const { edit } = getEditStatus()
  //
  // useEffect(() => {
  //   getEditStatus()
  // }, [])

  useEffect(() => {
    const getCRUDValue = async () => {
      const editState = searchParam.get('CRUD')
      const seqState = searchParam.get('seq')
      const edit = (editState === CRUD.수정 && seqState !== '') || false

      if (edit) {
        // 수정 페이지로 처리하는 로직
        console.log('This is the edit page.')
      } else {
        // 생성 페이지로 처리하는 로직
        console.log('This is the create page.')
      }
    }

    getCRUDValue()
  }, [searchParam])

  // console.log('editState:', editState)

  // useEffect(() => {
  //   if (edit) {
  //   }
  // }, [editState])

  return (
    <>
      <BackHeader canGoBack title={`창고 ${editState === CRUD.수정 ? '편집' : '생성'}`} />
      <div className={'mt-8'}>{editState === CRUD.수정 ? '편집' : '생성'}</div>
    </>
  )
}

export default WarehouseEdit
