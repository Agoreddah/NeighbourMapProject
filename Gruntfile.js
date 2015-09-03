module.exports = function(grunt){

    'use strict';

    grunt.initConfig({

        jshint : {
            //http://jshint.com/docs/options/
            options : {
                curly : true,
                eqeqeq : true,
                strict : false,
                devel : true,
                undef : true,
                unused : true
            },

            files : ['js/main.js']

        },
        htmlmin : {
            dist : {
                //https://github.com/kangax/html-minifier#options-quick-reference
                options : {
                    removeComments : true,
                    collapseWhitespace: true,
                    minifyCSS : true,
                    minifyJS : true
                },
                files : {
                    'dist/index.html' : 'index.html'
                }
            }
        },
        cssmin : {
            target : {
                files : {
                    'dist/css/skeleton.min.css' : 'css/skeleton.css'
                }
            }
        },
        uglify : {
            buildAll : {
                files : {
                    'dist/js/main.min.js' : ['js/main.js'],
                    'dist/js/vendors/jquery.ajax.min.js' : ['js/vendors/jquery*'],
                    'dist/js/vendors/knockout.min.js' : ['js/vendors/knockout.js']
                }
            },
            buildSimple : {
                files : {
                    'dist/js/main.min.js' : ['js/main.js']
                }
            }
        },
        copy : {
            main : {
                files : [
                    // images
                    {expand : true, src : ['images/*'], dest : 'dist'},
                    // fonts
                    {expand : true, src : ['fonts/*'], dest : 'dist'}
                ]
            }
        }

    });

    grunt.loadNpmTasks('grunt-contrib-jshint');
    grunt.loadNpmTasks('grunt-contrib-htmlmin');
    grunt.loadNpmTasks('grunt-contrib-cssmin');
    grunt.loadNpmTasks('grunt-contrib-uglify');
    grunt.loadNpmTasks('grunt-contrib-copy');

    grunt.registerTask('default',['jshint','htmlmin','cssmin','uglify:buildAll','copy']);
    grunt.registerTask('build-project', ['htmlmin','cssmin','uglify:buildAll','copy']);
    grunt.registerTask('build', ['htmlmin','cssmin','uglify:buildSimple']);
    grunt.registerTask('test',['jshint']);
};