<?php
/**
 * Template para entradas individuales.
 *
 * @package felixbarros
 */

get_header(); ?>

<div class="flex-1 flex items-start justify-center px-4">
	<?php if ( have_posts() ) : while ( have_posts() ) : the_post(); ?>
	<article class="max-w-3xl w-full py-12 text-dark font-body">

	<h1 class="text-3xl md:text-5xl font-heading font-bold mb-6">
		<?php the_title(); ?>
	</h1>

	<div class="prose prose-lg prose-headings:font-heading prose-headings:text-dark max-w-none">
		<?php the_content(); ?>
	</div>

	<!-- Sección de comentarios -->
	<div class="comments-area mt-12 pt-8 border-t border-gray-200" id="comments">
		<?php
		// Cargar comentarios para el post actual
		$comments = get_comments(array(
			'post_id' => get_the_ID(),
			'status' => 'approve'
		));
		
		// Mostrar comentarios existentes
		if ( !empty($comments) ) : ?>
			<h3 class="text-2xl font-heading font-bold mb-6 text-dark">
				<?php
				$comments_number = count($comments);
				if ( $comments_number == 1 ) {
					echo '1 Comentario';
				} else {
					echo $comments_number . ' Comentarios';
				}
				?>
			</h3>

			<div class="comment-list space-y-6 mb-8">
				<?php
				// Mostrar cada comentario usando la función personalizada
				foreach ( $comments as $comment ) {
					felixbarros_comment_callback( $comment, array(), 1 );
				}
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
	<?php endwhile; endif; ?>
</div>

<?php get_footer(); ?>
