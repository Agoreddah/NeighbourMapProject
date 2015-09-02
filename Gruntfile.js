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

        }

    });

    grunt.loadNpmTasks('grunt-contrib-jshint');

    grunt.registerTask('default',['jshint']);
    grunt.registerTask('testJs',['jshint']);
};