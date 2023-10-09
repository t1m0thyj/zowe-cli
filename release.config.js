module.exports = {
    branches: [
        {
            name: "master",
            level: "minor",
            dependencies: ["@zowe/perf-timing"]
        },
        {
            name: "add-imp-v1",
            level: "patch",
            dependencies: { "@zowe/perf-timing": "latest" }
        }
        // {
        //     name: "next",
        //     prerelease: true,
        //     dependencies: { "@zowe/perf-timing": "latest" }
        // }
    ],
    plugins: [
        "@octorelease/changelog",
        ["@octorelease/lerna", {
            aliasTags: {
                // Note: Remove "next" tag here when the "next" branch is uncommented above
                "latest": ["zowe-v2-lts", "next"]
            },
            npmPublish: false,
            // pruneShrinkwrap: ["@zowe/cli"],
            smokeTest: true,
            tarballDir: "dist",
            versionIndependent: ["@zowe/imperative"]
        }],
        ["@octorelease/github", {
            assets: "dist/*.tgz",
            checkPrLabels: true
        }],
        "@octorelease/git"
    ]
};
