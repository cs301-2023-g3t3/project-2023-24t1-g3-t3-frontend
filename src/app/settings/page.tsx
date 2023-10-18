"use client"

import { FaUserPlus } from 'react-icons/fa';
import { FiSearch } from 'react-icons/fi';
import Image from 'next/image';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import Sidebar from '../components/Sidebar';
import axios from 'axios';

export default function Settings() {
    return (
        <div className="bg-gray-100 h-screen flex">
        {/* Sidebar */}
        <Sidebar />
  
        {/* Main content */}
        <div className="flex-1 overflow-y-auto">
          <header className="bg-white p-4 flex justify-between">
            <h1 className="text-xl font-bold text-gray-700">Settings</h1>
            <Link href="/" className='mr-4 text-gray-500'>Log out</Link>
          </header>
          <main className="p-4">
            
  
            
          </main>
        </div>
      </div>
    );
}