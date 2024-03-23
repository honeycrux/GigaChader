import Image from 'next/image'
import gigachader from "@/public/gigachader.png"

const LogoSideBar = () => {
  return (
    <>
    <div className='flex bg-orange2 w-1/3 h-screen items-center overflow-hidden'>
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