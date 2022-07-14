import Web3 from 'web3';
import { create, urlSource } from 'ipfs-http-client';
import { fetchNFT } from './pinata';
import api from '../api';
require("dotenv").config();
const Axios = require('axios');
const contractABI = require("./contract-abi.json");
const contractAddress = "0x9EeC9C77141EDa6ACA885d6cdaB8e27e30805081";

export const ipfsAddress = "https://ipfs.infura.io/ipfs/";
export const loadWeb3 = async () => {
  if (window.ethereum) {
    window.web3 = new Web3(window.ethereum);
  } else if (window.web3) {
    window.web3 = new Web3(window.web3.currentProvider);
  } else {
    window.alert(
      "Non-Ethereum browser detected. You should consider trying MetaMask!"
    );
  }
};

export const connectWallet = async () => {
  if (window.ethereum) {
    try {
      const addressArray = await window.ethereum.request({
        method: "eth_requestAccounts",
      });
      const obj = {
        status: "Metamask successfuly connected.",
        address: addressArray[0],
      };
      return obj;
    } catch (err) {
      return {
        address: "",
        status: "Something went wrong: " + err.message,
      };
    }
  }
  else {
    return {
      address: "",
      status: (
        <span>
          <p>
            {" "}
            🦊{" "}
            <a target="_blank" rel="noreferrer" href={`https://metamask.io/download.html`}>
              You must install Metamask, a virtual Ethereum wallet, in your
              browser.
            </a>
          </p>
        </span>
      ),
    };
  }
};

export const getCurrentWalletConnected = async () => {
  if (window.ethereum) {
    try {
      const addressArray = await window.ethereum.request({
        method: "eth_accounts",
      });
      if (addressArray.length > 0) {
        return {
          address: addressArray[0],
          status: "Fill in the text-field above.",
        };
      } else {
        return {
          address: "",
          status: "🦊 Connect to Metamask using the top right button.",
        };
      }
    } catch (err) {
      return {
        address: "",
        status: "Something went wrong: " + err.message,
      };
    }
  } else {
    return {
      address: "",
      status: (
        <span>
          <p>
            {" "}
            🦊{" "}
            <a target="_blank" rel="noreferrer" href={`https://metamask.io/download.html`}>
              You must install Metamask, a virtual Ethereum wallet, in your
              browser.
            </a>
          </p>
        </span>
      ),
    };
  }
};

export const createNftFile = async (file_path) => {
  const client = create('https://ipfs.infura.io:5001/api/v0')
  try {
    const added = await client.add(urlSource(file_path));
    return {
      success: true,
      data: added.cid.toString()
    }
  } catch (error) {
    return {
      success: false,
      data: 'Error uploading file: ' + error
    }
  }
};

export const getCurrentWallet = async () => {
  const web3 = window.web3;
  try {
    let accounts = await web3.eth.getAccounts();
    let accountBalance = await web3.eth.getBalance(accounts[0]);
    accountBalance = web3.utils.fromWei(accountBalance);
    return {
      success: true,
      account: accounts[0],
      balance: accountBalance
    }
  } catch(error) {
    return {
      success: false,
      result: "Something went wrong: " + error.message
    }
  }
}

export const mintNFT = async (nftID, author) => {
  const nft = await fetchNFT(nftID);
  if (!nft) {
    return {
      success: false,
      status: "Something went wrong while uploading your tokenURI.",
    };
  }
  let tokenURI = '';
  const result = await createNftFile(api.baseUrl + nft.preview_image.url);
  if (result.success) {
    tokenURI = result.data;
  }
  else {
    return {
      success: false,
      status: result.data,
    };
  }
  
  let item_price = nft.price;
  const unlock = false;//nft.unlock;
  const token_meta = tokenURI;
  const royalties = nft.royalties;
  // const tokenType = nft.token_type;
  
  const web3 = window.web3;
  try {
    window.contract = await new web3.eth.Contract(contractABI, contractAddress);
  } catch (error) {
    return {
      success: false,
      status: "Something went wrong: " + error.message,
    };
  }

  try {
    let accounts = await web3.eth.getAccounts();
    item_price = web3.utils.toWei(item_price !== null ? item_price.toString() : '0', 'ether');
    let mintingFee = web3.utils.toWei(author.minting_fee !== null ? author.minting_fee.toString() : '0', 'ether');;
    let tx = await window.contract.methods.mintSpectraNFT(tokenURI, token_meta, item_price, unlock, royalties, 0).send({ from: accounts[0], value: mintingFee });  
    var aprovedflag = await window.contract.methods.setApprovalForAll(contractAddress, true);  
    console.log("[aprovedflag] = ", aprovedflag && aprovedflag.arguments[1]);

    return {
      success: true,
      tokenURI: tokenURI,
      status:
        `Check out your transaction on Etherscan: <a target="_blank" href="https://testnet.bscscan.com/tx/${tx.transactionHash}">${tx.transactionHash}</a>`
    };
  } catch (error) {
    return {
      success: false,
      status: "Something went wrong: " + error.message,
    };
  }
}

export const buyNFT = async (nft, curUser) => {
  const result = await getCurrentWallet();
  const accountOfCustomer = result.account;
  console.log("buyNFT: provider = ", window.web3.currentProvider)
  window.web3 = new Web3(window.web3.currentProvider)
  const web3 = window.web3;
  try {
    window.contract = await new web3.eth.Contract(contractABI, contractAddress);
    console.log("contract:", window.contract)
  } catch (error) {
    return {
      success: false,
      status: "Something went wrong: " + error.message,
    };
  }

  try {
    // let tx = await window.contract.methods.mintSpectraNFT(tokenURI, token_metadata, item_price, unlock, royalties, 0).send({from: accounts[0], value: mintingFee});
    if (nft.author.wallet === undefined || nft.author.wallet === null || nft.author.wallet === "") {
      return {
        success: false,
        status: "You havn't your wallet."
      };
    }
    if (nft.unique_id === undefined || nft.unique_id === null || nft.unique_id === "") {
      return {
        success: false,
        status: "NFT dosen't have IPFS address."
      };
    }
    
    let nftPrice = web3.utils.toWei(nft.price !== null ? nft.price.toString() : '0', 'ether');
    // console.log('[accountOfCustomer] = ', accountOfCustomer, typeof accountOfCustomer);
    // console.log('[nft.author.wallet] = ', nft.author.wallet, typeof nft.author.wallet);
    // console.log('[nft.price] = ', nft.price, typeof nft.price );
   
    // console.log('[nftPrice] = ', nftPrice, typeof nftPrice );
    await window.contract.methods.transferNFT(nft.unique_id, nftPrice, 0).send({ from: accountOfCustomer, value: nftPrice });    
        
    ///*chage the ownership of saling NFT with buyer's id *///
    await Axios.put(`${api.baseUrl}${api.nfts}/${nft.id}`, { "author": curUser.id, "status": "normal", "situation":"saled" }, {
      params: {},
    }).catch(err => {
      return {
        success: false,
        status: "Something went wrong: " + err.message,
      };
    });
    /*add saling NFT to it's buyer's list *///
    var nftsOfCustomer = curUser.author.nfts ? curUser.author.nfts : [];
    var nftsToUpdateCustomer = [];
    nftsOfCustomer.forEach(element => {
      nftsToUpdateCustomer = [...nftsToUpdateCustomer, element.id];
    });
    nftsToUpdateCustomer = [...nftsToUpdateCustomer, nft.id];    
    await Axios.put(`${api.baseUrl}${api.authors}/${curUser.author.id}`, { "nfts": nftsToUpdateCustomer }, {
      params: {},
    }).catch(err => {
      return {
        success: false,
        status: "Something went wrong: " + err.message,
      };
    });
    return {
      success: true,
      status: "You've bought it!",
    };
  } catch (err) {
    return {
      success: false,
      status: "Something went wrong: " + err.message,
    };
  }
}

export const approveForResell = async () => {
  await window.contract.methods.setApprovalForAll(contractAddress, true); 
}