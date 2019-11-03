let getContract = require("./common/contract_com.js").GetContract;
let filePath = "./ethererscan/house_abi.json";
let contractAddress = "0x4347f800a63501c84255ae5d58e86e15db8fdd75";
let web3 = require("./common/contract_com.js").web3;
let Web3EthAbi = require('web3-eth-abi');
let nonceMap = new Map();
async function init() {
	let contract = await getContract(filePath, contractAddress);
	return contract;
}
init().then(con => {
	// console.log(con.methods)
	let addr = "0xaDCe9984d4d2E3936A0eB6F21a6105217a3E8766";	
	let priKey = "0x36923250A8BF14292202A7932DA90A3222560E8FF3C0426FC6B6199F1EE29023";
	let houseAddr = "It lies in SanFan";
	let des = "It's very beautiful, and it has a lot of fun";
	let info = "";
	let hopeCtx = "Hopy you are easygoing";
	// releaseHouse(con, addr, priKey, houseAddr, 5, des, info, 12, 320000000000, hopeCtx).then(res => {
	// 	if (res) {
	// 		console.log(res);
	// 	}
	// });
	// house id : 0x2a43eecd35d6b76aef7c08c9ab761ae366bd19018492fe8de12799ec342ac69f
	let addr2 = "0x7c943AAd08FE4FAC036FD8185Db145ae88dE1bb3";
	let privateKey2 = "0x052719F3BB83E6081F064CBF4A2087067CD55F088404D0A20DB5CDCB075D867B";
	let houseId = "0x2a43eecd35d6b76aef7c08c9ab761ae366bd19018492fe8de12799ec342ac69f";
	let realRent = 320000000000;
	requestSign(con, addr2, privateKey2, houseId, realRent).then(res => {
		if (res) {
			console.log(res);
		}
	});
});

function releaseHouse(contract, addr, privateKey, houseAddr, huxing, des, info, tenancy, rent, hopeCtx) {
	return new Promise((resolve, reject) => {
		// console.log(contract.methods)
		const releaseFun = contract.methods.releaseHouse(houseAddr, huxing, des, info, tenancy, rent, hopeCtx);
	    const relABI = releaseFun.encodeABI();
	    packSendMsg(addr, privateKey, contractAddress, relABI).then(receipt => {
        	if (receipt) {
        		console.log("Release house success!");
        		const eventJsonInterface = contract._jsonInterface.find(
					o => (o.name === 'RelBasic' || o.name == 'RelInfo') && o.type === 'event');
				if (JSON.stringify(receipt.logs) != '[]') {
					const log = receipt.logs.find(
						l => l.topics.includes(eventJsonInterface.signature)
					)
					let houseRel = Web3EthAbi.decodeLog(eventJsonInterface.inputs, log.data, log.topics.slice(1))
	   				// console.log(1222, de)
	   				if (houseRel) {
	   					resolve(houseRel);
	   				} else {
	   					resolve(receipt);
	   				}
				}
        	} else {
        		console.log("Release house fail!");
        	}
		}).catch(err => {
			console.log("Release success!");
			reject(err);
		});
	});
}


function requestSign(contract, addr, privateKey, houseId, realRent) {
	return new Promise((resolve, reject) => {
		const reqFun = contract.methods.requestSign(houseId, realRent);
	    const reqABI = reqFun.encodeABI();
	    packSendMsg(addr, privateKey, contractAddress, reqABI).then(receipt => {
        	if (receipt) {
        		console.log("Request the house success!");
        		const eventJsonInterface = contract._jsonInterface.find(
					o => (o.name === 'RequestSign') && o.type === 'event');
				if (JSON.stringify(receipt.logs) != '[]') {
					const log = receipt.logs.find(
						l => l.topics.includes(eventJsonInterface.signature)
					)
					let houseRel = Web3EthAbi.decodeLog(eventJsonInterface.inputs, log.data, log.topics.slice(1))
	   				// console.log(1222, de)
	   				if (houseRel) {
	   					resolve(houseRel);
	   				} else {
	   					resolve(receipt);
	   				}
				}
        	} else {
        		console.log("Release house fail!");
        	}
		}).catch(err => {
			console.log("Release success!");
			reject(err);
		});
	});
}

function signAgreement(contract, addr, privateKey, houseId, name, signHowLong, rental, yearRent) {
	return new Promise((resolve, reject) => {
		const signFun = contract.methods.requestSign(houseId, name, signHowLong, rental, yearRent);
	    const signABI = signFun.encodeABI();
	    packSendMsg(addr, privateKey, contractAddress, signABI).then(receipt => {
        	if (receipt) {
        		console.log("Release house success!");
        		resolve(receipt);
        	} else {
        		console.log("Release house fail!");
        	}
		}).catch(err => {
			console.log("Release success!");
			reject(err);
		});
	});
}
function withdraw(contract, addr, privateKey, houseId, amount) {
	return new Promise((resolve, reject) => {
		const withFun = contract.methods.requestSign(houseId, amount);
	    const withABI = withFun.encodeABI();
	    packSendMsg(addr, privateKey, contractAddress, withABI).then(receipt => {
        	if (receipt) {
        		console.log("Release house success!");
        		resolve(receipt);
        	} else {
        		console.log("Release house fail!");
        	}
		}).catch(err => {
			console.log("Release success!");
			reject(err);
		});
	});
}


function packSendMsg(formAddr, privateKey, toAddr, createABI) {
		let gas, nonce;
		return new Promise((resolve, reject) => {
			gas = 20000000000;
			web3.eth.getTransactionCount(formAddr, 'pending').then(_nonce => {
				if (nonceMap.has(_nonce)) {
					_nonce += 1
				}
				nonceMap.set(_nonce, true);
				nonce = _nonce.toString(16);
				const txParams = {
				  gasPrice: gas,
			      gasLimit: 2000000,
			      to: toAddr,
			      data: createABI,
			      from: formAddr,
			      chainId: 3,
			      nonce: '0x' + nonce
				}
				web3.eth.accounts.signTransaction(txParams, privateKey).then(signedTx => {
			 		web3.eth.sendSignedTransaction(signedTx.rawTransaction).then(receipt => {
			 			if (receipt.status) {
			 				console.log(receipt.transactionHash)
			 				resolve(receipt);
			 			} else {
			 				console.log("this user already regiester");
			 				reject("this user already regiester");
			 			}
			 		}).catch(err => {
			 			reject(err);
			 		});
				});
			});
		});	 	
}