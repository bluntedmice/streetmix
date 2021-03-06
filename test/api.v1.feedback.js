'use strict'

var path = require('path')
var test = require('tape-catch')
var request = require('supertest')
var proxyquire = require('proxyquire')

var transmission = {
  message: 'Hello!',
  from: 'test@streetmix.net',
  additionalInformation: 'User agent'
}

function setupMockServer () {
  var express = require('express')
  var bodyParser = require('body-parser')
  var app = express()

  var sendgridStub = function (username, password) {
    // Normally, sendgrid expects username and password. We are not testing
    // authentication here, so the stub throws credentials away.
    return {
      send: function (data, callback) {
        // Throw data away and executes callback, passing null to err
        // and empty string to response to simulate success
        callback(null, '')
      }
    }
  }

  // Intercept feedback's logger & stubs logs with noops. It doesn't really
  // provide any useful information other than what the test output will give us.
  var loggerStub = function () {
    return {
      info: function () {},
      error: function () {}
    }
  }

  // Proxy-requires feedback controller, stubbing SendGrid client library & logger
  var feedback = proxyquire(path.join(process.cwd(), '/app/resources/v1/feedback'), {
    'sendgrid': sendgridStub,
    '../../../lib/logger.js': loggerStub
  })

  // Need body-parser middleware to handle JSON request body
  app.use(bodyParser.json())
  app.post('/api/v1/feedback', feedback.post)

  return app
}

test('post api/v1/feedback', function (t) {
  t.plan(2)

  var app = setupMockServer()

  // Post to feedback with transmission
  request(app)
    .post('/api/v1/feedback/')
    .type('json')
    .send(JSON.stringify(transmission))
    .end(function (err, res) {
      if (err) {
        t.error(err)
      }

      t.equal(res.statusCode, 202, 'should respond with 202 accepted when message is sent')
    })

  // Post to feedback with invalid transmission
  request(app)
    .post('/api/v1/feedback/')
    .type('json')
    .send('')
    .end(function (err, res) {
      if (err) {
        t.error(err)
      }

      t.equal(res.statusCode, 400, 'should respond with 400 bad request when no message is sent')
    })
})
