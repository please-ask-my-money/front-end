import React, { ReactNode } from 'react'
import type { UseFormRegisterReturn } from 'react-hook-form'
import { cls } from '@/app/libs/client/utils/util'

interface InputProps {
  label?: string
  id?: string
  kind?: 'text'
  type: string
  register?: UseFormRegisterReturn
  required?: boolean
  placeholder?: string
  autoComplete?: string
  icon?: ReactNode
  onKeyDown?: React.KeyboardEventHandler<HTMLInputElement>
  maxLength?: number
  disabled?: boolean
  className?: any
}

export const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
  return ['e', 'E', '+', '-'].includes(event.key) && event.preventDefault()
}

export default function InputField({
  label,
  id,
  kind = 'text',
  register,
  type,
  placeholder,
  required,
  autoComplete = 'off',
  icon,
  onKeyDown,
  maxLength,
  disabled,
  className,
}: InputProps) {
  return (
    <>
      <label className='mb-1 block text-xs font-medium leading-none text-gray-700' htmlFor={id}>
        {label}
      </label>
      {kind === 'text' ? (
        <div className='relative flex flex-[3_3_0%] items-center rounded-md'>
          <input
            type='password'
            style={{
              display: 'none',
            }}
            autoComplete='off'
          />
          <input
            id={id}
            required={required}
            {...register}
            type={type}
            placeholder={placeholder}
            autoComplete={autoComplete}
            onKeyDown={type === 'number' ? handleKeyDown : onKeyDown}
            maxLength={maxLength}
            disabled={disabled}
            className={cls(
              `w-full appearance-none rounded-md border border-gray-300 px-3 py-2 text-[13px] placeholder-gray-400 shadow-sm placeholder:text-[12px] placeholder:font-light focus:border-[#33CC99] focus:outline-none focus:ring-emerald-50 ${className}`,
              icon ? 'indent-5' : ''
            )}
          />
          {icon}
        </div>
      ) : null}
    </>
  )
}
