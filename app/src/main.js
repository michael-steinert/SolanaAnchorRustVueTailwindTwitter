/* Import CSS Files into `main.js` File, so they can be picked up by Webpack */
import "@solana/wallet-adapter-vue-ui/styles.css";
import "./main.css";
/* Configure Day.js that  it supports localised Formats and relative Times */
import dayjs from "dayjs";
import localizedFormat from "dayjs/plugin/localizedFormat";
import relativeTime from "dayjs/plugin/relativeTime";
dayjs.extend(localizedFormat);
dayjs.extend(relativeTime);

import { createApp } from "vue";
import App from "./App.vue";
import { createRouter, createWebHashHistory } from "vue-router";
import routes from "./routes";


const router = createRouter({
    /* The Function `createWebHashHistory` prefixes all Paths with a `#` so that they do not need to be configured any Redirections in the Server */
    history: createWebHashHistory(),
    routes
})

/* Create a Router Instance by providing the Routes and then make the VueJS App use it as a Plug-in */
createApp(App).use(router).mount("#app");
