export { default } from "next-auth/middleware";

// paths to be protected below
export const config = { matcher: ["/login_test"] };