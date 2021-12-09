import Web3 from "web3";
import { useState } from "react";
import { Link } from "react-router-dom";

function Signature() {
  const [state, setState] = useState({
    privateKey: "0x",
    itemId: "",
    buyerAddress: "",
    quantity: "",
    price: "",
    erc20Address: "",
  });
  const [signature, setSignature] = useState();

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
      const web3 = new Web3(window.ethereum);

      await window.ethereum.request({ method: "eth_requestAccounts" });

      const cloneObj = { ...state };
      cloneObj.itemId = Number(cloneObj.itemId);
      cloneObj.quantity = Number(cloneObj.quantity);

      const messageHash = web3.utils.soliditySha3(
        { t: "uint256", v: cloneObj.itemId },
        { t: "address", v: cloneObj.buyerAddress },
        { t: "uint256", v: cloneObj.quantity },
        { t: "uint256", v: cloneObj.price },
        { t: "address", v: cloneObj.erc20Address }
      );

      const signature = web3.eth.accounts.sign(
        messageHash,
        cloneObj.privateKey
      );

      console.log("signature", signature);

      if (signature?.signature) {
        setSignature(signature?.signature);
      }
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
        <h2>Get Signature</h2>

        <form onSubmit={listedItem}>
          <label>
            Private key:
            <input
              type="text"
              name="privateKey"
              value={state.privateKey}
              onChange={handleChange}
            />
          </label>

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
            buyerAddress:
            <input
              type="text"
              name="buyerAddress"
              value={state.buyerAddress}
              onChange={handleChange}
            />
          </label>

          <label>
            quantity:
            <input
              type="text"
              name="quantity"
              value={state.quantity}
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

          <input type="submit" value="Submit sign" />
        </form>

        {signature && <h6>Copy signature: {signature}</h6>}
      </header>
    </div>
  );
}

export default Signature;
