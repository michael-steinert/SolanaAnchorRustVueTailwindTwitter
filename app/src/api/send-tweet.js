import { web3 } from "@project-serum/anchor"
import { Tweet } from "@/models";

/* Define the `sendTweet` Endpoint */
export const sendTweet = async ({ wallet, program }, topic, content) => {

    /* Generate a new Keypair for a new Tweet Account */
    /* Each Tweet has its own Account */
    /* A Tweet will be initialised at this Keypair’s Public Address, and the entire Keypair Object is needed to sign the Transaction to prove that it owns this Address */
    const tweet = web3.Keypair.generate();

    /* Send the `SendTweet` Instruction with the right Data and Accounts */
    await program.value.rpc.sendTweet(topic, content, {
        accounts: {
            author: wallet.value.publicKey,
            tweet: tweet.publicKey,
            systemProgram: web3.SystemProgram.programId
        },
        signers: [tweet]
    });

    /* Fetch the created Account from the Blockchain */
    const tweetAccount = await program.value.account.tweet.fetch(tweet.publicKey);

    /* Convert the fetched Account and the generated Public Key into a Tweet Object so the Front End can display it */
    return new Tweet(tweet.publicKey, tweetAccount);
}