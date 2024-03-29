var util = require('util');
var querystring = require("querystring");
var request = require('request');
base = require("./base.js");


function Wallet(accessToken) {
  this.sendAuthenticatedRequest = function(params, callback) {
    params.headers = {
      "Authorization": "Bearer " + accessToken
    };
    base.sendUnauthenticatedRequest(params, callback);
  };

  this.accountInfo = function(callback) {
    this.sendAuthenticatedRequest({
      url: "/api/account-info"
    }, callback);
  };

  this.operationHistory = function(options, callback) {
    this.sendAuthenticatedRequest({
      url: "/api/operation-history",
      data: options
    }, callback);
  };

  this.operationDetails = function(operation_id, callback) {
    this.sendAuthenticatedRequest({
      url: "/api/operation-details",
      data: {operation_id: operation_id}
    }, callback);
  };

  this.requestPayment = function(options, callback) {
    this.sendAuthenticatedRequest({
      url: "/api/request-payment",
      data: options
    }, callback);
  };

  this.processPayment = function(options, callback) {
    this.sendAuthenticatedRequest({
      url: "/api/process-payment",
      data: options
    }, callback);
  };

  this.incomingTransferAccept = function(operation_id, protectionCode,
      callback) {
    this.sendAuthenticatedRequest({
      url: "/api/incoming-transfer-accept",
      data: {
        "operation_id": operation_id,
        "protection_code": protectionCode || undefined
      }
    }, callback);
  };

  this.incomingTransferReject = function(operation_id,
      callback) {
    this.sendAuthenticatedRequest({
      url: "/api/incoming-transfer-reject",
      data: {
        "operation_id": operation_id,
      }
    }, callback);
  };

}


Wallet.buildObtainTokenUrl = function (clientId, redirectURI, scope, instance_name){
  var query_string = querystring.stringify({
    client_id: clientId,
      instance_name: instance_name,
      redirect_uri: redirectURI,
      scope: scope.join(' '),
      response_type: "code"
  });
  return util.format("%s/oauth/authorize?%s",
      base.Config.SP_MONEY_URL, query_string);
};

Wallet.getAccessToken = function (clientId, code, redirectURI, clientSecret,
    callback) {
  var full_url = base.Config.MONEY_URL + "/oauth/token";
  request.post({
    "url": full_url,
    "form": {
      "code": code,
      "client_id": clientId,
      "grant_type": "authorization_code",
      "redirect_uri": redirectURI,
      "client_secret": clientSecret
    }
  }, base.processResponse(callback)
  );

};

Wallet.revokeToken = function(token, revoke_all, callback) {
  base.sendUnauthenticatedRequest({
    url: "/api/revoke",
    data: {
      "revoke_all": revoke_all
    },
    headers: {
      "Authorization": "Bearer " + token
    }
  }, callback);
};

module.exports.Wallet = Wallet;
