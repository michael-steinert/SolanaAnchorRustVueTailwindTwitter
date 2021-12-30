module.exports = {
    content: [],
    theme: {
        extend: {},
    },
    plugins: [],
    /* When Compiling for Production, Tailwind can remove all the Utility Classes that are not used within the provided Paths */
    purge: [
        "./public/index.html",
        "./src/**/*.{vue,js,ts,jsx,tsx}"
    ]
}
