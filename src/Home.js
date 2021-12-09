import Web3 from "web3";
import BigNumber from "big-number";
import { useState } from "react";
import { Link } from "react-router-dom";

import {
  crowdsaleAddress,
  crowdsaleAddressABI,
  coinAddress,
  coinAddressABI,
  nftLotAddress,
  nftLotAddressABI,
} from "./config";

function Home() {
  // itemId is unique identifier defined (not duplicate again) by the LOT backend (It'll listed from admin when call listedItem method and put to param on Smartcontract)
  const itemId = 4;
  // 1 * 10 ** 18 (10 ^ 18: is decimals method get from erc20Contract) | In this case it'll equivalent with 1USDT unit
  const usdt_coin = BigNumber(1 * 10 ** 18);
  const quantity = 1;
  const [web3, setWeb3] = useState();
  const [state, setState] = useState({
    itemId: "",
    price: "",
    erc20Address: "",
    cap: "",
  });
  const [info, setInfo] = useState();
  const [approve, setApprove] = useState(false);
  const [urlTx, setUrlTx] = useState();
  const [urlListedTx, setUrlListedTx] = useState();

  const connectWallet = async () => {
    if (typeof window.ethereum !== "undefined") {
      // Instance web3 with the provided information
      setWeb3(new Web3(window.ethereum));
      try {
        // Request account access
        await window.ethereum.request({ method: "eth_requestAccounts" });
        return alert("Connected wallet");
      } catch (e) {
        // User denied access
        return false;
      }
    }
  };

  const handleChange = async (event) => {
    event.preventDefault();
    const { name, value } = event.target;

    setState((prevState) => ({
      ...prevState,
      [name]: value,
    }));
  };

  const listedItem = async (event) => {
    event.preventDefault();

    if (typeof window.ethereum !== "undefined") {
      if (!web3) {
        return alert("Please connect wallet!");
      }
      await window.ethereum.request({ method: "eth_requestAccounts" });

      const accounts = await web3.eth.getAccounts();
      const account = accounts[0];

      const crowdsaleContract = new web3.eth.Contract(
        crowdsaleAddressABI,
        crowdsaleAddress
      );

      if (state?.itemId && state?.price && state?.erc20Address && state?.cap) {
        const listed = await crowdsaleContract.methods
          .listedItem(
            state?.itemId,
            state?.price,
            state?.erc20Address,
            state?.cap
          )
          .send({ from: account });
        console.log("listedItem", listed);
        const txBSC = `https://testnet.bscscan.com/tx/${listed.transactionHash}`;
        setUrlListedTx(txBSC);
        setState({
          itemId: "",
          price: "",
          erc20Address: "",
          cap: "",
        });
      }
    }
  };

  const approveErc20 = async () => {
    if (typeof window.ethereum !== "undefined") {
      if (!web3) {
        return alert("Please connect wallet!");
      }
      await window.ethereum.request({ method: "eth_requestAccounts" });

      const accounts = await web3.eth.getAccounts();
      const account = accounts[0];

      const crowdsaleContract = new web3.eth.Contract(
        crowdsaleAddressABI,
        crowdsaleAddress
      );

      const coinContract = new web3.eth.Contract(coinAddressABI, coinAddress);

      // approve USDT/LOT amount to contract, price amount approve to contract depend from parcel (itemId) which admin was listed price
      // and then multiplied with quantity nft (which you want to buy)
      // Example:
      // - nft want to buy: 5
      // - price amount from itemId which admin was listed: 1000000000000000000 (1USDT)
      // - Then amount must approve: 1000000000000000000 * 5 = 5000000000000000000 (5USDT)
      const approveCoin = await coinContract.methods
        .approve(crowdsaleContract._address, usdt_coin)
        .send({ from: account });

      // get result and query as example: https://testnet.bscscan.com/tx/0x1d9b9f3f552c6e497898a8df5a3ee0744a01970f8d1a2cb7fcfbfd46bfeae41b
      console.log("approveCoin", approveCoin.transactionHash);
      if (approveCoin?.transactionHash) {
        setApprove(true);
      }
    }
  };

  const buyOneNFT = async () => {
    if (typeof window.ethereum !== "undefined") {
      if (!web3) {
        return alert("Please connect wallet!");
      }
      await window.ethereum.request({ method: "eth_requestAccounts" });

      const accounts = await web3.eth.getAccounts();
      const account = accounts[0];

      const crowdsaleContract = new web3.eth.Contract(
        crowdsaleAddressABI,
        crowdsaleAddress
      );

      if (!approve) {
        return alert("Waiting for approve erc20Token...");
      }

      const buyNFT = await crowdsaleContract.methods
        .buy(itemId, quantity)
        .send({ from: account });

      console.log("buyNFT", buyNFT);

      const txBSC = `https://testnet.bscscan.com/tx/${buyNFT.transactionHash}`;
      setUrlTx(txBSC);
      setApprove(false);
    }
  };

  const getInfo = async () => {
    if (typeof window.ethereum !== "undefined") {
      if (!web3) {
        return alert("Please connect wallet!");
      }
      const accounts = await web3.eth.getAccounts();
      const account = accounts[0];

      // get network balance
      const balance = await web3.eth.getBalance(account);
      if (balance) {
        setInfo((prevState) => ({ ...prevState, networkBalance: balance }));
      }

      const coinContract = new web3.eth.Contract(coinAddressABI, coinAddress);
      const decimal = await coinContract.methods.decimals().call();

      coinContract.methods.balanceOf(account).call((err, result) => {
        if (err) {
          console.log("error: ", err);
          return err;
        }
        // check banlanceOf account
        setInfo((prevState) => ({
          ...prevState,
          coinBalance: result / 10 ** decimal,
        }));
      });

      const nftContract = new web3.eth.Contract(
        nftLotAddressABI,
        nftLotAddress
      );
      nftContract.methods.balanceOf(account).call((err, result) => {
        if (err) {
          console.log("error: ", err);
          return err;
        }
        // check balanceOf nft
        setInfo((prevState) => ({ ...prevState, nftBalance: result }));
      });
    }
  };

  return (
    <div className="App">
      <nav style={{ margin: "1rem" }}>
        <Link to="/" style={{ margin: "0.5rem" }}>
          Home
        </Link>
        <Link to="/signature" style={{ margin: "0.5rem" }}>
          Signature
        </Link>
      </nav>

      <header className="App-header">
        <h2>Interaction with listedItem method on Smartcontract</h2>
        <form onSubmit={listedItem}>
          <label>
            itemId:
            <input
              type="text"
              name="itemId"
              value={state.itemId}
              onChange={handleChange}
            />
          </label>

          <label>
            price:
            <input
              type="text"
              name="price"
              value={state.price}
              onChange={handleChange}
            />
          </label>
          <label>
            erc20Address:
            <input
              type="text"
              name="erc20Address"
              value={state.erc20Address}
              onChange={handleChange}
            />
          </label>
          <label>
            cap:
            <input
              type="text"
              name="cap"
              value={state.cap}
              onChange={handleChange}
            />
          </label>
          <input type="submit" value="Listed an Item" />
          <h6>
            Note: Currently only owner of Smartcontract (admin) have listedItem
            permission, example: 0x8f1e3e97111167fe1aec5085a5877c84b8c9420c
          </h6>
        </form>

        {urlListedTx ? (
          <p>
            -Transaction URL:{" "}
            <a href={urlListedTx} target="_blank">
              Visit on BSCScan
            </a>
          </p>
        ) : (
          ""
        )}

        <hr />

        <h2>Interaction with Buy method on Smartcontract</h2>

        <button
          style={{ width: "180px", margin: "0.5rem" }}
          onClick={() => connectWallet()}
        >
          Connect wallet
        </button>

        <button
          style={{ width: "180px", margin: "0.5rem" }}
          onClick={() => approveErc20()}
        >
          Approve erc20Coin to contract
        </button>

        <button
          style={{ width: "180px", margin: "0.5rem" }}
          onClick={() => buyOneNFT()}
        >
          Buy 1 NFT item now
        </button>

        {urlTx ? (
          <p>
            -Transaction URL:{" "}
            <a href={urlTx} target="_blank">
              Visit on BSCScan
            </a>
          </p>
        ) : (
          ""
        )}

        <button
          style={{ width: "180px", margin: "0.5rem" }}
          onClick={() => getInfo()}
        >
          Get balance
        </button>

        {info &&
          (info.hasOwnProperty("networkBalance") ||
            info.hasOwnProperty("coinBalance") ||
            info.hasOwnProperty("nftBalance")) && (
            <div>
              <h6>Balances</h6>
              <ul>
                <li>Network: {info.networkBalance / 1e18}</li>
                <li>Coin: {info.coinBalance}</li>
                <li>NFT: {info.nftBalance}</li>
              </ul>
            </div>
          )}
      </header>
    </div>
  );
}

export default Home;
