<?php
use WP_Mock\Tools\TestCase;

class FelixbarrosSetupTest extends TestCase {
    protected $testFiles = [ 'functions.php' ];

    public function test_setup_adds_theme_support_and_menu() {
        \WP_Mock::userFunction( 'add_theme_support', [
            'times' => 1,
            'args'  => [ 'title-tag' ],
        ] );
        \WP_Mock::userFunction( 'add_theme_support', [
            'times' => 1,
            'args'  => [ 'post-thumbnails' ],
        ] );
        \WP_Mock::userFunction( 'register_nav_menus', [
            'times' => 1,
            'args'  => [ [ 'main_menu' => 'Menú principal' ] ],
        ] );

        felixbarros_setup();

        $this->assertConditionsMet();
    }
}

