"use client";
import LoginBox from '@/components/authentication/LoginBox';

const adminLogin = () => {
  return (
    <>
    <div className="flex items-center justify-center h-screen w-screen">
        <LoginBox bUseAdmin={true} />
    </div>
    </>
  )
}

export default adminLogin