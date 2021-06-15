# @ngrey5/odbc

Wrapper for the **_odbc_** package that provides setup out-of-the-box. Written in typescript and supplies types natively.

## requirements

- unixODBC binaries and development libraries for module compilation
  - on Ubuntu/Debian `sudo apt-get install unixodbc unixodbc-dev`
  - on RedHat/CentOS `sudo yum install unixODBC unixODBC-devel`
  - on OSX
    - using macports.org `sudo port unixODBC`
    - using brew `brew install unixODBC`
  - on IBM i `yum install unixODBC unixODBC-devel` (requires [yum](http://ibm.biz/ibmi-rpms))
- odbc drivers for target database
- properly configured odbc.ini and odbcinst.ini.

## install

After insuring that all requirements are installed you may install by using the following npm command:

### npm

```bash
npm install @ngrey5/odbc
```

## quick example

### Javascript

```javascript
// Typescript
// import {createConnection} from "@ngrey5/odbc"

const createConnection = require("@ngrey5/odbc").createConnection;

async function init() {
  const connection = await createConnection({ DSN: "DSN_NAME" });

  try {
    const result = await connection.query("SELECT * FROM TABLE");
    console.log(result);
  } catch (error) {
    console.log(error);
  }
}
```

## API

- Classes
  - ODBCConnection
  - ODBCConnectionPool
- Functions
  - createConnection
  - createPool

#### Result From Query

- queryOne - returns a single object. Null if not object.
- queryMany - returns an array of objects. Empty if none.
- query - returns an array of objects. Empty if none.

## ODBCConnection

Creates a new class containing the connection and functions on that connection.

## ODBCConnectionPool

Creates a new class containing a connection pool, and the ability to get and ODBCConnection from the pool to run functions on that connection.

## createConnection

Function that returns a promise of a created ODBCConnection class.

## createPool

Function that returns a promise of a created ODBCConnectionPool class.

## Note

This documentation is not very verbose. It is a small project intended for a very opinionated setup and implementation of the **odbc** package.

You may benefit from using the **_odbc_** package directly instead of this. However, feel free to use as you'd like.

## license

Copyright (c) 2021 Nick Grey

Permission is hereby granted, free of charge, to any person obtaining a copy of
this software and associated documentation files (the "Software"), to deal in
the Software without restriction, including without limitation the rights to
use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of
the Software, and to permit persons to whom the Software is furnished to do so,
subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS
FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR
COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER
IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN
CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
