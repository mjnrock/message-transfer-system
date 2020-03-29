module.exports = function (grunt) {
    grunt.initConfig({
        copy: {
            files: {
                expand: true,
                dest: 'mts-react/src/lib',
                cwd: 'src/',
                src: '**'
            }
        }
    });

    grunt.loadNpmTasks('grunt-contrib-copy');
    grunt.registerTask('default', 'copy');
}