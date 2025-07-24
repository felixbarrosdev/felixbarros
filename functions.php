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
	add_theme_support( 'admin-bar', array( 'callback' => '__return_false' ) );
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

        // typed.js para animar texto en el header
        wp_enqueue_script(
               'typedjs',
               'https://cdn.jsdelivr.net/npm/typed.js@2.0.16/dist/typed.umd.min.js',
                array(),
                '2.0.16',
                true
        );

        wp_enqueue_script(
                'main-js',
                get_template_directory_uri() . '/assets/js/main.js',
                array( 'typedjs' ),
                filemtime( get_template_directory() . '/assets/js/main.js' ),
                true
        );
}
add_action( 'wp_enqueue_scripts', 'felixbarros_enqueue_assets' );

/**
 * Habilita soporte para comentarios en el theme.
 *
 * @return void
 */
function felixbarros_enable_comments() {
	add_theme_support( 'automatic-feed-links' );
	add_post_type_support( 'post', 'comments' );
	add_post_type_support( 'page', 'comments' );
}
add_action( 'after_setup_theme', 'felixbarros_enable_comments' );

/**
 * Template personalizado para mostrar comentarios individuales.
 *
 * @param object $comment   El objeto comentario.
 * @param array  $args      Argumentos de configuración.
 * @param int    $depth     Profundidad del comentario.
 * @return void
 */
function felixbarros_comment_callback( $comment, $args, $depth ) {
	$GLOBALS['comment'] = $comment;
	?>
	<div <?php comment_class( 'bg-dark-100 rounded-lg p-6 border-l-4 border-primary' ); ?> id="comment-<?php comment_ID(); ?>">
		<div class="flex items-start space-x-4">
			<div class="flex-shrink-0">
				<?php echo get_avatar( $comment, 48, '', '', array( 'class' => 'rounded-full' ) ); ?>
			</div>
			<div class="flex-1 min-w-0">
				<div class="flex items-center space-x-2 mb-2">
					<h4 class="font-heading font-semibold text-dark">
						<?php echo get_comment_author(); ?>
					</h4>
					<time class="text-sm text-dark-500" datetime="<?php comment_time( 'c' ); ?>">
						<?php comment_time( 'j F Y \a \l\a\s G:i' ); ?>
					</time>
				</div>
				
				<?php if ( $comment->comment_approved == '0' ) : ?>
					<p class="text-sm text-warning bg-warning/10 px-3 py-2 rounded mb-3">
						Tu comentario está pendiente de moderación.
					</p>
				<?php endif; ?>
				
				<div class="text-dark-700 leading-relaxed">
					<?php comment_text(); ?>
				</div>
				
				<div class="mt-3 flex items-center space-x-4">
					<?php
					comment_reply_link( array_merge( $args, array(
						'depth'     => $depth,
						'max_depth' => $args['max_depth'],
						'reply_text' => 'Responder',
						'class'     => 'text-primary hover:text-primary-dark text-sm font-medium',
					) ) );
					?>
					<?php edit_comment_link( 'Editar', '<span class="text-dark-500 text-sm">', '</span>' ); ?>
				</div>
			</div>
		</div>
	</div>
	<?php
}

/**
 * Configuración personalizada para el formulario de comentarios.
 *
 * @return array Argumentos del formulario de comentarios.
 */
function felixbarros_comment_form_args() {
	$commenter = wp_get_current_commenter();
	$req       = get_option( 'require_name_email' );
	$aria_req  = ( $req ? " aria-required='true'" : '' );
	
	return array(
		'title_reply'         => '<h3 class="text-2xl font-heading font-bold mb-6 text-dark">Deja tu comentario</h3>',
		'title_reply_to'      => 'Responder a %s',
		'cancel_reply_link'   => 'Cancelar respuesta',
		'label_submit'        => 'Publicar comentario',
		'submit_button'       => '<button type="submit" class="bg-primary hover:bg-primary-dark text-white font-semibold py-3 px-6 rounded-lg transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-opacity-50">%4$s</button>',
		'comment_field'       => '<div class="mb-4"><label for="comment" class="block text-sm font-medium text-dark mb-2">Comentario *</label><textarea id="comment" name="comment" rows="6" class="w-full px-4 py-3 border border-dark-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary transition-colors resize-none bg-white" placeholder="Escribe tu comentario aquí..." required></textarea></div>',
		'fields'              => array(
			'author' => '<div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4"><div><label for="author" class="block text-sm font-medium text-dark mb-2">Nombre' . ( $req ? ' *' : '' ) . '</label><input id="author" name="author" type="text" value="' . esc_attr( $commenter['comment_author'] ) . '" class="w-full px-4 py-3 border border-dark-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary transition-colors bg-white" placeholder="Tu nombre"' . $aria_req . ' /></div>',
			'email'  => '<div><label for="email" class="block text-sm font-medium text-dark mb-2">Email' . ( $req ? ' *' : '' ) . '</label><input id="email" name="email" type="email" value="' . esc_attr( $commenter['comment_author_email'] ) . '" class="w-full px-4 py-3 border border-dark-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary transition-colors bg-white" placeholder="tu@email.com"' . $aria_req . ' /></div></div>',
			//'url'    => '<div class="mb-4"><label for="url" class="block text-sm font-medium text-dark mb-2">Sitio web (opcional)</label><input id="url" name="url" type="url" value="' . esc_attr( $commenter['comment_author_url'] ) . '" class="w-full px-4 py-3 border border-dark-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary transition-colors bg-white" placeholder="https://tusitio.com" /></div>',
			'cookies' => '<div class="mb-4"><label for="wp-comment-cookies-consent" class="inline-flex items-center">
				<input id="wp-comment-cookies-consent" name="wp-comment-cookies-consent" type="checkbox" value="yes" class="mr-2">
				<span class="text-sm text-dark">Guardar mi nombre y correo electrónico en este navegador para la próxima vez que comente.</span>
			</label></div>',
		),
		'class_submit'        => 'submit-button',
		'comment_notes_before' => '<p class="text-sm text-dark-500 mb-4">Tu dirección de email no será publicada. Los campos obligatorios están marcados con *</p>',
		'comment_notes_after'  => '',
	);
}
