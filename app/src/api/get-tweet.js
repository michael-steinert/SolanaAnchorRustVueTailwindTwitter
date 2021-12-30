import {Tweet} from "@/models";

/* Retrieves the Content of a Tweet Account at a given Address */
/* `publicKey` Parameter is an Instance of Solana’s PublicKey Class */
export const getTweet = async ({program}, publicKey) => {
    const account = await program.value.account.tweet.fetch(publicKey);
    /* Converting into Tweet Objects */
    return new Tweet(publicKey, account);
}