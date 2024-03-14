# Gigachader

## Structure

This is a monorepo containing several folders:
- `frontend/`: Web server
  - `app/`: [Next app router](https://nextjs.org/docs/app/building-your-application/routing)
  - `components/`: Web components
  - `lib/`: Useful functionalities you define
  - `lib/actions/`: Server actions
- `backend/`: Backend services
  - `server.ts`: The main file that is run
  - `prisma/`: Database schema and crud operations
  - `routes/`: Routes and functionalities of the API
  - `lib/`: Useful functionalities you define
- `shared/`: Resources shared between `frontend/` and `backend/`
  - `contracts/`: [TS-REST contracts](https://ts-rest.com/docs/core/) to provide typings for API communications

## Installation

In order to run this app on your device for the first time, follow the steps below:
- Install dependencies: At the project root folder, run `npm install`
- Run web server and backend services: At the project root folder, run `npm run dev`

If you do not wish to run in parallel, use the alternative method to install separately:
Use 3 terminals, with one at the project root, one in `frontend/`, one in `backend/`
- Install dependencies: On the desired terminal, run `npm install`
- Run web server or backend services: On the desired terminal, run `npm run dev`

## Working with the project

### Installing Packages
**To install or remove packages, please go to the respective folder (frontend/backend) before using `npm install`.**

### Web Server: Building Pages
Use the [next app router](https://nextjs.org/docs/app/building-your-application/routing) to build pages. The UI Library [PrimeReact](https://primereact.org/) the CSS Library [Tailwind CSS](https://tailwindcss.com/) are used.

### Web Server: Interacting with the Backend (as a server action)
To interact with the API provided by the backend or do something complicated, please create an action in `frontend/lib/actions/` and use it to tailor the result for the webpage.

If you interact with the API, please use the [ts-rest client](https://ts-rest.com/docs/core/fetch) from `frontend/lib/actions/api-client.ts`.

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
- Now, implement the endpoint in the subroute `routes/api/[feature].ts`
- Check if the defined subroute is added under `routes/api.ts`
You can use tools like [Postman](https://www.postman.com/) to make API calls for test.

### Backend: Database Model & Migration



### Changes to Environment Variables
Environment variables are modifiable values that will affect how the process behave. The env file can contain sensitive information such as credentials.

**The env files shall be gitignored and shared privately. Please keep all sensitive information inside the env files.**

This project has two env files, one for frontend (`frontend/.env`) and one for backend (`backend/.env`).

To get environment variables in the project, use `process.env.VARIABLE_NAME`. All variables from the env file are of `string` type.

When changing environment variables on the frontend or backend, please update the respective `environment.d.ts` file so that we get nice autocomplete.