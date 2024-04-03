import React from 'react'
import { Button } from 'primereact/button';
import { InputText } from 'primereact/inputtext';
import { PrimeIcons } from 'primereact/api';
        

const search = () => {
  return (
    <div className="flex flex-col w-[60%] space-y-4">
      <div className="flex w-full h-fit justify-between mt-5 items-center !mb-0">
          <p className="text-3xl font-bold"> Search</p>        
      </div>
      
        <div className="relative w-full">
          <span className="absolute left-3 top-1/2 transform -translate-y-1/2 pi pi-search"> </span>
          <InputText className="pl-10 pr-10 font-medium center w-full" placeholder="Search User"/>
            <Button label="Search" 
              className="p-button-primary absolute top-0 end-0 h-full text-sm font-medium rounded-e-lg border" 
              
            />
              
        
        
        </div>
      
      
    </div>
  )
}

export default search