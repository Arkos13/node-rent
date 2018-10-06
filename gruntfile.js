module.exports = function (grunt) {
    "use strict";

    grunt.initConfig({
        nodemon: {
            dev: {
                script: './dist/app.js'
            },
            options: {
                ignore: ['node_modules/**', 'gruntfile.js'],
                env: {
                    PORT: '8181'
                }
            }
        },
        ts: {
            app: {
                files: [{
                    src: ["src/\*\*/\*.ts", "!src/.baseDir.ts"],
                    dest: "./dist"
                }],
                options: {
                    module: "commonjs",
                    target: "es6",
                    sourceMap: false,
                    rootDir: "src",
                    experimentalDecorators: true,
                    emitDecoratorMetadata: true
                }
            }
        },
        watch: {
            ts: {
                files: ["src/\*\*/\*.ts"],
                tasks: ["ts:app"]
            }
        },
    });

    grunt.loadNpmTasks("grunt-contrib-watch");
    grunt.loadNpmTasks("grunt-ts");
    grunt.loadNpmTasks("grunt-nodemon");

    grunt.registerTask("default", [
        "ts:app"
    ]);
};