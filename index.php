<?php
/**
 * Archivo principal del theme.
 *
 * @package felixbarros
 */

get_header(); ?>

<div class="flex-1 flex items-center justify-center p-4">
	<div class="max-w-3xl py-12 text-dark font-body">

	<?php
	if ( have_posts() ) :
		while ( have_posts() ) :
			the_post();
			?>
		<article class="mb-12">
		<div class="flex flex-col md:flex-row items-start gap-y-4">
		  
		<!-- Imagen destacada -->
			<?php if ( has_post_thumbnail() ) : ?>
			<a href="<?php the_permalink(); ?>" class="md:mr-6">
				<?php
				the_post_thumbnail(
					'medium',
					array(
						'class' => 'w-32 md:w-40 h-auto rounded-lg shadow-md',
					)
				);
				?>
			</a>
		<?php endif; ?>

			<!-- Contenido -->
			<div>
			<h2 class="text-2xl md:text-3xl font-title font-bold mb-2">
				<a href="<?php the_permalink(); ?>" class="text-primary hover:text-accent transition-colors">
				<?php the_title(); ?>
				</a>
			</h2>
			<div class="text-base">
				<?php the_excerpt(); ?>
			</div>
			</div>

		</div>
		</article>
			<?php endwhile; else : ?>
		<p>No hay publicaciones.</p>
	<?php endif; ?>

	</div>
</div>

<?php get_footer(); ?>
