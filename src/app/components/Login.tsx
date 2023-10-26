"use client"

import { signIn } from 'next-auth/react'
import Image from 'next/image'

export default function Login() {
    return (
        <div className="flex min-h-screen w-screen flex flex-col px-6 py-12 lg:px-8">
            
            <Image
            src="/images/smu-logo.jpg"
            alt="School Logo"
            width={250}
            height={250}
            className='mx-auto'
            />
            <button
            type="submit"
            onClick={() => signIn('cognito')}
            className='h-1/3 inline-flex items-center justify-center px-6 border border-transparent rounded-md shadow-sm text-base font-medium text-white bg-blue-500 hover:bg-blue-600'
            >
            Sign in     
            </button>
        

            <div className="mt-10 sm:mx-auto sm:w-full sm:max-w-sm">
            

                
            </div>
        </div>
        
  );
}