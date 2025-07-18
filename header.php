<?php
/**
 * Header del sitio.
 *
 * @package felixbarros
 */

?><!DOCTYPE html>
<html <?php language_attributes(); ?>>
<head>
	<meta charset="<?php bloginfo( 'charset' ); ?>">
	<meta name="viewport" content="width=device-width, initial-scale=1">
	<link rel="shortcut icon" href="<?php echo esc_url( get_template_directory_uri() ); ?>/assets/images/favicon.ico" type="image/x-icon">
	<link rel="icon" href="<?php echo esc_url( get_template_directory_uri() ); ?>/assets/images/favicon.ico" type="image/x-icon">
	<?php wp_head(); ?>
</head>
<body <?php body_class(); ?> class="min-h-screen flex flex-col">
<?php wp_body_open(); ?>
<header class="bg-dark-900 text-white px-4 py-3 shadow-md site-header">
	<div class="max-w-7xl mx-auto flex items-center justify-between flex-wrap md:flex-nowrap">
	  
		<!-- Logo horizontal -->
                <a href="<?php echo esc_url( home_url( '/' ) ); ?>" class="text-white font-heading text-xl md:text-2xl tracking-wide hover:text-accent-light transition-colors">
		<div class="flex items-center gap-2">
			<span class="text-white font-heading text-2xl font-bold tracking-tight">Felix Barros</span>
			<span class="w-px h-5 bg-dark-700"></span>
                        <span id="typed-dev" class="text-accent-light text-lg font-semibold">DEV</span>
		</div>
		</a>

		<!-- Menú -->
		<nav class="mt-3 md:mt-0 w-full md:w-auto main-navigation">
		<?php
			wp_nav_menu(
				array(
					'theme_location' => 'main_menu',
					'container'      => '',
					'menu_class'     => 'flex flex-col md:flex-row gap-3 md:gap-6 text-sm md:text-base font-body justify-end',
					'link_before'    => '<span class="text-dark-100 hover:text-white transition-colors duration-300">',
					'link_after'     => '</span>',
				)
			);
			?>
		</nav>

	</div>
	</header>
	<main class="container mx-auto">
