import React from 'react'
import Container from "react-bootstrap/Container";
import Nav from "react-bootstrap/Nav";
import Navbar from "react-bootstrap/Navbar";
import {UsedGlobalContext} from '../../context/mainContext'
import Button from "react-bootstrap/Button";
import Badge from "react-bootstrap/Badge";



function navbar({ onLinkClick }) {

  const { ConnectWallet, DisconnectWallet, walletAddress, network, flag } =
    UsedGlobalContext();

  return (
    <>
      <Navbar bg="dark" data-bs-theme="dark">
        <Container>
          <Navbar.Brand href="#home">0xCore Finance</Navbar.Brand>
          <Nav className="me-auto">
             <Nav.Link href="#" onClick={() => onLinkClick('home')}>Home</Nav.Link>
            <Nav.Link href="#" onClick={() => onLinkClick('market')}>Market</Nav.Link>
            <Nav.Link href="#" onClick={() => onLinkClick('userData')}>User</Nav.Link>
         </Nav>
          <Badge style={{ marginRight: "10px" }}>{network}</Badge>
          <Button
            variant="outline-light"
            onClick={flag ? ConnectWallet : DisconnectWallet}
          >
            {flag ? (
              "Connect Wallet"
            ) : (
              <div className="button-content">
                <div className="wallet-address">
                  {walletAddress.slice(0, 8) +
                    "..." +
                    walletAddress.slice(35, 42)}
                </div>
                <div className="disconnect-text">Disconnect Wallet</div>
              </div>
            )}
          </Button>
        </Container>
      </Navbar>
    </>
  );
}

export default navbar