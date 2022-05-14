<h1 align="center"> Node.js cex HD Wallet Api </h1>
<p align="center">Node.js module for creating hd wallets and performing other blockchain operations</p>
<P ALIGN="ceter"> useful link https://en.bitcoin.it/wiki/List_of_address_prefixes </p>


<h2>Install</h2>

```sh
npm i cex
```
<h2>Usage</h2>

```js
const acrexs = require("cex")

// Takes in a wallet name that will be stored on the db and create BTC mnemonics
// return false if walletname already exist
acrexs.createBTCHdWallet(wallet_name).then(
    (result) => {
        console.log(result)
    }
).catch(
    (err) => {
        console.error(err)
    }
)

// Takes in a wallet name that will be stored on the db and create ETH mnemonics
// return false if walletname already exist
acrexs.createETHHdWallet(wallet_name).then(
    (result) => {
        console.log(result)
    }
).catch(
    (err) => {
        console.error(err)
    }
)


// Takes in a wallet name that will be stored on the db and create BSC mnemonics
// return false if walletname already exist
acrexs.createBSCHdWallet(wallet_name).then(
    (result) => {
        console.log(result)
    }
).catch(
    (err) => {
        console.error(err)
    }
)

// Takes in a wallet name that was stored on the db and generate BTC wallet address.
// return false if walletname doesnt exist
// returns BTC wallet address, it private key
acrexs.generateBTCAddress(wallet_name).then(
    (result) => {
        console.log(result)
    }
).catch(
    (err) => {
        console.error(err)
    }
)

// Takes in a wallet name that was stored on the db and generate ETH wallet address.
// return false if walletname doesnt exist
// returns BTC wallet address, it private key
acrexs.generateETHAddresses(wallet_name).then(
    (result) => {
        console.log(result)
    }
).catch(
    (err) => {
        console.error(err)
    }
)

// Takes in a wallet name that was stored on the db and generate BSC wallet address.
// return false if walletname doesnt exist
// returns BTC wallet address, it private key

acrexs.generateBSCAddresses(wallet_name).then(
    (result) => {
        console.log(result)
    }
).catch(
    (err) => {
        console.error(err)
    }
)

// Get metadata for a particular address
//all data relevant for using this address..
acrexs.getAddressMeta(pipeline, address).then(
    (result) => {
        console.log(result)
    }
).catch(
    (err) => {
        console.error(err)
    }
)

// get all wallet ON btc
acrexs.getAllBTCWallets().then(
    (result) => {
        console.log(result)
    }
).catch(
    (err) => {
        console.error(err)
    }
)

// get all wallet ON eth
acrexs.getAllETHWallets().then(
    (result) => {
        console.log(result)
    }
).catch(
    (err) => {
        console.error(err)
    }
)

// get all wallet ON BSC
acrexs.getAllBSCWallets().then(
    (result) => {
        console.log(result)
    }
).catch(
    (err) => {
        console.error(err)
    }
)

// transfer currencies
// pipeline : if "ETH" then it will transfer ETHER in Ethereum network
//          if "BSC" then it will transfer BNB in Binance smartchain network
//          if "BTC" then it will transfer BTC in Bitcoin Network
// sender address
// receiever address
// amount
// IF SENDER ADDRESS DOESNT EXIST, RETURN FALSE.
// // TransferBtc("ETH", "0x4BF815Ef22628bFe3988B16fC5819B0262C3d3A6", "0xC655114468c3a7bdCF7457c91cb5ab541e528Bf8", 15);
acrexs.Transfer(pipeline, senderAddress, recieverAddress, amount).then(
    (result) => {
        console.log(result)
    }
).catch(
    (err) => {
        console.error(err)
    }
)

// transfer USDT in both Ethereum and Binance network 
// pipeline : if "ETH" then it will transfer USDT in Ethereum network
//          if "BSC" then it will transfer USDT in Binance smartchain network
// sender address
// receiever address
// amount
// IF SENDER ADDRESS DOESNT EXIST, RETURN FALSE.
// // TransferBtc("ETH", "0x4BF815Ef22628bFe3988B16fC5819B0262C3d3A6", "0xC655114468c3a7bdCF7457c91cb5ab541e528Bf8", 15); 
acrexs.TransferUSDT(pipeline, senderAddress, recieverAddress, amount).then(
    (result) => {
        console.log(result)
    }
).catch(
    (err) => {
        console.error(err)
    }
)

// transfer BTC in both Ethereum and Binance network 
// pipeline : if "ETH" then it will transfer USDT in Ethereum network
//          if "BSC" then it will transfer USDT in Binance smartchain network
// sender address
// receiever address
// amount
// IF SENDER ADDRESS DOESNT EXIST, RETURN FALSE.
// // TransferBtc("ETH", "0x4BF815Ef22628bFe3988B16fC5819B0262C3d3A6", "0xC655114468c3a7bdCF7457c91cb5ab541e528Bf8", 15); 
acrexs.TransferBTC(pipeline, senderAddress, recieverAddress, amount).then(
    (result) => {
        console.log(result)
    }
).catch(
    (err) => {
        console.error(err)
    }
)

// transfer ETH in Binance network 
// sender address
// receiever address
// amount
// IF SENDER ADDRESS DOESNT EXIST, RETURN FALSE.
// // TransferBtc("ETH", "0x4BF815Ef22628bFe3988B16fC5819B0262C3d3A6", "0xC655114468c3a7bdCF7457c91cb5ab541e528Bf8", 15); 
acrexs.TransferETHOnBSC(senderAddress, recieverAddress, amount).then(
    (result) => {
        console.log(result)
    }
).catch(
    (err) => {
        console.error(err)
    }
)

// transfer BNB in ETHEREUM network 
// sender address
// receiever address
// amount
// IF SENDER ADDRESS DOESNT EXIST, RETURN FALSE.
// // TransferBtc("ETH", "0x4BF815Ef22628bFe3988B16fC5819B0262C3d3A6", "0xC655114468c3a7bdCF7457c91cb5ab541e528Bf8", 15); 
acrexs.TransferBNBOnETH(senderAddress, recieverAddress, amount).then(
    (result) => {
        console.log(result)
    }
).catch(
    (err) => {
        console.error(err)
    }
)

//Get the Balance on a particular address
// Verify/Specify that input address is BTC address
acrexs.getBTCAddressBalance(address).then(
    (result) => {
        console.log(result)
    }
).catch(
    (err) => {
        console.error(err)
    }
)

//Get the Balance on a particular address
// Verify/Specify that input address is ETH address
acrexs.getETHAddressBalance(address).then(
    (result) => {
        console.log(result)
    }
).catch(
    (err) => {
        console.error(err)
    }
)

//Get the Balance on a particular address
// Verify/Specify that input address is BSC address
acrexs.getBSCAddressBalance(address).then(
    (result) => {
        console.log(result)
    }
).catch(
    (err) => {
        console.error(err)
    }
)


// Delete address from a wallet
acrexs.deleteAddressFromBTCWallet(address).then(
    (result) => {
        console.log(result)
    }
).catch(
    (err) => {
        console.error(err)
    }
)

// Delete address from a wallet
acrexs.deleteAddressFromBSCWallet(address).then(
    (result) => {
        console.log(result)
    }
).catch(
    (err) => {
        console.error(err)
    }
)

// Delete address from a wallet
acrexs.deleteAddressFromETHWallet(address).then(
    (result) => {
        console.log(result)
    }
).catch(
    (err) => {
        console.error(err)
    }
)

// Delete Wallet_Name completely from the server
// name of wallet to destroy
acrexs.destroyBTCHdWallet(wallet_name).then(
    (result) => {
        console.log(result)
    }
).catch(
    (err) => {
        console.error(err)
    }
)

// Delete Wallet_Name completely from the server
// name of wallet to destroy
acrexs.destroyETHHdWallet(wallet_name).then(
    (result) => {
        console.log(result)
    }
).catch(
    (err) => {
        console.error(err)
    }
)

// Delete Wallet_Name completely from the server
// name of wallet to destroy
acrexs.destroyBSCHdWallet(wallet_name).then(
    (result) => {
        console.log(result)
    }
).catch(
    (err) => {
        console.error(err)
    }
)
//

// return associated details with the wallet name
acrexs.getBTCWalletMeta(wallet_name).then(
    (result) => {
        console.log(result)
    }
).catch(
    (err) => {
        console.error(err)
    }
)

// return associated details with the wallet name
acrexs.getETHWalletMeta(wallet_name).then(
    (result) => {
        console.log(result)
    }
).catch(
    (err) => {
        console.error(err)
    }
)

// return associated details with the wallet name
acrexs.getBSCWalletMeta(wallet_name).then(
    (result) => {
        console.log(result)
    }
).catch(
    (err) => {
        console.error(err)
    }
)

// Convert Btc to others equivalent
// other is the name of the asset to convert into
// 
// other should include: 
// - ETH || ether
// - BNB
// - USD
acrexs.getBTCToOthersRate(other).then(
    (result) => {
        console.log(result)
    }
).catch(
    (err) => {
        console.error(err)
    }
)

// - check if wallet exist on the db
// - if wallet exist it return true otherwise false
acrexs.checkBTCWalletExists(wallet_name).then(
    (result) => {
        console.log(result)
    }
).catch(
    (err) => {
        console.error(err)
    }
)

// - check if wallet exist on the db
// - if wallet exist it return true otherwise false
acrexs.checkBSCWalletExists(wallet_name).then(
    (result) => {
        console.log(result)
    }
).catch(
    (err) => {
        console.error(err)
    }
)

// - check if wallet exist on the db
// - if wallet exist it return true otherwise false
acrexs.checkETHWalletExists(wallet_name).then(
    (result) => {
        console.log(result)
    }
).catch(
    (err) => {
        console.error(err)
    }
)

// - check if Address exist on the pipeline
// - if address exist it return true otherwise return false
acrexs.checkIfAddressExists(pipeline, address).then(
    (result) => {
        console.log(result)
    }
).catch(
    (err) => {
        console.error(err)
    }
)

// - get the total balance of all the addresses associated with the wallet_name
// wallet_name must exist on the server.
acrexs.getWalletAddressesBalance(wallet_name).then(
    (result) => {
        console.log(result)
    }
).catch(
    (err) => {
        console.error(err)
    }
)

//Get Transaction Information/Confirmation...
// getBTCTransaction("3KHvxwMriN9bh3Hk1CBZagQjAa3iYVFCp5")
//Transaction data could be any of the following 
// - address
acrexs.getBTCAddressTransaction(address).then(
    (result) => {
        console.log(result)
    }
).catch(
    (err) => {
        console.error(err)
    }
)

// Get recent transactions on a btc address deployed to ETH 
//limit is an integer indicating how deep the history should go
//..e,g limit of 1 means 1 result, 2 means 2 results.
acrexs.getPastBTCTransferEventsonETH(address, limit).then(
    (result) => {
        console.log(result)
    }
).catch(
    (err) => {
        console.error(err)
    }
)

// Get recent transactions on of USDT address deployed
// pipeline :
// ETH or BSC 
//limit is an integer indicating how deep the history should go
//..e,g limit of 1 means 1 result, 2 means 2 results.
acrexs.getRecentUSDTAddressTransactions(pipeline, address, limit).then(
    (result) => {
        console.log(result)
    }
).catch(
    (err) => {
        console.error(err)
    }
)

// Get recent transactions on a btc address deployed to BSC
//limit is an integer indicating how deep the history should go
//..e,g limit of 1 means last block.
acrexs.getPastBTCTransferEventsonBSC(address, limit).then(
    (result) => {
        console.log(result)
    }
).catch(
    (err) => {
        console.error(err)
    }
)

// Get recent transfer transactions of ETH address deployed to BSC 
//limit is an integer indicating how deep the history should go
//..e,g limit of 1 means 1 block.
acrexs.getPastBNBTransferEventsOnETH( address, limit).then(
    (result) => {
        console.log(result)
    }
).catch(
    (err) => {
        console.error(err)
    }
)

// Get recent transfer transactions of BNB address deployed to ETH
//limit is an integer indicating how deep the history should go
// ..e,g limit of 1 means 1 result, 2 means 2 results, and if it returns an empty array then the address has not perform any transaction within the blocks specify, use 0 to get all time transaction
acrexs.getPastETHTransferEventsOnBSC( address, limit).then(
    (result) => {
        console.log(result)
    }
).catch(
    (err) => {
        console.error(err)
    }
)

// Get recent transfer transactions that happened on BSC wallet
acrexs.getRecentBSCWalletTransactions(wallet_name).then(
    (result) => {
        console.log(result)
    }
).catch(
    (err) => {
        console.error(err)
    }
)

// Get recent transfer transactions that happened on ETH wallet
acrexs.getRecentETHWalletTransactions(wallet_name).then(
    (result) => {
        console.log(result)
    }
).catch(
    (err) => {
        console.error(err)
    }
)

// Get recent transfer transactions that happened on  BTC wallet
acrexs.getRecentBTCWalletTransactions(wallet_name).then(
    (result) => {
        console.log(result)
    }
).catch(
    (err) => {
        console.error(err)
    }
)






```

<h2>Dependencies</h2>

* [bip39](https://www.npmjs.com/package/bip39): For mnemonic generation
* [hdkey](https://www.npmjs.com/package/hdkey): For implementation of BIP 32
* [ethereumjs-util](https://www.npmjs.com/package/ethereumjs-util)
* [axios](https://www.npmjs.com/package/axios): For making requests to API's
* [create-hash](https://www.npmjs.com/package/create-hash)
* [bs58check](https://www.npmjs.com/package/bs58check)
* [bitcore-lib](https://www.npmjs.com/package/bitcore-lib)