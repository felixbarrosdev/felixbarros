<?php
/**
 * Template para entradas individuales.
 *
 * @package felixbarros
 */

get_header(); ?>

<div class="flex-1 flex items-start justify-center px-4">
	<article class="max-w-3xl w-full py-12 text-dark font-body">

	<h1 class="text-5xl font-heading font-bold mb-6">
		<?php the_title(); ?>
	</h1>

	<div class="prose prose-lg prose-headings:font-heading prose-headings:text-dark max-w-none">
		<?php the_content(); ?>
	</div>

	<!-- Sección de comentarios -->
	<div class="mt-12 pt-8 border-t border-gray-200">
		<?php
		// Mostrar comentarios existentes
		if ( have_comments() ) : ?>
			<h3 class="text-2xl font-heading font-bold mb-6 text-dark">
				<?php
				$comments_number = get_comments_number();
				if ( $comments_number == 1 ) {
					echo '1 Comentario';
				} else {
					echo $comments_number . ' Comentarios';
				}
				?>
			</h3>

			<div class="space-y-6 mb-8">
				<?php
				wp_list_comments( array(
					'style'       => 'div',
					'short_ping'  => true,
					'avatar_size' => 48,
					'callback'    => 'felixbarros_comment_callback',
				) );
				?>
			</div>

			<?php if ( get_comment_pages_count() > 1 && get_option( 'page_comments' ) ) : ?>
				<div class="navigation comment-navigation">
					<div class="nav-links">
						<?php
						if ( $prev_link = get_previous_comments_link( '← Comentarios anteriores' ) ) {
							echo '<div class="nav-previous">' . $prev_link . '</div>';
						}
						if ( $next_link = get_next_comments_link( 'Comentarios siguientes →' ) ) {
							echo '<div class="nav-next">' . $next_link . '</div>';
						}
						?>
					</div>
				</div>
			<?php endif; ?>

		<?php endif; ?>

		<?php
		// Mostrar formulario de comentarios
		if ( comments_open() ) : ?>
			<div class="comment-form-wrapper">
				<?php comment_form( felixbarros_comment_form_args() ); ?>
			</div>
		<?php elseif ( ! comments_open() && get_comments_number() && post_type_supports( get_post_type(), 'comments' ) ) : ?>
			<p class="no-comments text-gray-600">Los comentarios están cerrados.</p>
		<?php endif; ?>
	</div>

	</article>
</div>

<?php get_footer(); ?>
