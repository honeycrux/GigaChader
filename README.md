# Gigachader

Gigachader is a social media platform project, an online social media platform dedicated to cryptocurrency enthusiasts who also enjoy the Internet meme culture. Inspired by Twitter and Threads, users on the platform gather to share insights, discuss strategies, as well as posting various meme pictures and videos.

## Features
See your feeds on Home. Find out the latest posts from everyone on Global.  
![alt text](/images/feature-home.png) ![alt text](/images/feature-global.png)

Like, post, repost, and save posts to bookmark. Share your thoughts in the comments.  
![alt text](/images/feature-commenting.png) ![alt text](/images/feature-bookmarks.png)

Find people, posts, hashtags, and topics on Search.  
![alt text](/images/feature-search.png) ![alt text](/images/feature-search-tags.png) ![alt text](/images/feature-search-topics.png)

Discover trending posts, hashtags, and topics.  
![alt text](/images/feature-discover-posts.png) ![alt text](/images/feature-discover-tags.png) ![alt text](/images/feature-discover-topics.png)

Check your notifications. Never miss out on interactions.  
![alt text](/images/feature-notifications.png)

Bookmark your favourite crypto currencies. Follow their latest prices.  
![alt text](/images/feature-cryptobm.png) ![alt text](/images/feature-cryptobm-edit.png)

Follow and connect with other people.  
![alt text](/images/feature-profile.png) ![alt text](/images/feature-followuser.png)

Customize your profile, build a Flexfolio and share your investment strategies.  
![alt text](/images/feature-flexfolio.png) ![alt text](/images/feature-flexfolio-edit.png)

Be an admin and moderate users and posts. (Post management is not usable at the moment.)  
![alt text](/images/feature-manageuser.png) ![alt text](/images/feature-managepost.png)

## Install & Run
This project will not run locally without .env files containing databases login credentials.

Installing dependencies:
- At the project root folder, run `npm install`. This will run:
  - installation on the project root folder, which runs afterwards, in parallel:
    - `install:frontend`, equivallent to `npm install` on the frontend folder; and
    - `install:backend`, equivallent to `npm install` on the backend folder, which runs afterwards:
      - `prisma:gen` to re-generate the prisma client.

Running:
- At the project root folder, run `npm run dev`. This will run, in parallel:
  - `frontend:dev`, equivallent to `npm run dev` on the frontend folder, starting the web server;
  - `backend:dev`, equivallent to `npm run dev` on the backend folder, running in parallel:
    - `dev:server`, which runs the `server.ts` file; and
    - `dev:jobs`, which runs the `jobs.ts` file.
- To run for production, replace "dev" with "start". Remember you need to run the build step before this. See below for the build step.

Building:
- Frontend: Go to frontend folder and run `npm run build`
- Backend runs with tsx and requires no build (transpile) step

## Structure

This is a monorepo containing several folders:
- `frontend/`: Web server
  - `app/`: [Next app router](https://nextjs.org/docs/app/building-your-application/routing)
  - `components/`: Web components
  - `lib/`: Useful (shared) functionalities you define
  - `providers/`: Custom providers you define (e.g. context providers)
  - `public/`: Public assets
- `backend/`: Backend services
  - `server.ts`: The main file to run the express server
  - `jobs.ts`: The main file to schedule cron jobs
  - `lib/`: Useful (shared) functionalities you define
  - `middlewares/`: [Express middlewares](https://expressjs.com/en/guide/using-middleware.html)
  - `prisma/`: Database schema
  - `routes/`: Routes and functionalities of the API
- `images/`: (Images used in README files)
- `shared/`: Resources shared between `frontend/` and `backend/`
  - `contracts/`: [TS-REST contracts](https://ts-rest.com/docs/core/) to provide typings for API communications
  - `models/`: Zod schemas and typescript models for some standardized request/response types used in contracts

## Developer Notes
These are technical details for developers.

### Installing Packages
**To install or remove packages, please go to the respective folder (frontend/backend) before using `npm install`.**

### Web Server: Building Pages
Use the [next app router](https://nextjs.org/docs/app/building-your-application/routing) to build pages. The UI Library [PrimeReact](https://primereact.org/) the CSS Library [Tailwind CSS](https://tailwindcss.com/) are used.

### Web Server: User Information / Protecting Routes
On client components (with `"use client";` at top of script):
- Use useAuthContext from `@/providers/auth-provider`. Call `const { user } = useAuthContext();`.
- Check for absence of a session using the condition `!user`. If user is not null, user exists.

### Web Server: Interacting with the Backend (with client component)
In order to use the browser cookie, the only currently known way is to make API calls under client components (session cookie will fail if you call from server components). Feel free to use server actions `front/lib/actions/` to make those calls if code is reused, though make sure you invoke them from client component. Please see existing examples, for example, `frontend/app/(main)/home/page.tsx`.

If you interact with the API, please use the [ts-rest client](https://ts-rest.com/docs/core/fetch) from `frontend/lib/apiClient.ts`.

While running backend, you may infer the usage of API endpoints using the swagger docs on [http://localhost:3007/docs/](http://localhost:3007/docs/) or the contracts defined in `shared/contracts/`.

Please avoid interacting directly with the database with actions. The actions should serve as a layer to talk to the backend and tailor the result for the webpage.

If there are features you want from the backend services, please request it from the backend team.

### Web Server: Public APIs
It is not likely that we need to set up public APIs on the web server for this project.

But if you want to do it, use [next route handlers](https://nextjs.org/docs/app/building-your-application/routing/route-handlers).

### Backend: Building APIs
If your API route is `http://localhost:3007/api/[feature]/[endpoint]`, follow these steps:
- The source of truth for API endpoints is the [contracts](https://ts-rest.com/docs/core/), so first define the endpoint in the subcontract `shared/contracts/[feature].ts`
- Check if the defined subcontract is added under `shared/contracts/index.ts`
- Now, implement the endpoint in the subroute `routes/[feature].ts`
- Check if the defined subroute is added under `routes/index.ts`

You can use tools like [Insomnia](https://insomnia.rest/) to make API calls for test.

About middleware:
- If you need to add middleware, add them to `backend/middlewares/[feature].ts`.
- If you need to run middleware on the routes, see example on `backend/routes/(example-of-validate-user).ts` in which the validateUser middleware is run.

### Backend: User Information / Protecting Routes
- If user validation is needed, add the validateUser middleware to the route.
- If user validation plus a role level check is required, add the protectRoute.rolename middleware. The route will return "403 (Forbidden)" when the user role level is not enough.
- See examples on `backend/routes/(example-of-validate-user).ts`.
- The middlewares are defined in `backend/middlewares/auth.ts`.

### Backend: Media Upload
Media are uploaded to Azure Blob Storage.

When using storage programmatically from routes, please use defined functions on `backend/lib/data/mediaHandler.ts`. Please avoid directly calling the underlying `backend/lib/data/storage.ts`.

See `backend/routes/(example-of-media-upload).ts` as an example for defining a route that needs to handle image uploading.

### Backend: Database Model & Migration
To change the database model, change the prisma model file (`backend/prisma/schema.prisma`). Then, update the code type definition by running `npx prisma generate`, and update the database schema by running `npx prisma db push`. (Commands have to be run on the backend.)

[Other tips for working with Prisma+MongoDB](https://www.prisma.io/docs/orm/overview/databases/mongodb/)

The ER diagram shall be kept up-to-date with respect to the development of application:  
![Entity relation diagram](/images/entity-relation-diagram.jpg)

### Changes to Environment Variables
Environment variables are modifiable values that will affect how the process behave. The env file can contain sensitive information such as credentials.

**The env files shall be gitignored and shared privately. Please keep all sensitive information inside the env files.**

This project has two env files, one for frontend (`frontend/.env`) and one for backend (`backend/.env`).

To get environment variables in the project, use `process.env.VARIABLE_NAME`. All variables from the env file are of `string` type.

When changing environment variables on the frontend or backend, please update the respective `environment.d.ts` file so that we get nice autocomplete.