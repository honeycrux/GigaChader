import React from 'react'
import { Image } from 'primereact/image';
import { object } from 'zod';
import { Container } from 'postcss';
import { Avatar } from 'primereact/avatar';
import { AvatarGroup } from 'primereact/avatargroup';

const profile = ({ params }: { params: { username: string } }) => {
  let profileUsername = params.username;
  if (!profileUsername) {
    profileUsername = "self";
  }
  return (
    <div className='flex w-full flex-col justify-start'>
      <div className='w-4/5'>
         
        <div className='flex h-72 w-full overflow-hidden  bg-gray-300 '  > 
        
          <img className='object-cover max-h-72 maxw-full ' src="/placeholder_profilePic.png" alt="profile background pic"/>
            
        </div>

        <div className='flex items-center justify-between'>
          <div className='flex items-center gap-3'>
            <Avatar image="/placeholder_profilePic.png" size="xlarge" shape="circle" className='shadow-2xl object-cover'/>
            <div className='flex-1'>
              <h2 className='text-left font-bold text-white'>
                {profileUsername} 
              </h2>
              <p className='text-base text-gray-500'>

              </p>
            </div>
          </div>
            
        </div>
      </div>
      <div className='w-1/5'></div>
    </div>

     
  )
}

export default profile