# DB Homework 7

This is the source project for the CMU 15-415 *Database Applications* course.

- code by Hong Bin Shim
- tests by Jiayu Liu

## How to compile test code (`coffee` to js)

Just `cd` into `tests` folder, and call `make`.

You must have `node.js`, `coffeescript`, and `uglify.js` installed.

## How to run the project within Docker

Notice: you don't have to do this if you are comfortable with running it on the CMU CC hosted environment.

### Goal

To host Apache+PostgreSQL environment locally instead of in CMU CC cluster, so that the process is more isolated and less error-prone.

### Prerequisites

Docker has to be installed: https://docs.docker.com/installation/#installation
That means some sudo apt-get for linux and running a linux virtual machine locally for Mac (there's a GUI tool).

### How to run (in 2 steps)

#### Step 1

For HW7 you'll have to normalize the database config for each student:

`cd` into code directory, edit `config.php`, replace it with:

```php
$home = '/';

$MY_HOST = 'localhost';
$MY_DB_PORT = 5432;
$MY_DB = "postgres";
$DB_USER = "postgres";
$DB_PW = "change@this*passw0rd";
```

Step 2
After that, just run:

```bash
docker run --rm -p 80:80 -p 5432:5432 -v `pwd`:/app brunoric/docker-apache2-php-postgresql
```

And pointing your browser to the docker container's address/port 80 (you can see it visually in Mac's GUI, or use docker inspect to find out), you'll find the website up and running.

(That command means, run docker container with port mapping for 80 and 5432 which monitors the current directory for Apache).

Note that after you press Ctrl+C, the docker container will be removing itself (the `--rm` param), so the next time you run, the database will be brand new.
