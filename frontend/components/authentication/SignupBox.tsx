"use client";

import { signup } from "@/lib/actions/auth";
import { useRouter } from "next/navigation";
import { Button } from "primereact/button";
import { InputText } from "primereact/inputtext";
import { Password } from "primereact/password";
import { useState } from "react";
import z from "zod";

// signup form component for signup page
const SignupBox = () => {
  const [userName, setUserName] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [bIsSignupLoading, setbIsSignupLoading] = useState(false);
  const [confirmPassword, setConfirmPassword] = useState("");
  // useEffect(() => {
  //   console.log("email: " + email);
  //   console.log("password: " + password);
  // }, [email, password])
  const [error, setError] = useState("");
  const router = useRouter();

  // submit signup request to backend
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }
    if (!userName || !displayName || !email || !password) {
      setError("All fields are necessary");
      return;
    }

    // frontend guards
    if (!userName || userName.length < 3 || userName.length > 31 || !/^[a-z0-9_-]+$/.test(userName)) {
      setError("Invalid username");
      return;
    }
    if (!displayName) {
      setError("Invalid display name");
      return;
    }
    const zodEmail = z.string().email();
    if (!email || !zodEmail.safeParse(email).success) {
      setError("Invalid email");
      return;
    }
    if (!password || password.length < 6 || password.length > 255) {
      setError("Invalid password");
      return;
    }

    try {
      setbIsSignupLoading((prevbIsSignupLoading) => true);
      const res = await signup({
        username: userName,
        displayName,
        email,
        password,
      });

      if (res === true) {
        const form = e.target as HTMLFormElement;
        form.reset();
        console.log("Registration successful.");
        router.push("/signup/success");
      } else {
        setbIsSignupLoading((prevbIsSignupLoading) => false);
        console.log("Registration failed.");
        setError(res.error);
      }
    } catch (error) {
      setbIsSignupLoading((prevbIsSignupLoading) => false);
      console.log("Error during registration: ", error);
    }
  };

  return (
    <>
      <div className="flex w-2/3 items-center justify-center">
        <div className="flex flex-col p-12 w-[34rem] h-fit custom-shadow-border rounded-[50px]">
          <p className="text-3xl">Sign up</p>
          <hr className="h-px my-5 bg-gray-400" />
          <form onSubmit={handleSubmit} className="flex flex-col h-full [&>*]:my-1">
            <p className="text-2xl">User name</p>
            <InputText className="custom-shadow-border-light" value={userName} onChange={(e) => setUserName(e.target.value)} />
            <p className="text-2xl">Display name</p>
            <InputText className="custom-shadow-border-light" value={displayName} onChange={(e) => setDisplayName(e.target.value)} />
            <p className="text-2xl">Email address</p>
            <InputText className="custom-shadow-border-light" value={email} onChange={(e) => setEmail(e.target.value)} />
            {/* <br className='my-2' /> */}
            <p className="text-2xl !mb-0">Password</p>
            <p className="!m-0">Use &gt;= 6 characters</p>
            <Password
              className="custom-shadow-border-light w-full"
              toggleMask
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              pt={{
                input: { className: "w-full" },
              }}
            />
            <p className="text-2xl !mb-0">Confirm Password</p>
            <Password
              className="custom-shadow-border-light w-full"
              toggleMask
              feedback={false}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              pt={{
                input: { className: "w-full" },
              }}
            />
            {error ? <div className="text-red-600">{error}</div> : <br className="!my-5" />}
            <div className="flex w-full justify-center">
              <Button className="px-20" label="Sign up" loading={bIsSignupLoading} />
            </div>
          </form>
        </div>
      </div>
    </>
  );
};

export default SignupBox;
