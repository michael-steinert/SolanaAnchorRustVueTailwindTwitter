import { computed } from "vue";

/* This Composable is used to transform any given Text into a Slug */
/* For Instance: `Solana is AWESOME` will become `solana-is-awesome` */
export const useSlug = text => {
    return computed(() => {
        return (text.value || "")
            .toLowerCase()
            .replace(/[^a-z0-9 -]/g, "")
            .replace(/\s+/g, "-")
            .replace(/-+/g, "-");
    });
}
