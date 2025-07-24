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
	<div class="max-w-7xl mx-auto">
		<div class="flex items-center justify-between">
			<!-- Logo -->
			<a href="<?php echo esc_url( home_url( '/' ) ); ?>" class="text-white font-heading text-xl md:text-2xl tracking-wide hover:text-accent-light transition-colors flex-shrink-0">
				<div class="flex items-center gap-2">
					<span class="text-white font-heading text-xl md:text-2xl font-bold tracking-tight">Felix Barros</span>
					<span class="w-px h-4 md:h-5 bg-dark-700"></span>
					<span id="typed-dev" class="text-accent-light text-base md:text-lg font-semibold">DEV</span>
				</div>
			</a>

			<!-- Botón hamburguesa para móvil -->
			<button id="mobile-menu-toggle" class="md:hidden flex flex-col justify-center items-center w-8 h-8 space-y-1 focus:outline-none focus:ring-2 focus:ring-accent-light rounded" aria-label="Toggle menu">
				<span class="block w-6 h-0.5 bg-white transition-all duration-300 ease-in-out"></span>
				<span class="block w-6 h-0.5 bg-white transition-all duration-300 ease-in-out"></span>
				<span class="block w-6 h-0.5 bg-white transition-all duration-300 ease-in-out"></span>
			</button>

			<!-- Menú desktop -->
			<nav class="hidden md:block main-navigation">
				<?php
					wp_nav_menu(
						array(
							'theme_location' => 'main_menu',
							'container'      => '',
							'menu_class'     => 'flex gap-6 text-base font-body',
							'link_before'    => '<span class="text-dark-100 hover:text-white transition-colors duration-300 px-3 py-2 rounded-md hover:bg-dark-700">',
							'link_after'     => '</span>',
						)
					);
				?>
			</nav>
		</div>

		<!-- Menú móvil -->
		<nav id="mobile-menu" class="md:hidden mt-4 pb-4 border-t border-dark-700 hidden">
			<?php
				wp_nav_menu(
					array(
						'theme_location' => 'main_menu',
						'container'      => '',
						'menu_class'     => 'flex flex-col space-y-2 pt-4',
						'link_before'    => '<span class="block text-dark-100 hover:text-white transition-colors duration-300 px-4 py-3 rounded-md hover:bg-dark-700">',
						'link_after'     => '</span>',
					)
				);
			?>
		</nav>
	</div>
</header>
	<main class="container mx-auto">
