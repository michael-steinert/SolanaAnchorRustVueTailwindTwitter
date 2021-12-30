import { onBeforeRouteUpdate, useRoute } from "vue-router";

/* This Composable do some Refactors that helps to deal with Vue Router Hooks */
/* It updates the Component when enter a Router and when the Route has changed but the Components stay the same */
export const useFromRoute = (fn) => {
    fn(useRoute(), null);
    onBeforeRouteUpdate((to, from, next) => {
        fn(to, from);
        next();
    });
}
