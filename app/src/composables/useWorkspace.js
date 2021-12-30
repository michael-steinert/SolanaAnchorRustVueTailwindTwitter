import { inject, provide, computed } from "vue";
import { useAnchorWallet } from "@solana/wallet-adapter-vue";
import { Connection, PublicKey } from "@solana/web3.js";
import { Provider, Program } from "@project-serum/anchor";
/* Interface Description Language of Solana Program */
import idl from "../../../target/idl/solana_twitter.json";

const clusterUrl = process.env.VUE_APP_CLUSTER_URL;
const workspaceSymbol = Symbol();
const programID = new PublicKey(idl.metadata.address);
const preflightCommitment = "processed";
const commitment = "processed";

export const useWorkspace = () => inject(workspaceSymbol);

export const initWorkspace = () => {
    const wallet = useAnchorWallet();

    const connection = new Connection(clusterUrl, commitment);

    /* `computed` Properties are recreated when their Properties change */
    const provider = computed(() => new Provider(connection, wallet.value, {
        preflightCommitment, commitment
    }));

    /* IDL + Provider = Program */
    const program = computed(() => {
        return new Program(idl, programID, provider.value);
    });

    /* Connection + Wallet = Provider */
    provide(workspaceSymbol, {
        wallet,
        connection,
        provider,
        program
    });
}