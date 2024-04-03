"use client";

import React, { useEffect, useRef, useState } from 'react'
import { Image } from 'primereact/image';
import { Avatar } from 'primereact/avatar';
import PostBox from "@/components/home/PostBox";
import dummyPost from "@/dummy_data/dummyPosts.json";
import { Button } from 'primereact/button';
import { getUserInfo, getProfileInfo } from '@/lib/actions/user';
import { useAuthContext } from '@/providers/auth-provider';
import { Dialog } from 'primereact/dialog';
import { InputText } from 'primereact/inputtext';
import { InputTextarea } from 'primereact/inputtextarea';

const profile = ({ params }: { params: { username: string } }) => {
  const { user, logout } = useAuthContext();
  let profileUsername = params.username;

  const [userinfo, setUserinfo] = useState<any>();
  const [bEditProfileDiagVisible, setbEditProfileDiagVisible] = useState<boolean>(false);

  useEffect(() => {
    const wrapper = async () => {
      if (!profileUsername) {
        if (!user) {
          // console.log("You haven't logged in and you shouldn't be here");
        } else {
          const userinfo_fetched = await getUserInfo();
          if ("error" in userinfo_fetched) {
            console.log("Your own profile requested not found");
          } else {
            // console.log("from profile1");
            // console.log(userinfo_fetched);
            setUserinfo(userinfo_fetched);
          }
        }
      } else {
        const userinfo_fetched = await getProfileInfo( { username: profileUsername } );
        if ("error" in userinfo_fetched) {
          console.log("Profile " + profileUsername +  " requested not found");
        } else {
          // console.log("from profile2");
          // console.log(userinfo_fetched);
          setUserinfo(userinfo_fetched);
        }
      }
    };

    wrapper();
  }, [user]);

  const divRef = useRef<HTMLDivElement>(null);
  const [marginTop, setMarginTop] = useState(0);

  useEffect(() => {
    if (divRef.current) {
      setMarginTop(divRef.current.clientHeight - 70);
    }
  }, []);

  const [selectedButton, setSelectedButton] = useState('Posts');

  const footerElement = (
    <div>
      <Button label='Save' icon='pi pi-check' />
    </div>
  );
  const [editDisplayName, setEditDisplayName] = useState('');
  const [editUsername, setEditUsername] = useState('');
  const [editBio, setEditBio] = useState('');

  return (
    <div className='flex w-full h-full flex-col overflow-y-auto overflow-x-clip'>
      <Dialog header="Edit Profile" footer={footerElement} visible={bEditProfileDiagVisible} className='w-[50vw] min-h-[80%]' 
      onHide={() => setbEditProfileDiagVisible(false)}>
          <div>
            <div className='flex flex-col w-full bg-[#e5eeee] relative'> 
              <Image className='z-0 h-40' 
              src="/art-rachen-yJpjLD3c9bU-unsplash.jpg" alt="profile background pic"
                  pt={{
                    image: {className: "object-cover h-full w-full"},
                    previewContainer: {className: "z-20"}
                  }}
                  preview
              />
              <div className='absolute top-full transform translate-x-10 -translate-y-[4.5rem] z-10 '>
                <div className='flex mb-4'>
                  <Image
                      src='/anh-meme-cheems-hmmm.jpg'
                      alt='profile pic'
                      pt={{
                        image: {className: "rounded-full h-36 w-36 object-cover"},
                        previewContainer: {className: "z-20"}
                      }}
                      preview />
                </div>
                <div className='[&>div]:mb-4'>
                  <p className='text-xl'>Display name</p>
                  <div className='flex w-96'>
                    <InputText className='w-full' value={editDisplayName} onChange={(e) => setEditDisplayName(e.target.value)} />
                  </div>
                  <p className='text-xl'>Username</p>
                  <div className='flex w-96'>
                    <InputText className='w-full' value={editUsername} onChange={(e) => setEditUsername(e.target.value)} />
                  </div>
                  <p className='text-xl'>Bio</p>
                  <div className='flex w-96'>
                    <InputTextarea className="w-full" value={editBio} onChange={(e) => setEditBio(e.target.value)} rows={4} autoResize />
                  </div>
                </div>
              </div>

              {!profileUsername && 
              (<div className='flex w-full absolute top-full z-10 justify-end mt-10 pr-10'>
                  {/* <Button className='w-36' label='Edit Profile' onClick={() => setbEditProfileDiagVisible(true)} /> */}
              </div>)}
            </div>
          </div>
      </Dialog>
      <div className='flex flex-col w-full bg-[#e5eeee] relative'> 
        <Image className='z-0 h-72' 
        src="/art-rachen-yJpjLD3c9bU-unsplash.jpg" alt="profile background pic"
            pt={{
              image: {className: "object-cover h-full w-full"},
              previewContainer: {className: "z-20"}
            }}
            preview
        />
        <div ref={divRef} className='absolute top-full transform translate-x-10 -translate-y-[4.5rem] z-10 '>
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
              <p className='text-3xl'>{userinfo && (userinfo.userConfig.displayName)}</p>
              <p className='text-xl text-gray-600'>@{userinfo && (userinfo.username)}</p>
            </div>
          </div>
            <p className='text-xl whitespace-pre-wrap max-w-96'>Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.</p>
        </div>

        {(user && !profileUsername) && 
        (<div className='flex w-full absolute top-full z-10 justify-end mt-10 pr-10'>
            <Button className='w-36' label='Edit Profile' onClick={() => setbEditProfileDiagVisible(true)} />
        </div>)}
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