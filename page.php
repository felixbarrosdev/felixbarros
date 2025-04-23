<?php
/**
 * Template para páginas estáticas.
 *
 * @package felixbarros
 */

get_header(); ?>

<div class="flex-1 flex items-start justify-center px-4">
	<article class="max-w-3xl w-full py-12 text-dark font-body">

	<h1 class="text-3xl md:text-5xl font-title font-bold mb-6">
		<?php the_title(); ?>
	</h1>

	<div class="prose prose-lg prose-headings:font-title prose-headings:text-dark max-w-none">
		<?php the_content(); ?>
	</div>

	</article>
</div>

<?php get_footer(); ?>
