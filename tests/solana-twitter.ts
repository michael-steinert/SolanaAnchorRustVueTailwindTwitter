import * as anchor from "@project-serum/anchor";
import {Program} from "@project-serum/anchor";
import {SolanaTwitter} from "../target/types/solana_twitter";
import * as assert from "assert";
import * as bs58 from "bs58";

describe("solana-twitter", () => {
    /* Generates a new Provider using the `Anchor.toml` Config File and registers it */
    /* Cluster + Wallet = Provider */
    anchor.setProvider(anchor.Provider.env());
    /* Uses the registered Provider to create a new `Program` Object that can be used in Tests */
    const program = anchor.workspace.SolanaTwitter as Program<SolanaTwitter>;

    /* Using the `it` Method from the `mocha` Test Framework */
    it("can send a new Tweet", async () => {
        /* Generate a new Key Pair */
        const tweet = anchor.web3.Keypair.generate();
        /* The Keyword `await` allows waiting until the Transaction has finished */
        /* The Object `program` contains an RPC Object which exposes an API matching the Solana Program's Instructions */
        /* Therefore, to make a Call to the Instruction `SendTweet`, it is necessary to call the Method `program.rpc.sendTweet` */
        /* The last Argument of any `program.rpc` Method is always the Object `Context` */
        /* The Context of an Instruction contains all the Accounts Necessary for the Instruction to run successfully */
        await program.rpc.sendTweet("Bruno the brave Dog", "Bruno is a brave Dog", {
            accounts: {
                tweet: tweet.publicKey,
                author: program.provider.wallet.publicKey,
                systemProgram: anchor.web3.SystemProgram.programId
            },
            /* Key Pairs of all Signers */
            /* Anchor automatically adds the Wallet as a Signer to each Transaction */
            signers: [tweet]
        });

        /* Fetch the Account Details of the created Tweet on the Blockchain */
        /* The Method `fetch` retrieve exactly one Account by providing its Public Key */
        const tweetAccount = await program.account.tweet.fetch(tweet.publicKey);
        /* Ensure that the fetched Tweet has the right Data */
        assert.equal(tweetAccount.author.toBase58(), program.provider.wallet.publicKey.toBase58());
        assert.equal(tweetAccount.topic, "Bruno the brave Dog");
        assert.equal(tweetAccount.content, "Bruno is a brave Dog");
        assert.ok(tweetAccount.timestamp);
    });

    it("can send a new Tweet without a Topic", async () => {
        // Call the "SendTweet" instruction.
        const tweet = anchor.web3.Keypair.generate();
        await program.rpc.sendTweet("", "Bruno is a brave Dog", {
            accounts: {
                tweet: tweet.publicKey,
                author: program.provider.wallet.publicKey,
                systemProgram: anchor.web3.SystemProgram.programId
            },
            signers: [tweet]
        });

        const tweetAccount = await program.account.tweet.fetch(tweet.publicKey);

        assert.equal(tweetAccount.author.toBase58(), program.provider.wallet.publicKey.toBase58());
        assert.equal(tweetAccount.topic, "");
        assert.equal(tweetAccount.content, "Bruno is a brave Dog");
        assert.ok(tweetAccount.timestamp);
    });

    it("can send a new Tweet from a different Author", async () => {
        /* Generate another User and  */
        const otherUser = anchor.web3.Keypair.generate();
        /* Airdrop 1 SOL to `otherUser` */
        const signature = await program.provider.connection.requestAirdrop(otherUser.publicKey, 1000000000);
        /* Waiting until the Airdrop Transaction is confirmed */
        await program.provider.connection.confirmTransaction(signature);

        /* Call the Instruction `SendTweet` on Behalf of this other User */
        const tweet = anchor.web3.Keypair.generate();
        await program.rpc.sendTweet("Bruno the brave Dog", "Bruno is a brave Dog", {
            accounts: {
                tweet: tweet.publicKey,
                /* Anchor will only automatically sign Transactions using its internal Wallet which is why another Wallet has to be explicitly sign here */
                author: otherUser.publicKey,
                systemProgram: anchor.web3.SystemProgram.programId
            },
            signers: [otherUser, tweet]
        });

        /* Fetch the Account Details of the created Tweet */
        const tweetAccount = await program.account.tweet.fetch(tweet.publicKey);

        assert.equal(tweetAccount.author.toBase58(), otherUser.publicKey.toBase58());
        assert.equal(tweetAccount.topic, "Bruno the brave Dog");
        assert.equal(tweetAccount.content, "Bruno is a brave Dog");
        assert.ok(tweetAccount.timestamp);
    });

    it("cannot provide a Topic with more than 50 Characters", async () => {
        try {
            const tweet = anchor.web3.Keypair.generate();
            const topicWith51Characters = ("c").repeat(51);
            await program.rpc.sendTweet(topicWith51Characters, "Bruno is a brave Dog", {
                accounts: {
                    tweet: tweet.publicKey,
                    author: program.provider.wallet.publicKey,
                    systemProgram: anchor.web3.SystemProgram.programId
                },
                signers: [tweet]
            });
        } catch (error) {
            assert.equal(error.msg, "The provided Topic should be 50 Characters long Maximum");
            return;
        }
        assert.fail("The Instruction should have failed with a greater than 50-Character Topic");
    });

    it("cannot provide a Content with more than 280 Characters", async () => {
        try {
            const tweet = anchor.web3.Keypair.generate();
            const contentWith281Characters = ("c").repeat(281);
            await program.rpc.sendTweet("Bruno the brave Dog", contentWith281Characters, {
                accounts: {
                    tweet: tweet.publicKey,
                    author: program.provider.wallet.publicKey,
                    systemProgram: anchor.web3.SystemProgram.programId
                },
                signers: [tweet]
            });
        } catch (error) {
            assert.equal(error.msg, "The provided Content should be 280 Characters long Maximum");
            return;
        }
        assert.fail("The Instruction should have failed with a greater than 280-Character Content");
    });

    it("can fetch all Tweets", async () => {
        /* Returns all Tweet Accounts ever created */
        const tweetAccounts = await program.account.tweet.all();
        /* The first 5 Tests end up Creating a total of 3 Tweet Accounts, since 2 of the Tests make sure Accounts are not created under certain Conditions */
        assert.equal(tweetAccounts.length, 3);
    });

    it("can filter Tweets by Author", async () => {
        const authorPublicKey = program.provider.wallet.publicKey
        /* The Function `fetch` returns the Tweet Account with all of its Data parsed */
        /* The Function `all` returns the Tweet Account with all of its Data parsed inside a Wrapper Object that also provides its Public Key */
        const tweetAccounts = await program.account.tweet.all([
            {
                memcmp: {
                    /* The Discriminator take the first 8 Bytes of the Account therefore the Public Key starts from the 8th Position */
                    offset: 8,
                    /* Search Criteria: The Bytes from the 8th Position should mach the given Public Key */
                    bytes: authorPublicKey.toBase58()
                }
            }
        ]);
        /* Two of three Accounts are created with the built-in Wallet */
        assert.equal(tweetAccounts.length, 2);
        /* The Function `every` returns true if the provided Callback returns true for every Account */
        assert.ok(tweetAccounts.every(tweetAccount => {
            /* Check that both of the Accounts inside `tweetAccounts` are in  the built-in Wallet */
            return (tweetAccount.account.author.toBase58() === authorPublicKey.toBase58());
        }));
    });

    it("can filter Tweets by Topics", async () => {
        const tweetAccounts = await program.account.tweet.all([
            {
                memcmp: {
                    /* Discriminator + Author Public Key + Timestamp + Topic Vec<8> (String) Prefix */
                    offset: 8 + 32 + 8 + 4,
                    /* Converts a String to a Buffer and encodes it to Base-58 */
                    bytes: bs58.encode(Buffer.from("Bruno the brave Dog"))
                }
            }
        ]);

        assert.equal(tweetAccounts.length, 2);
        assert.ok(tweetAccounts.every(tweetAccount => {
            return (tweetAccount.account.topic === "Bruno the brave Dog");
        }));
    });
});
