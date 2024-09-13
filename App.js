import 'react-native-get-random-values'
import '@ethersproject/shims'
import './shim.js'

import { Text, View } from 'react-native'
import { createContext, useContext, useEffect, useState } from 'react'
import { PushAPI } from '@pushprotocol/restapi'
import { ethers } from 'ethers'

import { ENV, ENCRYPTION_TYPE } from '@pushprotocol/restapi/src/lib/constants'

export default function App() {
  return (
    <ChatContextProvider>
      <Chat />
    </ChatContextProvider>
  )
}

export const Chat = () => {
  const { connect, pushUser, pushMeta } = useChatContext()

  useEffect(() => {
    const fetchData = async () => {
      await connect()
    }

    fetchData()
  }, [])

  return (
    <View style={{ padding: 100 }}>
      <Text>Chat</Text>
      <Text>{JSON.stringify(pushUser) ?? ''}</Text>
      <Text>{JSON.stringify(pushMeta) ?? ''}</Text>
    </View>
  )
}

export const ChatContext = createContext({})

const getPK = () => {
  const pk =
    process.env.EXPO_PUBLIC_PK ??
    'ac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80'

  if (!pk) {
    throw new Error('The environment variable is not defined')
  }

  if (
    (pk.length !== 64 && pk.length !== 66) ||
    (pk.length === 66 && !pk.startsWith('0x'))
  ) {
    throw new Error('The private key does not have the expected format')
  }

  return pk.startsWith('0x') ? pk : `0x${pk}`
}

export const ChatContextProvider = ({ children }) => {
  const [wallet, setWallet] = useState()
  const [pushUser, setPushUser] = useState()
  const [pushMeta, setPushMeta] = useState()

  const createWallet = () => {
    try {
      const signer = new ethers.Wallet(getPK())

      const address = signer.address
      const account = `eip155:${address}`
      setWallet({ signer, account })
    } catch (error) {
      console.error('Error creating wallet:', error)
    }
  }

  const connect = async () => {
    try {
      await initialize()
    } catch (initializationError) {
      console.error('Error during initialization:', initializationError)

      try {
        await createUser()
      } catch (creationError) {
        console.error(
          'Error creating user after initialization failure:',
          creationError
        )
      }
    }
  }

  const initialize = async () => {
    if (!wallet) {
      console.log('Initialization failed')
      return
    }

    try {
      const user = await PushAPI.initialize(wallet.signer, {
        account: wallet.account,
        env: ENV.STAGING,
        decryptedPGPPrivateKey: wallet.signer.privateKey,
        version: ENCRYPTION_TYPE.PGP_V3,
      })

      if (!user || !user.decryptedPgpPvtKey) {
        throw new Error('User not Found!')
      }
      setPushUser(user)
      console.log('User initialized successfully')

      const meta = await user.profile.info()
      setPushMeta(meta)
      console.log('META info successfully')
    } catch (error) {
      console.error('Error initializing PushAPI:', error)
    }
  }

  const createUser = async () => {
    if (!wallet) return
    try {
      await PushAPI.user.create({
        account: wallet.account,
        signer: wallet.signer,
        env: ENV.STAGING,
      })
      await initialize()
    } catch (error) {
      console.error('Error creating user:', error)
    }
  }

  useEffect(() => {
    const fetchData = async () => {
      if (wallet) {
        console.log('connecting...')
        await connect()
      }
    }

    fetchData()
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
        connect,
      }}
    >
      {children}
    </ChatContext.Provider>
  )
}

export const useChatContext = () => useContext(ChatContext)
