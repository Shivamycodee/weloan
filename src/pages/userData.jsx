import React, { useEffect, useState } from "react";
import Table from "react-bootstrap/Table";
import Button from "react-bootstrap/Button";
import { UsedGlobalContext } from "../../context/mainContext";
import { Tokens } from "../data/token.js";
import { ethers } from "ethers";
import Swal from "sweetalert2";

function userData() {
  
  const [userData, setUserData] = useState([]);
  const { fectUserReserveData,fetchReserveData,Withdraw,Repay, signer,flag} = UsedGlobalContext();


  const makeWithdraw = async (address,decimal) => {
    const amount = await Swal.fire({
      title: "Input Amount",
      input: "number",
      inputLabel: "Your amount",
      inputPlaceholder: "Enter your amount",
    });

    if (amount) {
      Swal.fire(`Entered amount: ${amount.value}`);
      await Withdraw(address, amount.value, decimal);
    } else {
      Swal.fire("Please enter a valid amount");
    }
  };

  const makeRepay = async (address, decimal) => {
    const amount = await Swal.fire({
      title: "Input Amount",
      input: "number",
      inputLabel: "Your amount",
      inputPlaceholder: "Enter your amount",
    });

    if (amount) {
      Swal.fire(`Entered amount: ${amount.value}`);
      await Repay(address, decimal, amount.value);
    } else {
      Swal.fire("Please enter a valid amount");
    }
  };


   useEffect(() => {
     if (signer) {

      setUserData([]);

       async function getUserData() {

         for (let i = 0; i < Tokens.length; i++) {

          let data = await fectUserReserveData(Tokens[i].address);

          let temp = await fetchReserveData(Tokens[i].address,Tokens[i].decimal);

          let supplyApy = temp[0] == 0.0 ? "-" : temp[0] + "%";
          let borrowApy = temp[1] == 0.0 ? "-" : temp[1] + "%";

          let aTokenBalance =0;
          let borrowAmount = 0;
          let currentDebt = 0;

          if(data){
             aTokenBalance = data.currentATokenBalance.toString();
             borrowAmount = data.principalStableDebt.toString();
             currentDebt = data.currentStableDebt.toString();
            }
          if(aTokenBalance == 0 && borrowAmount == 0) continue;

          let _borrowedAmmount = ethers.utils.formatUnits(borrowAmount, Tokens[i].decimal);
          let _currentDebt = ethers.utils.formatUnits(currentDebt, Tokens[i].decimal);
          let _supplied = ethers.utils.formatUnits(aTokenBalance, Tokens[i].decimal);

          let interestEarned = (_currentDebt - _borrowedAmmount).toFixed(5);
          let BorrowedAmount = parseFloat(_borrowedAmmount).toFixed(2);
          let supplied = parseFloat(_supplied).toFixed(2);

          let name = Tokens[i].name; 
          let tkAddress = Tokens[i].address;  
          let tkDecimal = Tokens[i].decimal;     
          let obj = {
            supplied,
            interestEarned,
            BorrowedAmount,
            borrowApy,
            supplyApy,
            name,
            tkAddress,
            tkDecimal,
          };
          setUserData((prev) => [...prev, obj]);


         }
       }

       getUserData();
     }
   }, [signer]);



  return (
    <>
      {signer && Tokens ? (
        <>
          <Table
            striped
            hover
            variant="dark"
            style={{ textAlign: "center", marginRight: "5%" }}
          >
            <thead>
              <tr>
                <td colSpan="6">Supplied Asset</td>
              </tr>
              &nbsp;
              <tr>
                <th>No.</th>
                <th style={{ width: "140px" }}>Asset</th>
                <th>APY</th>
                <th>Supplied</th>
                <th>Withdraw</th>
              </tr>
            </thead>
            <tbody>
              {!flag && Tokens ? (
                userData.map((token, index) =>
                  token.supplied > 0 ? (
                    <tr key={index + 1}>
                      <td>{index + 1}</td>
                      <td>
                        <img
                          src={`https://app.aave.com/icons/tokens/${token.name.toLowerCase()}.svg`}
                          alt="Girl in a jacket"
                          width="35"
                          height="35"
                        />
                        &nbsp;
                        {token.name}
                      </td>
                      <td>{token.supplyApy}</td>
                      <td>{token.supplied}</td>
                      <td>
                        <Button
                          onClick={() =>
                            makeWithdraw(token.tkAddress, token.tkDecimal)
                          }
                          variant="outline-light"
                        >
                          withdraw
                        </Button>
                      </td>
                    </tr>
                  ) : null
                )
              ) : (
                <tr>
                  <td colSpan="6">Connect wallet first</td>
                </tr>
              )}
            </tbody>
          </Table>

          <Table
            striped
            hover
            variant="dark"
            style={{ textAlign: "center", marginRight: "5%" }}
          >
            <thead>
              <tr>
                <td colSpan="6">Borrowed Asset</td>
              </tr>
              &nbsp;
              <tr>
                <th>No.</th>
                <th style={{ width: "140px" }}>Asset</th>
                <th>APY</th>
                <th>Borrowed</th>
                <th>Interest</th>
                <th>Repay</th>
              </tr>
            </thead>
            <tbody>
              {!flag && Tokens ? (
                userData.map((token, index) =>
                  token.BorrowedAmount > 0 ? (
                    <tr key={index + 1}>
                      <td>{index + 1}</td>
                      <td>
                        <img
                          src={`https://app.aave.com/icons/tokens/${token.name.toLowerCase()}.svg`}
                          alt="Girl in a jacket"
                          width="35"
                          height="35"
                        />
                        &nbsp;
                        {token.name}
                      </td>
                      <td>{token.borrowApy}</td>
                      <td>{token.BorrowedAmount}</td>
                      <td>{token.interestEarned}</td>
                      <td>
                        <Button
                          onClick={() =>
                            makeRepay(token.tkAddress, token.tkDecimal)
                          }
                          variant="outline-light"
                        >
                          Repay
                        </Button>
                      </td>
                    </tr>
                  ) : null
                )
              ) : (
                <tr>
                  <td colSpan="6">Connect wallet first</td>
                </tr>
              )}
            </tbody>
          </Table>
        </>
      ) : (
        <Button style={{ width: "100%" }} variant="light" size="lg">
          Connect Wallet
        </Button>
      )}
    </>
  );
}

export default userData;
