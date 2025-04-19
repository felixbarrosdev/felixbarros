<?php
function felixbarros_setup() {
  add_theme_support('title-tag');
  add_theme_support('post-thumbnails');
  register_nav_menus([
    'main_menu' => 'Menú principal',
  ]);
}
add_action('after_setup_theme', 'felixbarros_setup');

function felixbarros_enqueue_assets() {
  wp_enqueue_style(
    'tailwind',
    get_template_directory_uri() . '/assets/build/style.css',
    [],
    filemtime(get_template_directory() . '/assets/build/style.css')
  );
  wp_enqueue_script(
    'main-js',
    get_template_directory_uri() . '/assets/js/main.js',
    [],
    filemtime(get_template_directory() . '/assets/js/main.js'),
    true
  );
}
add_action('wp_enqueue_scripts', 'felixbarros_enqueue_assets');
?>
