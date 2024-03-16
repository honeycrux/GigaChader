import { connectMongoDB } from "@/lib/mongodb";
import User from "@/models/user";
import { NextResponse } from "next/server";

export async function POST(req) {
  try {
    await connectMongoDB();
    const { userName, email } = await req.json();
    let existType = "";
    let userExistResult = await User.findOne({ email }).select("_id");
    // find email first
    if (userExistResult) {
      console.log("Existing email found: ", userExistResult);
      existType = "email";
      return NextResponse.json({ userExistResult, existType });
    }

    // if email not found, find userName
    if (!userExistResult) {
      userExistResult = await User.findOne({ userName }).select("_id");
      if (userExistResult) {
        console.log("Existing user found: ", userExistResult);
        existType = "userName";
      }
      return NextResponse.json({ userExistResult, existType });
    }
    
  } catch (error) {
    console.log(error);
  }
}