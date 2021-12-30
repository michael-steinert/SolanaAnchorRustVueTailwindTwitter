<script setup>
/* Ensures that the Content of a Variable is passed by Reference and not by Value */
import {ref} from "vue";
import {fetchTweets} from "@/api";
import TweetForm from "@/components/TweetForm";
import TweetList from "@/components/TweetList";
import {useWorkspace} from "@/composables";

const tweets = ref([]);
const loading = ref(true);
fetchTweets(useWorkspace())
    .then(fetchedTweets => tweets.value = fetchedTweets)
    .finally(() => loading.value = false);

const addTweet = (tweet) => {
  return tweets.value.push(tweet);
}
</script>

<!-- The Home Page that contains a Form to send Tweets and lists the latest Tweets from everyone -->
<template>
  <tweet-form @added="addTweet"></tweet-form>
  <tweet-list :tweets="tweets" :loading="loading"></tweet-list>
</template>
