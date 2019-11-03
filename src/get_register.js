let getContract = require("./common/contract_com.js").GetContract;
let  filePath = "./ethererscan/register.json";
let contractAddress = "0xc2500c2a90dc6eece516582caca5b006d425e1ff";
let web3 = require("./common/contract_com.js").web3;
// let AbiCoder = require("web3-eth-abi");
let Web3EthAbi = require('web3-eth-abi');
// import {AbiCoder} from 'web3-eth-abi';
let nonceMap = new Map();

async function init() {
	let contract = await getContract(filePath, contractAddress);
	return contract;
}
init().then(con => {
	// console.log(con.methods)
	let addr = "0x8E0f4A1f3C0DBEA0C73684B49aE4AD02789B3EC4";
	// isExitUserAddress(con, addr).then(res => {
	// 	console.log(res)
	// });
	let priKey = "0xFFE962244D80F95197089FE5FF87BE0163D485E7986A7070A498136012FD7B61";
	let username = "wu";
	let pwd = "123";
	login(con, priKey, addr, username, pwd).then((res, rej) => {
		console.log(4343, res);
	});
	// logout(con, priKey, addr, username, pwd).then((res, rej) => {
	// 	console.log(res);
	// });
});
function isExitUserAddress(contract, addr) {
	return new Promise(resolve => {
  	    contract.methods.isExitUserAddress(addr).call().then(res => {
			if (res) {
				console.log("this user already exist");
				resolve(res);
			} else {
				resolve(false);
			}
		}).catch(err => {
				console.log(err)
		});
    });
}
// First, judge whether user register
// If user already register, login directly
// Or, the user must login firstly.
function login(contract, privateKey, addr, username, pwd) {
	return new Promise((resolve, reject) => {
  	    contract.methods.isExitUserAddress(addr).call().then(res => {
			if (res) {
				console.log("Find:", res);
				const loginFun = contract.methods.login(addr, username, pwd);
		        const logABI = loginFun.encodeABI();
		        packSendMsg(addr, privateKey, contractAddress, logABI).then(receipt => {        			        	
		        	if (receipt) {
		        		console.log("Login success");
		        		const eventJsonInterface = contract._jsonInterface.find(
							o => (o.name === 'LoginEvent') && o.type === 'event');
						if (JSON.stringify(receipt.logs) != '[]') {
							const log = receipt.logs.find(
								l => l.topics.includes(eventJsonInterface.signature)
							)
							let de = Web3EthAbi.decodeLog(eventJsonInterface.inputs, log.data, log.topics.slice(1))
			   				console.log(de)
						}
		        		resolve(receipt);
		        	}  else {
						resolve(false);
					}
					
				}).catch(err => {
					console.log("Already login in");
					reject(err);
				});
			} else {
				console.log("Not find the user,it will directly create the user!");
				const createFunc = contract.methods.createUser(addr, username, pwd);
				const createABI = createFunc.encodeABI();
				packSendMsg(addr, privateKey, contractAddress, createABI).then((receipt, rej) => {
					
					console.log("Success create the user");
					if (receipt.status) {
						resolve(receipt);
					} else {
						reject(rej);
					}
				});				
			}
		});
    });
}

function logout(contract, privateKey, addr, username, pwd) {
	return new Promise((resolve, reject) => {
  	    contract.methods.isLogin(addr).call().then(res => {
			if (res) {
				console.log("Find:", res);
				const loginFun = contract.methods.logout(addr, username, pwd);
		        const logABI = loginFun.encodeABI();
		        packSendMsg(addr, privateKey, contractAddress, logABI).then(receipt => {        	
		        	if (receipt) {
		        		console.log("Login out success");
		        		resolve(receipt);
		        	} 
				}).catch(err => {
					console.log("Already login out");
					reject(err);
				});
			} else {
				reject("this user doesn't sign in!");			
			}
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