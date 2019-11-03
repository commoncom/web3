let getContract = require("./common/contract_com.js").GetContract;
let  filePath = "./ethererscan/token_abi.json";
let contractAddress = "0xfed21ab2993faa0e0b2ab92752428d96370d4889";
let web3 = require("./common/contract_com.js").web3;
let nonceMap = new Map();

async function init() {
	let contract = await getContract(filePath, contractAddress);
	return contract;
}
init().then(con => {
   let addr = "0xaDCe9984d4d2E3936A0eB6F21a6105217a3E8766";
   getBalance(con, addr).then(res => {
     console.log(res);
   });
   let to = "0x5b0ccb1c93064Eb8Fd695a60497240efd94A44ed";
   // let from = "0xaDCe9984d4d2E3936A0eB6F21a6105217a3E8766";
   let privKey = "0x36923250A8BF14292202A7932DA90A3222560E8FF3C0426FC6B6199F1EE29023";
    
   transfer(con, addr, addr, privKey, to, 20000000000).then((receipt, reject) => {
     console.log(receipt.transactionHash)
   });
   let spender = "0x5b0ccb1c93064Eb8Fd695a60497240efd94A44ed";
   // approveTransfer(con, addr, privKey, spender, 10000000000).then((receipt, reject) => {
   //  console.log(receipt.transactionHash);
   // });
});

function getBalance(contract, addr) {
	return new Promise((resolve, reject) => {
		contract.methods.balanceOf(addr).call().then(res => {
			// console.log(res);
			resolve(res)
		}).catch(err => {
			console.log(err);
		});
	});
}
/**
* des: initAddr: 若是普通转账则与from相同；若是授权后的转账，则与from不同 
*/
function transfer(contract, initAddr, from, privateKey, to, amount) {
  return new Promise((resolve, reject) => {
  	  // console.log(contract.methods)
      const transFun = contract.methods.transferFrom(from, to, amount);
      const transABI = transFun.encodeABI();
      let gas, nonce;
      gas = 20000000000;
      web3.eth.getTransactionCount(initAddr, 'pending').then(_nonce => {
          if (nonceMap.has(initAddr) && (nonceMap[initAddr] == _nonce)) {
             _nonce += 1
          }
          nonceMap.set(initAddr, _nonce);
          nonce = _nonce.toString(16);
          const txParams = {
              gasPrice: gas,
              gasLimit: 210000,
              to: contractAddress,
              data: transABI,
              from: initAddr,
              chainId: 3,
              // value: web3.utils.toHex(amount),
              nonce: '0x' + nonce
          }
          web3.eth.accounts.signTransaction(txParams, privateKey).then(signedTx => {
              web3.eth.sendSignedTransaction(signedTx.rawTransaction).then(receipt => {
                // console.log(receipt)
                if (receipt.status) {
                	resolve(receipt);
                  	// console.log(receipt.transactionHash)
                } else {
                	reject(receipt);
                }
              }).catch(err => {
                console.log(err);
              });
          });  
      });      
  });
}
// Call one for every contract
function approveTransfer(contract, from, privateKey,spender, amount) {
	return new Promise((resolve, reject) => {
  	  // console.log(contract.methods)
      const transFun = contract.methods.approve(spender, amount);
      const transABI = transFun.encodeABI();
      packSendMsg(from, privateKey, spender, transABI).then((res, rej)=> {
         resolve(res);
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
              // console.log(receipt.transactionHash)
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


// test();
// function test() {
//   let con = init();
//   let addr = "0xaDCe9984d4d2E3936A0eB6F21a6105217a3E8766";
//   getBalance(con, addr).then(res => {
//       console.log(res);
//   });
//   // let from = "0xaDCe9984d4d2E3936A0eB6F21a6105217a3E8766";
//   let privKey = "0x36923250A8BF14292202A7932DA90A3222560E8FF3C0426FC6B6199F1EE29023";
//   let to = "0x5b0ccb1c93064Eb8Fd695a60497240efd94A44ed"; // 
  
//   // transfer(con, addr, addr, privKey, to, 20000000000).then((receipt, reject) => {
//   //  console.log(receipt.transactionHash)
//   // });
//   console.time("st");
//   let spender = "0x7c943AAd08FE4FAC036FD8185Db145ae88dE1bb3";
//   approveTransfer(con, addr, privKey, spender, 30000000000).then((receipt, reject) => {
//     console.log(receipt.transactionHash);
//     console.timeEnd("st");
//   });
// }
// init().then(con => {
//  let addr = "0xaDCe9984d4d2E3936A0eB6F21a6105217a3E8766";
//  getBalance(con, addr).then(res => {
//    console.log(res);
//  });
//  // let from = "0xaDCe9984d4d2E3936A0eB6F21a6105217a3E8766";
//  let privKey = "0x36923250A8BF14292202A7932DA90A3222560E8FF3C0426FC6B6199F1EE29023";
//  let to = "0x5b0ccb1c93064Eb8Fd695a60497240efd94A44ed"; // 
  
//  // transfer(con, addr, addr, privKey, to, 20000000000).then((receipt, reject) => {
//  //  console.log(receipt.transactionHash)
//  // });
//   console.time("st");
//  let spender = "0x7c943AAd08FE4FAC036FD8185Db145ae88dE1bb3";
//  approveTransfer(con, addr, privKey, spender, 30000000000).then((receipt, reject) => {
//    console.log(receipt.transactionHash);
//     console.timeEnd("st");
//  });
// });
