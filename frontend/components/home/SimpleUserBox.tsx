import { SimpleUserInfo } from "#/shared/models/user";
import Link from "next/link";
import { Avatar } from "primereact/avatar";

interface Props {
  user: SimpleUserInfo;
}

const SimpleUserBox = ({ user }: Props) => {
  return (
    <div className="flex flex-col w-full bg-blue-100 rounded-2xl p-4">
      <Link href={`/profile/${user.username}`}>
        <div className="flex items-center">
          <Avatar
            className="mr-2"
            image={user.avatarUrl ? process.env.NEXT_PUBLIC_BACKEND_URL + user.avatarUrl : "/placeholder_profilePic_white-bg.jpg"}
            shape="circle"
            size="large"
          />
          <div className="whitespace-pre-wrap">
            <div>
              <span className="ml-4 text-md font-bold">{user.displayName}</span>
              <span className="ml-4 text-md text-gray-600">@{user.username}</span>
            </div>
          </div>
        </div>
      </Link>
    </div>
  );
};

export default SimpleUserBox;
