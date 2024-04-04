'use client';

import { InputText } from 'primereact/inputtext';
import { PrimeIcons } from 'primereact/api';
import { useSearchParams, usePathname,useRouter } from 'next/navigation';

const search = () => {
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const { replace } = useRouter();

  function handleSearch(term: string) {
    const params = new URLSearchParams(searchParams);
    

    if (term) {
      params.set('query', term);
    } else {
      params.delete('query');
    }
    replace(`${pathname}?${params.toString()}`);
  }

  return (
    <div className="flex flex-col w-[60%] space-y-4">
      <div className="flex w-full h-fit justify-between mt-5 items-center !mb-0">
        <p className="text-3xl font-bold">Search</p>
      </div>

      <div className="relative w-full">
        <span className="absolute left-3 top-1/2 transform -translate-y-1/2 pi pi-search"></span>
        <InputText
          className="pl-10 pr-10 font-medium center w-full"
          placeholder="Search User"
          onChange={(e) => {
            handleSearch(e.target.value);
          }}
          defaultValue={searchParams.get('query')?.toString()}
        />
      </div>
      
      {/* display table */}
      <div className="flex w-full gap-9">
        <table>
          <tbody>
            {!searchParams.get('query') ? (
              <tr>
                <td className="no-result col-span-2">
                  No Result
                </td>
              </tr>
            ) : (
              <tr>
                <td>
                  <img src="/placeholder_profilePic.png" alt="user profile pic" width="50" />
                </td>
                <td>
                  Display name
                </td>
                <td>
                  Username
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default search;