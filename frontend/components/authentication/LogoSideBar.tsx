import Image from 'next/image'
import gigachader from "@/public/gigachader.png"

// the big logo on the left side of the login page
const LogoSideBar = () => {
  return (
    <>
    <div className='flex bg-orange2 w-1/3 h-auto min-h-screen items-center overflow-hidden'>
        <Image src={gigachader}
                width={700}
                alt="logo"
                className='relative -left-[20%] scale-125'>
        </Image>
    </div>
    </>
  )
}

export default LogoSideBar