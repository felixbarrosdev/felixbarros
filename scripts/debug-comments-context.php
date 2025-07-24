<?php
/**
 * Script para debuggear el contexto de comentarios en WordPress
 */

// Cargar WordPress
require_once('/var/www/html/wp-config.php');

// Simular el contexto de una página single
$post_id = 109;

echo "🔍 Debuggeando contexto de comentarios para post ID: $post_id\n\n";

// Obtener el post
$post = get_post($post_id);
if (!$post) {
    echo "❌ Error: Post no encontrado\n";
    exit(1);
}

echo "📄 Post encontrado: {$post->post_title}\n";
echo "📊 Tipo de post: {$post->post_type}\n";
echo "📅 Estado: {$post->post_status}\n\n";

// Establecer el post global
global $wp_query;
$wp_query->is_single = true;
$wp_query->is_singular = true;
$wp_query->queried_object = $post;
$wp_query->queried_object_id = $post_id;
$wp_query->posts = [$post];
$wp_query->post_count = 1;
$wp_query->current_post = 0;
$wp_query->in_the_loop = false;

// Establecer el post actual
setup_postdata($post);
$GLOBALS['post'] = $post;

echo "🔧 Contexto de WordPress configurado\n\n";

// Verificar funciones de comentarios
echo "📝 Verificando funciones de comentarios:\n";
echo "  - comments_open(): " . (comments_open() ? 'Sí' : 'No') . "\n";
echo "  - get_comments_number(): " . get_comments_number() . "\n";
echo "  - have_comments(): " . (have_comments() ? 'Sí' : 'No') . "\n";

// Obtener comentarios directamente
$comments = get_comments([
    'post_id' => $post_id,
    'status' => 'approve'
]);

echo "  - get_comments() count: " . count($comments) . "\n\n";

// Verificar configuración de comentarios
echo "⚙️ Configuración de comentarios:\n";
echo "  - Post permite comentarios: " . ($post->comment_status === 'open' ? 'Sí' : 'No') . "\n";
echo "  - Soporte de comentarios en post type: " . (post_type_supports($post->post_type, 'comments') ? 'Sí' : 'No') . "\n";
echo "  - Opción require_name_email: " . get_option('require_name_email') . "\n";
echo "  - Opción comment_moderation: " . get_option('comment_moderation') . "\n";
echo "  - Opción default_comment_status: " . get_option('default_comment_status') . "\n\n";

// Simular el loop
echo "🔄 Simulando el loop de WordPress:\n";
if (have_posts()) {
    while (have_posts()) {
        the_post();
        echo "  - En el loop: post ID " . get_the_ID() . "\n";
        echo "  - have_comments() en el loop: " . (have_comments() ? 'Sí' : 'No') . "\n";
        echo "  - get_comments_number() en el loop: " . get_comments_number() . "\n";
        break; // Solo una iteración para debug
    }
} else {
    echo "  - No hay posts en el query\n";
}

echo "\n✅ Debug completado\n";
?>