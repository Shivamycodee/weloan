import React, { useState, useContext } from "react";
import { ethers } from "ethers";
import ERC20ABI from "../src/data/ERC20ABI.json";
import SupplyABI from "../src/data/SupplyABI.json";
import ReserveData from '../src/data/ReserveDataABI.json'
import {
  AavePoolV3_Mumbai,
  PoolDataProvider_Mumbai,
} from "../src/data/token.js";

export const mainContext = React.createContext();


export const MainContextProvider = ({ children }) => {

   const [flag, setFlag] = useState(true);
   const [walletAddress, setWalletAddress] = useState("");
   const [signer, setSigner] = useState();
   const [network, setNetwork] = useState();
   const [balance, setBalance] = useState([]);

   const [page,setPage] = useState("HomePage");

  const Network = {
    1: "Mainnet",
    80001: "Mumbai",
    137: "Polygon",
    56: "BSC",
    97: "BSC Testnet",
  };

 const ConnectWallet = async () => {
   let provider = new ethers.providers.Web3Provider(window.ethereum);
   let network = await provider.getNetwork();
   let networkId = network.chainId;
   setNetwork(Network[networkId]);

   provider
     .send("eth_requestAccounts", [])
     .then(async (accounts) => {
       setWalletAddress(accounts[0]);
       const balance = await provider.getBalance(accounts[0]);
       setBalance(balance.toString());
       setFlag(false);

       let sign = provider.getSigner();
       setSigner(sign);
     })

     .catch((err) => {
       console.log("Error connecting to MetaMask: ", err);
     });
 };

 const DisconnectWallet = async () => {
   setSigner();
   setWalletAddress("");
   setFlag(true);
   setNetwork();
 };

 const getBalance = async (address,decimal) => {
  const contract = new ethers.Contract(address, ERC20ABI, signer);
  try{
    const balance = await contract.balanceOf(walletAddress);
    const amt = ethers.utils.formatUnits(balance,decimal);
    return amt;
  }catch(e){
     console.log("Error in getting balance",e);
  }

 }

 const checkAllowance = async (address,decimal) => {
  const contract = new ethers.Contract(address, ERC20ABI, signer);
  try{
    const allowance = await contract.allowance(
      walletAddress,
      AavePoolV3_Mumbai
    );
    const amt = ethers.utils.formatUnits(allowance,decimal);
    return amt>0;
  }catch(e){
      console.log("Error in getting allowance",e);
  }
}
    
   const approve = async (address) => {
     try {
       const contracts = new ethers.Contract(address, ERC20ABI, signer);
       const amount = ethers.utils.parseUnits("10000000", 6);
      //  await contracts.approve(AavePoolV3_Mumbai, amount);
       await contracts.approve(
         "0xccc4dF7BAB0BEC8fB942aC6B253ec55eB4b35EB7",
         amount
       );
     } catch (e) {
      console.log("Error in approving",e);
     }
   };

  async function Supply(token,decimal,val) {
    try {
        const contract = new ethers.Contract(AavePoolV3_Mumbai, SupplyABI, signer);
        const amount = ethers.utils.parseUnits(val, decimal);
        const txReceipt = await contract.supply(token, amount, walletAddress, 0);
    } catch (e) {
      console.error("💀 ",e);
    }
  }
  
  const testingApprove = async () => {
      const amount6 = ethers.utils.parseUnits("10000000", 6);
      const amount18 = ethers.utils.parseUnits("10000000", 18);
      const CompoundContract = "0xdEA35BD5FF6463a5F6DA060879D2166d6D77D76C";
        const contractsAGEUR = new ethers.Contract(
          "0x1870299d37aa5992850156516DD81DcBf98f2b1C", // usdc
          ERC20ABI,
          signer
        );
          const contractsUsdt = new ethers.Contract(
            "0xAcDe43b9E5f72a4F554D4346e69e8e7AC8F352f0", // usdt
            ERC20ABI,
            signer
            );
            const contractsJEUR = new ethers.Contract(
              "0x6bF2BC4BD4277737bd50cF377851eCF81B62e320", // bal
              ERC20ABI,
              signer
            );
        // await contractsUsdc.approve(
        //   CompoundContract,
        //   amount6
        // );
        await contractsUsdt.approve(
          CompoundContract,
          amount6
        );
        await contractsJEUR.approve(CompoundContract, amount18);

    };

  async function Withdraw(token,amount,decimal){
    try{
      const contract = new ethers.Contract(AavePoolV3_Mumbai, SupplyABI, signer);
      const amt = ethers.utils.parseUnits(amount, decimal);
       await contract.withdraw(token, amt, walletAddress);
    }catch(e){
      console.log("Error in withdrawing",e);
    }
  }

  async function Borrow(token,decimal){
    try{
      const contract = new ethers.Contract(AavePoolV3_Mumbai, SupplyABI, signer);
      const amount = ethers.utils.parseUnits("5", decimal);
      const txReceipt = await contract.borrow(token, amount,1, 0, walletAddress);
      console.log("🔺borrow: ",txReceipt);
    }catch(e){
      console.log("Error in borrowing",e);
    }
  }

  async function Repay(token,decimal,amount){
    try{
      const contract = new ethers.Contract(AavePoolV3_Mumbai, SupplyABI, signer);
      const amt = ethers.utils.parseUnits(amount, decimal);
      const txReceipt = await contract.repay(token, amt, 1, walletAddress);
      console.log("🔺repay: ",txReceipt);
    }catch(e){
      console.log("Error in repaying",e);
    }
  }
  

  async function fetchReserveData(token,decimal) {

    try{

      const contract = new ethers.Contract(PoolDataProvider_Mumbai, ReserveData, signer);
      const reserveData = await contract.getReserveData(token);
      let liqRate = reserveData.liquidityRate*100/10**27   ;
      let stableBorrowRate = reserveData.averageStableBorrowRate*100/10**27;
      let variableBorrowRate = reserveData.variableBorrowRate*100/10**27;
      let totalToken = reserveData.totalAToken.toString();  
      return  [liqRate.toFixed(2),stableBorrowRate.toFixed(2),totalToken,variableBorrowRate.toFixed(2)];
    }catch(e){
      console.log("Error in fetching reserve data",e);
      return [0.00,0.00]
    }
  }
    

  async function fectUserReserveData(token) {
    try{
      const contract = new ethers.Contract(PoolDataProvider_Mumbai, ReserveData, signer);
      const userReserveData = await contract.getUserReserveData(token,walletAddress);
      return userReserveData;
    }catch(e){
      console.log("Error in fetching USER reserve data");
      // return 0;
    }
  }



  return (
    <mainContext.Provider
      value={{
        approve,
        ConnectWallet,
        checkAllowance,
        DisconnectWallet,
        fetchReserveData,
        fectUserReserveData,
        getBalance,
        walletAddress,
        Supply,
        testingApprove,
        Borrow,
        Repay,
        signer,
        flag,
        network,
        Withdraw,
        balance,
        page,
        setPage
      }}
    >
      {children}
    </mainContext.Provider>
  );
};

export const UsedGlobalContext = () => {
  return useContext(mainContext);
};

export default MainContextProvider;
