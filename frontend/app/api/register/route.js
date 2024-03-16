import { connectMongoDB } from "@/lib/mongodb";
import User from "@/models/user";
import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";

export async function POST(req) {
  try {
    const { userName, displayName, email, password } = await req.json();
    // const hashedPassword = await bcrypt.hash(password, 10);
    const hashedPassword = password;
    await connectMongoDB();
    await User.create({ userName, displayName, email, password: hashedPassword });

    console.log("userName: " + userName);
    console.log("displayName: " + displayName);
    console.log("email: " + email);
    console.log("password: " + password);

    return NextResponse.json({ message: "User registered." }, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { message: "An error occurred while registering the user." },
      { status: 500 }
    );
  }
}