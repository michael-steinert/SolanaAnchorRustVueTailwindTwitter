<script setup>
/* `ref` ensures that the Content of a Variable is passed by Reference and not by Value */
import {ref, watchEffect} from "vue";
import {fetchTweets, authorFilter} from "@/api";
import TweetForm from "@/components/TweetForm";
import TweetList from "@/components/TweetList";
import {useWorkspace} from "@/composables";

const tweets = ref([]);
const loading = ref(true);
const workspace = useWorkspace();
const {wallet} = workspace;


watchEffect(() => {
  /* Ensures that a Wallet is connected */
  if (!wallet.value) {
    return;
  }
  fetchTweets(workspace, [authorFilter(wallet.value.publicKey.toBase58())])
      .then((fetchedTweets) => {
        tweets.value = fetchedTweets;
      })
      .finally(() => {
        loading.value = false;
      });
});


const addTweet = (tweet) => {
  return tweets.value.push(tweet);
}
</script>

<!-- The Profile Page for the connected User (Wallet) that displays the Wallet’s Public Key before showing the Tweet Form and the List of Tweets sent from that Wallet -->
<template>
  <div v-if="wallet" class="border-b px-8 py-4 bg-gray-50">
    {{ wallet.publicKey.toBase58() }}
  </div>
  <tweet-form @added="addTweet"></tweet-form>
  <tweet-list :tweets="tweets" :loading="loading"></tweet-list>
</template>
