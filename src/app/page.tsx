"use client"

import Login from './components/Login'
import React, { useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation';

export default function Home() {
  const { data: session } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (session) {
      router.push('/dashboard');
    }
  }, [session, router]);

  return (
    <main className='flex'>
      {
        session ?  <div>Redirecting...</div> : <Login />
      }
    </main>
  );
}
