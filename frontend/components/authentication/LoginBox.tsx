import Link from "next/link";
import { Button } from "primereact/button";
import { InputText } from "primereact/inputtext";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuthContext } from "@/providers/auth-provider";
import ErrorBoundary from "next/dist/client/components/error-boundary";

const LoginBox = () => {
  const { login } = useAuthContext();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  // useEffect(() => {
  //   console.log("email: " + email);
  //   console.log("password: " + password);
  // }, [email, password])
  const [error, setError] = useState("");
  const [bIsLoginLoading, setBIsLoginLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    try {
      setBIsLoginLoading((prevBIsLoading) => true);
      const res = await login({ email, password });

      if (res !== true) {
        setBIsLoginLoading((prevBIsLoading) => false);
        setError("Invalid credentials. Please try again.");
        return;
      }

      router.replace("/home");
    } catch (error) {
      console.error("Error: " + error);
    }
  };

  return (
    <>
      <div className="flex w-2/3 items-center justify-center">
        <div className="flex flex-col p-12 w-[34rem] h-[40rem] custom-shadow-border rounded-[50px]">
          <p className="text-3xl">Sign in</p>
          <p className="text-xl font-light">to connect with other chads</p>
          <hr className="h-px my-10 bg-gray-400" />
          <form onSubmit={handleSubmit} className="flex flex-col h-full [&>*]:my-2">
            <p className="text-2xl">Email address</p>
            <InputText className="custom-shadow-border-light" value={email} onChange={(e) => setEmail(e.target.value)} />
            {/* <br className='my-2' /> */}
            <p className="text-2xl">Password</p>
            <InputText className="custom-shadow-border-light" value={password} onChange={(e) => setPassword(e.target.value)} />
            {error ? <div className="text-red-600">{error}</div> : <br className="!my-5" />}
            <div className="flex w-full justify-center">
              <Button
                onClick={() => {
                  setError("");
                }}
                className="px-20"
                label="Continue"
                loading={bIsLoginLoading}
              />
            </div>

            <br className="!my-5" />

            <span className="font-light">
              No account?&nbsp;
              <Link href="/signup" className="text-orange1 hover:underline">
                Sign up
              </Link>
            </span>
          </form>
        </div>
      </div>
    </>
  );
};

export default LoginBox;
