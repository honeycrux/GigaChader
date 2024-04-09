import { apiClient } from "@/lib/apiClient";

type Props = {
    symbol: string
}
function Crypto ({symbol} : Props) {

  return (
    <div className="flex w-full h-full flex-col ">
        <div>Crypto</div>
        <div>
        <h1>Items List</h1>
            <button className="button">
                Edit
            </button>
        </div>
    </div>
    )
}

export default Crypto
