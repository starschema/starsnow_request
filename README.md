# StarSnow Request  ![Integration tests](https://github.com/starschema/starsnow_request/workflows/Deploy%20master%20branch/badge.svg)

HTTP Client for Snowflake database (HTTP get/post from SQL)

The idea is simple: invoke HTTP/HTTPS web servers directly from Snowflake Database SQL statements using pre-deployed, generic external functions. Built on top of [Axios](https://github.com/axios/axios).



## Examples

Simple HTTP get. varchar input (URL), varchar return (content of the site):

```sql
select STARSNOW_REQUEST_GET('https://google.com/') as google_content;
```

Get Snowflake system status. Select value from the result `variant`:

```sql
select STARSNOW_REQUEST('https://status.snowflake.com/api/v2/status.json', NULL):data:status:description as snowflake_status;
```
![](https://user-images.githubusercontent.com/82426/103464558-df01b000-4d34-11eb-8228-4e7d16e81875.png)

Get Snowflake historical stock values:

```sql
select key, value:"4. close"::float
from TABLE (FLATTEN(
        input => STARSNOW_REQUEST('https://www.alphavantage.co/query',
                                  object_construct('method', 'get',
                                                   'params', object_construct(
                                                           'function', 'TIME_SERIES_DAILY_ADJUSTED',
                                                           'symbol', 'SNOW',
                                                           'apikey', '<your_alphavantage_key>'))
            ): data:"Time Series (Daily)"));
```
![](https://user-images.githubusercontent.com/82426/103464555-db6e2900-4d34-11eb-82f5-cc54112243cb.png)

## StarSnow Request API 

The package contains two functions: `STARSNOW_REQUEST_GET` and `STARSNOW_REQUEST`.

**`varchar STARSNOW_REQUEST_GET(url VARCHAR)`**

The function takes one string argument (url) and returns with the content of that web address. It supports only `get` method and no custom headers.  

**`variant STARSNOW_REQUEST(url VARCHAR, params OBJECT)`**

The function takes and url and an parameters object that passed as an [axios configuration](https://github.com/axios/axios#request-config) to request. The following configuration properties are supported:


```sql
object_construct(
  -- `url` is the server URL that will be used for the request
  'url', '/user',

  -- `method` is the request method to be used when making the request
  'method', 'get', -- default

  -- `headers` are custom headers to be sent
  'headers', object_construct('X-Requested-With', 'XMLHttpRequest'),

  -- `params` are the URL parameters to be sent with the request
  -- Must be a plain object 
  'params', object_construct(
    'ID', 12345
  ),

  -- `data` is the data to be sent as the request body
  -- Only applicable for request methods 'PUT', 'POST', 'DELETE , and 'PATCH'
  'data', object_construct(
    'firstName', 'Fred'
  ),
  
  -- syntax alternative to send data into the body
  -- method post
  -- only the value is sent, not the key
  'data', 'Country=Brasil&City=Belo Horizonte',

  -- `timeout` specifies the number of milliseconds before the request times out.
  -- If the request takes longer than `timeout`, the request will be aborted.
  'timeout', 1000, -- default is `0` (no timeout)

  -- `auth` indicates that HTTP Basic auth should be used, and supplies credentials.
  -- This will set an `Authorization` header, overwriting any existing
  -- `Authorization` custom headers you have set using `headers`.
  -- Please note that only HTTP Basic auth is configurable through this parameter.
  -- For Bearer tokens and such, use `Authorization` custom headers instead.
  'auth', object_construct(
    'username', 'janedoe',
    'password', 's00pers3cret'
  ),

  -- `responseType` indicates the type of data that the server will respond with
  -- options are: 'arraybuffer', 'document', 'json', 'text', 
  'responseType', 'json', -- default

  -- `responseEncoding` indicates encoding to use for decoding responses
  'responseEncoding', 'utf8', -- default

  -- `maxContentLength` defines the max size of the http response content in bytes allowed in node.js
  'maxContentLength', 2000,

  -- `maxBodyLength` defines the max size of the http request content in bytes allowed
  'maxBodyLength', 2000,

  -- `maxRedirects` defines the maximum number of redirects to follow in node.js.
  -- If set to 0, no redirects will be followed.
  'maxRedirects', 5, -- default

  -- `proxy` defines the hostname, port, and protocol of the proxy server.
  -- You can also define your proxy using the conventional `http_proxy` and
  -- `https_proxy` environment variables. If you are using environment variables
  -- for your proxy configuration, you can also define a `no_proxy` environment
  -- variable as a comma-separated list of domains that should not be proxied.
  -- Use `false` to disable proxies, ignoring environment variables.
  -- `auth` indicates that HTTP Basic auth should be used to connect to the proxy, and
  -- supplies credentials.
  -- This will set an `Proxy-Authorization` header, overwriting any existing
  -- `Proxy-Authorization` custom headers you have set using `headers`.
  -- If the proxy server uses HTTPS, then you must set the protocol to `https`. 
  'proxy', object_construct(
    'protocol', 'https',
    'host', '127.0.0.1',
    'port', 9000,
    'auth', object_construct(
      'username', 'mikeymike',
      'password', 'rapunz3l'
    ),
  ),


  -- `decompress` indicates whether or not the response body should be decompressed 
  -- automatically. If set to `true` will also remove the 'content-encoding' header 
  -- from the responses objects of all decompressed responses
  'decompress', true -- default
)
```

See examples on how to construct snowflake objects from SQL statements.

On successful execution, the status code, headers and data are returned in single variant. 


## Deploying

To deploy, clone the repo, then:

```
$ npm install serverless -g
$ npm install
$ vim serverless.yml # edit your snowflake account details
$ sls deploy
```

Then, the functions should be available in your snowflake account.

## License, Copyright

BSD License, Starschema Inc, 2020
