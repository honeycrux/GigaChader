"use client"
import Image from 'next/image'
import placeholder_profilePic from "@/resource/placeholder_profilePic.png"
import { FileUpload } from 'primereact/fileupload'
import { useRef, useState } from 'react';
import { Toast } from 'primereact/toast';
import { InputText } from 'primereact/inputtext';
import { InputTextarea } from 'primereact/inputtextarea';
import { Button } from 'primereact/button';

const onboarding = () => {
    const toast = useRef<Toast>(null);

    const onUpload = () => {
        if (toast.current) {
            toast.current.show({ severity: 'info', summary: 'Success', detail: 'Fake file upload' });
        }
    };

    const fakeContinue = () => {
        if (toast.current) {
            toast.current.show({ severity: 'info', summary: 'Success', detail: 'Go to home' });
        }
    };

    const [displayName, setDisplayName] = useState('same as placeholderUserName by default');
    const [userName, setUserName] = useState('placeholderUserName');
    const [bio, setBio] = useState('placeholder Bio');

    return (
    <>
    <div className="flex flex-col items-center justify-center my-10">
        <div className=''>
            <Toast ref={toast}></Toast>
            <p className='text-3xl mb-2'>Onboarding</p>
            <p className='text-xl font-light mb-5'>Complete your profile to get started</p>
            <div className='flex flex-col p-12 w-[35rem] h-auto custom-shadow-border rounded-[50px]'>
                <div className="flex items-center">
                    <Image className='mr-5' src={placeholder_profilePic} width={100} alt="placeholder profilePic" />
                    <FileUpload mode="basic" 
                    name='profilePic_upload[]' 
                    url=''
                    accept="image/*"
                    chooseLabel="Upload Profile Picture"
                    onUpload={onUpload}
                    auto />
                </div>
                <div className='[&>*]:my-2'>
                    <p className='!mt-4 text-xl'>Username:</p>
                    <p className='text-xl'>{userName}</p>
                    <p className='text-xl'>Display name</p>
                    <InputText className='custom-shadow-border-light w-full' value={displayName} onChange={(e) => setDisplayName(e.target.value)} />
                    <p className="text-xl">Bio</p>
                    <InputTextarea className='w-full' value={bio} onChange={(e) => setBio(e.target.value)} rows={4} autoResize />
                    <div className="flex justify-center">
                        <Button onClick={fakeContinue} className='px-20' label='Continue' />
                    </div>
                </div>
            </div>
        </div>
    </div>
    </>
  )
}

export default onboarding