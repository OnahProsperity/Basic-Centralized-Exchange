const cex = require("./cex");
// const hdWallet = require("./cex");
// --------------- BITCOIN -------------------------

//3. Generate BTC addresses for an array of HD wallet
const wallet_names = ['wallet1', 'wallet2', 'wallet3']
cex.generateBtcAddresses(wallet_names).then((data) =>[


	//data takes the form: 
	{
		results: [

				{
					'wallet_name': 'wallet1',
					'addresses': []

				}, 

				{
					'wallet_name': 'wallet2',
					'addresses': []
				}, 
				
				{
					'wallet_name': 'wallet3',
					'addresses': []
				}

			],
		metadata: ''
	}


]);


//8. Get recent transactions on the btc wallet
//limit is an integer indicating how deep the history should go
//..e,g limit of 1 means 1 result, 2 means 2 results.
//minimum is 1
cex.getRecentBtcWalletTransactions(wallet_name, limit).then((data) =>{

	//returns an array of recent transactions with all standard data

});

//9. Get recent transactions on a btc address
//limit is an integer indicating how deep the history should go
//..e,g limit of 1 means 1 result, 2 means 2 results.
//minimum is 1
cex.getRecentBtcAddressTransactions(address, limit).then((data) =>{

	//returns an array of recent transactions with all standard data, e.g hashes

});


//16. Get Transaction Information/Confirmation...
//
//Transaction data could be any of the following 
// - address
// - transaction hash
cex.getBtcTransaction(transaction_data).then((data) =>{

	//this returns data that tells the number of confirmations
	// and other information relevant to the transaction

});
