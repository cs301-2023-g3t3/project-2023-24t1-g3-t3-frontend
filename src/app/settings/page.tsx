"use client"

import { FaUserPlus } from 'react-icons/fa';
import { FiSearch } from 'react-icons/fi';
import Image from 'next/image';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import Sidebar from '../components/Sidebar';
import axios from 'axios';
import { useSession } from 'next-auth/react';
import Forbidden from '../components/Forbidden';
import Header from '../components/Header';

export default function Settings() {
  const { data: session } = useSession();
  
  if (!session) {
    return (
      <Forbidden />
    );
  }

    return (
        <div className="bg-gray-100 h-screen flex">
        {/* Sidebar */}
        <Sidebar />
  
        {/* Main content */}
        <div className="flex-1 overflow-y-auto">
          <Header title="Settings" />
          <main className="p-4">
            
  
            
          </main>
        </div>
      </div>
    );
}