# Solana

* Rust is the Language, Solana uses to build Programs / Accounts (Smart Contracts)
* To store Data on Solana, an Account must be created each Time
* These Accounts store Data in the Blockchain therefore it is possible to:
  * have on big Account that stores all the Information that are needed or
  * many little Accounts that store granular Information
* Programs create, retrieve, update or delete Accounts, but they need Accounts to store Information as it can not be stored in the Program
* Programs are special Accounts that:
  * store their own Code,
  * are read-only and
  * are marked as executable
* There is an Executable Boolean on every single Account that indicates if this Account is a Program or a regular Account that stores Data

* __Rent__ is a Concept in Solana that ensures everybody that adds Data to the Blockchain is accountable for the Amount of Storage they provide
* The Rent Concept works as follows:
  * When an Account is created, someone has to put some Lamport (SOL) into it
  * Periodically the Blockchain collects some of that Lamport (SOL) as a Rent, that Rent is proportional to the Size of the Account
  * When the Account runs out of Lamport (SOL), the Account is deleted and its Data is lost
* A __Lamport__ is the smallest Decimal of Solana's native Token SOL
* If enough Lamport (SOL) is added in the Account to pay the Equivalent of two Years of Rent the Account become __rent-exempt__
* Once done this, the Lamport (Sol) will stay on the Account forever and will never be collected
* If the Account is closed its Lamport (SOL) will be refunded to the Owner
* Solana Defaults to allocating twice the Amount of Space needed to store the Program because the Program is likely to have Updates in the Future

* __Solana Commitment__ describes how finalized a Block is at the Point of Sending the Transaction:
* When Sending a Transaction to the Blockchain it is added to a Block which will need to be finalized before officially becoming a Part of the Blockchain’s Data
  * Before a Block is finalized, it has to be confirmed by a Voting System made on the Cluster
  * Before a Block is confirmed, there is a Possibility that the Block will be skipped by the Cluster (because of Reading Operations can be performed in parallel)
* Therefore, there are the following three Commitment Levels:
  * __finalized__ means that it is certain that the Block will not be skipped and, therefore, the Transaction will not be rolled back
  * __confirmed__ means that the Cluster has confirmed through a Vote that the Transaction’s Block is valid - Whilst this is a strong Indication the transaction will not roll back, it is still not a Guarantee
  * __processed__ means that the Transaction has been processed and added to a Block, and no Guarantee is needed on what will happen to that Block
* `commitment` and `preflightCommitment` both of them define the Level of Commitment that is expected from the Blockchain when sending a Transaction
* `preflightCommitment` will be used when Simulating a Transaction whereas `commitment` will be used when Sending the Transaction on the Mainnet



## Project
* Every Tweet is stored on its own Account
* That Way, Storage will be created and paid on Demand by the Author of the Tweet
* Since each Tweet will require only a small Amount of Space, the Storage will be more affordable and will scale to an unlimited Amount of Tweets and Users
* Granularity pays in Solana

* The Owner of an Account will be the Program that generated it, therefore the Field `author` in a Tweet is necessary:
* The Solana-Twitter Program is owned by another Account which is Solana's System Program
* This executable Account also owns every User an Account
* The System Program is ultimately the ancestor of all Solana Accounts

<p align="center">
  <img src="https://user-images.githubusercontent.com/29623199/147405481-2674965d-fbf9-43df-995e-ddf540bc2eca.png" alt="accounts structure" width="65%"/>
</P>

### Accounts in Project
* `tweet`: This is the Account that the Instruction will create by passing the Public Key that should be used when Creating the Account and also its Private Key to prove that the Instruction owns the Public Key
* `author`: This Account is used to know who is Sending the Tweet, and also to get the Signature of the Sender to prove it
* `system_program`: This is the official System Program (Account) from Solana that will pass through to interact with the stateless Programs. It will initialize the Tweet Account and figure out how much Lamport (SOL) is necessary for it to be rent-exempt

### Interaction in Project
* Solana offers a JSON RPC API to interact with their Blockchain
* Solana provides a JavaScript Library called `@solana/web3.js` that encapsulates this API by providing a Bunch of asynchronous Methods
* All of these Methods live inside a `Connection` Object that requires a Cluster for it to know where to send its Requests
* A Cluster can be Localhost, Devnet or Mainnet
* A `Wallet` Object that has Access to the Key Pair of the User who makes the Transaction is necessary to sign them and prove his Identity
* Anchor provides a JavaScript Library called `@project-serum/anchor` that provides a `Wallet` Object that requires a Key Pair and allows signing Transactions
* Anchor’s Library `@project-serum/anchor` also provides a `Provider` Object that wraps both the `Connection` and the `Wallet` and automatically adds the Wallet’s Signature to outgoing Transactions
* Anchor generates a JSON File called an `IDL` (Interface Description Language)
* That `IDL` File contains a structured Description of the Solana Program including its Public Key, Instructions and Accounts
* The Object `Program` uses both the `IDL` and the `Provider` to create a Custom JavaScript API that completely matches the Solana Program
* That `Program` Object can interact with the Solana Program on Behalf of a Wallet without even needing to know anything about the underlying API

<p align="center">
  <img src="https://user-images.githubusercontent.com/29623199/147581109-fb2981ba-b729-47e9-9bc1-054da8bb90ef.png" alt="solana-interacting-model" width="75%"/>
</P>

### Filter in Solana
* Solana supports the following two Types of Filters:
* The `dataSize` Filter that takes a Size in Bytes, and it will only return Accounts that match exactly that Size
* `{ dataSize: 2000 }` will not include Accounts above or below 2000 Bytes in the Result
* The `memcmp` Filter allows comparing an Array of Bytes with the Account's Data at a particular Offset
* That means, the `memcmp` Filter takes an Array of Bytes that should be present in the Account's Data at a certain Position, and it will only return these Accounts
* `{ memcmp: { offset: 42,  bytes: 'D4AFE..' } }` will include all Accounts that have the given Public Key at the 42nd Byte
<hr/>

## Accounts
* __Programs__ are special Accounts that store their own Code but can not store any other Information (Programs in Solana are stateless)
* Because of that, Sending an __Instruction__ to a Program requires Providing all the necessary Context for it to run successfully
* When a new Account is created, a Discriminator of exactly 8 Bytes will be added to the Beginning of the Data
* That Discriminator stores the Type of the Account
* This Way, if multiple Types of Accounts exits then the Program can differentiate them

### Sizing an Account
| Type               | Size                                            |
|--------------------|-------------------------------------------------|
| bool               | 1 Byte                                          |
| u8 or i8           | 1 Byte                                          |
| u16 or i16         | 2 Byte                                          |
| u32 or i32         | 4 Byte                                          |
| u64 or i64         | 8 Byte                                          |
| u128 or i128       | 16 Byte                                         |
| [u16; 32]          | 64 Byte                                         |
| PubKey or [u8; 32] | 32 Byte                                         |
| vec<u16>           | Any Multiple of 2 Byte + 4 Bytes for the Prefix |
| String or vec<8>   | Any Multiple of 1 Byte + 4 Bytes for the Prefix |

### Instruction versus Transaction
* A Transaction is composed of one or multiple Instructions
* When a User interacts with the Blockchain, he can push many Instructions in an Array and send all of them as one Transaction
* Transactions are atomic, meaning that if any of the Instructions fail, the entire Operation (Transaction) rolls back
* Instructions can be delegated to other Instructions either within the same program or outside the current Program, called Cross-Program Invocations (CPI)
* During CPIs the Signers of the current Instruction are automatically passed along to the nested Instructions
* No matter how many Instructions and nested Instructions exists inside a Transaction, it will always be atomic

## Anchor

### Structure

* The `programs` Folder contains all our Solana Programs
* The `tests` Folder contains all JavaScript Tests that directly interact with the Programs
* The `Anchor.toml` Configuration File helps to configure the Program ID, Solana Clusters, Test Command, etc.
* The `app` Folder contains the JavaScript Client

### Commands

| Command                                                     | Description                                                                                                                |
|-------------------------------------------------------------|----------------------------------------------------------------------------------------------------------------------------|
| anchor build                                                | Compiles and builds the Program and generate the IDL                                                                       |
| anchor deploy                                               | Deploys the compiled Program (Build) on the Cluster and it will also generate a Public and Private Key for it              |
| anchor run script                                           | Runs a given Script from the `Anchor.toml` Configuration File                                                              |
| anchor test                                                 | Starts a local Ledger that will be automatically terminated at the End of all Tests and build, deploy and test the Program |
| anchor idl init <programId> -f <target/idl/program.json>    | Publishes the IDL File to allow other Tools in the Solana Ecosystem to interact with the Program                           |
| anchor idl upgrade <programId> -f <target/idl/program.json> | Upgrades the IDL File to allow other Tools in the Solana Ecosystem to interact with the Program                            |

### Public Key
* The generated Public Key will become the Unique Identifier of the Program (Program ID)
* Programs can be updated by means of the Public Key

### Interface Description Language (IDL) 

* IDL is a JSON File that contains all the Specifications of the Solana Program
* It contains:
  * Information about its Instructions,
  * the Parameters required by these Instructions,
  * the Accounts generated by the Program
* The IDL allows the JavaScript Client to interact with the Solana Program

<hr/>

## Solana CLI

### Commands

| Command                                                     | Description                                                                                       |
|-------------------------------------------------------------|---------------------------------------------------------------------------------------------------|
| solana-test-validator --reset                               | Runs a Simulation of a Solana Cluster inside the local Machine and terminate it after the Command |
| solana address -k target/deploy/solana_twitter-keypair.json | Returns the Public Key of the Program that was generated when the Program was deployed             |
