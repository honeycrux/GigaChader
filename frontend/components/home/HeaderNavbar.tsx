"use client";

import { validateUser } from '@/lib/actions/auth';
import { Image } from 'primereact/image';
import { use, useRef, useState } from 'react';
import { OverlayPanel } from 'primereact/overlaypanel';
import { Button } from 'primereact/button';
import { Toast } from 'primereact/toast';

interface Props {
  displayName: string;
}

const HeaderNavbar = ({displayName}: Props) => {
  const op = useRef(null);
  const toast = useRef<Toast>(null);

  const handleLogout = () => {
    if (toast.current) {
        toast.current.show({ severity: "info", summary: "Success", detail: "Fake logout" });
    }
  }

  return (
    <>
    <Toast ref={toast}></Toast>
    <OverlayPanel ref={op}>
        <Button label='Logout' onClick={handleLogout} />
    </OverlayPanel>
    {/* header start */}
    <nav className="flex bg-orange2 h-16 items-center space-x-2 justify-between px-4">
        <a className='flex items-center space-x-2'
        href='/home'>
          <Image
            src='/gigachader_notext.png'
            alt='gigachad logo'
            width='50'
          />
          <span className='text-xl font-bold'>GigaChader</span>
        </a>

        <button className='flex items-center space-x-2 
          transition duration-300 ease-in-out hover:bg-[hsl(40,32%,71%)] 
          rounded-md p-2'
          onClick={(e) => (op.current as OverlayPanel | null)?.toggle(e)}>
          <Image
            src='/placeholder_profilePic.png'
            alt='user profile pic'
            width='50'
          />
          <span>{displayName}</span>
        </button>
    </nav>
    {/* header end */}
    </>
  )
}

export default HeaderNavbar