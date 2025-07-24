<?php
/**
 * Script para agregar comentarios de prueba al post específico
 * Ejecutar desde la raíz de WordPress: php wp-content/themes/felixbarros/scripts/add-test-comments.php
 */

// Cargar WordPress
require_once('/var/www/html/wp-config.php');

// ID del post donde agregar comentarios (el post que estamos usando en las pruebas)
$post_id = 109;

// Verificar que el post existe
$post = get_post($post_id);
if (!$post) {
    echo "❌ Error: El post con ID $post_id no existe.\n";
    exit(1);
}

echo "📝 Agregando comentarios de prueba al post: {$post->post_title}\n";

// Comentarios de prueba
$test_comments = [
    [
        'comment_author' => 'María García',
        'comment_author_email' => 'maria@ejemplo.com',
        'comment_content' => 'Excelente artículo, muy informativo. Me ha ayudado mucho a entender el tema.',
        'comment_approved' => 1
    ],
    [
        'comment_author' => 'Carlos Rodríguez',
        'comment_author_email' => 'carlos@ejemplo.com',
        'comment_content' => 'Gracias por compartir esta información. ¿Podrías profundizar más en el tema de la implementación?',
        'comment_approved' => 1
    ],
    [
        'comment_author' => 'Ana López',
        'comment_author_email' => 'ana@ejemplo.com',
        'comment_content' => 'Me parece muy útil este contenido. Lo voy a compartir con mi equipo de trabajo.',
        'comment_approved' => 1
    ],
    [
        'comment_author' => 'Pedro Martínez',
        'comment_author_email' => 'pedro@ejemplo.com',
        'comment_content' => 'Interesante perspectiva. Me gustaría ver más ejemplos prácticos en futuros artículos.',
        'comment_approved' => 0 // Este comentario estará pendiente de moderación
    ]
];

$added_comments = 0;

foreach ($test_comments as $comment_data) {
    // Preparar datos del comentario
    $commentdata = [
        'comment_post_ID' => $post_id,
        'comment_author' => $comment_data['comment_author'],
        'comment_author_email' => $comment_data['comment_author_email'],
        'comment_content' => $comment_data['comment_content'],
        'comment_approved' => $comment_data['comment_approved'],
        'comment_date' => current_time('mysql'),
        'comment_date_gmt' => current_time('mysql', 1),
        'comment_type' => '',
        'comment_parent' => 0,
        'user_id' => 0
    ];
    
    // Insertar comentario
    $comment_id = wp_insert_comment($commentdata);
    
    if ($comment_id) {
        $status = $comment_data['comment_approved'] ? 'aprobado' : 'pendiente';
        echo "✅ Comentario agregado (ID: $comment_id, Estado: $status): {$comment_data['comment_author']}\n";
        $added_comments++;
    } else {
        echo "❌ Error al agregar comentario de: {$comment_data['comment_author']}\n";
    }
}

echo "\n🎉 Proceso completado. Se agregaron $added_comments comentarios de prueba.\n";
echo "📍 Puedes ver los comentarios en: http://localhost:8000/?p=$post_id\n";
echo "🔧 Para eliminar estos comentarios de prueba, ejecuta: remove-test-comments.php\n";
?>