# OnboardinGBM

Taqtile's onboarding project, developed by Gabriel Batista Moura. Its main goal is to get used to the technologies and workflow used by the team.
By the end of the project, we expect a working server, able to store data in a database and CRUD that data.

## Environment and Tools

### node

The application was built in Node.js, and all of the necessary packages were installed through npm (Node Package Manager). Make sure you have node.js [v20.10.0](https://nodejs.org/en/download) and npm installed.
Node.js is downloaded with a built-in version of npm, as well as npx. Update it to 10.2.5:

`$ npm install -g npm@10.2.5`

You can check by running `$ node -v` and `$ npm -v`.

### docker

We also need [Docker](https://www.docker.com/get-started/), v24.0.5. To check the version:

`$ docker --version`

### OS

The project is ran and tested on a Linux Ubuntu 20.04.6 LTS 64-bit operating system.

## Running and Debugging

In the root of your project, run:

`$ npm install`

It will install all the other necessary dependencies, listed in JSON files. Then, you can run any of the scripts, as `dev` or `start`:

`$ npm run dev`
