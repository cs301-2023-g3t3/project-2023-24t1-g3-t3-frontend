import { signOut } from "next-auth/react";
import { useRouter } from "next/navigation";

export default function Header({ title }: { title: string }) {
  const router = useRouter();

  const handleLogout = () => {
    router.push('/');
    signOut();
  };
  
  return (        
    <header className="bg-white p-4 flex justify-between">
      <h1 className="text-xl font-bold text-gray-700">{title}</h1>
      <h1 onClick={handleLogout} className='mr-4 text-gray-500 cursor-pointer'>Log out</h1>
    </header>
  );
}
