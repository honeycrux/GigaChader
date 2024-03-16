"use client"

import LogoSideBar from '@/components/authentication/LogoSideBar'
import SignupBox from '@/components/authentication/SignupBox'

const signup = () => {    
    return (
        <>
        <div className="flex">
                {/* left container */}
                <LogoSideBar />
                {/* right container */}
                <SignupBox />
        </div>
        </>
    )
}

export default signup