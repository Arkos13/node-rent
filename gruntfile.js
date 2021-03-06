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
                    emitDecoratorMetadata: true,
                    compilerOptions: {
                      experimentalDecorators: true,
                      lib: [ "es2015" ]
                    }
                }
            }
        },
        watch: {
            ts: {
                files: ["src/\*\*/\*.ts"],
                tasks: ["ts:app"]
            }
        },
        tslint: {
            options: {
             configuration: grunt.file.readJSON("tslint.json")
            },
            all: {
            src: ["src/\*\*/\*.ts", "!node_modules/**/*.ts"] // avoid linting typings files and node_modules files
            }
        },
    });

    grunt.loadNpmTasks("grunt-contrib-watch");
    grunt.loadNpmTasks("grunt-ts");
    grunt.loadNpmTasks("grunt-tslint");
    grunt.loadNpmTasks("grunt-nodemon");

    grunt.registerTask("default", [
      "tslint:all",
      "ts:app"
    ]);

    grunt.registerTask("run", [
        "tslint:all",
        "ts:app",
        "nodemon:dev",
    ]);
};