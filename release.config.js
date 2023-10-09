module.exports = {
    branches: [
        {
            name: "master",
            level: "minor",
            dependencies: ["@zowe/perf-timing"]
        },
        {
            name: "zowe-v?-lts",
            level: "patch",
            dependencies: ["@zowe/perf-timing"]
        },
        {
            name: "next",
            prerelease: true,
            dependencies: { "@zowe/perf-timing": "latest" }
        }
    ],
    plugins: [
        ["@octorelease/changelog", {
            "displayNames": {
                "cli": "Zowe CLI",
                "core": "Core SDK",
                "zosconsole": "z/OS Console SDK",
                "zosfiles": "z/OS Files SDK",
                "zosjobs": "z/OS Jobs SDK",
                "zoslogs": "z/OS Logs SDK",
                "provisioning": "Provisioning SDK",
                "secrets": "Secrets SDK",
                "zostso": "z/OS TSO SDK",
                "zosuss": "z/OS USS SDK",
                "workflows": "Workflows SDK",
                "zosmf": "z/OSMF SDK",
                "cli-test-utils": "CLI Test Utils"
            }
        }],
        ["@octorelease/lerna", {
            aliasTags: {
                "latest": ["zowe-v2-lts"]
            },
            npmPublish: false,
            // pruneShrinkwrap: ["@zowe/cli"],
            smokeTest: true,
            tarballDir: "dist"
        }],
        ["@octorelease/github", {
            assets: "dist/*.tgz",
            checkPrLabels: true,
            publishRelease: true
        }],
        "@octorelease/git"
    ]
};
