# README #

This README would normally document whatever steps are necessary to get your application up and running.

### What is this repository for? ###

* Quick summary
* Version
* [Learn Markdown](https://bitbucket.org/tutorials/markdowndemo)

### How do I get set up? ###

* Summary of set up
* Configuration
* Dependencies
* Database configuration
* How to run tests
* Deployment instructions

### Contribution guidelines ###

* Writing tests
* Code review
* Other guidelines

### Who do I talk to? ###

* Repo owner or admin
* Other community or team contact

Compiling mostngk6x
To compile mostngk6x extension, first compile mostngk6x.go using this command
go mod init mostngk6x
go mod tidy

Create mostngk6x extension
To create mostngk6x extension use this command
xk6 build --with mostngk6x=.
xk6 build --with github.com/grafana/xk6-dashboard --with github.com/avitalique/xk6-file --with github.com/grafana/xk6-sql --with github.com/denyshuzovskyi/xk6-sql-driver-oracle --with github.com/grafana/xk6-sql-driver-postgres --with github.com/stefnedelchevbrady/xk6-sql-with-oracle 
--with mostngk6x=.