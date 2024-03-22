const home = () => {
  return (
    // force page size to fit screen
    <div className='w-screen h-screen'>
        {/* header start */}
        <nav className="flex bg-orange2 h-16 items-center [&>*]:mx-2">
            {/* border-4 border-black */}
            <p className='!mx-0'>header</p>
            <p>item1</p>
            <p>item2</p>
        </nav>
        {/* header end */}

        {/* define size of area below navbar */}
        <div className='flex h-[calc(100%-4rem)]'>
            {/* sidebar start */}
            <aside className="bg-orange2 w-60 overflow-y-auto [&>*]:my-2">
                {/* border-4 border-black */}
                <p className='!my-0'>sidebar</p>
                <p>item1</p>
                <p>item2</p>
            </aside>
            {/* sidebar end */}

            {/* main content start */}
            <main className='flex w-[calc(100%-15rem)] justify-center'>
                <p>home content</p>
            </main>
            {/* main content end */}
        </div>

    </div>
  )
}

export default home