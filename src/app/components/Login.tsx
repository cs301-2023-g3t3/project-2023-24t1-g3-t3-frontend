"use client"

import { signIn } from 'next-auth/react';
import Image from 'next/image';

import { useState } from 'react';
import { animated, useSpring } from 'react-spring';

export default function Login() {
     // Define the animations for the two divs
    const animationProps1 = useSpring({
        from: { transform: 'rotate(10deg)' },
        to: { transform: 'rotate(70deg)' },
        config: { duration: 5000 },
        loop: { reverse: true}
    });

    const animationProps2 = useSpring({
        from: { opacity: 0.3 },
        to: { opacity: 1 },
        config: { duration: 1000 },
        loop: { reverse: true }
    });

  return (
    <div className="flex min-h-screen w-screen">
        <div className="w-1/2 relative hidden-mobile">
            <Image
            src="/images/office.jpeg"
            // src="/images/suit.png"
            alt="Login Background"
            layout="fill"
            objectFit="cover"
            />
        </div>
        <div className="w-screen lg:w-1/2 relative isolate pt-32 overflow-y-hidden">
            <animated.div style={animationProps1} className="absolute inset-x-0 -top-40 -z-10 transform-gpu overflow-hidden blur-3xl sm:-top-80" aria-hidden="true">
                <div className="relative left-[calc(50%-11rem)] aspect-[1155/678] w-[36.125rem] -translate-x-1/2 rotate-[30deg] bg-gradient-to-tr from-blue-500 to-blue-700 opacity-30 sm:left-[calc(50%-30rem)] sm:w-[72.1875rem]" ></div>
            </animated.div>
            <div className="mx-auto max-w-2xl py-32 sm:py-48 lg:py-56">
                <div className="text-center">
                    <h1 className="text-4xl font-bold tracking-tight text-gray-900 sm:text-6xl">CS301: Project B</h1>
                    <p className="mt-6 text-lg leading-8 text-gray-600">By G3T3: Adrian, Jeremy, Kevin, Samuel, Samuel, Yao Long.</p>
                    <div className="mt-10 flex items-center justify-center gap-x-6">

                        <a href="#" onClick={() => signIn('cognito')} className="rounded-md bg-blue-500 px-3.5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-blue-600 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600">Get started</a>
                        <a href="#" className="text-sm font-semibold leading-6 text-gray-900">Project Doc <span aria-hidden="true">→</span></a>
                    </div>
                </div>
            </div>
            <animated.div style={animationProps2} className="absolute inset-x-0 top-[calc(100%-13rem)] -z-10 transform-gpu overflow-hidden blur-3xl sm:top-[calc(100%-30rem)]" aria-hidden="true">
                <div className="relative left-[calc(50%+3rem)] aspect-[1155/678] w-[36.125rem] -translate-x-1/2 bg-gradient-to-tr from-blue-200 to-blue-600 opacity-30 sm:left-[calc(50%+36rem)] sm:w-[72.1875rem]"></div>
            </animated.div>
        </div>
        


    </div>
  );
}
