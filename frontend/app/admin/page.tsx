"use client";
import LoginBox from '@/components/authentication/LoginBox';

// admin login page
const AdminLogin = () => {
  return (
    <>
    <div className="flex items-center justify-center h-screen w-screen">
      {/* set bUseAdmin to true to show admin login box style */}
        <LoginBox bUseAdmin={true} />
    </div>
    </>
  )
}

export default AdminLogin