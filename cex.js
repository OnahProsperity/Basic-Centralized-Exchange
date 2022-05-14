const bip39 = require('bip39')
const HDKey = require('hdkey')
const ethUtil = require('ethereumjs-util')
const axios = require('axios')
const usdt_abi = require("./usdt_abi.json")
const btc_abi = require("./btc_abi.json")
const createHash = require('create-hash')
const bs58check = require('bs58check')
const bitcore = require("bitcore-lib");
require('dotenv-defaults').config()

const mongo = require('mongodb');
const MongoClient = mongo.MongoClient;
const url = `${process.env.SERVER_USERNAME}`; // 'mongodb://localhost:27017'
const client = new MongoClient(url)

// rpc
const rpcForEth = `${process.env.ethRPC}`; 
const rpcForBsc = `${process.env.bscRPC}`;

// contract address
const eth_usdt_contract_address = `${process.env.ETH_USDT_CONTRACT_ADDRESS}`;
const eth_btc_contract_address = `${process.env.ETH_BTC_CONTRACT_ADDRESS}`;
const eth_bnb_contract_address = `${process.env.ETH_BNB_CONTRACT_ADDRESS}`;

const bsc_usdt_contract_address = `${process.env.BSC_USDT_CONTRACT_ADDRESS}`;
const bsc_btc_contract_address = `${process.env.BSC_BTC_CONTRACT_ADDRESS}`;
const bsc_eth_contract_address = `${process.env.BSC_ETH_CONTRACT_ADDRESS}`;

createBTCHdWallet = async (wallet_name) => {
    await client.connect();
    let walletExist = await client.db("cex").collection("wallets").findOne({ walletName: wallet_name }).then(function(record) {
        return record != undefined ? record : undefined;
        });        
    await client.close();

    if (walletExist != undefined) {
        return true;
    }else {
        let mnemonic = await bip39.generateMnemonic();
        let seed = await bip39.mnemonicToSeed(mnemonic)
        let root = HDKey.fromMasterSeed(seed);
        let masterPrivateKey = root.privateKey.toString('hex');
        let masterPublicKey = root.publicKey.toString('hex');
        await client.connect();
        let newListing = {walletName: wallet_name, mnemonic: mnemonic, walletType: "BTC", masterPrivateKey: masterPrivateKey, masterPublicKey: masterPublicKey};
        await client.db("cex").collection("wallets").insertOne(newListing);
        await client.close();
       return  (mnemonic, root, masterPrivateKey, masterPublicKey)
    }
    
}

createETHHdWallet = async (wallet_name) => {
    await client.connect();
    let walletExist = await client.db("cex").collection("wallets").findOne({ walletName: wallet_name }).then(function(record) {
        return record != undefined ? record : undefined;
        });        
    await client.close();

    if (walletExist != undefined) {
        return true;
    }else {
        let mnemonic = await bip39.generateMnemonic();
        let seed = await bip39.mnemonicToSeed(mnemonic)
        let root = HDKey.fromMasterSeed(seed);
        let masterPrivateKey = root.privateKey.toString('hex');
        let masterPublicKey = root.publicKey.toString('hex');
        await client.connect();
        let newListing = {walletName: wallet_name, mnemonic: mnemonic, walletType: "ETH", masterPrivateKey: masterPrivateKey, masterPublicKey: masterPublicKey};
        await client.db("cex").collection("wallets").insertOne(newListing);
        await client.close();
        return  (mnemonic, root, masterPrivateKey, masterPublicKey)
    }
}

createBSCHdWallet = async (wallet_name) => {
    await client.connect();
    let walletExist = await client.db("cex").collection("wallets").findOne({ walletName: wallet_name }).then(function(record) {
        return record != undefined ? record : undefined;
        });        
    await client.close();

    if (walletExist != undefined) {
        return true;
    }else {
        let mnemonic = await bip39.generateMnemonic();
        let seed = await bip39.mnemonicToSeed(mnemonic)
        let root = HDKey.fromMasterSeed(seed);
        let masterPrivateKey = root.privateKey.toString('hex');
        let masterPublicKey = root.publicKey.toString('hex');
        await client.connect();
        let newListing = {walletName: wallet_name, mnemonic: mnemonic, walletType: "BSC", masterPrivateKey: masterPrivateKey, masterPublicKey: masterPublicKey};
        await client.db("cex").collection("wallets").insertOne(newListing);
        await client.close();
        return  (mnemonic, root, masterPrivateKey, masterPublicKey)
    }
}

generateBTCAddress = async (wallet_name) => {
    try{
        
        await client.connect();
        let walletExist = await client.db("cex").collection("wallets").findOne({ walletName: wallet_name }).then(function(record) {
            return record != undefined ? record : undefined;
            });        
        await client.close();

        if (walletExist == undefined) {
            return false;
        }else {
            await client.connect();
            let mnemonic = await client.db("cex").collection("wallets").findOne({ walletName: wallet_name }).then(function(record) {
                return record["mnemonic"];
            });
            await client.close();
        
            await client.connect();

            let accountIndex = await client.db("cex").collection("btcAddresses").find({ walletName: wallet_name }).toArray().then(function(record) {
                            
                            return record[record.length - 1] != undefined ? record[record.length - 1]["accountIndex"] : undefined;
                            });
                                        
            await client.close();
            
            
            let network = 'BTC'     
            

            if(accountIndex == undefined){
                accountIndex = 0;
            } else {
                accountIndex ++;
            }
            await client.close(); 
            let seed = bip39.mnemonicToSeed(mnemonic)
            let root = HDKey.fromMasterSeed((await seed).toString());
            
            let addrnode = await root.derive(`m/44'/0'/0'/0/${accountIndex}`);        
            let pubKey = addrnode._publicKey;
            let sha256Hash = createHash('sha256').update(pubKey).digest();
            let rmd160Hash = createHash('rmd160').update(sha256Hash).digest();
            let versionByte = Buffer.allocUnsafe(21);
            versionByte.writeUInt8(0x00, 0);
            rmd160Hash.copy(versionByte, 1); //step4 now holds the extended RIPMD-160 result
            let address = bs58check.encode(versionByte);  

            let Balance = await axios.get(`https://sochain.com/api/v2/get_address_balance/${network}/${address}`);
            await client.connect();
                let newListing = {address: address, privateKey: addrnode._privateKey.toString('hex'), balance: '0', walletName: wallet_name, accountIndex: accountIndex, addressType: "BTC"};
                 await client.db("cex").collection("btcAddresses").insertOne(newListing);
            
                await client.close();
            return {
                "privateKey":addrnode._privateKey.toString('hex'),
                "publicKey": pubKey.toString('hex'),
                "address":address
            };
        }        
        
        
    }catch(err){
        console.error(err)
    }
}

generateETHAddress = async (wallet_name) => {
    try{
        await client.connect();
        let walletExist = await client.db("cex").collection("wallets").findOne({ walletName: wallet_name }).then(function(record) {
            return record != undefined ? record : undefined;
            });        
        await client.close();

        if (walletExist == undefined) {
            return false;
        }else {                       
            await client.connect();
           let mnemonic = await client.db("cex").collection("wallets").findOne({ walletName: wallet_name }).then(function(record) {
                              return record["mnemonic"];
            });
            await client.close();
       
            await client.connect();
   
           let accountIndex = await client.db("cex").collection("ethAddresses").find({ walletName: wallet_name }).toArray().then(function(record) {
                           
                           return record[record.length - 1] != undefined ? record[record.length - 1]["accountIndex"] : undefined;
                           });
                                       
           await client.close();


            if(accountIndex == undefined){
                accountIndex = 0;
            } else {
                accountIndex ++;
            }
            let seed = bip39.mnemonicToSeed(mnemonic)
            let root = HDKey.fromMasterSeed((await seed).toString());
            let addrNode = await root.derive(`m/44'/60'/0'/0/${accountIndex}`);
            let pubKey = ethUtil.privateToPublic(addrNode._privateKey); 
            const privatKey = addrNode._privateKey.toString('hex');
            const addr = "0x" + ethUtil.publicToAddress(pubKey).toString('hex');
            const address = ethUtil.toChecksumAddress(addr);

            let Web3 = require('web3')
            let web3 = new Web3(new Web3.providers.HttpProvider(rpcForEth))
            let balanceInWei = await web3.eth.getBalance(address)
            let balanceInEther = web3.utils.fromWei(balanceInWei, 'ether')            
           
            await client.connect();
            let newListing = {
                address: address, 
                privateKey: privatKey, 
                balance: balanceInEther, 
                btcBalanceEth: '0',
                bnbBalanceEth: '0',
                usdtBalanceEth:'0',
                walletName: wallet_name, 
                accountIndex: accountIndex, 
                addressType: "ETH"};
                await client.db("cex").collection("ethAddresses").insertOne(newListing);
        
            await client.close();
  
            return {"privateKey":addrNode._privateKey.toString('hex'),
                    "publicKey": pubKey.toString('hex'),
                    "address":address
                };
        }
    }catch(err){
        console.error(err)
    }
}

generateBSCAddress = async (wallet_name) => {
    try{
        await client.connect();
        let walletExist = await client.db("cex").collection("wallets").findOne({ walletName: wallet_name }).then(function(record) {
            return record != undefined ? record : undefined;
            });        
        await client.close();

        if (walletExist == undefined) {
            return false;
        }else {   
            await client.connect();
            let mnemonic = await client.db("cex").collection("wallets").findOne({ walletName: wallet_name }).then(function(record) {
                               return record["mnemonic"];
             });
             await client.close();
        
             await client.connect();
    
            let accountIndex = await client.db("cex").collection("bscAddresses").find({ walletName: wallet_name }).toArray().then(function(record) {
                            
                            return record[record.length - 1] != undefined ? record[record.length - 1]["accountIndex"] : undefined;
                            });
                                        
            await client.close();

            if(accountIndex == undefined){
                accountIndex = 0;
            } else {
                accountIndex ++;
            }
            let seed = bip39.mnemonicToSeed(mnemonic)
            let root = HDKey.fromMasterSeed((await seed).toString());
            let addrNode = await root.derive(`m/44'/60'/0'/0/${accountIndex}`)
            let pubKey = ethUtil.privateToPublic(addrNode._privateKey); 
            const addr = "0x" + ethUtil.publicToAddress(pubKey).toString('hex');
            const address = ethUtil.toChecksumAddress(addr);            
            const privatKey = addrNode._privateKey.toString('hex');
            let Web3 = require('web3')
            let web3 = new Web3(new Web3.providers.HttpProvider(rpcForBsc))
            let balanceInWei = await web3.eth.getBalance(address)
            let balanceInEther = web3.utils.fromWei(balanceInWei, 'ether')
            
                await client.connect();
                let newListing = {
                    address: address, 
                    privateKey: privatKey, 
                    balance: balanceInEther, 
                    btcBalanceBsc: '0',
                    usdtBalanceBsc: '0',
                    ethBalanceBsc:'0',
                    walletName: wallet_name, 
                    accountIndex: accountIndex, 
                    addressType: "BSC"};
                    await client.db("cex").collection("bscAddresses").insertOne(newListing);
            
                await client.close();
                        
            return {"privateKey":addrNode._privateKey.toString('hex'),
                    "publicKey": pubKey.toString('hex'),
                    "address":address
                };
            }
    }catch(err){
        console.error(err)
    }
}

getAddressMeta = async (pipeline, address) => {

    let table;
    if(pipeline === "ETH") {
        table = "ethAddresses";        
    } else if (pipeline === "BSC") {
        table = "bscAddresses";
    } else if (pipeline === "BTC"){
        table = "btcAddresses";
    } else{
        return false;
    }

    await client.connect();
    let record = await client.db("cex").collection(table).findOne({ address: address }).then(function(record) {
        return record;
    });
    await client.close();

    if (record === null){
        return "INVALID ADDRESS"
    } else {
        await client.connect();

        let mnemonic = await client.db("cex").collection("wallets").findOne({ walletName: record["walletName"] }).then(function(record) {
        return record["mnemonic"];
        });

        await client.close();
        return {
            "address":record["address"],
            "privateKey":record["privateKey"], 
            "balance" : record["balance"],
            "btcBalanceBsc" : record["btcBalanceBsc"], 
            "usdtBalanceBsc": record["usdtBalanceBsc"],
            "ethBalanceBsc": record["ethBalanceBsc"],
            "walletName": record["walletName"],
            "addressType": record["addressType"],
            "mnemonic": mnemonic    
        }
    }
        
}

getCurrentGasPriceOnEth = async () => {
    try{
        let response = await axios.get('https://ethgasstation.info/json/ethgasAPI.json')
        let averageGasPrice = response.data.average
        return averageGasPrice
    }catch(err){
        console.error(err)
    }
}

Transfer = async (pipeline, senderAddress, recieverAddress, amount) => {
    try{
        const addressCheck = await checkIfAddressExists(pipeline, senderAddress)
        if (addressCheck != true) {
            return false;
        } else{
            let table;
        if(pipeline === "ETH") {
            table = "ethAddresses";            
        } else if (pipeline === "BSC") {
            table = "bscAddresses";
        } else {
            table = "btcAddresses";
        }
       
        await client.connect();
        let userDetails = await client.db("cex").collection(table).findOne({ address: senderAddress}).then(function(record) {
            return record["privateKey"];
        });
        await client.close();

          var accountPrivateKey = userDetails;
        if (pipeline === "ETH"){
            let Web3 = require('web3')
            let web3 = new Web3(new Web3.providers.HttpProvider(rpcForEth))
            let nonce = await web3.eth.getTransactionCount(senderAddress)

            let value = `${amount}`;

            let gasPrice = await getCurrentGasPriceOnEth()
            let gasPriceInWei = web3.utils.toWei(`${gasPrice}`, 'gwei')
            let details = {
                "to": recieverAddress,
                "value": web3.utils.toHex(web3.utils.toWei(value, 'ether')),
                "gas": 21000,
                "gasPrice": gasPriceInWei,
                "nonce": nonce,
            }
            let signedTx = await web3.eth.accounts.signTransaction(details, accountPrivateKey)
            let signingOutput = web3.eth.sendSignedTransaction(signedTx.rawTransaction, async (error, hash) =>{
                if (!error) {
                    var balanceOfSender = await web3.eth.getBalance(senderAddress)
                    var balanceOfReceiver = await web3.eth.getBalance(recieverAddress)

                    await client.connect();
                    await client.db("cex").collection("ethAddresses")
                    .updateOne({ address: senderAddress },{ $set: {balance: balanceOfSender} });
                    await client.close();

                    await client.connect();
                    await client.db("cex").collection("ethAddresses")
                    .updateOne({ address: recieverAddress },{ $set: {balance: balanceOfReceiver} });
                    await client.close();
                    return hash
                }else{
                    console.error(error)
                }
            });
            return signingOutput;

        } else if(pipeline === "BSC") {
            let Web3 = require('web3')
            let web3 = new Web3(new Web3.providers.HttpProvider(rpcForBsc))
            let nonce = await web3.eth.getTransactionCount(senderAddress)
    
            let value = `${amount}`
            let valueInWei = web3.utils.toWei(value, 'ether')
    
            let gasPriceInWei = await web3.eth.getGasPrice()
            let details = {
                "to": recieverAddress,
                "value": web3.utils.toHex(valueInWei),
                "gas": 21000,
                "gasPrice": gasPriceInWei,
                "nonce": nonce,
            }
            let signedTx = await web3.eth.accounts.signTransaction(details, accountPrivateKey)
            let signingOutput = web3.eth.sendSignedTransaction(signedTx.rawTransaction, async (error, hash) =>{
                if (!error) {
                    
                    var balanceOfSender = await web3.eth.getBalance(senderAddress)
                    var balanceOfReceiver = await web3.eth.getBalance(recieverAddress)

                    var balanceOfSender = await web3.eth.getBalance(senderAddress)
                    var balanceOfReceiver = await web3.eth.getBalance(recieverAddress)

                    await client.connect();
                    await client.db("cex").collection("bscAddresses")
                    .updateOne({ address: senderAddress },{ $set: {balance: balanceOfSender} });
                    await client.close();

                    await client.connect();
                    await client.db("cex").collection("bscAddresses")
                    .updateOne({ address: recieverAddress },{ $set: {balance: balanceOfReceiver} });
                    await client.close();

                    return hash
                }else{
                    console.error(error)
                }
            })
            return signingOutput
        } else if (pipeline === 'BTC') {    
        
            let amountInSatoshi = amount * 100000000 
            let fee = 0; 
            let inputCount = 0;
            let outputCount = 2
            let network = 'BTC'
            let utxos = await axios.get(
                `https://sochain.com/api/v2/get_tx_unspent/${network}/${senderAddress}`
              );
            let totalAmountAvailable = 0;
            let inputs = [];
            utxos.data.data.txs.forEach(async (element) => {
                let utxo = {};            
                utxo.satoshis = Math.floor(Number(element.value) * 100000000);
                utxo.script = element.script_hex;
                utxo.address = utxos.data.data.address;
                utxo.txId = element.txid;
                utxo.outputIndex = element.output_no;
            
                totalAmountAvailable += utxo.satoshis;
                inputs.push(utxo);
            });
            let transaction = new bitcore.Transaction();
            transaction.from(inputs);
            let transactionSize = inputCount * 180 + outputCount * 34 + 10 - inputCount
            fee = 20 * transactionSize
            if(totalAmountAvailable - amountInSatoshi - fee < 0){
                throw new Error("Balance is too low for this transaction");
            }else{
                transaction.to(recieverAddress, amountInSatoshi)
                transaction.fee(fee)
                transaction.change(senderAddress)
                transaction.sign(accountPrivateKey)
                let serializedTX = transaction.serialize();
                 // broadcast transaction
                let result = await axios({
                    method: "POST",
                    url: `https://sochain.com/api/v2/send_tx/${network}`,
                    data: {
                    tx_hex: serializedTX,
                    },
                })
               
                await client.connect();
                await client.db("cex").collection("btcAddresses")
                .updateOne({ address: senderAddress },{ $set: {balance: msgSender - amount} });
                await client.close();

                await client.connect();
                await client.db("cex").collection("btcAddresses")
                .updateOne({ address: recieverAddress },{ $set: {balance: receiver + amount} });
                await client.connect();

                return result.data.data
            } 
    
        }

        }

    }catch(err){

    }
  
} 

TransferUSDT = async (pipeline, senderAddress, recieverAddress, amount) => {
    try{
        const addressCheck = await checkIfAddressExists(pipeline, senderAddress)
        if (addressCheck != true) {
            return false;
        } else{
            let table;
            if(pipeline === "ETH") {
                table = "ethAddresses";
                
            } else if (pipeline === "BSC") {
                table = "bscAddresses";
            }

           await client.connect();
            let userDetails = await client.db("cex").collection(table).findOne({ address: senderAddress}).then(function(record) {
                return record["privateKey"];
            });
            await client.close();
            var accountPrivateKey = userDetails;
            if (pipeline === "ETH") {
                
                let Web3 = require('web3')
                let web3 = new Web3(new Web3.providers.HttpProvider(rpcForEth))
                let contractAddress = eth_usdt_contract_address;
                let btcContract = new web3.eth.Contract(btc_abi, contractAddress);

                let value = await web3.utils.toWei(amount);
                let tx = await btcContract.methods.transfer(recieverAddress, value);
                let gas = await web3.eth.estimateGas({from: senderAddress}, tx);

                let gasPrice = await web3.eth.getGasPrice();
                let txData = tx.encodeABI();
                
                let nonce = await web3.eth.getTransactionCount(senderAddress)
                
                let signedTx = await web3.eth.accounts.signTransaction(
                    {
                        to: contractAddress,
                        gas,
                        gasPrice,
                        data: txData,
                        nonce
                    },
                    accountPrivateKey
                )
                
                let reciept = await web3.eth.sendSignedTransaction(signedTx.rawTransaction, async (error, hash) => {
                    if (!error) {
                        
                        var balanceOfSender = await btcContract.methods.balanceOf(senderAddress).call()
                        var balanceOfReceiver = await btcContract.methods.balanceOf(recieverAddress).call()

                        await client.connect();
                        await client.db("cex").collection("ethAddresses")
                        .updateOne({ address: senderAddress },{ $set: {usdtBalanceEth: balanceOfSender} });
                        await client.close();

                        await client.connect();
                        await client.db("cex").collection("ethAddresses")
                        .updateOne({ address: recieverAddress },{ $set: {usdtBalanceEth: balanceOfReceiver} });
                        await client.close();

                        return hash
                    }else{
                        console.error(error)
                    }
                });

                return reciept
            } else if (pipeline === 'BSC'){
                
                let Web3 = require('web3')
                let web3 = new Web3(new Web3.providers.HttpProvider(rpcForBsc))
                let contractAddress = bsc_usdt_contract_address;
                let btcContract = new web3.eth.Contract(btc_abi, contractAddress);

                let value = await web3.utils.toWei(amount);
                let tx = await btcContract.methods.transfer(recieverAddress, value);
                let gas = await web3.eth.estimateGas({from: senderAddress}, tx);

                let gasPrice = await web3.eth.getGasPrice();
                let txData = tx.encodeABI();
                
                let nonce = await web3.eth.getTransactionCount(senderAddress)
                
                let signedTx = await web3.eth.accounts.signTransaction(
                    {
                        to: contractAddress,
                        gas,
                        gasPrice,
                        data: txData,
                        nonce
                    },
                    accountPrivateKey
                )
                
                let reciept = await web3.eth.sendSignedTransaction(signedTx.rawTransaction, async (error, hash) => {
                    if (!error) {
                        
                        var balanceOfSender = await btcContract.methods.balanceOf(senderAddress).call()
                        var balanceOfReceiver = await btcContract.methods.balanceOf(recieverAddress).call()

                        await client.connect();
                        await client.db("cex").collection("bscAddresses")
                        .updateOne({ address: senderAddress },{ $set: {usdtBalanceBsc: balanceOfSender} });
                        await client.close();

                        await client.connect();
                        await client.db("cex").collection("bscAddresses")
                        .updateOne({ address: recieverAddress },{ $set: {usdtBalanceBsc: balanceOfReceiver} });
                        await client.close();

                        return hash
                    }else{
                        console.error(error)
                    }
                });
                return reciept
            } else{
                return false;
            }
        }
        
    }
    catch(err){

    }
}

TransferBTC = async (pipeline, senderAddress, recieverAddress, amount) => {
    try{
        const addressCheck = await checkIfAddressExists(pipeline, senderAddress)
        if (addressCheck != true) {
            return false;
        } else{
            let table;
            if(pipeline === "ETH") {
                table = "ethAddresses";
                
            } else if (pipeline === "BSC") {
                table = "bscAddresses";
            }

            await client.connect();
            let userDetails = await client.db("cex").collection(table).findOne({ address: senderAddress}).then(function(record) {
                return record["privateKey"];
            });
            await client.close();

            var accountPrivateKey = userDetails;
            if (pipeline === "ETH") {
                let Web3 = require('web3')
                let web3 = new Web3(new Web3.providers.HttpProvider(rpcForEth))
                let contractAddress = eth_btc_contract_address;
                let btcContract = new web3.eth.Contract(btc_abi, contractAddress);
                
                let value = amount**9;
                let tx = await btcContract.methods.transfer(recieverAddress, value);
                let gas = await web3.eth.estimateGas({from: senderAddress}, tx);

                let gasPrice = await web3.eth.getGasPrice();
                let txData = tx.encodeABI();
                
                let nonce = await web3.eth.getTransactionCount(senderAddress)
                let signedTx = await web3.eth.accounts.signTransaction(
                    {
                        to: contractAddress,
                        gas,
                        gasPrice,
                        data: txData,
                        nonce
                    },
                    accountPrivateKey
                )
                
                let reciept = await web3.eth.sendSignedTransaction(signedTx.rawTransaction, async (error, hash) => {
                    if (!error) {
                        
                        var balanceOfSender = await btcContract.methods.balanceOf(senderAddress).call()
                        var balanceOfReceiver = await btcContract.methods.balanceOf(recieverAddress).call()

                        await client.connect();
                        await client.db("cex").collection("ethAddresses")
                        .updateOne({ address: senderAddress },{ $set: {btcBalanceEth: balanceOfSender} });
                        await client.close();

                        await client.connect();
                        await client.db("cex").collection("ethAddresses")
                        .updateOne({ address: recieverAddress },{ $set: {btcBalanceEth: balanceOfReceiver} });
                        await client.close();
                        return hash
                    }else{
                        console.error(error)
                    }
                });

                return reciept
            } else if (pipeline === 'BSC'){
                
            
            let Web3 = require('web3')
            let web3 = new Web3(new Web3.providers.HttpProvider(rpcForBsc))
            let contractAddress = bsc_btc_contract_address;
            let btcContract = new web3.eth.Contract(btc_abi, contractAddress);

            let value = await web3.utils.toWei(amount);
            let tx = await btcContract.methods.transfer(recieverAddress, value);
            let gas = await web3.eth.estimateGas({from: senderAddress}, tx);

            let gasPrice = await web3.eth.getGasPrice();
            let txData = tx.encodeABI();
            
            let nonce = await web3.eth.getTransactionCount(senderAddress)
            
            let signedTx = await web3.eth.accounts.signTransaction(
                {
                    to: contractAddress,
                    gas,
                    gasPrice,
                    data: txData,
                    nonce
                },
                accountPrivateKey
                )
                let reciept = await web3.eth.sendSignedTransaction(signedTx.rawTransaction, async (error, hash) => {
                    if (!error) {
                        
                        var balanceOfSender = await btcContract.methods.balanceOf(senderAddress).call()
                        var balanceOfReceiver = await btcContract.methods.balanceOf(recieverAddress).call()

                       
                        await client.connect();
                        await client.db("cex").collection("bscAddresses")
                        .updateOne({ address: senderAddress },{ $set: {btcBalanceBsc: balanceOfSender} });
                        await client.close();

                        await client.connect();
                        await client.db("cex").collection("bscAddresses")
                        .updateOne({ address: recieverAddress },{ $set: {btcBalanceBsc: balanceOfReceiver} });
                        await client.close();

                        return hash
                    }else{
                        console.error(error)
                    }
                });
                return reciept
            } else{
                return false;
            }
        }
        
    }
    catch(err){

    }
}

TransferETHOnBSC = async (senderAddress, recieverAddress, amount) => {
    try{
        const addressCheck = await checkIfAddressExists("BSC", senderAddress)
        if (addressCheck != true) {
            return false;
        } else{
        

            await client.connect();
            let userDetails = await client.db("cex").collection("bscAddresses").findOne({ address: senderAddress}).then(function(record) {
                return record["privateKey"];
            });
            await client.close();

            var accountPrivateKey = userDetails;
            let Web3 = require('web3')
            let web3 = new Web3(new Web3.providers.HttpProvider(rpcForBsc))
            let contractAddress = bsc_eth_contract_address;
            let btcContract = new web3.eth.Contract(btc_abi, contractAddress);

            let value = await web3.utils.toWei(amount);
            let tx = await btcContract.methods.transfer(recieverAddress, value);
            let gas = await web3.eth.estimateGas({from: senderAddress}, tx);

            let gasPrice = await web3.eth.getGasPrice();
            let txData = tx.encodeABI();
            
            let nonce = await web3.eth.getTransactionCount(senderAddress)
            
            let signedTx = await web3.eth.accounts.signTransaction(
                {
                    to: contractAddress,
                    gas,
                    gasPrice,
                    data: txData,
                    nonce
                },
                accountPrivateKey
                )
                let reciept = await web3.eth.sendSignedTransaction(signedTx.rawTransaction, async (error, hash) => {
                    if (!error) {
                        
                        var balanceOfSender = await btcContract.methods.balanceOf(senderAddress).call()
                        var balanceOfReceiver = await btcContract.methods.balanceOf(recieverAddress).call()

                       
                        await client.connect();
                        await client.db("cex").collection("bscAddresses")
                        .updateOne({ address: senderAddress },{ $set: {ethBalanceBsc: balanceOfSender} });
                        await client.close();

                        await client.connect();
                        await client.db("cex").collection("bscAddresses")
                        .updateOne({ address: recieverAddress },{ $set: {ethBalanceBsc: balanceOfReceiver} });
                        await client.close();

                        return hash
                    }else{
                        console.error(error)
                    }
                });
                return reciept
        }
    }
    catch(err){

    }
}

TransferBNBOnETH = async (senderAddress, recieverAddress, amount) => {
    try{
        const addressCheck = await checkIfAddressExists("ETH", senderAddress)
        if (addressCheck != true) {
            return false;
        } else{
           
            await client.connect();
            let userDetails = await client.db("cex").collection("ethAddresses").findOne({ address: senderAddress}).then(function(record) {
                return record["privateKey"];
            });
            await client.close();

            var accountPrivateKey = userDetails;
                let Web3 = require('web3')
                let web3 = new Web3(new Web3.providers.HttpProvider(rpcForEth))
                let contractAddress = eth_bnb_contract_address;
                let btcContract = new web3.eth.Contract(btc_abi, contractAddress);
                let value = await web3.utils.toWei(amount);
                let tx = await btcContract.methods.transfer(recieverAddress, value);
                let gas = await web3.eth.estimateGas({from: senderAddress}, tx);
                let gasPrice = await web3.eth.getGasPrice();
                let txData = tx.encodeABI();
                
                let nonce = await web3.eth.getTransactionCount(senderAddress)
                
                let signedTx = await web3.eth.accounts.signTransaction(
                    {
                        to: contractAddress,
                        gas,
                        gasPrice,
                        data: txData,
                        nonce
                    },
                    accountPrivateKey
                )
                let reciept = await web3.eth.sendSignedTransaction(signedTx.rawTransaction, async (error, hash) => {
                    if (!error) {                        
                        var balanceOfSender = await btcContract.methods.balanceOf(senderAddress).call()
                        var balanceOfReceiver = await btcContract.methods.balanceOf(recieverAddress).call()

                        await client.connect();
                        await client.db("cex").collection("ethAddresses")
                        .updateOne({ address: senderAddress },{ $set: {bnbBalanceEth: balanceOfSender} });
                        await client.close();

                        await client.connect();
                        await client.db("cex").collection("ethAddresses")
                        .updateOne({ address: recieverAddress },{ $set: {bnbBalanceEth: balanceOfReceiver} });
                        await client.close();

                        return hash
                    }else{
                        console.error(error)
                    }
                });

                return reciept
            }
        
    }
    catch(err){

    }
}

getBTCAddressBalance = async (address) =>{
    try{      
        const addressCheck = await checkIfAddressExists("BTC", address)
        if (addressCheck != true) {
            return 'INVALID';
        } else{                
            await client.connect();
            let balance = await client.db("cex").collection("btcAddresses").findOne({ address: address}).then(function(record) {
                return record["balance"];
            });
            await client.close();
            return balance;
        }
       
    }catch(err){
        console.log(err);
    }
}

getETHAddressBalance = async (address) =>{
    try{
        var balance;
        const walletExist = await checkIfAddressExists('ETH', address)
        if (walletExist != true ){
            return 'INVALID'
        }else{
            await client.connect();
            balance = await client.db("cex").collection("ethAddresses").findOne({ address: address}).then(function(record) {
                return record["balance"];
            });
            await client.close();
        }       
        
        return balance;
       
    }catch(err){
        console.log(err);
    }
}

getBSCAddressBalance = async (address) =>{
    try{
        var balance;
        const walletExist = await checkIfAddressExists('BSC', address)
        if (walletExist != true ){
            return 'INVALID'
        }else{       
            await client.connect();
            balance = await client.db("cex").collection("bscAddresses").findOne({ address: address}).then(function(record) {
                return record["balance"];
            });
            await client.close();
            return balance;
        }
       
    }catch(err){
        console.log(err);
    }
}

getBTCWalletMeta = async (wallet_name) => {
    const walletExist = await checkBTCWalletExists(wallet_name);
    if(walletExist == false) {
        return 'INVALID'
    } else {
        console.log(true   )
        await client.connect();
        let AllWallets = await client.db("cex").collection("wallets").find({ walletName: wallet_name}).toArray().then(function(record) {
            return record;
        });
        await client.close();
        console.log(AllWallets)
        return AllWallets;
    }
}

getETHWalletMeta = async (wallet_name) => {
    const walletExist = await checkETHWalletExists(wallet_name);
    if(walletExist == false) {
        return 'INVALID'
    } else {
        await client.connect();
        let AllWallets = await client.db("cex").collection("wallets").find({ walletName: wallet_name}).toArray().then(function(record) {
            return record;
        });
        await client.close();
        return AllWallets;
    }
}

getBSCWalletMeta = async (wallet_name) => {
    const walletExist = await checkBSCWalletExists(wallet_name);
    if(walletExist == false) {
        return 'INVALID'
    } else {
        await client.connect();
        let AllWallets = await client.db("cex").collection("wallets").find({ walletName: wallet_name}).toArray().then(function(record) {
            return record;
        });
        await client.close();
        return AllWallets;
    }
}

getAllBTCWallets = async () => {   
    await client.connect();
    let AllWallets = await client.db("cex").collection("wallets").find({ walletType: 'BTC'}).toArray().then(function(record) {
        return record;
    });
    await client.close();
  return AllWallets;
}

getAllETHWallets = async () => {
  
    await client.connect();
    let AllWallets = await client.db("cex").collection("wallets").find({ walletType: 'ETH'}).toArray().then(function(record) {
        return record;
    });
    await client.close();
   return AllWallets;
 }

getAllBSCWallets = async () => {
 
    await client.connect();
    let AllWallets = await client.db("cex").collection("wallets").find({ walletType: 'BSC'}).toArray().then(function(record) {
        return record;
    });
    await client.close();
   return AllWallets;
}

deleteAddressFromBTCWallet = async (address) => {
    let table = "btcAddresses";
    const exist = await checkIfAddressExists("BTC", address)
    if(exist == false) {
        return 'INVALID'
    } else{
        await client.connect();
    let AllWallets = await client.db("cex").collection(table).deleteOne({ address: address }).then(function(record) {
        return record;
    });
    await client.close();
   
    return AllWallets;
    }
}

deleteAddressFromETHWallet = async (address) => {
    let table = "ethAddresses";
    const exist = await checkIfAddressExists("ETH", address)
    if(exist == false) {
        return 'INVALID'
    } else{
        await client.connect();
        let AllWallets = await client.db("cex").collection(table).deleteOne({ address: address }).then(function(record) {
            return record;
        });
        await client.close();
    
        return AllWallets;
    }
}

deleteAddressFromBSCWallet = async (address) => {
    let table = "bscAddresses";
    const exist = await checkIfAddressExists("BSC", address)
    if(exist == false) {
        return 'INVALID'
    } else{
        await client.connect();
        let AllWallets = await client.db("cex").collection(table).deleteOne({ address: address }).then(function(record) {
            return record;
        });
        await client.close();
    
        return AllWallets;
    }
}

getBTCToOthersRate = async (other) => {
    
    try{
        var btcValue = 1;

        if (other === "ETH" || other === "ether"){
            let response = await axios.get('http://api.coinlayer.com/api/live?access_key=bdc1f9792c5fc2d669f7c56f5824074f&symbols=ETH,BTC');
            let btcRate = response.data.rates.BTC;
            let ethRate = response.data.rates.ETH;
            let btcValueInUsd = btcValue * btcRate
            let btcValueInEth = btcValueInUsd/ethRate
            return btcValueInEth;
        }else if(other === "BNB"){
            let response = await axios.get('http://api.coinlayer.com/api/live?access_key=bdc1f9792c5fc2d669f7c56f5824074f&symbols=BNB,BTC');
            let btcRate = response.data.rates.BTC;
            let bnbRate = response.data.rates.BNB;
            let btcValueInUsd = btcValue * btcRate
            let btcValueInBnb = btcValueInUsd/bnbRate
            return btcValueInBnb;
        }else if(other === "USD"){
            let response = await axios.get('http://api.coinlayer.com/api/live?access_key=bdc1f9792c5fc2d669f7c56f5824074f&symbols=BTC');
            let btcRate = response.data.rates.BTC;
            let btcValueInUsd = btcValue * btcRate
            return btcValueInUsd;
        }

    } catch(err) {
        console.log(err)
    }

}

destroyBTCHdWallet = async (wallet_name) => {
    var AllWallets
   
    await client.connect();
    AllWallets = await client.db("cex").collection("wallets").deleteOne({ walletName: wallet_name }).then(function(record) {
        return record;
    });
    await client.close();
    
    await client.connect();
    AllWallets = await client.db("cex").collection("btcAddresses").deleteMany({ walletName: wallet_name }).then(function(record) {
        return record;
    });
    await client.close();
    
    if (AllWallets == undefined) {
        return undefined
    } else {
        return "Wallet Deleted Successfully";
    }
}

destroyETHHdWallet = async (wallet_name) => {
    var AllWallets
    await client.connect();
    AllWallets = await client.db("cex").collection("wallets").deleteOne({ walletName: wallet_name }).then(function(record) {
        return record;
    });
    await client.close();

    await client.connect();
    AllWallets = await client.db("cex").collection("ethAddresses").deleteMany({ walletName: wallet_name }).then(function(record) {
        return record;
    });
    await client.close();
    if (AllWallets === undefined) {
        return "Wallet Deleted Successfully"
    } else {
        return "Wallet Deleted Successfully";
    }
}

destroyBSCHdWallet = async (wallet_name) => {
    var AllWallets
    await client.connect();
    AllWallets = await client.db("cex").collection("wallets").deleteOne({ walletName: wallet_name }).then(function(record) {
        return record;
    });
    await client.close();
    await client.connect();
    AllWallets = await client.db("cex").collection("btcAddresses").deleteMany({ walletName: wallet_name }).then(function(record) {
        return record;
    });
    await client.close();
    if (AllWallets === undefined) {
        return "Wallet Deleted Successfully"
    } else {
        return "Wallet Deleted Successfully";
    }
}

checkBTCWalletExists = async (wallet_name) => {
    
    await client.connect();
    let walletExist = await client.db("cex").collection("btcAddresses").findOne({ walletName: wallet_name }).then(function(record) {
        return record != undefined ? record : undefined;
        });
        
    await client.close();

    if(walletExist != undefined) {
        return true;
    }else {
        return false
    }
}

checkETHWalletExists = async (wallet_name) => {
    
    await client.connect();
    let walletExist = await client.db("cex").collection("ethAddresses").findOne({ walletName: wallet_name }).then(function(record) {
        return record != undefined ? record : undefined;
        });
        
    await client.close();
    if(walletExist != undefined) {
        return true;
    }else {
        return false
    }
}

checkBSCWalletExists = async (wallet_name) => {
    
    await client.connect();
    let walletExist = await client.db("cex").collection("bscAddresses").findOne({ walletName: wallet_name }).then(function(record) {
        return record != undefined ? record : undefined;
        });
        
    await client.close();

    if(walletExist != undefined) {
        return true;
    }else {
        return false
    }
}

checkIfAddressExists = async (pipeline, address) => {
    let table;
    if(pipeline === "ETH") {
        table = "ethAddresses";
        
    } else if (pipeline === "BSC") {
        table = "bscAddresses";
    }else if (pipeline === "BTC"){
        table = "btcAddresses";
    } else{
        return false;
    }
    // let walletExist;

        await client.connect();
        let walletExist = await client.db("cex").collection(table).findOne({ address: address }).then(function(record) {
            return record != undefined ? record : undefined;
            });
    
        await client.close();

    if(walletExist != undefined) {
        return true;
    }else {
        return false
    }
}

//................................................................................................................................................

getRecentBSCWalletTransactions = async (wallet_name) => {
    var checkIfExist = await checkBSCWalletExists(wallet_name);

    if(checkIfExist == true) {

        await client.connect();
        let AllWallets = await client.db("cex").collection("bscAddresses").find({ walletName: wallet_name}).toArray().then(function(record) {
            return record.map(element => element.address);
        });
        await client.close();

        let arr = [];
        if (AllWallets.length < 1){
            return undefined;
        }else {
            for(let i = 0; i >= AllWallets.length; i++){
                const lastTrans = await getRecentUSDTAddressTransactions("BSC", AllWallets[i], 20)

                arr.push(lastTrans[0]["returnValues"])
                const lastBTCTrans = await getPastBTCTransferEventsonBSC(AllWallets[i], 20)
                arr.push(lastBTCTrans[0]["returnValues"])
                const lastEthTrans = await getPastETHTransferEventsOnBSC(AllWallets[i], 20)
                    arr.push(lastEthTrans[0]["returnValues"])
            }
        }
        return arr;

    }else if(checkIfExist != true) {
        return undefined
    }
}

getRecentETHWalletTransactions = async (wallet_name) => {
    var checkIfExist = await checkBTCWalletExists(wallet_name);

    if(checkIfExist == true) {

        await client.connect();
        let AllWallets = await client.db("cex").collection("ethAddresses").find({ walletName: wallet_name}).toArray().then(function(record) {
            return record.map(element => element.address);
        });
        await client.close();
        let arr = [];
        if (AllWallets.length < 1){
            return undefined;
        }else {
            for(let i = 0; i >= AllWallets.length; i++){
                const lastTrans = await getRecentUSDTAddressTransactions("ETH", AllWallets[i], 20)

                arr.push(lastTrans[0]["returnValues"])
                const lastBTCTrans = await getPastBTCTransferEventsonETH(AllWallets[i], 20)
                arr.push(lastBTCTrans[0]["returnValues"])
                const lastEthTrans = await getPastBNBTransferEventsOnETH(AllWallets[i], 20)
                    arr.push(lastEthTrans[0]["returnValues"])
            }
        }

        return arr;

    }else if(checkIfExist != true) {
        return undefined
    }
}

getRecentBTCWalletTransactions = async (wallet_name) => {
    var checkIfExist = await checkBTCWalletExists(wallet_name);

    if(checkIfExist == true) {

        await client.connect();
        let AllWallets = await client.db("cex").collection("btcAddresses").find({ walletName: wallet_name}).toArray().then(function(record) {
            return record.map(element => element.address);
        });
        await client.close();

        let arr = [];
        if (AllWallets.length < 1){
            return undefined;
        }else {
            for(let i = 0; i >= AllWallets.length; i++){
                const lastTrans = await getBTCAddressTransaction(AllWallets[i])

                arr.push(lastTrans[0]["returnValues"])
            }
        }

        return arr;

    }else if(checkIfExist != true) {
        return undefined
    }
}

//....................................................................................................................................................

getWalletAddressesBalance = async (walletName) =>{
    try{
        await client.connect();
        let EthAddresses = await client.db("cex").collection("ethAddresses").find({ walletName: walletName}).toArray().then(function(record) {
            return record.length < 1 ? 0 : record.map(element => parseInt(element.balance)).reduce((a, b) => a + b);
        });
        await client.close();

       
        await client.connect();
        let BscAddresses = await client.db("cex").collection("bscAddresses").find({ walletName: walletName}).toArray().then(function(record) {
            
            return record.length < 1 ? 0 : record.map(element => parseInt(element.balance)).reduce((a, b) => a + b);
        });
        await client.close();

        await client.connect();
        let BtcAddresses = await client.db("cex").collection("btcAddresses").find({ walletName: walletName}).toArray().then(function(record) {
            return record.length < 1 ? 0 : record.map(element => parseInt(element.balance)).reduce((a, b) => a + b);
        });
        await client.close();

          let sunTotal = EthAddresses + BscAddresses + BtcAddresses ;
       return sunTotal;
    }catch(err){
        console.log(err)
    }
}

getBTCAddressTransaction = async (addresses) => {
    try{
        let network = 'BTC'
        let transactions = []
            let address = addresses
            let recievedTransactions = await axios.get(`https://sochain.com/api/v2/get_tx_received/${network}/${address}`);
            let unspentTransactions = await axios.get(`https://sochain.com/api/v2/get_tx_unspent/${network}/${address}`);
            let spentTransactions = await axios.get(`https://sochain.com/api/v2/get_tx_spent/${network}/${address}`);

            let obj = {};  
            obj[address] = {
                recievedTransactions:recievedTransactions.data.data.txs[0],
                unspentTransactions:unspentTransactions.data.data.txs,
                spentTransactions:spentTransactions.data.data
            }
            transactions.push(obj)
        return transactions;
    }catch(err){
        console.error("err")
    }
}

getRecentUSDTAddressTransactions = async (pipeline, address, limit) => {

    try{
        if(pipeline === "ETH"){
            const checkAddressExist = await checkIfAddressExists('ETH', addresses);
            if (checkAddressExist != true) {
                return false
            } else{
                let Web3 = require('web3')
                let web3 = new Web3(new Web3.providers.HttpProvider(rpcForEth))
                var currentBlock = web3.eth.getBlockNumber()
                var blockNumb = currentBlock - limit;

                let contractAddress = eth_usdt_contract_address;
                let usdtContract = new web3.eth.Contract(usdt_abi, contractAddress)
                await usdtContract.getPastEvents({
                    filter:{to:address},
                    fromBlock: blockNumb,
                    toBlock: 'latest'
                },(err, res) => {
                    if(!err){
                        return res
                    }else{
                        return err
                    }
                })
            }

        }else if(pipeline === "BSC"){
            const checkAddressExist = await checkIfAddressExists('BSC', addresses);
            if (checkAddressExist != true) {
                return false
            } else{
                let Web3 = require('web3')
                let web3 = new Web3(new Web3.providers.HttpProvider(rpcForBsc))
                var currentBlock = await web3.eth.getBlockNumber()

                var blockNumb = currentBlock - limit;
                let contractAddress = bsc_usdt_contract_address;
                let usdtContract = new web3.eth.Contract(usdt_abi, contractAddress)
                await usdtContract.getPastEvents( {
                    filter:{to:address},
                    fromBlock:  blockNumb,
                    toBlock: 'latest'
                },(err, res) => {
                    if(!err){                        
                        return res
                    }else{
                        return err
                    }
                })
            }
        }
    }catch(err){
        console.error(err)
    }
}

getPastBTCTransferEventsonETH = async (addresses, limit) => {
    try{
        const checkAddressExist = await checkIfAddressExists('ETH', addresses);
        if (checkAddressExist != true) {
            return false
        } else{
            let Web3 = require('web3')
            let web3 = new Web3(new Web3.providers.HttpProvider(rpcForEth))
            var currentBlock = web3.eth.getBlockNumber()
            var blockNumb = currentBlock - limit;

            let contractAddress = eth_btc_contract_address;
            let btcContract = new web3.eth.Contract(btc_abi, contractAddress)
            await btcContract.getPastEvents({
                filter:{to:addresses},
                fromBlock: blockNumb,
                toBlock: 'latest'
            },(err, res) => {
                if(!err){
                    return res
                }else{
                    return err
                }
            })
        }
        
    }catch(err){
        console.error(err)
    }
}

getPastBTCTransferEventsonBSC = async (addresses, limit) => {
    try{
        const checkAddressExist = await checkIfAddressExists('BSC', addresses);
        if (checkAddressExist != true) {
            return false
        } else{            
            let Web3 = require('web3')
            let web3 = new Web3(new Web3.providers.HttpProvider(rpcForBsc))
            let contractAddress = bsc_btc_contract_address;
            let btcContract = new web3.eth.Contract(btc_abi, contractAddress)
            var currentBlock = web3.eth.getBlockNumber()
            var blockNumb = currentBlock - limit;
            await btcContract.getPastEvents({
                filter:{to:addresses},
                fromBlock: blockNumb,
                toBlock: 'latest'
            },(err, res) => {
                if(!err){
                    return res
                }else{
                    return err
                }
            })
        }
        
    }catch(err){
        console.error(err)
    }
}

getPastBNBTransferEventsOnETH = async (addresses, limit) => {
    try{
        const checkAddressExist = await checkIfAddressExists('ETH', addresses);
        if (checkAddressExist != true) {
            return false
        } else{ 
            let Web3 = require('web3')
            let web3 = new Web3(new Web3.providers.HttpProvider(rpcForEth))
            let contractAddress = eth_bnb_contract_address;
            let bnbContract = new web3.eth.Contract(btc_abi, contractAddress)
            var currentBlock = await web3.eth.getBlockNumber();
            let blockNumb;
            if(limit != 0) {
                blockNumb = currentBlock - limit;
            }else {
                blockNumb = 0;
            }    
            
            await bnbContract.getPastEvents('Transfer', {
                filter:{myOtherIndexedParam:addresses},
                fromBlock: blockNumb,
                toBlock: 'latest'
            },(err, res) => {
                if(!err){
                    return res
                }else{
                    return err
                }
            })
        }
    
    }catch(err){
        console.error(err)
    }
}

getPastETHTransferEventsOnBSC = async ( addresses, limit) => {
    try{
        const checkAddressExist = await checkIfAddressExists('ETH', addresses);
        if (checkAddressExist != true) {
            return false
        } else{
            let Web3 = require('web3')
            let web3 = new Web3(new Web3.providers.HttpProvider(rpcForBsc))
            let contractAddress = bsc_eth_contract_address;
            let ethContract = new web3.eth.Contract(btc_abi, contractAddress)
            var currentBlock = web3.eth.getBlockNumber()
            let blockNumb;
            if(limit != 0) {
                blockNumb = currentBlock - limit;
            }else {
                blockNumb = 0;
            }
            await ethContract.getPastEvents({
                filter:{to:addresses},
                fromBlock: blockNumb,
                toBlock: 'latest'
            },(err, res) => {
                if(!err){
                    return res
                }else{
                    return err
                }
            })
        }
        
    }catch(err){
        console.error(err)
    }
}

module.exports = {
    createBTCHdWallet,
    createETHHdWallet,
    createBSCHdWallet,
    generateBTCAddress,
    generateETHAddress,
    generateBSCAddress,
    getAddressMeta,
    Transfer,
    TransferBTC,
    TransferUSDT,
    TransferETHOnBSC,
    TransferBNBOnETH,
    checkBTCWalletExists,
    checkBSCWalletExists,
    checkETHWalletExists,
    checkIfAddressExists,
    getAllBTCWallets,
    getAllETHWallets,
    getAllBSCWallets,
    getBTCAddressBalance,
    getETHAddressBalance,
    getBSCAddressBalance,
    deleteAddressFromBTCWallet,
    deleteAddressFromBSCWallet,
    deleteAddressFromETHWallet,
    destroyBTCHdWallet,
    destroyBSCHdWallet,
    destroyETHHdWallet,
    getBTCToOthersRate,
    getWalletAddressesBalance,
    getPastBTCTransferEventsonBSC,
    getPastBTCTransferEventsonETH,
    getPastBNBTransferEventsOnETH,
    getPastETHTransferEventsOnBSC,
    getBTCWalletMeta,
    getBSCWalletMeta,
    getETHWalletMeta,
    getRecentBTCWalletTransactions,
    getRecentUSDTAddressTransactions,
    getBTCAddressTransaction,
    getRecentBSCWalletTransactions,
    getRecentBTCWalletTransactions,
    getRecentETHWalletTransactions
}

getAddressMeta("BSC", "0x16c70C749D578A984AE44f7867a708Edde1Ee310");
