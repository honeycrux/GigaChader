"use client";

import React, { useEffect, useRef, useState } from 'react'
import { Image } from 'primereact/image';
import { Avatar } from 'primereact/avatar';
import PostBox from "@/components/home/PostBox";
import dummyPost from "@/dummy_data/dummyPosts.json";
import { Button } from 'primereact/button';


const profile = ({ params }: { params: { username: string } }) => {
  let profileUsername = params.username;
  if (!profileUsername) {
    profileUsername = "self";
  }

  const divRef = useRef<HTMLDivElement>(null);
  const [marginTop, setMarginTop] = useState(0);

  useEffect(() => {
    if (divRef.current) {
      setMarginTop(divRef.current.clientHeight - 70);
    }
  }, []);

  const [selectedButton, setSelectedButton] = useState('Posts');
  return (
    <div className='flex w-full h-full flex-col overflow-y-auto overflow-x-clip'>
      <div className='flex h-72 w-full bg-[#e5eeee] relative'> 
        <Image className='z-0' 
        src="/art-rachen-yJpjLD3c9bU-unsplash.jpg" alt="profile background pic"
            pt={{
              image: {className: "object-cover h-full w-full"},
              previewContainer: {className: "z-20"}
            }}
            preview
        />
        <div ref={divRef} className='absolute top-full transform translate-x-10 -translate-y-[4.5rem] z-10'>
          <div className='flex mb-4'>
            <Image
                src='/anh-meme-cheems-hmmm.jpg'
                alt='profile pic'
                pt={{
                  image: {className: "rounded-full h-36 w-36 object-cover"},
                  previewContainer: {className: "z-20"}
                }}
                preview />
            <div className="flex flex-col min-h-full justify-end ml-2">
              <p className='text-3xl'>Cheem</p>
              <p className='text-xl text-gray-600'>@cheemuser</p>
            </div>
          </div>
            <p className='text-xl whitespace-pre-wrap max-w-96'>Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.</p>
        </div>
      </div>
      <div style={{ marginTop: `${marginTop}px` }}>
        <div className='flex justify-between w-full'>
          <Button className={`w-full ${selectedButton === 'Posts' ? 'border-0 !border-b-2 border-orange1' : ''}`} 
          label="Posts" text
          onClick={() => setSelectedButton('Posts')} />
          <Button className={`w-full ${selectedButton === 'Replies' ? 'border-0 !border-b-2 border-orange1' : ''}`}
          label="Replies" text
          onClick={() => setSelectedButton('Replies')} />
        </div>

      </div>

      {/* <div className="bg-slate-500 h-96 w-10"></div> */}
      {dummyPost.map((post, index) => <PostBox key={index} {...post} />)}

      
    </div>
     
  )
}

export default profile