"use client"

import { signIn } from 'next-auth/react'
import Image from 'next/image'

export default function Login() {
    return (
        <div className="flex min-h-full w-1/2 flex-1 flex-col justify-center px-6 py-12 lg:px-8">
            <div className="sm:mx-auto sm:w-full sm:max-w-sm">
                <Image
                src="/images/smu-logo.jpg"
                alt="School Logo"
                width={250}
                height={250}
                className='mx-auto'
                />
                <h2 className="mt-10 text-center text-2xl font-bold leading-9 tracking-tight text-gray-900">
                Sign in to your account
                </h2>
            </div>

            <div className="mt-10 sm:mx-auto sm:w-full sm:max-w-sm">
                <form className="space-y-6">
                <div>
                    <label htmlFor="email" className="block text-sm font-medium leading-6 text-gray-900">
                    Email address
                    </label>
                    <div className="mt-2">
                    <input
                        id="email"
                        name="email"
                        type="email"
                        autoComplete="email"
                        // required
                        className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                    />
                    </div>
                </div>

                <div>
                    <div className="flex items-center justify-between">
                    <label htmlFor="password" className="block text-sm font-medium leading-6 text-gray-900">
                        Password
                    </label>
                    <div className="text-sm">
                        <a href="#" className="font-semibold text-indigo-600 hover:text-indigo-500">
                        Forgot password?
                        </a>
                    </div>
                    </div>
                    <div className="mt-2">
                    <input
                        id="password"
                        name="password"
                        type="password"
                        autoComplete="current-password"
                        // required
                        className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                    />
                    </div>
                </div>

                <div>
                    <button
                    type="submit"
                    className="flex w-full justify-center rounded-md bg-indigo-600 px-3 py-1.5 text-sm font-semibold leading-6 text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
                    >
                    Sign in
                    </button>
                </div>
                </form>
                <button
                    type="submit"
                    onClick={() => signIn('google')}
                    className="mt-4 w-full justify-center px-3 py-1.5 border flex gap-2 border-slate-200 rounded-lg text-slate-700 text-sm hover:border-slate-400 hover:text-slate-900 hover:shadow transition duration-150">
                    <img className="w-5 h-5" src="https://www.svgrepo.com/show/475656/google-color.svg" loading="lazy" alt="google logo"/>
                    <span>Login with Google</span>
                </button>
                
            </div>
        </div>
        
  );
}