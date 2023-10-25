"use client"

import Login from './components/Login'
import React from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation';

export default function Protected() {
  const { data: session } = useSession();
  const router = useRouter();

  if (session) {
    router.push('/dashboard'); 
  }

  return (
    <main className='flex'>
      {
        session ?  <div>Redirecting...</div> : <Login />
      }
    </main>
  );
}
