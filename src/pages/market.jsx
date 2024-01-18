import React, { useEffect, useState } from "react";
import Table from "react-bootstrap/Table";
import Button from "react-bootstrap/Button";
import { UsedGlobalContext } from "../../context/mainContext";
import { Tokens } from "../data/token.js";


function Market() {

      const {
        getBalance,
        flag,
        signer,
        checkAllowance,
        fetchReserveData,
      } = UsedGlobalContext();

      const [assetData, setAssetData] = useState([]);

      function formatNumber(n) {
        if (n >= 1e9) return (n / 1e9).toFixed(1) + "B";
        if (n >= 1e6) return (n / 1e6).toFixed(1) + "M";
        if (n >= 1e3) return (n / 1e3).toFixed(1) + "K";
        return n;
      }

      
    useEffect(() => {
      if (signer) {
        async function getTokenData() {
          setAssetData([]);
          for (let i = 0; i < Tokens.length; i++) {
            let _balance = await getBalance(
              Tokens[i].address,
              Tokens[i].decimal
            );
            let balance = parseFloat(_balance).toFixed(0);

            let isAllowed = await checkAllowance(
              Tokens[i].address,
              Tokens[i].decimal
            );

            let temp = await fetchReserveData(Tokens[i].address);

            let supplyApy = temp[0] == 0.0 ? "-" : temp[0] + "%";
            let borrowApy = temp[1] == 0.0 ? "-" : temp[1] + "%";
            let _totalToken = (parseFloat(temp[2])/10**Tokens[i].decimal).toFixed(0);
            let totalToken = formatNumber(_totalToken);
            console.log("totalToken 🟢", totalToken);
      
            let tkName = Tokens[i].name;
            let tkAddress = Tokens[i].address;
            let tkDecimal = Tokens[i].decimal;
            let obj = {
              balance,
              isAllowed,
              tkName,
              tkAddress,
              supplyApy,
              borrowApy,
              totalToken,
              tkDecimal,
            };
            setAssetData((prev) => [...prev, obj]);
          }
        }

        getTokenData();
      }
    }, [signer]);



  return (
    <>
      {signer && Tokens ? (
        <Table
          striped
          hover
          variant="dark"
          style={{ textAlign: "center", marginRight: "5%" }}
        >
          <thead>
            <tr>
              <td colSpan="6"> Asset Data</td>
            </tr>
            &nbsp;
            <tr>
              <th>No.</th>
              <th style={{ width: "140px" }}>Asset</th>
              <th>Total Supplied</th>
              <th style={{ width: "140px" }}>Wallet Balance</th>
              <th>APY</th>
              <th>APY (borrow)</th>
            </tr>
          </thead>
          <tbody>
            {!flag && Tokens ? (
              assetData.map((token, index) => (
                <tr key={index + 1}>
                  <td>{index + 1}</td>
                  <td>
                    <img
                      src={`https://app.aave.com/icons/tokens/${token.tkName.toLowerCase()}.svg`}
                      alt="Girl in a jacket"
                      width="35"
                      height="35"
                    />
                    &nbsp;
                    {token.tkName}
                  </td>
                  <td>{token.totalToken}</td>
                  <td>{token.balance}</td>
                  <td>{token.supplyApy}</td>
                  <td>{token.borrowApy}</td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="6">Connect wallet first</td>
              </tr>
            )}
          </tbody>
        </Table>
      ) : (
        <Button style={{ width: "100%" }} variant="light" size="lg">
          Connect Wallet
        </Button>
        
      )}
    </>
  );
}

export default Market;
