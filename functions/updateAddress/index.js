const validate = require('uuid-validate')
const AWS_dynamodb = require('aws-sdk/clients/dynamodb')
let dynamodb = new AWS_dynamodb()

exports.handle = function (e, ctx) {
  if (validate(e.userid, 4) === false) {
    return ctx.fail('invalid userid supplied')
  }
  if (validate(e.addressid, 4) === false) {
    return ctx.fail('invalid adressid supplied')
  }
  if (!e.body || !e.body.data || !e.body.tscs || Array.isArray(e.body.tscs) === false || e.body.tscs.length < 1) {
    return ctx.fail('invalid body supplied')
  }

  dynamodb.updateItem({
    TableName: 'bk_addresses', // TODO move to config
    Key: {
      _id: {
        S: e.addressid
      },
      userid: {
        S: e.userid
      }
    },
    AttributeUpdates: {
      data: {
        Action: 'PUT',
        Value: {
          S: e.body.data
        }
      },
      tscs: {
        Action: 'PUT',
        Value: {
          SS: e.body.tscs
        }
      }
    },
    ReturnValues: 'ALL_NEW',
    ReturnConsumedCapacity: 'NONE'
  }, (err, result) => {
    if (err) {
      console.log(err)
      return ctx.fail('error')
    }
    ctx.succeed({
      _id: result.Attributes._id.S,
      data: result.Attributes.data.S,
      tscs: result.Attributes.tscs.SS
    })
  })
}