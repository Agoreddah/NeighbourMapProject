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

            files : ['js/*.js']

        },
        stylus : {
        	compile : {
        		files : {
        			'css/pifko.css' : 'css/pifko.styl'
        		}
        	}
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
                    'dist/css/pifko.min.css' : ['css/skeleton.css','css/pifko.css']
                }
            }
        },
        uglify : {
            buildAll : {
                files : {
                    'dist/js/main.min.js' : ['js/config.js','js/foursquare.js','js/map.js','js/app.js'],
                    'dist/js/vendors/jquery.min.js' : ['js/vendors/jquery*'],
                    'dist/js/vendors/knockout.min.js' : ['js/vendors/knockout.js']
                }
            },
            buildSimple : {
                files : {
                    'dist/js/main.min.js' : ['js/config.js','js/foursquare.js','js/map.js','js/app.js']
                }
            }
        },
        copy : {
            main : {
                files : [
                    // images
                    {expand : true, src : ['images/*'], dest : 'dist'},
                    // fonts
                    {expand : true, src : ['fonts/*'], dest : 'dist'},
                    // scripts
                    {expand : true, src : ['js/vendors/animation/*'], dest : 'dist'}
                ]
            }
        }

    });

    grunt.loadNpmTasks('grunt-contrib-jshint');
    grunt.loadNpmTasks('grunt-contrib-htmlmin');
    grunt.loadNpmTasks('grunt-contrib-stylus');
    grunt.loadNpmTasks('grunt-contrib-cssmin');
    grunt.loadNpmTasks('grunt-contrib-uglify');
    grunt.loadNpmTasks('grunt-contrib-copy');

    grunt.registerTask('default',['jshint','htmlmin','stylus','cssmin','uglify:buildAll','copy']);
    grunt.registerTask('build-project', ['htmlmin','stylus','cssmin','uglify:buildAll','copy']);
    grunt.registerTask('build', ['htmlmin','stylus','cssmin','uglify:buildSimple']);
    grunt.registerTask('test',['jshint']);
};