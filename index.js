var axios = require('axios')
var crypto = require('crypto')

/**
 * API class
 * @class API
 */
class API {
    /**
     * constructor
     * @param {string} appKey app key
     * @param {string} appSecret app secret
     * @param {string} apiAddr app addr, http://host:port, https://host:port
     */
    constructor (appKey, appSecret, apiAddr) {
      if (!appKey || !appSecret || !apiAddr) {
        throw new Error('initialization failed, missing parameter...')
      }

      this.appKey = appKey
      this.appSecret = appSecret
      this.apiAddr = apiAddr
      this._nonceCount = 0
    }

    /**
     * create a new address
     * @param {string} coinType coin type, such as ETH, BTC
     * @return {string} coin address
     */
    async createAddress (coinType) {
        if (!coinType) {
            throw new Error('sorry, coinType must be nonempty')
        }
        let url = this.apiAddr + "/api/v1/address/"+coinType+"/new"
        var data = {
            timestamp: Number.parseInt(new Date().valueOf()/1000),
            nonce: this.generateNonce(),
        }
        let msg = _buidlMsg(data)
        var sign = crypto.createHmac('SHA256', this.appSecret).update(msg).digest('hex');
        data.sign = sign
    
        let result = await axios.post(url, data, {
            headers: {
                'Content-Type': 'application/json',
                'X-App-Key': this.appKey
            }
        })

        if (!!result.data.code) {
            throw new Error(JSON.stringify(result.data))
        }
        return result.data.data
    }

    /**
     * verify a address
     * @param {string} coinType such as ETH, BTC
     * @param {string} address address
     * @return {bool} true or false
     */
    async verifyAddress (coinType, address) {
        if (!coinType || !address) {
            throw new Error('sorry, coinType and address must be nonempty')
        }

        let url = this.apiAddr + "/api/v1/address/" + coinType + "/verify"
        var data = {
            timestamp: Number.parseInt(new Date().valueOf()/1000),
            nonce: this.generateNonce(),
            address: address
        }
        let msg = _buidlMsg(data)
        var sign = crypto.createHmac('SHA256', this.appSecret).update(msg).digest('hex');
        data.sign = sign

        let result = await axios.post(url, data, {
            headers: {
                'Content-Type': 'application/json',
                'X-App-Key': this.appKey
            }
        })
        if (!!result.data.code) {
            throw new Error(JSON.stringify(result.data))
        }
        return result.data.data.valid
    }

    /**
     * get asset list
     * @return {array} coin type list
     */
    async getAssets () {
        let url = this.apiAddr + "/api/v1/app/assets"
        var data = {
            timestamp: Number.parseInt(new Date().valueOf()/1000),
            nonce: this.generateNonce()
        }
        let msg = _buidlMsg(data)
        var sign = crypto.createHmac('SHA256', this.appSecret).update(msg).digest('hex');
        data.sign = sign
    
        let result = await axios.get(url, {
            params: data,
            headers: {
                'Content-Type': 'application/json',
                'X-App-Key': this.appKey
            }
        })

        if (!!result.data.code) {
            throw new Error(JSON.stringify(result.data))
        }
        return result.data.data.assets
    }

    /**
     * get app balance
     * @param {string} coinType such as ETH, BTC
     * @return {Object} 
     */
    async getBalance (coinType) {
        if (!coinType) {
            throw new Error('sorry, coinType must be nonempty')
        }
        let url = this.apiAddr + "/api/v1/app/balance/" + coinType
        var data = {
            timestamp: Number.parseInt(new Date().valueOf()/1000),
            nonce: this.generateNonce(),
        }
        let msg = _buidlMsg(data)
        var sign = crypto.createHmac('SHA256', this.appSecret).update(msg).digest('hex');
        data.sign = sign
        
        let result = await axios.get(url, {
            params: data,
            headers: {
                'Content-Type': 'application/json',
                'X-App-Key': this.appKey
            }
        })

        if (!!result.data.code) {
            throw new Error(JSON.stringify(result.data))
        }
        return result.data.data
    }

    /**
     * get order status
     * @param {string} id saas order id
     * @param {string} hash txid
     * @return {String} 
     */
    async getOrder (id, hash) {
        if (!id && !hash) {
            throw new Error('sorry, id or hash must be nonempty')
        }
        let url = this.apiAddr + "/api/v1/app/order/"+ id
        var data = {
            timestamp: Number.parseInt(new Date().valueOf()/1000),
            nonce: this.generateNonce()
        }
        let msg = _buidlMsg(data)
        var sign = crypto.createHmac('SHA256', this.appSecret).update(msg).digest('hex');
        data.sign = sign
    
        let result = await axios.get(url, {
            params: data,
            headers: {
                'Content-Type': 'application/json',
                'X-App-Key': this.appKey
            }
        })

        if (!!result.data.code) {
            throw new Error(JSON.stringify(result.data))
        }
        return result.data.data
    }

    /**
     * withdraw
     * @param {string} id withdraw request id, unique
     * @param {string} coinType coin type
     * @param {string} to withdraw address
     * @param {string} value withdraw value
     * @param {string} memo memo
     * @return {Object} 
     */
    async withdraw (id, coinType, to, value, memo) {
        if (!id || !coinType || !to || !value) {
            throw new Error('sorry, id & coinType & to & value must be nonempty')
        }
        if (isNaN(value)) {
            throw new Error('sorry, value must be a number')
        }

        let url = this.apiAddr + "/api/v1/app/" + coinType + "/withdraw"
        var data = {
            timestamp: Number.parseInt(new Date().valueOf()/1000),
            nonce: this.generateNonce(),
            to: to,
            value: value,
            memo: memo,
            id: id
        }
        let msg = _buidlMsg(data)
        var sign = crypto.createHmac('SHA256', this.appSecret).update(msg).digest('hex');
        data.sign = sign
        
        let result = await axios.post(url, data, {
            headers: {
                'Content-Type': 'application/json',
                'X-App-Key': this.appKey
            }
        })

        if (!!result.data.code) {
            throw new Error(JSON.stringify(result.data))
        }
        return result.data.data
    }

    generateNonce() {
        this._nonceCount++
        let timestamp = new Date().valueOf()
        let rand = Math.round(Math.random() * timestamp)
        return ('' + timestamp + this._nonceCount + rand)
    }
}

function _buidlMsg(obj) {
    var keys = Object.keys(obj)
    keys.sort()
    let keyVals = []
    for (let i = 0; i < keys.length; i++) {
        let key = keys[i]
        keyVals.push(key + "=" + obj[key])
    }
    return keyVals.join('&')
}

module.exports = API