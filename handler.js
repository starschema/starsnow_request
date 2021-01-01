// BSD 3-Clause License

// Copyright (c) 2020, Starschema Limited
// All rights reserved.

// Redistribution and use in source and binary forms, with or without
// modification, are permitted provided that the following conditions are met:

// 1. Redistributions of source code must retain the above copyright notice, this
//    list of conditions and the following disclaimer.

// 2. Redistributions in binary form must reproduce the above copyright notice,
//    this list of conditions and the following disclaimer in the documentation
//    and/or other materials provided with the distribution.

// 3. Neither the name of the copyright holder nor the names of its
//    contributors may be used to endorse or promote products derived from
//    this software without specific prior written permission.

// THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS"
// AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE
// IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE
// DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT HOLDER OR CONTRIBUTORS BE LIABLE
// FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL
// DAMAGES (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR
// SERVICES; LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER
// CAUSED AND ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY,
// OR TORT (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE
// OF THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.

'use strict';

var _ = require('lodash/core');
const axios = require('axios');

/**
 *
 * Call axios with the user supplied url and parameters.
 * 
 * More informaion about axios config (params) can be found [here](https://github.com/axios/axios#request-config)
 * 
 * @param {string} url URL to invoke
 * @param {object} params axios config object
 * @returns {Promise} Promise object that contains the entire axios response
 */
const makeRequest = (url, params) => {
  const config = _.defaults(params, { method: 'get' }, { url: url })

  if (!config['url']) {
    return Promise.reject({ errorCode: 1, message: `URL parameter cannot be empty.` })
  }

  return axios(config)
    .then(response => {
      return _.pick(response, ["headers", "status", "statusText", "data"])
    })
    .catch(error => {
      return {
        errorCode: 2
        , message: `cannot retrieve url "${url}": ${error}.`
        , request: params
      }
    })

}

module.exports.starsnowRequest = async event => {
  const body = JSON.parse(event.body);


  return await Promise.all(

    body.data.map((row) => makeRequest(row[1], row[2]))

  ).then((ret) => {

    return {
      statusCode: 200,
      body: JSON.stringify(
        {
          data: ret.map((v, idx) => [idx, v])
        }
      )
    }

  }).catch(error => {
    return {
      statusCode: 500,
      body: JSON.stringify(error)
    }
  })

}

module.exports.starsnowRequestGet = async event => {
  const body = JSON.parse(event.body);


  return await Promise.all(

    body.data.map((row) => makeRequest(row[1], {}))

  ).then((ret) => {

    return {
      statusCode: 200,
      body: JSON.stringify(
        {
          data: ret.map((v, idx) => [idx, v.data])
        },
      )
    }

  }).catch(error => {
    return {
      statusCode: 500,
      body: JSON.stringify(error)
    }
  })

}
