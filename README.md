# @ngrey5/odbc

Utility package based of the standard `odbc` package. This package is meant to provide easier typing and functionality that might be lacking from the base package.

## Requirements

The setup below refers to the requirments details from the standard `odbc` package and are subject to change.

- unixODBC binaries and development libraries for module compilation
  - on Ubuntu/Debian `sudo apt-get install unixodbc unixodbc-dev`
  - on RedHat/CentOS `sudo yum install unixODBC unixODBC-devel`
  - on OSX
    - using macports.org `sudo port unixODBC`
    - using brew `brew install unixODBC`
  - on IBM i `yum install unixODBC unixODBC-devel` (requires [yum](http://ibm.biz/ibmi-rpms))
- odbc drivers for target database
- properly configured odbc.ini and odbcinst.ini.

## Installation

After insuring that all requirements are installed you may install by using the following npm command:

```bash
npm install @ngrey5/odbc
```

## Documentation

### ODBCConnection

- [Creating a Connection](#creating-a-connection)
- [connect](#connect)
- [query](#query)
- [callProcedure](#callprocedure)
- [createStatement](#createstatement)
- [tables](#tables)
- [columns](#columns)
- [cursor](#cursor)
- [setIsolationLevel](#setisolationlevel)
- [beginTransaction](#begintransaction)
- [commit](#commit)
- [rollback](#rollback)
- [close](#close)
- [wrapConnection](#wrapconnection)

### ODBCPool

- [Creating a Pool](#creating-a-pool)
- [Pool Options](#pool-options)
- [init](#init)
- [connect](#connect-1)
- [query](#query-1)
- [close](#close-1)

### ODBCCursor

- [fetch](#fetch)
- [noData](#nodata)
- [read](#read)
- [close](#close-2)

### ODBCStatement

- [prepare](#prepare)
- [bind](#bind)
- [execute](#execute)
- [close](#close-3)

### Results

- [ODBCResult](#odbcresult)
- [ODBCError](#odbcerror)

### Modifiers

- [ODBCConnectionModifier](#odbcconnectionmodifier)

### Types

- [ODBCQueryParameter](#odbcqueryparameter)
- [ODBCQueryParameters](#odbcqueryparameters)
- [ODBCQueryOptions](#odbcqueryoptions)
- [ODBCCursorOptions](#odbccursoroptions)
- [ODBCCallProcedureOptions](#odbccallprocedureoptions)
- [ODBCTablesOptions](#odbctablesoptions)
- [ODBCColumnsOptions](#odbccolumnsoptions)
- [ODBCResultPipe](#odbcresultpipe)
- [ODBCQueryPipe](#odbcquerypipe)

## ODBCConnection

Creates a connection to an ODBC data source

### Creating a Connection

There are a multitude of ways to create an odbc connection:

#### 1. Standard Class Constructor

```ts
const connection = new ODBCConnection();
await connection.connect(CONNECTION_STRING);
```

#### 2. Async static method

```ts
const connection = await ODBCConnection.create(CONNECTION_STRING);
```

#### 3. Helper function

```ts
const connection = await createODBCConnection(CONNECTION_STRING);
```

### `connect`

Initializes the connection to the ODBC connection string provided

```ts
await connection.connect(CONNECTION_STRING);
```

### `query`

Executes a query on the open odbc connection.

Parameters:

- statement: `string` - The sql statement
- parameters: [ODBCQueryParameters](#odbcqueryparameters) - The parameters to bind to the statement
- options: [ODBCQueryOptions](#odbcqueryoptions) - The options to apply to the query execution

All values passed to `parameters` will be bound to any `?`'s found in the statement. The number of parameters must match the number of bound characters in the statement.

```ts
const query = `SELECT * FROM "Table" WHERE "column" = ?`;
const parameters = ["value"];
const result = await connection.query(query, parameters);
```

### `callProcedure`

Calls a procedure defined on the database. Takes an [ODBCCallProcedureOptions](#odbccallprocedureoptions) object

```ts
const result = await connection.callProcedure(options);
```

### `createStatement`

Creates an [ODBCStatement](#odbcstatement) class from the connection

```ts
const statement = await connection.createStatement();
```

### `tables`

Calls a procedure defined on the database. Takes an [ODBCTablesOptions](#odbctablesoptions) object

```ts
const result = await connection.tables(options);
```

### `columns`

Calls a procedure defined on the database. Takes an [ODBCColumnsOptions](#odbccolumnsoptions) object

```ts
const result = await connection.columns(options);
```

### `cursor`

Creates an [ODBCCursor](#odbcursor) class from the connection

Parameters:

- statement: `string` - The statement to execute
- parameters: [ODBCQueryParameters](#odbcqueryparameters) - The parameters to bind to the statement
- options: [ODBCQueryOptions](#odbcqueryoptions) - the options to apply to the query exection

```ts
const cursor = await connection.cursor(`SELECT * FROM "Table"`);
```

### `setIsolationLevel`

Sets the isolation level of the connection. Use [ODBCIsolationLevel](#odbcisolationlevel) enum for
name isolation levels

```ts
await connection.setIsolationLevel(ODBCIsolationLevel.Serializable);
```

### `beginTransaction`

Opens a transaction on the current connection. Can be optionally passed an isolation level to set the isolation of the transaction

```ts
await connection.beginTransaction(ISOLATION_LEVEL);
```

### `commit`

Commits the changes made on the open transaction. If no transaction is open this method will do nothing

```ts
await connection.commit();
```

### `rollback`

Rolls back the changes made on the open transaction. If no transaction is open this method will do nothing

```ts
await connection.rollback();
```

### `close`

Closes the current connection. If a transaction is in progress, it will automatically call `rollback` before closing

```ts
await connection.close();
```

### `wrapConnection`

Wraps a connection created from the base `odbc` package inside this package's [ODBCConnection](#odbconnection) class. This function is used by [ODBCPool](#odbcpool) to return the connection class. It is being exposed for any possible use.

```ts
import odbc from "odbc";
const connection = await odbc.connect(CONNECTION_STRING);
const connectionClass = new ODBCConnection();
connectionClass.wrapConnection(connection);
```

## ODBCPool

Creates a connection pool to an ODBC data source

### Creating a Pool

There are a multitude of ways to create an odbc connection pool:

#### 1. Standard Class Constructor

```ts
const pool = new ODBCPool();
await pool.init({
  connectionString: CONNECTION_STRING,
});
```

#### 2. Async static method

```ts
const connection = await ODBCPool.create({
  connectionString: CONNECTION_STRING,
});
```

#### 3. Helper function

```ts
const connection = await createODBCPool({
  connectionString: CONNECTION_STRING,
});
```

### Pool Options

Options can be set on the connection pool

- connectionString: `string` - the connection string to the data source
- connectionTimeout: `number` - the number of seconds the connection should wait before a timeout
- loginTimeout: `number` - the number of seconds a login should wait before a timeout
- initialSize: `number` - the initial number of connections to be created by the pool
- incrementSize: `number` - the number of connection that the pool should add when all connections are currently in use
- maxSize: `number` - the max number of connection to allow within the pool
- shrink: `boolean` - if the pool should remove additional connections when they are not being used

### `init`

Intializes the database pool with options

```ts
await pool.init(POOL_OPTIONS);
```

### `connect`

Gets an [ODBCConnection](#odbconnection) from the pool and returns it for use

```ts
const connection = await pool.connect();
```

### `query`

Utility function to execute a query on an open connection in the pool. This method will get a connection, execute the query, return the result set, and return the connection to the pool

Refer to [ODBCConnection](#odbconnection)`.query` for all available options to supply to this method. They are effectively the same invocation

```ts
const query = `SELECT * FROM "Table"`;
const result = await pool.query(query);
```

### `close`

Closes the entire database pool. Any connection that are currently in progress will no be closed. When those connection are closed they will be discarded

```ts
await pool.close();
```

## ODBCCursor

A cursor created by the [ODBCConnection](#odbconnection)`.cursor` method. Used to retrieve partial data from an overarching dataset that would normally by returned from the entire query

### `fetch`

Fetches a data of length specified by the `fetchSize` set on the cursor. If no data is remaining it will return an empty array

```ts
const result = await cursor.fetch();
```

### `noData`

If the cursor has no data remaining to fetch. Cannot return a true value unless `fetch` has been called at least once

```ts
while (!cursor.noData()) {
  const result = await cursor.fetch();
}
```

### `read`

Reads each result set with `fetch` and returns the result to the callback function provided.

```ts
cursor.read((result, error) => {
  if (error) {
    // react to an error
  }
  // do something with each result
});
```

### `close`

Closes the cursor

```ts
await cursor.close();
```

## ODBCStatement

A statement created from [ODBCConnection](#odbconnection)`.createStatement` method. Allows preparing of a commonly used statement and binding parameters to it multiple times.

### `prepare`

Prepares an SQL statement with or without parameters to bind to

```ts
const query = `SELECT * FROM "Table" WHERE "column" = ?`;
await statement.prepare(query);
```

### `bind`

Binds an array of values to the parameters on the prepared SQL statement created with `prepare`. Cannot be called before `prepare`

```ts
const query = `SELECT * FROM "Table" WHERE "column" = ?`;
await statement.prepare(query);
await statement.bind(["column-value"]);
```

### `execute`

Executes the prepared and optionally bound statement

```ts
const result = await statement.execute();
```

### `close`

Closes the statement, freeing the statement handle. Calling methods after closing will result in an error

Note: this will not close the connection the statement was created on

```ts
await statement.close();
```

## ODBCResult

All queries and calls invoked on a connection will return a result of this type.

Values:

- rows: `array` - the resulting rows from the database execution
- count: `number` - the number of rows affected by the execution. Note: this is not the length of the rows array
- fields: `ColumnDefinition` - the definitions of the fields returned by the execution
- statement: `string` the statement executed
- parameters: `ODBCQueryParameters` The array of parameters passed to the statement. For input/output or output parameters on a procedure, this value will reflect the output values of the procedure
- return: `unknown` The return value of some procedures. For many DBMS this will always be undefined
- length: `number` the length of the rows array

## ODBCError

Any error thrown by this package will be this error class

Values:

- query: information pertaining to the query the attempted to execute
- errors: odbc errors provided directly from the standard `odbc` package
- name: the name of the error
- message: the message of the error
- stack: the error stack of the error

## ODBCConnectionModifier

A modification to an ODBC connection. A modifier can be specific to a `ODBCPool`, `ODBCConnection`, `ODBCCursor`, or `ODBCStatement`

If a modifier is applied to an `ODBCPool`, it will be applied to all connections on that pool

If a modifier is applied to an `ODBCConnection` it will be applied to all actions on that connection. i.e cursors and statements

Takes a config object of type `ODBCConnectionModifierOptions` to supply transformations on the data received and returned from the connection

```ts
const options: ODBCConnectionModifierOptions = {
  resultPipes: [
    // pipes the data returned from calls to the database
  ],
  queryPipes: [
    // pipes the query and parameters supplied to any calls
  ],
};

pool.useConnectionModifier(new ODBCConnectionModifier(options));
connection.useConnectionModifier(new ODBCConnectionModifier(options));
```

## Types

### ODBCQueryParameter

Defined the types available to supply to a query parameter array

### ODBCQueryParameters

Shorthand type for `ODBCQueryParameter[]`

### ODBCQueryOptions

Options to supply to a `.query` method on a `ODBCPool` or `ODBCConnection`

### ODBCCursorOptions

Options to set on an `ODBCCursor`

### ODBCCallProcedureOptions

Options to set on a `.callProcedure` method on a `ODBCConnection`

### ODBCTablesOptions

Options to set on a `.tables` method on a `ODBCConnection`

### ODBCColumnsOptions

Options to set on a `.columns` method on a `ODBCConnection`

### ODBCResultPipe

Function type to supply to the `resultPipes` array of a `ODBCConnectionModifier`

### ODBCQueryPipe

Function type to supply to the `queryPipes` array of a `ODBCConnectionModifier`

## Notes

This documentation is not very verbose. It is a small project intended for a very opinionated setup and implementation of the **odbc** package.

You may benefit from using the **_odbc_** package directly instead of this. However, feel free to use as you'd like.

## License

Copyright (c) 2022 Nick Grey

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
