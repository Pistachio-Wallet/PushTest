import "react-native-get-random-values";
import "@ethersproject/shims";
import "./shim.js";

import { Text, View } from 'react-native';
import { createContext, useContext, useEffect, useState } from 'react';
import * as PushRest from '@pushprotocol/restapi';
import { ethers } from 'ethers';
import * as PushAPI from '@pushprotocol/react-native-sdk';
import { ENV } from '@pushprotocol/restapi/src/lib/constants';

export default function App() {
  return (
    <ChatContextProvider>
      <Chat />
    </ChatContextProvider>
  );
}

export const Chat = () => {
  const { connect, pushUser, pushMeta } = useChatContext()

  useEffect(() => {
    connect()
  }, [])

  return (
    <View style={{ padding: 100 }}>
      <Text>Chat</Text>
      <Text>{JSON.stringify(pushUser) ?? ""}</Text>
      <Text>{JSON.stringify(pushMeta) ?? ""}</Text>
    </View>
  )
}

export const ChatContext = createContext({});

export const ChatContextProvider = ({ children }) => {
  const [wallet, setWallet] = useState()
  const [pushUser, setPushUser] = useState()
  const [pushMeta, setPushMeta] = useState()

  const createWallet = () => {
    const signer = ethers.Wallet.createRandom();
    const address = signer.address;
    const account = `eip155:${address}`;
    setWallet({ signer, account })
  }

  const connect = () => {
    try {
      initialize()
    } catch (e) {
      try {
        createUser()
      } catch (e) {
        console.log(e)
      }
    }
  }

  const initialize = () => {
    if (!wallet) return
    try {
      PushRest.PushAPI.initialize(wallet.signer, { env: ENV.PROD, account: wallet.account })
        .then((user) => {
          setPushUser(user)
          user.profile.info().then((meta) => {
            setPushMeta(meta)
          })
        });
    } catch (e) {
      console.log(e)
    }

  }

  const createUser = () => {
    if (!wallet) return
    try {
      PushAPI.user.create({
        account: wallet.account,
        signer: wallet.signer,
        env: ENV.PROD,
      })
        .then(() => {
          initialize()
        });
    } catch (e) {
      console.log(e)
    }
  }

  useEffect(() => {
    if (!wallet) return
    connect()
  }, [wallet])

  useEffect(() => {
    createWallet()
  }, [])

  return (
    <ChatContext.Provider
      value={{
        pushUser,
        pushMeta,
        initialize,
        createUser,
        connect
      }}
    >
      {children}
    </ChatContext.Provider>
  );
};

export const useChatContext = () => useContext(ChatContext);
