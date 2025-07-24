<?php
/**
 * Script para verificar comentarios en el post específico
 */

// Cargar WordPress
require_once('/var/www/html/wp-config.php');

// ID del post
$post_id = 109;

echo "🔍 Verificando comentarios en el post ID: $post_id\n";

// Obtener todos los comentarios del post
$all_comments = get_comments([
    'post_id' => $post_id,
    'status' => 'all'
]);

// Obtener solo comentarios aprobados
$approved_comments = get_comments([
    'post_id' => $post_id,
    'status' => 'approve'
]);

echo "📊 Total comentarios: " . count($all_comments) . "\n";
echo "✅ Comentarios aprobados: " . count($approved_comments) . "\n";
echo "⏳ Comentarios pendientes: " . (count($all_comments) - count($approved_comments)) . "\n\n";

if (count($all_comments) > 0) {
    echo "📝 Lista de comentarios:\n";
    foreach ($all_comments as $comment) {
        $status = $comment->comment_approved == '1' ? 'Aprobado' : 'Pendiente';
        echo "  - ID: {$comment->comment_ID} | {$comment->comment_author} | {$status}\n";
        echo "    Contenido: " . substr($comment->comment_content, 0, 50) . "...\n";
    }
} else {
    echo "❌ No se encontraron comentarios en este post.\n";
}

// Verificar si los comentarios están habilitados
$comments_open = comments_open($post_id);
echo "\n💬 Comentarios abiertos: " . ($comments_open ? 'Sí' : 'No') . "\n";

// Verificar función have_comments()
echo "🔧 Función have_comments(): ";
if (have_comments()) {
    echo "Sí (hay comentarios)\n";
} else {
    echo "No (no hay comentarios)\n";
}

echo "\n📍 URL del post: http://localhost:8000/?p=$post_id\n";
?>