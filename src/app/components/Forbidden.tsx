import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Login from "./Login";

export default function Forbidden() {
    return (
        <main className='flex w-screen h-screen justify-center'>
            <p className='text-2xl self-center'>You are not authorized to view this page.</p>
        </main>
    );
}