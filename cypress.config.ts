import {defineConfig} from "cypress";

export default defineConfig({
    projectId: '5oiwpi',
    component: {
        devServer: {
            framework: "next",
            bundler: "webpack",
        },
        defaultCommandTimeout: 40000
    },
});
