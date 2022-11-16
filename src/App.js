import logo from "./logo.svg";
import "./App.css";
import { JsonRpcProvider, Network } from "@mysten/sui.js";
import React, { useEffect, useState } from "react";
import axios from "axios";
const ownerAddress = "0xaf739817f371f4ceff7f8217e7978258eddfce7e";
const recipientAddress = "0xe4d7b592d8c6afadb480979b7ae4739e66648436";
const provider = new JsonRpcProvider(Network.DEVNET);

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
    let gasId = undefined;
    console.log(adminObj, "ADMIN OBJECT");
    if (adminObj) {
      adminObj.map((event) => {
        if (
          event.type.includes("Forge") &&
          event.owner.AddressOwner === ownerAddress
        ) {
          forgeId = event.objectId;
          const arr = event.type.split(":");
          objectId = arr[0];
        } else if (
          gasId === undefined &&
          event.type.includes("0x2::coin::Coin<0x2::sui::SUI>")
        ) {
          gasId = event.objectId;
        }
      });
      const forger = await provider.getObject(objectId);
      if (
        forger.status === "Exists" &&
        forger.details.data.dataType === "package" &&
        forger.details.owner === "Immutable"
      ) {
        setForger({ packageId: objectId, forgeId, gasId });
      }
    }
  };

  const forgeSwordToAddress = async (recipient, objectId) => {
    console.log("call func forge sworld", forger);
    if (forger) {
      axios
        .post(
          "https://fullnode.devnet.sui.io:443",
          {
            id: 1,
            jsonrpc: "2.0",
            method: "sui_moveCall",
            params: [
              ownerAddress, //owner address
              forger.packageId, //packageId
              "my_module", //module name
              "sword_create", //func name
              ["0x2::sui_beginner::sui"],
              [forger.forgeId, 42, 7, recipientAddress], //agrs
              forger.gasId,
              3000,
            ],
          },
          {
            headers: {
              "Content-Type": "application/json",
            },
          }
        )
        .then((res) => {
          console.log(res, "this is result");
        });
      // console.log("address generated: ", signer.getAddress());
      // const moveCallTxn = await signer.executeMoveCall({
      //   packageObjectId: forger.packageId,
      //   module: "my_module",
      //   function: "sword_create",
      //   typeArguments: [],
      //   arguments: [
      //     forger.forgeId, //Forge Object id
      //     42, //magic att
      //     7, //strength att
      //     "0xe4d7b592d8c6afadb480979b7ae4739e66648436", //recipient Address
      //   ],
      //   gasBudget: 3000,
      // });
      // console.log("moveCallTxn : ", moveCallTxn);
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
