import logo from "./logo.svg";
import "./App.css";
import {
  Ed25519Keypair,
  JsonRpcProvider,
  Network,
  RawSigner,
} from "@mysten/sui.js";
import { useEffect, useState } from "react";
const provider = new JsonRpcProvider(Network.DEVNET);
const keypair = new Ed25519Keypair();
const signer = new RawSigner(keypair, provider);
const ownerAddress = "0xaf739817f371f4ceff7f8217e7978258eddfce7e";

function App() {
  const [adminObj, setAdminObj] = useState();
  const [forger, setForger] = useState();

  const getAllObject = async () => {
    const objects = await provider.getObjectsOwnedByAddress(ownerAddress);
    console.log(objects, "HAHAHA");
    setAdminObj(objects);
  };

  const getForgerDetail = async () => {
    let objectId = undefined;
    let forgeId = undefined;
    console.log(adminObj, "ADMIN OBJECT");
    if (adminObj) {
      adminObj.map((event) => {
        if (
          event.type.includes("Forge") &&
          event.owner.AddressOwner === ownerAddress
        ) {
          forgeId = event;
          const arr = event.type.split(":");
          objectId = arr[0];
        }
      });
      const forger = await provider.getObject(objectId);
      if (
        forger.status === "Exists" &&
        forger.details.data.dataType === "package" &&
        forger.details.owner === "Immutable"
      ) {
        setForger({ packageId: objectId, forgeId: packageId });
      }
    }
  };

  const forgeSwordToAddress = async (recipient, objectId) => {
    console.log("call func forge sworld", forger);
    if (forger) {
      const callSend = await signer.executeMoveCall({
        packageObjectId: forger.details.reference.objectId,
        module: "my_module",
        function: "sword_create",
        typeArguments: [],
        arguments: ["", 42, 7, "0xe4d7b592d8c6afadb480979b7ae4739e66648436"],
        gasBudget: 10000,
      });
    }
  };

  useEffect(() => {
    console.log("test");
    getAllObject();
  }, []);

  useEffect(() => {
    console.log("test detail");
    getForgerDetail();
  }, [adminObj]);

  useEffect(() => {
    console.log("test sendSworld");
    forgeSwordToAddress();
  }, [forger]);

  // console.log(adminObj, "This is admin Object list");
  // console.log(forger, "Event Forger");

  return (
    <div className="App">
      <header className="App-header">
        <img src={logo} className="App-logo" alt="logo" />
        <p>
          Edit <code>src/App.js</code> and save to reload.
        </p>
        <button>forge sword to send</button>
      </header>
    </div>
  );
}

export default App;
