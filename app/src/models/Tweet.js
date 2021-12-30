import dayjs from "dayjs";

export class Tweet {
    /* `publicKey` will be an Instance of Solana’s PublicKey Class */

    /* The `accountData` Object is provided by the API Endpoint */
    constructor(publicKey, accountData) {
        this.publicKey = publicKey;
        this.author = accountData.author;
        this.timestamp = accountData.timestamp.toString();
        this.topic = accountData.topic;
        this.content = accountData.content;
    }

    /* The `key` Property is a unique Identifier that represents the Tweet */
    get key() {
        return this.publicKey.toBase58();
    }

    /* The `author_display` Property gives Access to the Author’s Public Key */
    get author_display() {
        const author = this.author.toBase58();
        return (`${author.slice(0, 4)}..${author.slice(-4)}`);
    }

    /* Human-readable Versions of `timestamp` */
    get created_at() {
        return dayjs.unix(this.timestamp).format('lll');
    }

    /* Human-readable Versions of `timestamp` */
    get created_ago() {
        return dayjs.unix(this.timestamp).fromNow();
    }
}
