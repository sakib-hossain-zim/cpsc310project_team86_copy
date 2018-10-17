# CPSC 310 Project Repository

This is the base project for CPSC310. You will extend this codebase for all of the deliverables in the project. Please keep your repository private.

The [course webpage](https://github.com/ubccpsc/310/tree/2016sept) is your best resource for additional details about the project, AutoTest, and the specific requirements of each project deliverable. These resources will be frequently updated as the term progresses.

# Project: insightUBC

UBC is a big place, and involves a large number of people doing a variety of tasks. The goal of this project is to provide a way to perform some of the tasks required to run the university and to enable effective querying of the metadata from around campus. This will involve working with courses, prerequisites, past course averages, room scheduling, and timetable creation.

To enable you to focus on the key abstractions, data models, and algorithms, this project will remove most UI concerns; we will provide a reference interface that will connect to your system using network requests. The project will represent a 'full stack' web development project using [Node](https://nodejs.org). You are free to use Javascript, Typescript, or CoffeeScript for your project, but the packages and libraries you use will be strictly limited.

Each project deliverable will be marked using an automated private test suite; you will have access to a public automated test suite as well. While the public test suite will enable you to test that your project conforms to the interface of the private suite, it will be insufficient to gauge how complete your solution is. You are encouraged to create a private fork of the public test suite and extend it yourself to further validate each deliverable. Additional details are available on the [AutoTest](project/AutoTest.md) page.

## Language and environment

Your project will have to be JavaScript ES5 compatible; you can write it in either pure JS, CoffeeScript, or TypeScript (we will use TypeScript in lecture). The language you choose as a team is up to you so choose wisely. The course staff may not have experience with your language choice so it will be up to you to problem solve language-specific issues.

While it might seem daunting to learn a new language on your own, the fluid nature of software systems requires that you get used to this. You will be responsible for learning the language that you choose to use. The syntax of Typescript is extremely similar to both each other and to Java itself, which you should have used in 210 (Javascript has some quirks, but is a relatively simple, if inconsistent, language).  Google will be your friend for Javascript, as there are _thousands_ of free tutorials and videos. Typescript also has a bunch of resources, but you can't really go wrong starting with the [Typescript Handbook](http://www.typescriptlang.org/docs/handbook/basic-types.html) or the [Typescript Deep Dive](https://basarat.gitbooks.io/typescript/content/docs/getting-started.html). If you are starting from scratch, it is really important that you don't just read a bunch of code but actually write some. The [Typescript Playground](http://www.typescriptlang.org/play/index.html) or a [Javascript REPL](https://repl.it/languages/javascript) can be a lightweight way to do this.

All development will take place on Github. You will need a Github account; we will create the repository for your group after the course add/drop date. Being familiar with git is essential; please take a look at the 'getting started' part of the [Atlassian Git Introduction](https://www.atlassian.com/git/tutorials/setting-up-a-repository) before the first lab.

## Allowable packages

The packages and external libraries (aka all of the code you did not write yourself) you can use are limited. The packages below, and the packages they require, are all you are permitted to use. It is notable that a database is **NOT** permitted to be used; the data in this course is sufficiently simple for in-memory manipulation using the features built into the programming language. Essentially if you are typing ```npm install``` it is probably not permitted.

* [typescript](https://www.npmjs.com/package/typescript)
* [coffeescript](https://www.npmjs.com/package/coffee-script)
* [restify](https://www.npmjs.com/package/restify)
* [jszip](https://www.npmjs.com/package/jszip)

## Configuring your environment

To start using this project you need to get your computer configured so you can build and execute the code. This process should be largely similar to the ```cpsc310starter``` repo used during the first lab. To do this, follow these steps; the specifics of each step (especially the first two) will vary based on which operating system your computer has:

1. Install git (you should be able to execute ```git -v``` on the command line).

1. Install Node, which will also install NPM (you should be able to execute ```node -v``` and ```npm -v``` the command line).

1. Clone the project: ```git clone git@github.com:CS310-2016Fall/cpsc310project_teamXXX.git``` (where ```XXX``` is your team number). You can also clone the repo by visiting your project in Github and getting the clone target by clicking on the green button on your project repository.

1. It is important that your project directory be called ```cpsc310project``` if you want to work with the public test suite we are providing. The easiest way to do this is to move it to the right name: ```mv cpsc310project_teamXXX cpsc310project``` (replacing ```XXX``` with your team number). ***NOTE:*** This is important or the public test suite will not work. The private test suite we run will do this automatically.


## Project commands

Once your project is configured you need to further prepare the project's tooling and dependencies. In the ```cpsc310project``` folder:

1. ```npm run clean```

1. ```npm run configure```

1. ```npm run build```

If you use Windows; instead try:

1. ```npm run cleanwin```

1. ```npm run configurewin```

1. ```npm run build```

### Executing the unit test suite

The sample project ships with some automated unit tests. These commands will execute the suites:
 
* Test: ```npm run test``` (or ```npm test```)
* Test coverage: ```npm run cover``` (or ```npm run coverwin``` if you use Windows). HTML reports can be found: ```./coverage/lcov-report/index.html```

You can also run the tests as a Mocha target inside your favourite IDE (WebStorm and VSCode both work well and are free for academic use); some students are also using Atom and Cloud9 (although this will require a bit of fiddling since it runs in the cloud).


### Executing the public test suite

Instructions for running the public suite will be included in your team's public suite repo.


### Executing the private test suite

To invoke the private suite, add a ```@CPSC310Bot``` mention to any commit in your main branch in Github. Remember: these are rate limited so choose your commits wisely. Additional details can be found in the AutoTest documentation.


### Starting the server

* ```npm run start```

You can then open the sample UI in your web browser by visiting [http://localhost:4321](http://localhost:4321). Alternatively, you can invoke the server using curl or some other tool that can hit your REST endpoints once the server is started.

## Developing your project

If you are developing in Typescript you will have to re-compile the Typescript code. This can be done with ```npm run build``` to build the system and get it ready to execute. New unit tests can be written and added to ```/test```; as long as the tests end in ```Spec.ts``` they will be executed automatically when you run ```npm run test```.

### Running and testing from an IDE

While these instructions are for WebStorm, other IDEs (e.g., VSCode, Atom, etc.) and editors (e.g., Sublime) should be similar, or will at least be compatible with the command line options described above.

To run or test the system in WebStorm you will need to configure run targets. To run the system go to the ```Run->Edit Configurations``` and tap on the ```+``` and then ```Node.js```. Point the 'JavaScript file' argument to ```src/App.js```. To run the system tests, go to the ```Run->Edit Configurations``` and tap on the ```+``` and then ```Mocha```. Point the 'Test Directory' file argument to ```test/```.


