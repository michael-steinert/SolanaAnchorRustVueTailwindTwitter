import { Tweet } from "@/models";
import bs58 from "bs58";

/* Whole `workspace` is passed as Parameter therefore destruct only `program` from it */
export const fetchTweets = async ({ program }, filters = []) => {
    /* Access to the Program is possible through `program.value` because `program` is a reactive Variable and wrapped in a `ref` Object */
    const tweets = await program.value.account.tweet.all(filters);
    /* Converting into Tweet Objects */
    return tweets.map((tweet) => {
        return new Tweet(tweet.publicKey, tweet.account);
    });
}

export const authorFilter = authorBase58PublicKey => ({
    memcmp: {
        /* The Discriminator takes the fist 8th Bytes */
        offset: 8,
        /* Search Criteria: Bytes have to match the `authorBase58PublicKey` */
        bytes: authorBase58PublicKey
    }
});

export const topicFilter = topic => ({
    memcmp: {
        /* Discriminator + Author Public Key + Timestamp + Topic String Prefix */
        offset: 8 + 32 + 8 + 4,
        /* Search Criteria: Bytes have to match the `topic` */
        bytes: bs58.encode(Buffer.from(topic))
    }
});