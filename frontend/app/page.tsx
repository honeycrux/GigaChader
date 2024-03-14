// import React from 'react'

const login = () => {
    return (
        <div className="flex">
                {/* left container */}
                <div className='bg-orange2 w-1/3 h-screen'></div>
                {/* right container */}
                <div className='flex w-2/3 items-center justify-center'>
                        <div className='flex flex-col p-12 w-[34rem] h-[40rem] custom-shadow-border rounded-[50px]'>
                            <p className="text-3xl">Sign in</p>
                            <p className="text-xl font-light">to connect with other chads</p>
                        </div>
                </div>
        </div>
    )
}

export default login