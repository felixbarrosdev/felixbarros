<?php
/**
 * Funciones del theme felixbarros.
 *
 * Configura soporte básico del theme y encola los assets (CSS y JS).
 *
 * @package felixbarros
 */

/**
 * Registra soporte básico del theme:
 * - Etiqueta <title> automática
 * - Imágenes destacadas (thumbnails)
 * - Menú de navegación principal
 *
 * @return void
 */
function felixbarros_setup() {
	add_theme_support( 'title-tag' );
	add_theme_support( 'post-thumbnails' );
	register_nav_menus(
		array(
			'main_menu' => 'Menú principal',
		)
	);
}
add_action( 'after_setup_theme', 'felixbarros_setup' );

/**
 * Encola hojas de estilo y scripts del theme:
 * - Tailwind CSS desde /assets/build
 * - JS principal desde /assets/js
 * Los archivos se versionan automáticamente con filemtime.
 *
 * @return void
 */
function felixbarros_enqueue_assets() {
        wp_enqueue_style(
                'tailwind',
                get_template_directory_uri() . '/assets/build/style.css',
                array(),
                filemtime( get_template_directory() . '/assets/build/style.css' )
        );

        // Highlight.js para resaltar código
        wp_enqueue_style(
                'highlightjs-style',
                'https://cdnjs.cloudflare.com/ajax/libs/highlight.js/11.9.0/styles/github-dark.min.css',
                array(),
                '11.9.0'
        );
        wp_enqueue_script(
                'highlightjs',
                'https://cdnjs.cloudflare.com/ajax/libs/highlight.js/11.9.0/highlight.min.js',
                array(),
                '11.9.0',
                true
        );
        wp_add_inline_script( 'highlightjs', 'document.addEventListener("DOMContentLoaded",function(){hljs.highlightAll();});' );

        wp_enqueue_script(
                'main-js',
                get_template_directory_uri() . '/assets/js/main.js',
                array(),
                filemtime( get_template_directory() . '/assets/js/main.js' ),
                true
        );
}
add_action( 'wp_enqueue_scripts', 'felixbarros_enqueue_assets' );
