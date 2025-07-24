<?php
/**
 * Script para eliminar comentarios de prueba del post específico
 * Ejecutar desde la raíz de WordPress: php wp-content/themes/felixbarros/scripts/remove-test-comments.php
 */

// Cargar WordPress
require_once('/var/www/html/wp-config.php');

// ID del post donde eliminar comentarios (el post que estamos usando en las pruebas)
$post_id = 109;

// Verificar que el post existe
$post = get_post($post_id);
if (!$post) {
    echo "❌ Error: El post con ID $post_id no existe.\n";
    exit(1);
}

echo "🗑️ Eliminando comentarios de prueba del post: {$post->post_title}\n";

// Emails de los comentarios de prueba que agregamos
$test_emails = [
    'maria@ejemplo.com',
    'carlos@ejemplo.com',
    'ana@ejemplo.com',
    'pedro@ejemplo.com'
];

// Obtener comentarios del post
$comments = get_comments([
    'post_id' => $post_id,
    'status' => 'all' // Incluir aprobados y pendientes
]);

$deleted_count = 0;

foreach ($comments as $comment) {
    // Verificar si es un comentario de prueba
    if (in_array($comment->comment_author_email, $test_emails)) {
        $deleted = wp_delete_comment($comment->comment_ID, true); // true = forzar eliminación permanente
        
        if ($deleted) {
            echo "✅ Comentario eliminado (ID: {$comment->comment_ID}): {$comment->comment_author}\n";
            $deleted_count++;
        } else {
            echo "❌ Error al eliminar comentario (ID: {$comment->comment_ID}): {$comment->comment_author}\n";
        }
    }
}

if ($deleted_count === 0) {
    echo "ℹ️ No se encontraron comentarios de prueba para eliminar.\n";
} else {
    echo "\n🎉 Proceso completado. Se eliminaron $deleted_count comentarios de prueba.\n";
}

echo "📍 Puedes verificar en: http://localhost:8000/?p=$post_id\n";
?>