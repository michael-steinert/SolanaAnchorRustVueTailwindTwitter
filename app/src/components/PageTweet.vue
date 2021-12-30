<script setup>
/* `ref` ensures that the Content of a Variable is passed by Reference and not by Value */
import {ref, watchEffect} from "vue";
import {PublicKey} from "@solana/web3.js";
import {getTweet} from "@/api";
import {useFromRoute, useWorkspace} from "@/composables";
import TweetCard from "@/components/TweetCard";

const tweetAddress = ref(null);
useFromRoute((route) => {
  return (tweetAddress.value = route.params.tweet);
});

const loading = ref(false);
const tweet = ref(null);
const workspace = useWorkspace();

watchEffect(async () => {
  try {
    loading.value = true;
    /* The reactive Property `tweetAddress`contains the Public Key which is dynamically extracted from the current URL */
    tweet.value = await getTweet(workspace, new PublicKey(tweetAddress.value));
  } catch (error) {
    tweet.value = null;
    console.error(error);
  } finally {
    loading.value = false;
  }
});

</script>

<!-- The Tweet Page only shows one Tweet -->
<!-- The Tweet’s Public Key is provided in the URL allowing us to fetch the Tweet Account -->
<template>
  <div v-if="loading" class="p-8 text-gray-500 text-center">
    Loading
  </div>
  <div v-else-if="! tweet" class="p-8 text-gray-500 text-center">
    Tweet not found
  </div>
  <tweet-card v-else :tweet="tweet"></tweet-card>
</template>
