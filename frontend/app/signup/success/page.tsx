"use client"

import LogoSideBar from '@/components/authentication/LogoSideBar'
import SignupSuccessBox from '@/components/authentication/SignupSuccessBox'

const signupSuccess = () => {    
    return (
        <>
        <div className="flex">
                {/* left container */}
                <LogoSideBar />
                {/* right container */}
                <SignupSuccessBox />
        </div>
        </>
    )
}

export default signupSuccess