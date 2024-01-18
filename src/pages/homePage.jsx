import React,{useEffect,useState} from 'react'
import Table from "react-bootstrap/Table";
import Button from "react-bootstrap/Button";
import { UsedGlobalContext } from "../../context/mainContext";
import {Tokens} from "../data/token.js";
import Swal from 'sweetalert2'


function homePage() {

  const {
    Supply,
    approve,
    getBalance,
    flag,
    signer,
    testingApprove,
    Borrow,
    checkAllowance,
    fetchReserveData,
  } = UsedGlobalContext();

const [tokenData,setTokenData] = useState([]);

const makeSupply = async(name,address,decimal) => {

  const amount = await Swal.fire({
  title: 'Input Amount',
  input: 'number',
  inputLabel: 'Your amount',
  inputPlaceholder: 'Enter your amount',
})

if (amount) {
  Swal.fire(`Entered amount: ${amount.value}`)
  await Supply(address, decimal, amount.value);
}else{
  Swal.fire("Please enter a valid amount");
}

   
  };

 
    useEffect(() => {

      if (signer) {

          async function getTokenData() {
              setTokenData([]);
              for (let i = 0; i < Tokens.length; i++) {
                  console.log(`${i+1}`)
                  let _balance = await getBalance(
              Tokens[i].address,
              Tokens[i].decimal
            );
            let balance = parseFloat(_balance).toFixed(0);

            let isAllowed = await checkAllowance(
              Tokens[i].address,
              Tokens[i].decimal
            );

            let temp = await fetchReserveData(Tokens[i].address,Tokens[i].decimal);
            let supplyApy = temp[0] == 0.0 ? "-" : temp[0] + "%";
            let borrowApy = temp[1] == 0.0 ? "-" : temp[1] + "%";
            let variableBorrowApy = temp[3] == 0.0 ? "-" : temp[3] + "%";

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
              tkDecimal,
              variableBorrowApy,
            };
            setTokenData((prev) => [...prev, obj]);
          }
        }

        getTokenData();
      }
    }, [signer]);

  return (
    <>
      {signer && Tokens ? (
        <>
          <>
            <Table
              striped
              hover
              variant="dark"
              style={{ textAlign: "center", marginRight: "5%" }}
            >
              <thead>
                <tr>
                  <td colSpan="6">Supply Asset</td>
                </tr>
                &nbsp;
                <tr>
                  <th>No.</th>
                  <th style={{ width: "140px" }}>Asset</th>
                  <th style={{ width: "140px" }}>Wallet Balance</th>
                  <th>APY</th>
                  <th>Supply</th>
                </tr>
              </thead>
              <tbody>
                {!flag && Tokens ? (
                  tokenData.map((token, index) => (
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
                      <td>{token.balance}</td>
                      <td>{token.supplyApy}</td>
                      <td>
                        {!token.isAllowed ? (
                          <Button
                            onClick={() => approve(token.tkAddress)}
                            style={{ marginRight: "5px" }}
                            variant="outline-light"
                          >
                            Approve
                          </Button>
                        ) : (
                          <Button
                            onClick={() =>
                              makeSupply(
                                token.tkName,
                                token.tkAddress,
                                token.tkDecimal
                              )
                            }
                            variant="outline-light"
                          >
                            Supply
                          </Button>
                        )}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="6">Connect wallet first</td>
                  </tr>
                )}
              </tbody>
            </Table>

            <Table striped hover variant="dark" style={{ textAlign: "center" }}>
              <thead>
                <tr>
                  <td colSpan="6">Borrow Asset</td>
                </tr>
                &nbsp;
                <tr>
                  <th>No.</th>
                  <th style={{ width: "140px" }}>Asset</th>
                  <th>Available</th>
                  <th>APY (Stable)</th>
                  <th>APY (Variable)</th>
                  <th>Borrow</th>
                </tr>
              </thead>
              <tbody>
                {!flag && Tokens ? (
                  tokenData.map((token, index) => (
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
                      <td>{token.balance}</td>
                      <td>{token.borrowApy}</td>
                      <td>{token.variableBorrowApy}</td>
                      <td>
                        {!token.isAllowed ? (
                          <Button
                            onClick={() => approve(token.tkAddress)}
                            style={{ marginRight: "5px" }}
                            variant="outline-light"
                          >
                            Approve
                          </Button>
                        ) : (
                          <Button
                            onClick={() =>
                              Borrow(token.tkAddress, token.tkDecimal)
                            }
                            variant="outline-light"
                          >
                            Borrow
                          </Button>
                        )}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="6">Connect wallet first</td>
                  </tr>
                )}
              </tbody>
            </Table>
          </>
          <Button onClick={testingApprove}>Test</Button>
        
        </>
      ) : (
        <Button style={{ width: "100%" }} variant="light" size="lg">
          Connect Wallet
        </Button>
      )}
    </>
  );
}

export default homePage