'use strict';

const AWS = require('aws-sdk');
AWS.config.update({ region: 'eu-west-2' });

const client = new AWS.DynamoDB.DocumentClient({ apiVersion: '2012-08-10' });

const params = {
  TableName: 'nz-data',
  Key: { 'id': 'test', 'time': 'now' }
};

module.exports.query = async (event, context) => {

  const resp = await new Promise((resolve, reject) => {
    client.get(params, (err, data) => {
      if (err) {
        reject(err)
      } else {
        resolve(data)
      }
    });
  })


  return {
    statusCode: 200,
    body: "stuff: " + JSON.stringify(resp)
  }
}

module.exports.hello = async (event, context) => {
  return {
    statusCode: 200,
    body: JSON.stringify({
      message: 'Go Serverless v1.0! Your function executed successfully!',
      input: event,
    }),
  };

  // Use this code if you don't use the http event with the LAMBDA-PROXY integration
  // return { message: 'Go Serverless v1.0! Your function executed successfully!', event };
};
