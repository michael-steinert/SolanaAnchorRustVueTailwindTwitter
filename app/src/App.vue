<!-- This is the Main Component that loads when the Application starts -->
<!-- It designs the overall Layout of the App and delegates the Rest to Vue Router by using the <router-view> Component -->
<script setup>
import {useRoute} from "vue-router";
import Sidebar from "./components/Sidebar";
import {getPhantomWallet, getSolflareWallet} from "@solana/wallet-adapter-wallets";
import {WalletProvider} from "@solana/wallet-adapter-vue";
import WorkspaceProvider from "@/components/WorkspaceProvider";

const route = useRoute();
const wallets = [
  getPhantomWallet(),
  getSolflareWallet()
];
</script>

<template>
  <wallet-provider :wallets="wallets" auto-connect>
    <workspace-provider>
      <div class="w-full max-w-3xl lg:max-w-4xl mx-auto">
        <!-- Sidebar -->
        <sidebar class="py-4 md:py-8 md:pl-4 md:pr-8 fixed w-20 md:w-64"/>
        <!-- Main -->
        <main class="flex-1 border-r border-l ml-20 md:ml-64 min-h-screen">
          <header class="flex space-x-6 items-center justify-between px-8 py-4 border-b">
            <div class="text-xl font-bold" v-text="route.name"></div>
          </header>
          <!-- Any Page that matches the current URL will be rendered where <router-view> is-->
          <router-view/>
        </main>
      </div>
    </workspace-provider>
  </wallet-provider>
</template>
