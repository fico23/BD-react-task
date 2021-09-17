import React, { useEffect } from "react";
import { Contract } from "@ethersproject/contracts";
import { useQuery, useMutation } from "@apollo/react-hooks";
import { utils } from "ethers";

import { Body, Button, Header, Image, Link } from "./components";
import logo from "./ethereumLogo.png";
import useWeb3Modal from "./hooks/useWeb3Modal";

import { addresses, abis } from "@project/contracts";
import {GET_TRANSFERS, SET_TRANSFER} from "./graphql/subgraph";

let trackedWallets = [];


async function readOnChainData(provider) {
  // Create an instance of an ethers.js Contract
  // Read more about ethers.js on https://docs.ethers.io/v5/api/contract/contract/
  const wallet = "0xBc05ad6390eFA623322D0B8f2C86bC8F2D73f010"
  const ceaErc20 = new Contract(addresses.bdtErc20, abis.erc20, provider);
  // A pre-defined address that owns some CEAERC20 tokens
  const tokenBalance = await ceaErc20.balanceOf(wallet);
  console.log({ tokenBalance: tokenBalance.toString() });

  addErc20TransferListener(provider, wallet)
}

function addErc20TransferListener(provider, address) {
  const filterFrom = {
    address: addresses.bdtErc20,
    topics: [
      utils.id('Transfer(address,address,uint256)'),
      utils.hexZeroPad(address, 32)
    ],
  }
  const filterTo = {
    address: addresses.bdtErc20,
    topics: [
      utils.id('Transfer(address,address,uint256)'),
      null,
      utils.hexZeroPad(address, 32)
    ],
  }

  const erc20Interface = new utils.Interface(abis.erc20)

  provider.on(filterFrom, (rawLog) => {
    const log = erc20Interface.parseLog(rawLog)
    if(!(log.args.to in trackedWallets)){
      trackedWallets.push(log.args.to);
    }
    console.log(log.args.to);
    console.log(`Transfer ${utils.formatEther(log.args.value)} from ${log.args.from} to ${log.args.to}`)
  })

  provider.on(filterTo, (rawLog) => {
    const log = erc20Interface.parseLog(rawLog)
    console.log(`Transfer ${utils.formatEther(log.args.value)} from ${log.args.from} to ${log.args.to}`)
  })
}

function WalletButton({ provider, loadWeb3Modal, logoutOfWeb3Modal }) {
  return (
    <Button
      onClick={() => {
        if (!provider) {
          loadWeb3Modal();
        } else {
          logoutOfWeb3Modal();
        }
      }}
    >
      {!provider ? "Connect Wallet" : "Disconnect Wallet"}
    </Button>
  );
}

function App() {
  const { loading, error, data } = useQuery(GET_TRANSFERS);
  const [provider, loadWeb3Modal, logoutOfWeb3Modal] = useWeb3Modal();

  useEffect(() => {
    if (!loading && !error && data && data.transfers) {
      console.log({ transfers: data.transfers });
    }
  }, [loading, error, data]);

     const [mutateFunction, updatedData] = useMutation(SET_TRANSFER,{
  variables: {
    to:'test', from:'test', value: 'test'
  },
});

  function test(){
    console.log("trackedWallets is ", trackedWallets);
  }

  return (
    <div>
      <Header>
        <WalletButton provider={provider} loadWeb3Modal={loadWeb3Modal} logoutOfWeb3Modal={logoutOfWeb3Modal} />
      </Header>
      <Body>
        <Image src={logo} alt="react-logo" />
        <p>
          Edit <code>packages/react-app/src/App.js</code> and save to reload.
        </p>
        {/* Remove the "hidden" prop and open the JavaScript console in the browser to see what this function does */}
        <Button onClick={() => readOnChainData(provider)}>
          Read On-Chain Balance
        </Button>

          <Button onClick={() => test()}>
          test
        </Button>

        <Link href="https://ethereum.org/developers/#getting-started" style={{ marginTop: "8px" }}>
          Learn Ethereum
        </Link>
        <Link href="https://reactjs.org">Learn React</Link>
        <Link href="https://thegraph.com/docs/quick-start">Learn The Graph</Link>
      </Body>
    </div>
  );
}

export default App;
