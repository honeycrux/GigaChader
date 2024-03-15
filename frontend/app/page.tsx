"use client"
import { Button } from 'primereact/button';
import { InputText } from 'primereact/inputtext';
import { useEffect, useState } from "react";
import Image from 'next/image'
import gigachader from "@/resource/gigachader.png"

const login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    // useEffect(() => {
    //   console.log("email: " + email);
    //   console.log("password: " + password);
    // }, [email, password])

    
    return (
        <>
        <div className="flex">
                {/* left container */}
                <div className='flex bg-orange2 w-1/3 h-screen items-center overflow-hidden'>
                    <Image src={gigachader}
                            width={700}
                            alt="logo"
                            className='relative -left-[20%] scale-125'>
                    </Image>
                </div>
                {/* right container */}
                <div className='flex w-2/3 items-center justify-center'>
                        <div className='flex flex-col p-12 w-[34rem] h-[40rem] custom-shadow-border rounded-[50px]'>
                            <p className="text-3xl">Sign in</p>
                            <p className="text-xl font-light">to connect with other chads</p>
                            <hr className="h-px my-10 bg-gray-400" />
                            <div className='flex flex-col h-full [&>*]:my-2'>
                                <p className="text-2xl">Email address</p>
                                <InputText className='custom-shadow-border-light' value={email} onChange={(e) => setEmail(e.target.value)} />
                                {/* <br className='my-2' /> */}
                                <p className="text-2xl">Password</p>
                                <InputText className='custom-shadow-border-light' value={password} onChange={(e) => setPassword(e.target.value)} />
                                <br className='!my-5' />
                                <div className="flex w-full justify-center">
                                    <Button className='px-20' label='Continue' />
                                </div>
                                <br className='!my-5' />
                                <span className='font-light'>No account?&nbsp;
                                    <a href="#" target="_blank" className="text-orange1 hover:underline">
                                        Sign up
                                    </a>
                                </span>
                            </div>
                        </div>
                </div>
        </div>
        </>
    )
}

export default login